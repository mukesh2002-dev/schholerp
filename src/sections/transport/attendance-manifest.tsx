"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bus,
  CalendarDays,
  CheckCircle2,
  History,
  MinusCircle,
  RefreshCw,
  Save,
  Search,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import {
  fetchBoardingCorrections,
  fetchBoardingRouteSummary,
  fetchBoardingStudentSummary,
  fetchRoutes,
  fetchStudentBoardingHistory,
  fetchTransportBills,
  fetchTransportPayments,
  fetchTripAttendance,
  searchTransportStudentsApi,
  submitTripAttendance,
  type AttendanceManifest,
  type AttendanceStudentRow,
  type BoardingCorrection,
  type BoardingRouteSummary,
  type BoardingStatus,
  type NotPickedReason,
  type StudentBoardingHistoryRow,
  type StudentBoardingSummaryRow,
  type TransportStudentSearchRow,
} from "@/lib/api/transport";

const REASONS: { value: NotPickedReason; label: string }[] = [
  { value: "ABSENT", label: "Absent" },
  { value: "SELF_ARRANGED", label: "Self arranged" },
  { value: "NO_SHOW", label: "No show" },
  { value: "HOLIDAY", label: "Holiday" },
];

const STATUS_META: Record<BoardingStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  BOARDED: { label: "Boarded", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", Icon: CheckCircle2 },
  NOT_BOARDED: { label: "Not boarded", className: "bg-rose-500/10 text-rose-600 border-rose-500/30", Icon: XCircle },
  NOT_MARKED: { label: "Not marked", className: "bg-muted text-muted-foreground border-border", Icon: MinusCircle },
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const money = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

const daysAgoStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const historyBadgeVariant = (status: BoardingStatus): "success" | "destructive" | "outline" =>
  status === "BOARDED" ? "success" : status === "NOT_BOARDED" ? "destructive" : "outline";

const dateKeyOf = (value: string | Date) => {
  if (typeof value === "string") return value.slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
};

const formatClock = (value?: string | null) => {
  if (!value) return "";
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const monthKeyList = (from: string, to: string) => {
  if (!from || !to) return [];
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const months: { year: number; month: number }[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor <= last) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};

type StatusEntry = { status: BoardingStatus; reason: NotPickedReason | "ABSENT" };

export function AttendanceManifestView() {
  const searchParams = useSearchParams();
  const { activeBranchId } = useERP();

  const { data: routes } = useCampusData({
    fetcher: (cid) => fetchRoutes({ campusId: cid, limit: 200 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-routes",
  });

  const [routeUuid, setRouteUuid] = useState("");
  const [date, setDate] = useState(todayStr());
  const [tripType, setTripType] = useState<"PICKUP" | "DROP">("PICKUP");
  const [manifest, setManifest] = useState<AttendanceManifest | null>(null);
  const [statusMap, setStatusMap] = useState<Record<string, StatusEntry>>({});
  const [corrections, setCorrections] = useState<BoardingCorrection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");

  const [historyFrom, setHistoryFrom] = useState(() => daysAgoStr(30));
  const [historyTo, setHistoryTo] = useState(todayStr());
  const [routeSummary, setRouteSummary] = useState<BoardingRouteSummary[]>([]);
  const [historyCorrections, setHistoryCorrections] = useState<BoardingCorrection[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<TransportStudentSearchRow[]>([]);
  const [studentSearching, setStudentSearching] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<TransportStudentSearchRow | null>(null);
  const [studentHistory, setStudentHistory] = useState<StudentBoardingHistoryRow[]>([]);
  const [studentHistoryLoading, setStudentHistoryLoading] = useState(false);

  const [historyRouteUuid, setHistoryRouteUuid] = useState("");
  const [studentSummary, setStudentSummary] = useState<StudentBoardingSummaryRow[]>([]);
  const [studentSummaryLoading, setStudentSummaryLoading] = useState(false);
  const [detailRow, setDetailRow] = useState<StudentBoardingSummaryRow | null>(null);
  const [detailHistory, setDetailHistory] = useState<StudentBoardingHistoryRow[]>([]);
  const [detailBills, setDetailBills] = useState<any[]>([]);
  const [detailPayments, setDetailPayments] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const routeList = (routes.data as any[]) ?? [];

  useEffect(() => {
    if (!routeList.length) return;
    const fromQuery = searchParams.get("route");
    if (fromQuery && routeList.some((r) => r.uuid === fromQuery)) {
      setRouteUuid(fromQuery);
    } else {
      setRouteUuid((prev) => prev || routeList[0]?.uuid || "");
    }
  }, [routeList, searchParams]);

  useEffect(() => {
    if (!routeList.length) return;
    const fromQuery = searchParams.get("route");
    setHistoryRouteUuid((prev) =>
      prev || (fromQuery && routeList.some((r) => r.uuid === fromQuery) ? fromQuery : routeList[0]?.uuid || "")
    );
  }, [routeList, searchParams]);

  const load = useCallback(async () => {
    if (!routeUuid) return;
    setLoading(true);
    try {
      const [manifestData, correctionData] = await Promise.all([
        fetchTripAttendance({ routeUuid, date, tripType }),
        fetchBoardingCorrections({ routeUuid, date, limit: 20 }).catch(() => ({ data: [], meta: null })),
      ]);
      setManifest(manifestData);
      const next: Record<string, StatusEntry> = {};
      for (const group of manifestData.stops) {
        for (const s of group.students) {
          next[s.student.uuid] = {
            status: s.boarding.boardingStatus,
            reason: (s.boarding.reason as NotPickedReason) || "ABSENT",
          };
        }
      }
      setStatusMap(next);
      setCorrections(correctionData.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load attendance");
      setManifest(null);
      setCorrections([]);
    } finally {
      setLoading(false);
    }
  }, [routeUuid, date, tripType]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const [summary, correctionData] = await Promise.all([
        fetchBoardingRouteSummary({ from: historyFrom || undefined, to: historyTo || undefined }),
        fetchBoardingCorrections({ from: historyFrom || undefined, to: historyTo || undefined, limit: 50 })
          .catch(() => ({ data: [], meta: null })),
      ]);
      setRouteSummary(summary);
      setHistoryCorrections(correctionData.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load attendance history");
      setRouteSummary([]);
      setHistoryCorrections([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyFrom, historyTo]);

  const loadStudentHistory = useCallback(async (studentUuid: string) => {
    setStudentHistoryLoading(true);
    try {
      const rows = await fetchStudentBoardingHistory(studentUuid, {
        from: historyFrom || undefined,
        to: historyTo || undefined,
      });
      setStudentHistory(rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load student history");
      setStudentHistory([]);
    } finally {
      setStudentHistoryLoading(false);
    }
  }, [historyFrom, historyTo]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (historyStudent) void loadStudentHistory(historyStudent.student.uuid);
  }, [historyStudent, loadStudentHistory]);

  const loadStudentSummary = useCallback(async () => {
    if (!historyRouteUuid) {
      setStudentSummary([]);
      return;
    }
    setStudentSummaryLoading(true);
    try {
      const res = await fetchBoardingStudentSummary({
        routeUuid: historyRouteUuid,
        from: historyFrom || undefined,
        to: historyTo || undefined,
      });
      setStudentSummary(res.students);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load students");
      setStudentSummary([]);
    } finally {
      setStudentSummaryLoading(false);
    }
  }, [historyRouteUuid, historyFrom, historyTo]);

  useEffect(() => {
    void loadStudentSummary();
  }, [loadStudentSummary]);

  const openStudentDetail = async (row: StudentBoardingSummaryRow) => {
    setDetailRow(row);
    setDetailHistory([]);
    setDetailBills([]);
    setDetailPayments([]);
    setDetailLoading(true);
    try {
      const [history, bills, payments] = await Promise.all([
        fetchStudentBoardingHistory(row.student.uuid, {
          from: historyFrom || undefined,
          to: historyTo || undefined,
        }),
        fetchTransportBills({ studentUuid: row.student.uuid, limit: 20 }).catch(() => ({ data: [], total: 0 })),
        fetchTransportPayments({ studentUuid: row.student.uuid, limit: 20 }).catch(() => ({ data: [], meta: {} })),
      ]);
      setDetailHistory(history);
      setDetailBills(bills.data ?? []);
      setDetailPayments(payments.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load student details");
    } finally {
      setDetailLoading(false);
    }
  };

  const searchHistoryStudents = async () => {
    const q = studentQuery.trim();
    if (q.length < 2) {
      toast.error("Type at least 2 characters (name or admission no)");
      return;
    }
    setStudentSearching(true);
    try {
      const rows = await searchTransportStudentsApi(q);
      setStudentResults(rows);
      if (rows.length === 0) toast.info("No matching students found");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Student search failed");
    } finally {
      setStudentSearching(false);
    }
  };

  const pickHistoryStudent = (row: TransportStudentSearchRow) => {
    setHistoryStudent(row);
    setStudentQuery(row.student.name);
    setStudentResults([]);
    setStudentHistory([]);
  };

  const allStudents = useMemo<AttendanceStudentRow[]>(
    () => (manifest?.stops ?? []).flatMap((g) => g.students),
    [manifest]
  );

  const setStatus = (studentUuid: string, status: BoardingStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentUuid]: { status, reason: prev[studentUuid]?.reason ?? "ABSENT" },
    }));
  };

  const setReason = (studentUuid: string, reason: NotPickedReason) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentUuid]: { status: "NOT_BOARDED", reason },
    }));
  };

  const markAllBoarded = () => {
    const next: Record<string, StatusEntry> = {};
    for (const s of allStudents) next[s.student.uuid] = { status: "BOARDED", reason: "ABSENT" };
    setStatusMap(next);
    toast.success("All students marked boarded — review and submit");
  };

  const counts = useMemo(() => {
    let boarded = 0;
    let notBoarded = 0;
    let notMarked = 0;
    for (const s of allStudents) {
      const st = statusMap[s.student.uuid]?.status ?? "NOT_MARKED";
      if (st === "BOARDED") boarded += 1;
      else if (st === "NOT_BOARDED") notBoarded += 1;
      else notMarked += 1;
    }
    return { boarded, notBoarded, notMarked, expected: allStudents.length };
  }, [allStudents, statusMap]);

  const submit = async (confirm: boolean) => {
    if (!manifest) return;
    if (confirm && counts.notMarked > 0) {
      const ok = window.confirm(
        `${counts.notMarked} student(s) are still NOT MARKED. Submit anyway?`
      );
      if (!ok) return;
    }
    setSaving(true);
    try {
      const payloadStudents = allStudents.map((s) => {
        const entry = statusMap[s.student.uuid] ?? { status: "NOT_MARKED" as BoardingStatus, reason: "ABSENT" as NotPickedReason };
        return {
          studentUuid: s.student.uuid,
          boardingStatus: entry.status,
          reason: entry.status === "NOT_BOARDED" ? (entry.reason as NotPickedReason) : undefined,
        };
      });
      const res = await submitTripAttendance({
        routeUuid,
        tripDate: date,
        tripType,
        confirm,
        correctionReason: correctionReason.trim() || undefined,
        students: payloadStudents,
      });
      toast.success(
        confirm
          ? `Attendance submitted — ${res.submitted} students`
          : `Draft saved — ${res.submitted} students`
      );
      if (res.corrections > 0) {
        toast.message(`${res.corrections} correction(s) recorded in audit trail`);
      }
      setCorrectionReason("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  const detailPending = detailBills.reduce((sum, b) => sum + Math.max(0, Number(b.balance)), 0);
  const detailPaid = detailPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <Tabs defaultValue="mark" className="space-y-3">
      <TabsList className="h-9">
        <TabsTrigger value="mark" className="text-xs">Mark attendance</TabsTrigger>
        <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
      </TabsList>

      <TabsContent value="mark" className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px]">
            <label className="text-[11px] font-medium text-muted-foreground">Route</label>
            <Select value={routeUuid} onValueChange={setRouteUuid}>
              <SelectTrigger className="mt-1 h-9 text-xs">
                <SelectValue placeholder="Select route" />
              </SelectTrigger>
              <SelectContent>
                {routeList.map((r: any) => (
                  <SelectItem key={r.uuid} value={r.uuid} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 h-9 text-xs w-[140px]" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Trip</label>
            <div className="mt-1 flex rounded-lg border p-0.5 h-9">
              {(["PICKUP", "DROP"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTripType(t)}
                  className={`px-3 rounded-md text-xs font-medium transition-colors ${
                    tripType === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => void load()} disabled={loading || !routeUuid}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={markAllBoarded} disabled={!allStudents.length}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark all boarded
          </Button>
        </div>
      </Card>

      {manifest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SummaryCard label="Expected" value={counts.expected} tone="default" />
          <SummaryCard label="Boarded" value={counts.boarded} tone="emerald" />
          <SummaryCard label="Not boarded" value={counts.notBoarded} tone="rose" />
          <SummaryCard label="Not marked" value={counts.notMarked} tone="amber" />
        </div>
      )}

      {manifest && (
        <Card className="p-3 border-border/70 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Bus className="h-3.5 w-3.5" /> {manifest.vehicle?.registrationNumber ?? "No bus"}</span>
          <span>Driver: {manifest.driver?.name ?? "—"}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {manifest.routeName}</span>
          <span className="font-mono">{manifest.tripDate}</span>
          {manifest.warning && (
            <span className="flex items-center gap-1 text-amber-600 ml-auto">
              <AlertTriangle className="h-3.5 w-3.5" /> {manifest.warning}
            </span>
          )}
        </Card>
      )}

      {loading && !manifest ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading manifest…</Card>
      ) : !manifest ? (
        <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">
          Select a route with active students to load the trip manifest.
        </Card>
      ) : allStudents.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">
          No active students on this route.
        </Card>
      ) : (
        <div className="space-y-3">
          {manifest.stops.map((group) => (
            <Card key={group.stopName} className="border-border/60">
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                      {group.stopSequence === 999 ? "—" : group.stopSequence}
                    </span>
                    <span className="text-sm font-semibold">{group.stopName}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{group.students.length} students</Badge>
                </div>
                <div className="space-y-1.5">
                  {group.students.map((s) => {
                    const entry = statusMap[s.student.uuid] ?? { status: s.boarding.boardingStatus, reason: "ABSENT" as NotPickedReason };
                    return (
                      <div key={s.student.uuid} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{s.student.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {[s.student.admissionNo, s.student.class].filter(Boolean).join(" • ") || "—"}
                          </div>
                        </div>
                        {entry.status === "NOT_BOARDED" && (
                          <Select value={entry.reason} onValueChange={(v) => setReason(s.student.uuid, v as NotPickedReason)}>
                            <SelectTrigger className="h-7 w-[130px] text-[11px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REASONS.map((r) => (
                                <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex items-center gap-1">
                          {(["BOARDED", "NOT_BOARDED", "NOT_MARKED"] as BoardingStatus[]).map((status) => {
                            const meta = STATUS_META[status];
                            const active = entry.status === status;
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => setStatus(s.student.uuid, status)}
                                className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors ${
                                  active ? meta.className : "border-border text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                <meta.Icon className="h-3 w-3" /> {meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="p-3 border-border/70 space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground">Correction reason (optional — saved when you change an already-marked student)</label>
            <Input
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Conductor corrected a wrong marking"
              className="h-9 text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => void submit(false)} disabled={saving}>
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save as draft"}
              </Button>
              <Button variant="gradient" size="sm" className="h-9 text-xs gap-1" onClick={() => void submit(true)} disabled={saving}>
                <CheckCircle2 className="h-3.5 w-3.5" /> {saving ? "Submitting…" : "Confirm & submit"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="border-border/70">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold">Corrections audit trail</h3>
            <Badge variant="outline" className="text-[10px] ml-auto">{corrections.length}</Badge>
          </div>
          {corrections.length === 0 ? (
            <p className="text-xs text-muted-foreground">No corrections recorded for this route/date.</p>
          ) : (
            <div className="space-y-1.5">
              {corrections.map((c) => (
                <div key={c.uuid} className="rounded-lg border bg-card p-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.student?.name ?? "Student"}</span>
                    <span className="text-muted-foreground">
                      {c.oldStatus} → <strong>{c.newStatus}</strong>
                      {c.newReason ? ` (${c.newReason})` : ""}
                    </span>
                    <span className="ml-auto text-muted-foreground">
                      {c.correctedBy?.name ?? "system"} • {new Date(c.correctedAt).toLocaleString()}
                    </span>
                  </div>
                  {c.reason && <div className="text-muted-foreground mt-0.5">Reason: {c.reason}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-3">
        <Card className="p-3 border-border/70">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[220px]">
              <label className="text-[11px] font-medium text-muted-foreground">Route</label>
              <Select value={historyRouteUuid} onValueChange={setHistoryRouteUuid}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routeList.map((r: any) => (
                    <SelectItem key={r.uuid} value={r.uuid} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">From</label>
              <Input type="date" value={historyFrom} onChange={(e) => setHistoryFrom(e.target.value)} className="mt-1 h-9 text-xs w-[140px]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">To</label>
              <Input type="date" value={historyTo} onChange={(e) => setHistoryTo(e.target.value)} className="mt-1 h-9 text-xs w-[140px]" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1"
              onClick={() => { void loadHistory(); void loadStudentSummary(); }}
              disabled={historyLoading || studentSummaryLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${historyLoading || studentSummaryLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <span className="text-[11px] text-muted-foreground ml-auto">
              Route-wise boarding summary, student history aur corrections
            </span>
          </div>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Route-wise history</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">{routeSummary.length}</Badge>
            </div>
            {historyLoading ? (
              <p className="text-xs text-muted-foreground p-3 text-center">Loading history…</p>
            ) : routeSummary.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">Is date range me koi boarding record nahi mila.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-1.5 pr-2">Route</th>
                      <th className="py-1.5 pr-2">Students</th>
                      <th className="py-1.5 pr-2">Active</th>
                      <th className="py-1.5 pr-2">Trips</th>
                      <th className="py-1.5 pr-2">Boarded</th>
                      <th className="py-1.5 pr-2">Not boarded</th>
                      <th className="py-1.5 pr-2">Not marked</th>
                      <th className="py-1.5 text-right">Boarding %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeSummary.map((r) => {
                      const selected = r.routeUuid === historyRouteUuid;
                      return (
                        <tr
                          key={r.routeUuid}
                          onClick={() => setHistoryRouteUuid(r.routeUuid)}
                          className={`border-b last:border-0 cursor-pointer ${selected ? "bg-primary/5" : "hover:bg-muted/40"}`}
                        >
                          <td className="py-1.5 pr-2 font-medium">
                            <span className="flex items-center gap-1.5">
                              {selected && <CalendarDays className="h-3.5 w-3.5 text-primary" />}
                              {r.routeName}
                            </span>
                          </td>
                          <td className="py-1.5 pr-2">
                            {selected ? (
                              studentSummaryLoading ? (
                                <span className="text-muted-foreground">Loading…</span>
                              ) : studentSummary.length === 0 ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <span className="flex flex-wrap gap-1">
                                  {studentSummary.map((s) => (
                                    <button
                                      key={s.student.uuid}
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); void openStudentDetail(s); }}
                                      className="rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/20"
                                    >
                                      {s.student.name}
                                    </button>
                                  ))}
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] text-primary">Click to view students</span>
                            )}
                          </td>
                          <td className="py-1.5 pr-2">{r.activeStudents}</td>
                          <td className="py-1.5 pr-2">{r.tripsMarked}</td>
                          <td className="py-1.5 pr-2 text-emerald-600">{r.boarded}</td>
                          <td className="py-1.5 pr-2 text-rose-600">{r.notBoarded}</td>
                          <td className="py-1.5 pr-2 text-amber-600">{r.notMarked}</td>
                          <td className="py-1.5 text-right font-semibold">
                            {r.boardingPct == null ? "—" : `${r.boardingPct}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Students on route</h3>
              <Badge variant="outline" className="text-[10px]">{studentSummary.length}</Badge>
              <span className="ml-auto text-[10px] text-muted-foreground">Naam pe click karke pura data dekho</span>
            </div>
            {studentSummaryLoading ? (
              <p className="text-xs text-muted-foreground p-3 text-center">Loading students…</p>
            ) : studentSummary.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">Is route par koi student nahi mila.</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-1.5 pr-2">Student</th>
                      <th className="py-1.5 pr-2">Class</th>
                      <th className="py-1.5 pr-2">Stop</th>
                      <th className="py-1.5 pr-2">Boarded</th>
                      <th className="py-1.5 pr-2">Not boarded</th>
                      <th className="py-1.5 pr-2">Not marked</th>
                      <th className="py-1.5 text-right">Last trip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentSummary.map((s) => (
                      <tr key={s.student.uuid} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-1.5 pr-2">
                          <button
                            type="button"
                            onClick={() => void openStudentDetail(s)}
                            className="text-left font-semibold text-primary hover:underline"
                          >
                            {s.student.name}
                          </button>
                          <div className="text-[10px] text-muted-foreground">{s.student.admissionNo ?? "—"}</div>
                        </td>
                        <td className="py-1.5 pr-2">{s.student.class ?? "—"}</td>
                        <td className="py-1.5 pr-2">{s.assignment?.stop?.name ?? s.assignment?.stopName ?? "—"}</td>
                        <td className="py-1.5 pr-2 text-emerald-600">{s.boarded}</td>
                        <td className="py-1.5 pr-2 text-rose-600">{s.notBoarded}</td>
                        <td className="py-1.5 pr-2 text-amber-600">{s.notMarked}</td>
                        <td className="py-1.5 text-right text-muted-foreground">
                          {s.lastTrip
                            ? `${new Date(s.lastTrip.date).toLocaleDateString("en-IN")} · ${s.lastTrip.boardingStatus}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Student attendance history</h3>
            </div>
            <div className="flex gap-2">
              <Input
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void searchHistoryStudents(); }}
                placeholder="Student name or admission no"
                className="h-9 text-xs"
              />
              <Button size="sm" className="h-9 text-xs gap-1" onClick={() => void searchHistoryStudents()} disabled={studentSearching}>
                <Search className="h-3.5 w-3.5" /> {studentSearching ? "Searching…" : "Search"}
              </Button>
            </div>

            {studentResults.length > 0 && (
              <div className="max-h-48 overflow-auto space-y-1">
                {studentResults.map((r) => (
                  <button
                    key={r.student.uuid}
                    type="button"
                    onClick={() => pickHistoryStudent(r)}
                    className="w-full flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-left text-xs hover:bg-muted/40"
                  >
                    <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold">{r.student.name}</span>
                    <span className="text-muted-foreground">{r.student.admissionNo ?? ""}</span>
                    <span className="text-muted-foreground">{r.student.class ?? ""}</span>
                    {r.assignment?.route && (
                      <span className="ml-auto text-[10px] text-muted-foreground">{r.assignment.route.name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {historyStudent && (
              <div className="rounded-lg border bg-muted/20 p-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{historyStudent.student.name}</span>
                  <span className="text-muted-foreground">{historyStudent.student.admissionNo ?? ""}</span>
                  {historyStudent.assignment?.route && (
                    <span className="ml-auto text-[10px] text-muted-foreground">{historyStudent.assignment.route.name}</span>
                  )}
                </div>
                {studentHistoryLoading ? (
                  <p className="text-muted-foreground p-2 text-center">Loading student history…</p>
                ) : studentHistory.length === 0 ? (
                  <p className="text-muted-foreground p-2 text-center">Is date range me koi boarding history nahi hai.</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {studentHistory.map((h, i) => (
                      <div key={`${h.date}-${h.tripType}-${i}`} className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2">
                        <span className="font-mono text-[11px]">{new Date(h.date).toLocaleDateString("en-IN")}</span>
                        <Badge variant="outline" className="text-[10px]">{h.tripType}</Badge>
                        <Badge variant={historyBadgeVariant(h.boardingStatus)} className="text-[10px]">{h.boardingStatus}</Badge>
                        {h.reason && <span className="text-muted-foreground">{h.reason}</span>}
                        <span className="ml-auto text-[10px] text-muted-foreground">{h.route?.name ?? ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Corrections in range</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">{historyCorrections.length}</Badge>
            </div>
            {historyCorrections.length === 0 ? (
              <p className="text-xs text-muted-foreground p-3 text-center">Is date range me koi correction record nahi hai.</p>
            ) : (
              <div className="space-y-1.5">
                {historyCorrections.map((c) => (
                  <div key={c.uuid} className="rounded-lg border bg-card p-2 text-[11px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{c.student?.name ?? "Student"}</span>
                      <span className="text-muted-foreground">
                        {c.oldStatus} → <strong>{c.newStatus}</strong>
                        {c.newReason ? ` (${c.newReason})` : ""}
                      </span>
                      <span className="ml-auto text-muted-foreground">
                        {c.correctedBy?.name ?? "system"} • {new Date(c.correctedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      {c.tripDate ? new Date(c.tripDate).toLocaleDateString("en-IN") : ""}
                      {c.tripType ? ` • ${c.tripType}` : ""}
                      {c.route?.name ? ` • ${c.route.name}` : ""}
                    </div>
                    {c.reason && <div className="text-muted-foreground mt-0.5">Reason: {c.reason}</div>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={Boolean(detailRow)} onOpenChange={(open) => { if (!open) setDetailRow(null); }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{detailRow?.student.name ?? "Student"}</DialogTitle>
            <DialogDescription>
              {detailRow?.student.admissionNo ?? "—"} • {detailRow?.student.class ?? "—"}
            </DialogDescription>
          </DialogHeader>

          {detailRow && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg border p-2">
                  <div className="text-[10px] text-muted-foreground">Route</div>
                  <div className="font-semibold">{detailRow.assignment?.route?.name ?? "—"}</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-[10px] text-muted-foreground">Stop</div>
                  <div className="font-semibold">{detailRow.assignment?.stop?.name ?? detailRow.assignment?.stopName ?? "—"}</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-[10px] text-muted-foreground">Pickup</div>
                  <div className="font-semibold">{detailRow.assignment?.pickupTime ?? "—"}</div>
                </div>
                <div className="rounded-lg border p-2">
                  <div className="text-[10px] text-muted-foreground">Drop</div>
                  <div className="font-semibold">{detailRow.assignment?.dropTime ?? "—"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <SummaryCard label="Boarded" value={detailRow.boarded} tone="emerald" />
                <SummaryCard label="Not boarded" value={detailRow.notBoarded} tone="rose" />
                <SummaryCard label="Not marked" value={detailRow.notMarked} tone="amber" />
                <SummaryCard label="Total trips" value={detailRow.total} tone="default" />
              </div>

              <div className="rounded-lg border p-2 space-y-1">
                <div className="font-semibold">Student & guardian</div>
                <div className="text-muted-foreground">
                  {detailRow.student.guardianName ?? "—"}
                  {detailRow.student.guardianPhone ? ` • ${detailRow.student.guardianPhone}` : ""}
                </div>
                <div className="text-muted-foreground">Transport status: {detailRow.assignment?.status ?? "—"}</div>
              </div>

              <div className="rounded-lg border p-2 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Transport fees</span>
                  <span className="ml-auto">
                    Pending <b className="text-rose-600">{money(detailPending)}</b> • Paid{" "}
                    <b className="text-emerald-600">{money(detailPaid)}</b>
                  </span>
                </div>
                {detailLoading ? (
                  <p className="text-muted-foreground p-2 text-center">Loading fees…</p>
                ) : detailBills.length === 0 && detailPayments.length === 0 ? (
                  <p className="text-muted-foreground p-2 text-center">Koi transport fee record nahi hai.</p>
                ) : (
                  <>
                    {detailBills.slice(0, 4).map((b) => (
                      <div key={b.uuid} className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-1.5 text-[11px]">
                        <span className="font-semibold">{b.month}/{b.year}</span>
                        <span className="text-muted-foreground">Due {money(b.amountDue)}</span>
                        <span className="text-muted-foreground">Paid {money(b.amountPaid)}</span>
                        <span className="ml-auto text-rose-600">Balance {money(b.balance)}</span>
                      </div>
                    ))}
                    {detailPayments.slice(0, 4).map((p) => (
                      <div key={p.uuid} className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-1.5 text-[11px]">
                        <span className="font-mono">{p.receiptNumber}</span>
                        <span className="font-semibold">{money(p.amount)}</span>
                        <span className="text-muted-foreground">{p.paymentMode}</span>
                        <span className="ml-auto text-muted-foreground">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : ""}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="rounded-lg border p-2 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">Attendance calendar</span>
                  <span className="text-[10px] text-muted-foreground">Aane (pickup) aur Jaane (drop) alag-alag</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">{detailHistory.length} entries</Badge>
                </div>
                {detailLoading ? (
                  <p className="text-muted-foreground p-2 text-center">Loading history…</p>
                ) : detailHistory.length === 0 ? (
                  <p className="text-muted-foreground p-2 text-center">Is date range me boarding history nahi hai.</p>
                ) : (
                  <BoardingCalendar
                    rows={detailHistory}
                    from={historyFrom}
                    to={historyTo}
                    pickupTime={detailRow.assignment?.pickupTime}
                    dropTime={detailRow.assignment?.dropTime}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}

function BoardingCalendar({
  rows,
  from,
  to,
  pickupTime,
  dropTime,
}: {
  rows: StudentBoardingHistoryRow[];
  from: string;
  to: string;
  pickupTime?: string | null;
  dropTime?: string | null;
}) {
  const months = useMemo(() => monthKeyList(from, to), [from, to]);
  const byDate = useMemo(() => {
    const map = new Map<string, { PICKUP?: StudentBoardingHistoryRow; DROP?: StudentBoardingHistoryRow }>();
    for (const row of rows) {
      const key = dateKeyOf(row.date);
      const entry = map.get(key) ?? {};
      if (row.tripType === "PICKUP") entry.PICKUP = row;
      else if (row.tripType === "DROP") entry.DROP = row;
      map.set(key, entry);
    }
    return map;
  }, [rows]);

  if (months.length === 0) {
    return <p className="text-muted-foreground p-2 text-center">Date range select karo.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />Present</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-500" />Absent</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />Not marked</span>
        <span>Aane: pickup {pickupTime ?? "—"} • Jaane: drop {dropTime ?? "—"}</span>
      </div>
      {months.map(({ year, month }) => {
        const first = new Date(year, month, 1);
        const pad = first.getDay();
        const days = new Date(year, month + 1, 0).getDate();
        const monthLabel = first.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
        return (
          <div key={`${year}-${month}`} className="rounded-lg border p-2">
            <div className="mb-1 text-center text-[11px] font-bold">{monthLabel}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-medium text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: pad }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const inRange = key >= from && key <= to;
                const entry = byDate.get(key);
                const isToday = key === todayStr();
                return (
                  <div
                    key={key}
                    className={`min-h-[66px] rounded-md border p-1 text-left ${
                      inRange ? "bg-card" : "bg-muted/20 opacity-50"
                    } ${isToday ? "border-primary" : "border-border/60"}`}
                  >
                    <div className={`text-[9px] font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      {day}
                    </div>
                    {inRange && (
                      <div className="mt-0.5 space-y-0.5">
                        <CalendarTripLine label="Aane" row={entry?.PICKUP} fallbackTime={pickupTime} />
                        <CalendarTripLine label="Jaane" row={entry?.DROP} fallbackTime={dropTime} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarTripLine({
  label,
  row,
  fallbackTime,
}: {
  label: string;
  row?: StudentBoardingHistoryRow;
  fallbackTime?: string | null;
}) {
  if (!row) {
    return (
      <div className="flex items-center justify-between gap-1 text-[8px] text-muted-foreground">
        <span>{label}</span>
        <span>—</span>
      </div>
    );
  }
  const status =
    row.boardingStatus === "BOARDED"
      ? "Present"
      : row.boardingStatus === "NOT_BOARDED"
        ? "Absent"
        : "Not marked";
  const color =
    row.boardingStatus === "BOARDED"
      ? "text-emerald-600"
      : row.boardingStatus === "NOT_BOARDED"
        ? "text-rose-600"
        : "text-muted-foreground";
  const time = formatClock(row.markedAt) || formatClock(fallbackTime) || "";
  return (
    <div
      className={`flex items-center justify-between gap-1 text-[8px] ${color}`}
      title={`${label}: ${status}${time ? ` at ${time}` : ""}${row.reason ? ` (${row.reason})` : ""}`}
    >
      <span>{label}</span>
      <span className="font-semibold">{status}</span>
      {time && <span className="text-muted-foreground">{time}</span>}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "default" | "emerald" | "rose" | "amber" }) {
  const toneClass = {
    default: "text-foreground",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
  }[tone];
  return (
    <Card className="p-3 border-border/70">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-xl font-bold ${toneClass}`}>{value}</div>
    </Card>
  );
}
