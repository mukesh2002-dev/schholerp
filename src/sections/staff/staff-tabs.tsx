"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchStaffAttendance,
  fetchStaffDocuments,
  createStaffDocument,
  deleteStaffDocument,
  fetchStaffPerformance,
  createStaffPerformance,
  fetchStaffPayroll,
  generatePayroll,
  uploadStaffFile,
} from "@/lib/api/staff";
import { markSingleStaffAttendanceApi } from "@/lib/api/attendance";
import { fetchLeaves, updateLeaveStatusApi, mapBackendLeave } from "@/lib/api/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { AlertCircle, CalendarCheck, CheckCircle2, Clock, History, Loader2 } from "lucide-react";
import { StaffPicker } from "./staff-picker";

const labelCls = "text-xs font-medium text-muted-foreground";

function useCampus() {
  const { activeBranchId } = useERP();
  return activeBranchId !== "all" ? activeBranchId : undefined;
}

const ATTENDANCE_STATUSES = [
  { value: "PRESENT", label: "Present", active: "bg-emerald-600 text-white border-emerald-600", idle: "text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10", dot: "bg-emerald-500" },
  { value: "ABSENT", label: "Absent", active: "bg-rose-600 text-white border-rose-600", idle: "text-rose-600 border-rose-500/40 hover:bg-rose-500/10", dot: "bg-rose-500" },
  { value: "LATE", label: "Late", active: "bg-amber-500 text-white border-amber-500", idle: "text-amber-600 border-amber-500/40 hover:bg-amber-500/10", dot: "bg-amber-500" },
  { value: "HALF_DAY", label: "Half Day", active: "bg-sky-600 text-white border-sky-600", idle: "text-sky-600 border-sky-500/40 hover:bg-sky-500/10", dot: "bg-sky-500" },
  { value: "ON_LEAVE", label: "On Leave", active: "bg-violet-600 text-white border-violet-600", idle: "text-violet-500 border-violet-500/40 hover:bg-violet-500/10", dot: "bg-violet-500" },
] as const;

function statusBadgeClass(status: string): string {
  const s = String(status ?? "").toUpperCase();
  if (s === "PRESENT") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
  if (s === "ABSENT") return "bg-rose-500/10 text-rose-600 border-rose-500/30";
  if (s === "LATE") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (s === "HALF_DAY") return "bg-sky-500/10 text-sky-600 border-sky-500/30";
  return "bg-violet-500/10 text-violet-500 border-violet-500/30";
}

