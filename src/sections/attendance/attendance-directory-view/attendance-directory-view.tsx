"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchStudentAttendance,
  fetchStaffAttendance,
  fetchLeaves,
  markStudentAttendanceApi,
  markAllStudentAttendanceApi,
  markSingleStaffAttendanceApi,
  bulkMarkStaffAttendanceApi,
  staffDirectoryCategory,
  mapBackendStudentAttendance,
  mapBackendStaffAttendance,
} from "@/lib/api/attendance";
import { fetchStaffList } from "@/lib/api/staff";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { AttendanceCategory, AttendanceStatus, AttendanceRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CalendarCheck, Users, Search, CheckCircle2, TrendingUp, UserPlus, ClipboardCheck } from "lucide-react";
import { ManualAttendanceModal, OPEN_MANUAL_ATTENDANCE_EVENT } from "@/sections/attendance/manual-attendance-modal";
import { MarkAttendance } from "../mark-attendance/mark-attendance";
import { MarkStaff } from "../mark-staff/mark-staff";

const statusVariant = (s: AttendanceStatus) => {
  switch (s) {
    case "PRESENT":
      return "success";
    case "LATE":
      return "warning";
    case "ABSENT":
      return "destructive";
    case "LEAVE":
      return "info";
    default:
      return "outline";
  }
};

