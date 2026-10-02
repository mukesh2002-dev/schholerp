"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AppImage } from "@/components/ui/app-image";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2, Save, Search, Zap } from "lucide-react";
import { fetchStudents } from "@/lib/api/students";
import { fetchClasses } from "@/lib/api/classes";
import { fetchStudentAttendance, markStudentAttendanceApi } from "@/lib/api/attendance";

type MarkStatus = "present" | "absent" | "late" | "leave" | "half_day";

const STATUS_BUTTONS: { value: MarkStatus; label: string }[] = [
  { value: "present", label: "P" },
  { value: "absent", label: "A" },
  { value: "late", label: "L" },
  { value: "leave", label: "Lv" },
  { value: "half_day", label: "H" },
];

const toBackendStatus = (s: string): string => {
  const v = s.toLowerCase();
  if (v === "leave") return "leave"; // backend normalizes leave → excused
  return v;
};

const fromBackendStatus = (s: string): MarkStatus => {
  const v = (s ?? "").toLowerCase();
  if (v === "excused" || v === "leave") return "leave";
  if (v === "absent") return "absent";
  if (v === "late") return "late";
  if (v === "half_day" || v === "half-day") return "half_day";
  return "present";
};

const todayISO = () => new Date().toISOString().split("T")[0];

export function MarkAttendance() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [search, setSearch] = useState("");
  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const { data: classes } = useCampusData({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchClasses>>,
    queryKeyPrefix: "classes",
  });

  const { data: rosterData, isLoading: rosterLoading } = useCampusData({
    fetcher: (cid) =>
      classId
        ? fetchStudents({ campusId: cid, classId, limit: 200 }).then((r) => r.data)
        : Promise.resolve([]),
    campusId: activeBranchId,
    fallback: [] as any[],
    queryKeyPrefix: `class-roster-${classId || "none"}`,
  });

  const { data: existing, isLoading: existingLoading, refresh: refreshExisting } = useCampusData({
    fetcher: (cid) =>
      classId ? fetchStudentAttendance({ campusId: cid, classId, date }) : Promise.resolve([]),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchStudentAttendance>>,
    queryKeyPrefix: `class-attendance-${classId || "none"}-${date}`,
  });

  // Prefill marks from already-saved attendance for this class+date
  useEffect(() => {
    if (!classId) { setMarks({}); return; }
    const prefill: Record<string, MarkStatus> = {};
    for (const r of existing as any[]) {
      const sid = r.student?.uuid ?? r.studentId;
      if (sid) prefill[String(sid)] = fromBackendStatus(r.status);
    }
    setMarks(prefill);
    setSavedAt(Object.keys(prefill).length > 0 ? date : null);
  }, [existing, classId, date]);

  const keyOf = (s: any) => String(s.uuid ?? s.id);
  const markOf = (s: any): MarkStatus => marks[keyOf(s)] ?? "present";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rosterData;
    return rosterData.filter((s: any) =>
      (s.fullName ?? "").toLowerCase().includes(q) ||
      (s.admissionNumber ?? "").toLowerCase().includes(q) ||
      (s.rollNumber ?? "").toLowerCase().includes(q)
    );
  }, [rosterData, search]);

  const counts = useMemo(() => {
    const c: Record<MarkStatus, number> = { present: 0, absent: 0, late: 0, leave: 0, half_day: 0 };
    for (const s of filtered) c[markOf(s)] += 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, marks]);

  const setAll = (v: MarkStatus) => {
    const next: Record<string, MarkStatus> = { ...marks };
    for (const s of filtered) next[keyOf(s)] = v;
    setMarks(next);
  };

  const handleSubmit = async () => {
    if (!classId) { toast.error("Select a class first"); return; }
    if (date > todayISO()) { toast.error("Future dates not allowed — today or past only"); return; }
    if (filtered.length === 0) { toast.error("No students in this class"); return; }
    setSaving(true);
    try {
      const records = filtered.map((s: any) => ({ studentId: keyOf(s), status: toBackendStatus(markOf(s)) }));
      const res = await markStudentAttendanceApi({ campusId: branch, classId, date, records });
      toast.success(`Saved ${res.count} record(s) for ${formatDate(date)}`);
      setSavedAt(date);
      void refreshExisting();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const loading = rosterLoading || existingLoading;

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-52 flex-1">
            <label className="text-xs font-medium block mb-1">Class *</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (
                  <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Date</label>
            <Input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => {
                const v = e.target.value;
                if (v && v > todayISO()) {
                  toast.error("Future dates not allowed — reset to today");
                  setDate(todayISO());
                } else {
                  setDate(v);
                }
              }}
              className="h-9 text-xs w-40"
            />
          </div>
          <div className="relative flex-1 min-w-44">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / adm no…" className="pl-9 h-9 text-xs" />
          </div>
          <Button size="sm" variant="outline" className="h-9 text-xs gap-1 text-emerald-600" onClick={() => setAll("present")} disabled={!classId || filtered.length === 0}>
            <CheckCircle2 className="h-3.5 w-3.5" /> All Present
          </Button>
          <Button size="sm" variant="gradient" className="h-9 text-xs gap-1" onClick={() => void handleSubmit()} disabled={saving || !classId || filtered.length === 0}>
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : `Save (${filtered.length})`}
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9 text-xs gap-1">
            <Link href="/attendance/mark"><Zap className="h-3.5 w-3.5" /> Simple Page</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
          <span className="text-muted-foreground">P Present</span>
          <span className="text-muted-foreground">A Absent</span>
          <span className="text-muted-foreground">L Late</span>
          <span className="text-muted-foreground">Lv Leave</span>
          <span className="text-muted-foreground">H Half-day</span>
          <span className="ml-auto text-muted-foreground">
            {counts.present}P • {counts.absent}A • {counts.late}L • {counts.leave}Lv • {counts.half_day}H
          </span>
          {savedAt && <Badge variant="success" className="text-[10px]">Saved for {formatDate(savedAt)}</Badge>}
        </div>
      </Card>

      {!classId ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">Select a class to begin</h3>
          <p className="text-xs text-muted-foreground mt-1">Students load class-wise. Tap P/A/L/Lv/H per student, then Save — or use biometric sync from the header.</p>
        </Card>
      ) : loading && filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading roster…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">No students in this class</h3>
          <p className="text-xs text-muted-foreground mt-1">Enroll students first (Admissions → approve → enroll).</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Adm / Roll</TableHead>
                <TableHead className="text-right">Mark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s: any) => {
                const m = markOf(s);
                return (
                  <TableRow key={keyOf(s)} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AppImage src={s.avatar} alt={s.fullName} className="h-7 w-7 rounded-full ring-1 ring-border" />
                        <span className="text-sm font-semibold">{s.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] font-mono text-muted-foreground">{s.admissionNumber}{s.rollNumber ? ` • ${s.rollNumber}` : ""}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        {STATUS_BUTTONS.map((b) => (
                          <button
                            key={b.value}
                            onClick={() => setMarks((p) => ({ ...p, [keyOf(s)]: b.value }))}
                            title={b.value}
                            className={`h-7 min-w-8 px-2 rounded-md border text-[11px] font-bold transition-colors ${
                              m === b.value
                                ? b.value === "present"
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : b.value === "absent"
                                    ? "bg-rose-500 text-white border-rose-500"
                                    : b.value === "late"
                                      ? "bg-amber-500 text-white border-amber-500"
                                      : "bg-sky-500 text-white border-sky-500"
                                : "bg-card hover:border-primary/50 text-muted-foreground"
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