function formatTime(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function weekdayName(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], { weekday: "short" });
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ── Attendance ────────────────────────────────────────────────────────────
export function StaffAttendanceTab() {
  const campusId = useCampus();
  const [staffUuid, setStaffUuid] = useState("");
  const [staffInfo, setStaffInfo] = useState<any>(null);
  const [userUuid, setUserUuid] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<string>("PRESENT");
  const [remarks, setRemarks] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1].map(String);
  }, []);

  const load = async (uuid: string, m = month, y = year) => {
    if (!uuid) return;
    setLoading(true);
    try {
      const rows = await fetchStaffAttendance(uuid, { month: Number(m), year: Number(y) });
      const sorted = (Array.isArray(rows) ? rows : []).slice().sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));
      setRecords(sorted);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load attendance");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStaff = (uuid: string) => {
    setStaffUuid(uuid);
    setStaffInfo(null);
    setUserUuid("");
    setRecords([]);
    if (!uuid) return;
    // Resolve profile summary + login-account uuid for marking
    import("@/lib/api/staff").then(async ({ fetchStaffById }) => {
      try {
        const s: any = await fetchStaffById(uuid);
        setStaffInfo(s);
        setUserUuid(s?.user?.uuid ?? "");
      } catch {
        setStaffInfo(null);
        setUserUuid("");
      }
    });
  };

  useEffect(() => {
    if (staffUuid) void load(staffUuid, month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffUuid, month, year]);

  const summary = useMemo(() => {
    const norm = (s: string) => String(s ?? "").toUpperCase();
    const present = records.filter((r) => norm(r.status) === "PRESENT").length;
    const absent = records.filter((r) => norm(r.status) === "ABSENT").length;
    const late = records.filter((r) => norm(r.status) === "LATE").length;
    const leave = records.filter((r) => ["ON_LEAVE", "LEAVE", "EXCUSED", "HALF_DAY"].includes(norm(r.status))).length;
    const rate = records.length ? Math.round(((present + late) / records.length) * 100) : 0;
    return { present, absent, late, leave, total: records.length, rate };
  }, [records]);

  const handleMark = async () => {
    if (!userUuid) {
      toast.error("Selected staff has no login account");
      return;
    }
    setSaving(true);
    try {
      await markSingleStaffAttendanceApi({ campusId, userId: userUuid, date, status, remarks: remarks.trim() || null });
      toast.success(`Marked ${status.replace("_", " ")} for ${formatDate(date)}`);
      setRemarks("");
      await load(staffUuid);
    } catch (e: any) {
      toast.error(e?.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  const staffName = staffInfo
    ? [staffInfo.firstName, staffInfo.lastName].filter(Boolean).join(" ") || staffInfo.user?.name || staffInfo.employeeId
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-emerald-500" />
          <span>Staff Attendance</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Select a staff member, mark daily attendance, and review the month-wise history.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Step 1 — pick staff */}
        <div>
          <label className={labelCls}>1. Select staff member</label>
          <div className="mt-1.5 max-w-xl">
            <StaffPicker value={staffUuid} onChange={handleSelectStaff} />
          </div>
          {staffInfo && (
            <div className="mt-2.5 flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 max-w-xl">
              <img
                src={staffInfo.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(staffName)}`}
                alt={staffName}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-background"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{staffName}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {staffInfo.designation || staffInfo.staffType} • {staffInfo.department || "—"}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono shrink-0">{staffInfo.employeeId}</Badge>
              {userUuid
                ? <Badge variant="success" className="text-[10px] shrink-0">Login linked</Badge>
                : <Badge variant="destructive" className="text-[10px] shrink-0">No login account</Badge>}
            </div>
          )}
        </div>

        {/* Step 2 — mark */}
        <div className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
          <p className="text-xs font-semibold">2. Mark attendance</p>
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3">
            <div>
              <label className={labelCls}>Date</label>
              <div className="flex gap-1.5 mt-1">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-xs" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 text-[11px] shrink-0"
                  onClick={() => setDate(new Date().toISOString().split("T")[0])}
                >
                  Today
                </Button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {ATTENDANCE_STATUSES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setStatus(o.value)}
                    className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${status === o.value ? o.active : o.idle}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${status === o.value ? "bg-white" : o.dot}`} />
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-9 text-xs flex-1"
            />
            <Button size="sm" onClick={handleMark} disabled={saving || !staffUuid} className="gap-1.5 h-9">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {saving ? "Saving..." : `Mark ${ATTENDANCE_STATUSES.find((o) => o.value === status)?.label ?? ""}`}
            </Button>
          </div>
        </div>

        {/* Step 3 — history */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> 3. History</p>
            <div className="flex items-center gap-2 ml-auto">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{yearOptions.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {staffUuid && !loading && records.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[10px] text-emerald-600 font-medium">Present</p>
                <p className="text-lg font-bold text-emerald-600">{summary.present}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                <p className="text-[10px] text-rose-600 font-medium">Absent</p>
                <p className="text-lg font-bold text-rose-600">{summary.absent}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-[10px] text-amber-600 font-medium">Late</p>
                <p className="text-lg font-bold text-amber-600">{summary.late}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-center">
                <p className="text-[10px] text-violet-500 font-medium">Leave</p>
                <p className="text-lg font-bold text-violet-500">{summary.leave}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-center col-span-2 sm:col-span-1">
                <p className="text-[10px] text-muted-foreground font-medium">Rate</p>
                <p className="text-lg font-bold">{summary.rate}%</p>
              </div>
            </div>
          )}

          {loading ? <Skeleton className="h-40" /> : records.length ? (
            <div className="rounded-xl border border-border/70 overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Check-In</TableHead><TableHead>Check-Out</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
                <TableBody>
                  {records.map((a: any) => (
                    <TableRow key={a.uuid} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase w-8">{weekdayName(String(a.date).slice(0, 10))}</span>
                          <span className="text-xs font-medium">{formatDate(a.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${statusBadgeClass(a.status)}`}>{String(a.status ?? "").replace("_", " ").toUpperCase()}</Badge></TableCell>
                      <TableCell className="text-xs font-mono"><Clock className="h-3 w-3 inline mr-1 text-muted-foreground" />{formatTime(a.checkIn)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{formatTime(a.checkOut)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{a.remarks || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed space-y-1.5">
              {staffUuid ? (
                <>
                  <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-sm font-semibold">No records for {MONTHS[Number(month) - 1]} {year}</p>
                  <p className="text-xs text-muted-foreground">Mark attendance above or pick another month.</p>
                </>
              ) : (
                <>
                  <Clock className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="text-sm font-semibold">No staff selected</p>
                  <p className="text-xs text-muted-foreground">Select a staff member above to mark and view attendance.</p>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Leave ─────────────────────────────────────────────────────────────────
export function StaffLeaveTab() {
  const campusId = useCampus();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchLeaves({ campusId });
      setLeaves(Array.isArray(rows) ? rows.map(mapBackendLeave) : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load leaves");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, /* eslint-disable-next-line react-hooks/exhaustive-deps */ [campusId]);

  const act = async (uuid: string, st: "approved" | "rejected") => {
    try {
      await updateLeaveStatusApi(uuid, st);
      toast.success(`Leave ${st}`);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    }
  };

  const visible = leaves.filter((l: any) => {
    const q = search.trim().toLowerCase();
    const okSearch = !q || `${l.staffName}`.toLowerCase().includes(q);
    const okStatus = statusFilter === "ALL" || l.status === statusFilter;
    return okSearch && okStatus;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Leave Management</CardTitle>
        <Button size="sm" variant="outline" className="h-8" onClick={load}>Refresh</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col md:flex-row gap-2">
          <Input placeholder="Search staff name..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 text-xs max-w-sm" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading ? <Skeleton className="h-32" /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Type</TableHead><TableHead>From → To</TableHead><TableHead>Days</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {visible.length ? visible.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-sm font-medium">{l.staffName}</TableCell>
                  <TableCell className="text-xs">{l.leaveType}</TableCell>
                  <TableCell className="text-xs">{l.fromDate} → {l.toDate}</TableCell>
                  <TableCell className="text-xs">{l.totalDays}</TableCell>
                  <TableCell className="text-xs max-w-[180px] truncate">{l.reason || "—"}</TableCell>
                  <TableCell><Badge variant={l.status === "APPROVED" ? "success" : l.status === "REJECTED" ? "destructive" : "warning"} className="text-[10px]">{l.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {l.status === "PENDING" ? (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-[11px] text-emerald-600" onClick={() => act(l.id, "approved")}>Approve</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] text-rose-600" onClick={() => act(l.id, "rejected")}>Reject</Button>
                      </div>
                    ) : <span className="text-[11px] text-muted-foreground">—</span>}
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">No leave requests</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Payroll ───────────────────────────────────────────────────────────────
export function StaffPayrollTab() {
  const [staffUuid, setStaffUuid] = useState("");
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async (uuid: string) => {
    if (!uuid) return;
    setLoading(true);
    try {
      const data = await fetchStaffPayroll(uuid);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load payroll");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (staffUuid) void load(staffUuid); }, /* eslint-disable-next-line react-hooks/exhaustive-deps */ [staffUuid]);

  const handleGenerate = async () => {
    if (!staffUuid) { toast.error("Select a staff member first"); return; }
    setSaving(true);
    try {
      await generatePayroll({ staffId: staffUuid, month: Number(month), year: Number(year) });
      toast.success(`Payroll generated for ${month}/${year}`);
      await load(staffUuid);
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Payroll — Generate & History</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className={labelCls}>Staff member</label>
            <div className="mt-1"><StaffPicker value={staffUuid} onChange={(u) => { setStaffUuid(u); setRows([]); }} /></div>
          </div>
          <div>
            <label className={labelCls}>Month / Year</label>
            <div className="flex gap-2 mt-1">
              <Input className="h-9 text-xs" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="MM" />
              <Input className="h-9 text-xs" value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" />
            </div>
          </div>
          <Button size="sm" onClick={handleGenerate} disabled={saving || !staffUuid} className="gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Generate Payroll
          </Button>
        </div>
        {loading ? <Skeleton className="h-32" /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Month/Year</TableHead><TableHead>Base</TableHead><TableHead>Allowances</TableHead><TableHead>Deductions</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.length ? rows.map((p: any) => (
                <TableRow key={p.uuid}>
                  <TableCell className="text-xs">{p.month}/{p.year}</TableCell>
                  <TableCell className="text-xs">{p.baseSalary}</TableCell>
                  <TableCell className="text-xs">{p.totalAllowances}</TableCell>
                  <TableCell className="text-xs">{p.totalDeductions}</TableCell>
                  <TableCell className="text-xs font-bold">{p.netSalary}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.status}</Badge></TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">Select a staff member to view payroll</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Documents ─────────────────────────────────────────────────────────────
const DOC_TYPES = ["Aadhaar / ID Proof", "PAN", "Qualification Certificate", "Experience Certificate", "Joining Letter", "Resume", "Other Documents"];

export function StaffDocumentsTab() {
  const [staffUuid, setStaffUuid] = useState("");
  const [docs, setDocs] = useState<any[]>([]);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [fileUrl, setFileUrl] = useState("");
  const [expiry, setExpiry] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async (uuid: string) => {
    if (!uuid) return;
    try {
      const data = await fetchStaffDocuments(uuid);
      setDocs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load documents");
      setDocs([]);
    }
  };

  useEffect(() => { if (staffUuid) void load(staffUuid); }, /* eslint-disable-next-line react-hooks/exhaustive-deps */ [staffUuid]);

  const handleFilePick = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    try {
      const { url } = await uploadStaffFile(f);
      setFileUrl(url);
      toast.success("File uploaded");
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!staffUuid) { toast.error("Select a staff member first"); return; }
    if (!fileUrl.trim()) { toast.error("Attach a file or paste a file URL"); return; }
    setSaving(true);
    try {
      await createStaffDocument(staffUuid, { documentType: docType, fileUrl: fileUrl.trim(), expiryDate: expiry || null });
      toast.success("Document saved");
      setFileUrl("");
      setExpiry("");
      await load(staffUuid);
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (docUuid: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteStaffDocument(docUuid);
      toast.success("Document deleted");
      await load(staffUuid);
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Documents — Upload with Expiry Tracking</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className={labelCls}>Staff member</label>
          <div className="mt-1 max-w-xl"><StaffPicker value={staffUuid} onChange={(u) => { setStaffUuid(u); setDocs([]); }} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
          <div>
            <label className={labelCls}>Document type</label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>File</label>
            <Input type="file" accept="image/*,.pdf" className="mt-1 h-9 text-xs" disabled={uploading} onChange={(e) => void handleFilePick(e.target.files?.[0])} />
            {fileUrl ? <p className="text-[11px] text-emerald-600 mt-1 truncate">Attached ✓ {fileUrl.slice(0, 60)}...</p> : <p className="text-[11px] text-muted-foreground mt-1">or paste a URL below</p>}
          </div>
          <div>
            <label className={labelCls}>File URL</label>
            <Input placeholder="https://..." value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="mt-1 h-9 text-xs" />
          </div>
          <div>
            <label className={labelCls}>Expiry</label>
            <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="mt-1 h-9 text-xs" />
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || uploading || !staffUuid} className="gap-1.5">
          {(saving || uploading) && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Document
        </Button>
        <Table>
          <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>File</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {docs.length ? docs.map((d: any) => (
              <TableRow key={d.uuid}>
                <TableCell className="text-xs">{d.documentType}</TableCell>
                <TableCell className="text-xs truncate max-w-[220px]">
                  {String(d.fileUrl ?? "").startsWith("http") || String(d.fileUrl ?? "").startsWith("data:") ? (
                    <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open file</a>
                  ) : "—"}
                </TableCell>
                <TableCell className="text-xs">{d.expiryDate ? formatDate(d.expiryDate) : "—"}</TableCell>
                <TableCell>{d.expiryDate && new Date(d.expiryDate) < new Date() ? <Badge variant="destructive" className="text-[10px]">Expired</Badge> : <Badge variant="outline" className="text-[10px]">Valid</Badge>}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="ghost" className="h-7 text-[11px] text-rose-600" onClick={() => void handleDelete(d.uuid)}>Delete</Button></TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={5} className="text-center py-6 text-sm text-muted-foreground">Select a staff member to view documents</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Performance ───────────────────────────────────────────────────────────
export function StaffPerformanceTab() {
  const [staffUuid, setStaffUuid] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0]);
  const [rating, setRating] = useState("4");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (uuid: string) => {
    if (!uuid) return;
    try {
      const data = await fetchStaffPerformance(uuid);
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load reviews");
      setRows([]);
    }
  };

  useEffect(() => { if (staffUuid) void load(staffUuid); }, /* eslint-disable-next-line react-hooks/exhaustive-deps */ [staffUuid]);

  const handleAdd = async () => {
    if (!staffUuid) { toast.error("Select a staff member first"); return; }
    setSaving(true);
    try {
      await createStaffPerformance(staffUuid, { reviewDate, rating: Number(rating), remarks: remarks || null });
      toast.success("Review added");
      setRemarks("");
      await load(staffUuid);
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Performance Reviews</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className={labelCls}>Staff member</label>
          <div className="mt-1 max-w-xl"><StaffPicker value={staffUuid} onChange={(u) => { setStaffUuid(u); setRows([]); }} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div>
            <label className={labelCls}>Review date</label>
            <Input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="mt-1 h-9 text-xs" />
          </div>
          <div>
            <label className={labelCls}>Rating</label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 — Excellent</SelectItem>
                <SelectItem value="4">4 — Good</SelectItem>
                <SelectItem value="3">3 — Average</SelectItem>
                <SelectItem value="2">2 — Below Average</SelectItem>
                <SelectItem value="1">1 — Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1">
            <label className={labelCls}>Remarks</label>
            <Input placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="mt-1 h-9 text-xs" />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={saving || !staffUuid} className="gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add Review
          </Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Rating</TableHead><TableHead>Remarks</TableHead><TableHead>Reviewer</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length ? rows.map((p: any) => (
              <TableRow key={p.uuid}>
                <TableCell className="text-xs">{formatDate(p.reviewDate)}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{p.rating ?? "—"} / 5</Badge></TableCell>
                <TableCell className="text-xs">{p.remarks || p.assessment || "—"}</TableCell>
                <TableCell className="text-xs">{p.reviewer?.name || "—"}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">Select a staff member to view reviews</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