export function AttendanceDirectoryView() {
  const { activeBranchId } = useERP();
  const [category, setCategory] = useState<AttendanceCategory>("STUDENT");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [saving, setSaving] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  // Header ka "Manual Attendance" button isi modal ko kholta hai
  React.useEffect(() => {
    const handler = () => setManualOpen(true);
    window.addEventListener(OPEN_MANUAL_ATTENDANCE_EVENT, handler);
    return () => window.removeEventListener(OPEN_MANUAL_ATTENDANCE_EVENT, handler);
  }, []);

  const fallbackRecords: AttendanceRecord[] = [];
  const fallbackSummaries: any[] = [];
  const fallbackReport: any[] = [];

  const {
    data: apiRecords,
    isLoading: recordsLoading,
    isOffline: recordsOffline,
    error: recordsError,
    refresh: refreshRecords,
  } = useCampusData<AttendanceRecord[]>({
    fetcher: async (cid) => {
      try {
        if (category === "STUDENT") {
          const res = await fetchStudentAttendance({ campusId: cid, date });
          return Array.isArray(res) ? res.map((r) => mapBackendStudentAttendance(r, cid)) : [];
        }
        const res = await fetchStaffAttendance({ campusId: cid, date });
        return Array.isArray(res) ? res.map((r) => mapBackendStaffAttendance(r, cid)) : [];
      } catch {
        return [];
      }
    },
    campusId: activeBranchId,
    fallback: fallbackRecords,
    queryKeyPrefix: `attendance-${category}-${date}`,
  });

  const {
    data: apiLeaves,
    isLoading: leavesLoading,
    isOffline: leavesOffline,
    error: leavesError,
    refresh: refreshLeaves,
  } = useCampusData<any[]>({
    fetcher: (cid) => fetchLeaves({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
  });
  void apiLeaves; void leavesLoading; void leavesOffline; void leavesError; void refreshLeaves;

  const allRecords = apiRecords.length > 0 || recordsOffline || !recordsLoading ? apiRecords : fallbackRecords;
  const summaries = useMemo(() => {
    const byDate = new Map<string, { total: number; present: number; absent: number; late: number; leave: number }>();
    allRecords.forEach((r) => {
      const cur = byDate.get(r.date) ?? { total: 0, present: 0, absent: 0, late: 0, leave: 0 };
      cur.total += 1;
      if (r.status === "PRESENT") cur.present += 1;
      else if (r.status === "LATE") cur.late += 1;
      else if (r.status === "LEAVE") cur.leave += 1;
      else cur.absent += 1;
      byDate.set(r.date, cur);
    });
    return Array.from(byDate.entries())
      .map(([date, v]) => ({
        date,
        category,
        branchId: activeBranchId,
        total: v.total,
        present: v.present,
        absent: v.absent,
        late: v.late,
        leave: v.leave,
        rate: v.total > 0 ? Math.round(((v.present + v.late) / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [allRecords, category, activeBranchId]);

  const report = useMemo(() => {
    const byPerson = new Map<string, { personId: string; personName: string; present: number; late: number; absent: number; totalDays: number; rate: number }>();
    allRecords.forEach((r) => {
      const cur = byPerson.get(r.personId) ?? { personId: r.personId, personName: r.personName, present: 0, late: 0, absent: 0, totalDays: 0, rate: 0 };
      cur.totalDays += 1;
      if (r.status === "PRESENT") cur.present += 1;
      else if (r.status === "LATE") cur.late += 1;
      else cur.absent += 1;
      byPerson.set(r.personId, cur);
    });
    return Array.from(byPerson.values()).map((p) => ({
      ...p,
      rate: p.totalDays > 0 ? Math.round(((p.present + p.late) / p.totalDays) * 100) : 0,
    }));
  }, [allRecords]);
  // Filter by the selected tab: STUDENT shows student rows, the other tabs
  // show only staff rows mapped to that category (TEACHER / STAFF).
  const recordsForCategory = useMemo(
    () =>
      category === "STUDENT"
        ? allRecords.filter((r) => r.category === "STUDENT")
        : allRecords.filter((r) => r.category === category),
    [allRecords, category]
  );
  // The date picker always respects the chosen date. Records are fetched for
  // that date, so no silent switching to another day.
  const recordsForDate = useMemo(
    () => recordsForCategory.filter((r) => r.date === date),
    [recordsForCategory, date]
  );

  const filtered = useMemo(() => {
    return recordsForDate.filter((r) => {
      const matchSearch = r.personName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [recordsForDate, search, statusFilter]);

  const refresh = useCallback(() => {
    void refreshRecords();
    void refreshLeaves();
  }, [refreshRecords, refreshLeaves]);

  const handleMarkAllPresent = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error("Offline — cannot save attendance");
      return;
    }
    if (date > new Date().toISOString().split("T")[0]) {
      toast.error("Future dates not allowed — today or past only");
      return;
    }
    const campus = activeBranchId !== "all" ? activeBranchId : undefined;
    // Staff tabs: build the roster from the staff directory and bulk-mark
    // everyone in this category as PRESENT for the selected date.
    if (category !== "STUDENT") {
      setSaving(true);
      try {
        const res = await fetchStaffList({ campusId: campus, limit: 200 });
        const roster = ((res as any)?.data ?? []).filter(
          (s: any) => staffDirectoryCategory({ staffType: s.staffType }) === category && (s?.user?.uuid ?? s?.user?.id)
        );
        if (roster.length === 0) {
          const who = category === "TEACHER" ? "teachers" : "staff members";
          toast.error(`No ${who} found for this campus. Add staff first.`);
          return;
        }
        const result = await bulkMarkStaffAttendanceApi({
          campusId: campus,
          date,
          records: roster.map((s: any) => ({ userId: s.user.uuid ?? s.user.id, status: "PRESENT" })),
        });
        const failed = result.errors?.length ?? 0;
        toast.success(
          `Marked ${result.saved} ${category.toLowerCase()} as PRESENT for ${date}` +
            (failed > 0 ? ` (${failed} failed)` : "")
        );
        await refreshRecords();
      } catch (err: any) {
        toast.error(err?.message || "Failed to save attendance");
      } finally {
        setSaving(false);
      }
      return;
    }
    // No records yet for this date (first marking): bootstrap server-side —
    // backend builds the roster from enrolled students, no classId needed.
    if (filtered.length === 0) {
      setSaving(true);
      try {
        const res = await markAllStudentAttendanceApi({ campusId: campus, date, status: "present" });
        toast.success(`Marked ${res.count} students as PRESENT for ${date}`);
        await refreshRecords();
      } catch (err: any) {
        const msg = err?.message || "Failed to save attendance";
        toast.error(msg, { description: "Students enrolled hain? Check admissions for this campus." });
      } finally {
        setSaving(false);
      }
      return;
    }
    const classId = filtered[0]?.classId;
    if (!classId || classId === "all") {
      toast.error("Class not resolved for these records — cannot save");
      return;
    }
    setSaving(true);
    try {
      const records = filtered.map((r) => ({ studentId: r.personId, status: "present" as const }));
      const res = await markStudentAttendanceApi({ campusId: campus, classId, date, records });
      toast.success(`Marked ${res.count} students as PRESENT for ${date}`);
      await refreshRecords();
    } catch (err: any) {
      const msg = err?.message || "Failed to save attendance";
      toast.error(msg, { description: err?.details ? JSON.stringify(err.details).slice(0,300) : "Check console (F12)" });
    } finally {
      setSaving(false);
    }
  }, [filtered, category, date, activeBranchId, refreshRecords]);

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={recordsOffline} error={recordsError} isLoading={recordsLoading} />
      {/* Category Filter Pills & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex items-center gap-2">
          {(["STUDENT", "TEACHER", "STAFF"] as AttendanceCategory[]).map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="text-xs h-8 capitalize"
            >
              {cat.toLowerCase()}s
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setManualOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <UserPlus className="h-3.5 w-3.5" /> Manual Attendance
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllPresent}
            disabled={saving || recordsLoading}
            className="gap-1.5 text-xs h-8 text-emerald-600 hover:bg-emerald-500/10"
          >
            <CheckCircle2 className={`h-3.5 w-3.5 ${saving ? "animate-spin" : ""}`} /> {saving ? "Saving..." : "Mark All Present"}
          </Button>
        </div>
      </div>
      <ManualAttendanceModal
        open={manualOpen}
        onOpenChange={setManualOpen}
        defaultCategory={category}
        onSaved={refresh}
      />

      <Tabs defaultValue="mark" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mark" className="gap-1.5 text-xs">
            <ClipboardCheck className="h-3.5 w-3.5" /> Mark Students
          </TabsTrigger>
          <TabsTrigger value="mark-staff" className="gap-1.5 text-xs">
            <ClipboardCheck className="h-3.5 w-3.5" /> Mark Staff
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-1.5 text-xs">
            <CalendarCheck className="h-3.5 w-3.5" /> Daily Punch Ledger
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" /> Day Trajectory
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Individual Compliance
          </TabsTrigger>
        </TabsList>

        {/* Tab 0: Direct on-screen marking (class roster) */}
        <TabsContent value="mark" className="space-y-4">
          <MarkAttendance />
        </TabsContent>

        {/* Tab 0b: Direct on-screen marking (teacher / staff roster) */}
        <TabsContent value="mark-staff" className="space-y-4">
          <MarkStaff />
        </TabsContent>

        {/* Tab 1: Daily */}
        <TabsContent value="daily" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${category.toLowerCase()} name...`}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const v = e.target.value;
                const today = new Date().toISOString().split("T")[0];
                if (v && v > today) {
                  toast.error("Future dates not allowed — reset to today");
                  setDate(today);
                } else {
                  setDate(v);
                }
              }}
              className="w-[160px] h-9 text-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LEAVE">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            {recordsLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading attendance... <span className="animate-pulse">●</span></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">No records for {date}</p>
                <p className="text-xs text-muted-foreground">No {category.toLowerCase()} attendance marked for this date/campus. Use <em>Manual Attendance</em> to mark individually{category === "STUDENT" ? <> or <em>Mark All Present</em> after enrolling students</> : ""}, or pick another date.</p>
                {recordsOffline && <p className="text-xs text-amber-600">Offline — showing cached data</p>}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category / Role</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Marked By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-sm">{r.personName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {r.category === "STUDENT" ? "Student" : r.category === "TEACHER" ? "Teacher" : "Staff"}
                        </Badge>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium leading-tight">{r.roleName || "—"}</span>
                          {r.department && (
                            <span className="text-[10px] text-muted-foreground leading-tight">{r.department}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-medium">
                      {r.checkIn || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {r.checkOut || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.markedBy || "Biometric"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={r.status}
                        onValueChange={async (val) => {
                          if (!navigator.onLine) { toast.error("Offline — cannot update"); return; }
                          const campus = activeBranchId !== "all" ? activeBranchId : undefined;
                          try {
                            if (r.category === "STUDENT") {
                              const cid = r.classId;
                              if (!cid) { toast.error("Class missing"); return; }
                              // Backend stores LEAVE as `excused` (see mapStatus) — send canonical value.
                              const apiStatus = val === "LEAVE" ? "excused" : val.toLowerCase();
                              await markStudentAttendanceApi({ campusId: campus, classId: cid, date: r.date, records: [{ studentId: r.personId, status: apiStatus }] });
                            } else {
                              await markSingleStaffAttendanceApi({ campusId: campus, userId: r.personId, date: r.date, status: val });
                            }
                            toast.success(`${r.personName} → ${val}`);
                            await refreshRecords();
                          } catch (e:any) { toast.error(e?.message || "Update failed"); }
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="LEAVE">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Summaries */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {summaries.map((s, idx) => (
              <Card key={`${s.date}-${idx}`} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm block">{formatDate(s.date)}</span>
                      <span className="text-[11px] text-muted-foreground">{s.category}</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold text-primary">
                      {s.rate}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-xs pt-2 border-t">
                    <div>
                      <span className="block font-bold text-emerald-600">{s.present}</span>
                      <span className="text-[10px] text-muted-foreground">Pres</span>
                    </div>
                    <div>
                      <span className="block font-bold text-amber-600">{s.late}</span>
                      <span className="text-[10px] text-muted-foreground">Late</span>
                    </div>
                    <div>
                      <span className="block font-bold text-rose-600">{s.absent}</span>
                      <span className="text-[10px] text-muted-foreground">Abs</span>
                    </div>
                    <div>
                      <span className="block font-bold text-blue-600">{s.leave}</span>
                      <span className="text-[10px] text-muted-foreground">Leave</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Report */}
        <TabsContent value="report" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person Name</TableHead>
                  <TableHead className="text-right tabular-nums">Total Days</TableHead>
                  <TableHead className="text-right tabular-nums">Present</TableHead>
                  <TableHead className="text-right tabular-nums">Late</TableHead>
                  <TableHead className="text-right tabular-nums">Absent</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((e) => (
                  <TableRow key={e.personId} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-sm">{e.personName}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono">{e.totalDays}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono font-bold text-emerald-600">
                      {e.present}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono text-amber-600">{e.late}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono text-rose-600">{e.absent}</TableCell>
                    <TableCell>
                      <Badge
                        variant={e.rate >= 90 ? "success" : e.rate >= 75 ? "warning" : "destructive"}
                        className="text-[10px]"
                      >
                        {e.rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
