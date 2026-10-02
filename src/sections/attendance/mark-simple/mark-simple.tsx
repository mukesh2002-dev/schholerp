"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { fetchStudents } from "@/lib/api/students";
import { fetchClasses } from "@/lib/api/classes";
import { fetchStudentAttendance, markStudentAttendanceApi } from "@/lib/api/attendance";

const todayISO = () => new Date().toISOString().split("T")[0];
const ALL = "__ALL__";

export function MarkSimple() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [classId, setClassId] = useState("");
  const [section, setSection] = useState(ALL);
  const [date, setDate] = useState(todayISO());
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const { data: classes } = useCampusData({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchClasses>>,
    queryKeyPrefix: "classes",
  });

  const selectedClass = useMemo(
    () => (classes as any[]).find((c: any) => (c.uuid ?? c.id) === classId) ?? null,
    [classes, classId]
  );
  const sections: { id: string; name: string }[] = useMemo(
    () => (selectedClass?.sections ?? []).map((s: any) => ({ id: s.id ?? s.name, name: s.name })),
    [selectedClass]
  );

  const rosterKey = classId || "none";
  const { data: rosterData, isLoading } = useCampusData({
    fetcher: (cid) =>
      classId
        ? fetchStudents({
            campusId: cid,
            classId,
            section: section !== ALL ? section : undefined,
            limit: 300,
          }).then((r) => r.data)
        : Promise.resolve([]),
    campusId: activeBranchId,
    fallback: [] as any[],
    queryKeyPrefix: `simple-roster-${rosterKey}-${section}`,
  });

  const { data: existing, refresh: refreshExisting } = useCampusData({
    fetcher: (cid) =>
      classId ? fetchStudentAttendance({ campusId: cid, classId, date }) : Promise.resolve([]),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchStudentAttendance>>,
    queryKeyPrefix: `simple-marked-${rosterKey}-${date}`,
  });

  // Default: every switch ON (present). Prefill OFF for already-absent records.
  useEffect(() => {
    if (!classId) { setPresent({}); return; }
    const absent = new Set(
      (existing as any[])
        .filter((r) => ["absent"].includes(String(r.status ?? "").toLowerCase()))
        .map((r) => String(r.student?.uuid ?? r.studentId))
    );
    const next: Record<string, boolean> = {};
    for (const s of rosterData as any[]) {
      const key = String(s.uuid ?? s.id);
      next[key] = !absent.has(key);
    }
    setPresent(next);
    setTouched(false);
    setSavedAt(absent.size > 0 || (existing as any[]).length > 0 ? date : null);
  }, [existing, rosterData, classId, date]);

  const keyOf = (s: any) => String(s.uuid ?? s.id);
  const presentCount = useMemo(
    () => (rosterData as any[]).filter((s) => present[keyOf(s)] !== false).length,
    [rosterData, present]
  );

  const markAll = (v: boolean) => {
    const next: Record<string, boolean> = {};
    for (const s of rosterData as any[]) next[keyOf(s)] = v;
    setPresent(next);
    setTouched(true);
  };

  const handleSubmit = async () => {
    if (!classId) { toast.error("Select a class first"); return; }
    if (date > todayISO()) { toast.error("Future dates not allowed — today or past only"); return; }
    if (rosterData.length === 0) { toast.error("No students loaded"); return; }
    if (!touched && savedAt === date) {
      toast.info("Already saved for this date — toggle a switch to update, then Submit.");
      return;
    }
    setSaving(true);
    try {
      const records = (rosterData as any[]).map((s) => ({
        studentId: keyOf(s),
        status: present[keyOf(s)] !== false ? "present" : "absent",
      }));
      const res = await markStudentAttendanceApi({ campusId: branch, classId, date, records });
      toast.success(`Attendance saved — ${presentCount} present, ${records.length - presentCount} absent`);
      setSavedAt(date);
      setTouched(false);
      void refreshExisting();
      void res;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1">
          <Link href="/attendance"><ArrowLeft className="h-3.5 w-3.5" /> Attendance</Link>
        </Button>
        <h1 className="font-bold text-base">Mark Attendance — Simple</h1>
        {savedAt && <Badge variant="success" className="text-[10px] ml-auto">Saved {formatDate(savedAt)}</Badge>}
      </div>

      <Card className="p-3 border-border/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium block mb-1">Class *</label>
            <Select value={classId} onValueChange={(v) => { setClassId(v); setSection(ALL); }}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {(classes as any[]).map((c: any) => (
                  <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Section</label>
            <Select value={section} onValueChange={setSection} disabled={!classId}>
              <SelectTrigger className="h-10"><SelectValue placeholder={classId ? "All sections" : "Pick class first"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All sections</SelectItem>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Date (today or past)</label>
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
              className="h-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="h-9 text-xs gap-1 text-emerald-600 flex-1" onClick={() => markAll(true)} disabled={rosterData.length === 0}>
            <CheckCircle2 className="h-4 w-4" /> Mark All Present
          </Button>
          <Button size="sm" variant="gradient" className="h-9 text-xs gap-1 flex-1" onClick={() => void handleSubmit()} disabled={saving || rosterData.length === 0}>
            <Save className="h-4 w-4" /> {saving ? "Saving…" : `Submit (${presentCount}/${rosterData.length} present)`}
          </Button>
        </div>
      </Card>

      {!classId ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">Select a class above</h3>
          <p className="text-xs text-muted-foreground mt-1">Switch ON = Present • Switch OFF = Absent • Then Submit.</p>
        </Card>
      ) : isLoading && rosterData.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading students…</Card>
      ) : rosterData.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">No students found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try another class/section, or enroll students first.</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card divide-y overflow-hidden">
          {(rosterData as any[]).map((s: any, i: number) => {
            const on = present[keyOf(s)] !== false;
            return (
              <button
                key={keyOf(s)}
                onClick={() => { setPresent((p) => ({ ...p, [keyOf(s)]: !on })); setTouched(true); }}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
              >
                <span className="text-[11px] font-mono text-muted-foreground w-7">{i + 1}</span>
                <AppImage src={s.avatar} alt={s.fullName} className="h-9 w-9 rounded-full ring-1 ring-border" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold line-clamp-1">{s.fullName}</span>
                  <span className="block text-[11px] text-muted-foreground font-mono">Adm {s.admissionNumber}{s.rollNumber ? ` • ${s.rollNumber}` : ""}</span>
                </span>
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                  aria-label={on ? "Present" : "Absent"}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`}
                  />
                </span>
                <span className={`text-[11px] font-bold w-14 text-right ${on ? "text-emerald-600" : "text-rose-500"}`}>
                  {on ? "Present" : "Absent"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {touched && rosterData.length > 0 && (
        <p className="text-center text-[11px] text-amber-600">Unsaved changes — press Submit to save.</p>
      )}
    </div>
  );
}
