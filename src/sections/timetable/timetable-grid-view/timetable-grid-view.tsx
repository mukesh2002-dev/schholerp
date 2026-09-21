"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchClasses, fetchSubjects } from "@/lib/api/classes";
import { fetchStaffDirectory } from "@/lib/api/hr";
import { fetchTimetableGrid, createSlotApi, updateSlotApi, deleteSlotApi, bulkSlotsApi, fetchPeriods, updatePeriodApi, createPeriodApi, deletePeriodApi } from "@/lib/api/timetable";
import type { PeriodDTO, TimetableSlotDTO } from "@/lib/api/timetable";
import type { ClassRoom, Subject } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Clock, Plus, Edit3, Trash2, Save, Coffee, Utensils, Settings2, LayoutGrid, Copy, X, AlertTriangle, WifiOff, Loader2, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";
const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_SHORT: Record<DayOfWeek, string> = { MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat" };

const SUBJECT_COLOR: Record<string, string> = {
  "sub-101": "border-l-blue-500 bg-blue-500/5",
  "sub-102": "border-l-emerald-500 bg-emerald-500/5",
  "sub-103": "border-l-purple-500 bg-purple-500/5",
  "sub-104": "border-l-amber-500 bg-amber-500/5",
  "sub-105": "border-l-rose-500 bg-rose-500/5",
};
const getColor = (id: string) => SUBJECT_COLOR[id] || "border-l-slate-400 bg-slate-500/5";

const slotSchema = z.object({
  day: z.string().min(1, "Day"),
  periodNumber: z.string().min(1, "Period"),
  classId: z.string().min(1, "Class"),
  section: z.string().optional(),
  sectionId: z.string().optional(),
  subjectId: z.string().min(1, "Subject"),
  teacherId: z.string().min(1, "Teacher"),
  roomNumber: z.string().min(1, "Room"),
});
type SlotForm = z.infer<typeof slotSchema>;

export function TimetableGridView() {
  const { activeBranchId } = useERP();
  const campusId = activeBranchId !== "all" ? activeBranchId : undefined;

  // offline detection
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const on = () => setIsOffline(!navigator.onLine);
    on();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", on); };
  }, []);

  // classes
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);

  const fetchClassesList = useCallback(async () => {
    setClassesLoading(true);
    setClassesError(null);
    try {
      const list = await fetchClasses({ campusId });
      setClasses(list);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      setClassesError(msg);
    } finally {
      setClassesLoading(false);
    }
  }, [campusId]);

  useEffect(() => { fetchClassesList(); }, [fetchClassesList]);

  // chosen class + section — REQUIRED before showing timetable
  const [chosenClassId, setChosenClassId] = useState<string>("");
  const [chosenSection, setChosenSection] = useState<string>("");
  useEffect(() => {
    if (!chosenClassId && classes.length > 0) {
      const first = classes[0];
      setChosenClassId(first.id);
      setChosenSection(first.sections[0]?.name ?? "");
    }
  }, [classes, chosenClassId]);

  const chosenClass = useMemo(() => classes.find((c) => c.id === chosenClassId), [classes, chosenClassId]);
  const sectionOptions = useMemo(() => chosenClass?.sections ?? [], [chosenClass]);

  // subjects + teachers per campus/class
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; fullName: string }>>([]);
  useEffect(() => {
    if (!chosenClassId) return;
    (async () => {
      try {
        const subs = await fetchSubjects({ campusId });
        // filter by class if backend supports classId; fallback to chosenClass.subjects
        const filtered = Array.isArray(subs) ? subs.filter((s: any) => !chosenClassId || String(s.class?.uuid ?? s.classId ?? chosenClassId) === String(chosenClassId) || !s.classId) : [];
        // map backend subject to frontend shape
        const mapped: Subject[] = (filtered.length ? filtered : chosenClass?.subjects ?? []).map((s: any) => ({
          id: s.uuid ?? s.id,
          name: s.name,
          code: s.code ?? "",
          teacherId: s.teacher?.uuid ?? s.teacherId ?? "",
          teacherName: s.teacher?.name ?? "",
          weeklyPeriods: 4,
        }));
        setSubjects(mapped.length ? mapped : (chosenClass?.subjects ?? []));
      } catch {
        setSubjects(chosenClass?.subjects ?? []);
      }
      try {
        const res = await fetchStaffDirectory({ campusId, role: "teacher", limit: 100 });
        const t = res.data.map((u) => ({ id: u.uuid, fullName: u.name }));
        setTeachers(t.length ? t : []);
      } catch {
        // fallback empty — will show subject teacherName
      }
    })();
  }, [chosenClassId, campusId, chosenClass]);

  // grid data (periods + slots) for chosen class
  const [periods, setPeriods] = useState<PeriodDTO[]>([]);
  const [slots, setSlots] = useState<TimetableSlotDTO[]>([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);

  const fetchGrid = useCallback(async () => {
    if (!chosenClassId) return;
    setGridLoading(true);
    setGridError(null);
    try {
      const grid = await fetchTimetableGrid({ campusId, classId: chosenClassId, section: chosenSection || undefined });
      setPeriods(grid.periods ?? []);
      setSlots(grid.slots ?? []);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      setGridError(msg);
      toast.error(msg);
    } finally {
      setGridLoading(false);
    }
  }, [chosenClassId, chosenSection, campusId]);

  useEffect(() => { fetchGrid(); }, [fetchGrid]);

  // derived
  const lectures = useMemo(() => periods.filter((p) => !p.isBreak && p.type !== "BREAK" && p.type !== "LUNCH"), [periods]);

  // filters
  const [dayFilter, setDayFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"class" | "teacher">("class");

  // dialogs
  const [slotOpen, setSlotOpen] = useState(false);
  const [editing, setEditing] = useState<TimetableSlotDTO | null>(null);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [draft, setDraft] = useState<PeriodDTO[]>(periods);
  const [inlineId, setInlineId] = useState<string | null>(null);
  const [inlineS, setInlineS] = useState("");
  const [inlineE, setInlineE] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [gridBuilder, setGridBuilder] = useState<Record<string, Record<number, { subjectId: string; teacherId: string; room: string }>>>({});

  useEffect(() => { setDraft(periods); }, [periods]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SlotForm>({
    resolver: zodResolver(slotSchema),
    defaultValues: { day: "MONDAY", periodNumber: "1", classId: "", section: "", sectionId: "", subjectId: "", teacherId: "", roomNumber: "" },
  });
  const wClassId = watch("classId");
  const wSubId = watch("subjectId");
  const selClass = useMemo(() => classes.find((c) => c.id === wClassId) ?? chosenClass, [classes, wClassId, chosenClass]);

  useEffect(() => {
    if (selClass && watch("section")) {
      // noop
    }
  }, [wClassId]);

  useEffect(() => {
    if (wSubId && subjects.length) {
      const s = subjects.find((x) => x.id === wSubId);
      if (s?.teacherId) setValue("teacherId", s.teacherId);
    }
  }, [wSubId, subjects, setValue]);

  const filtered = useMemo(() => slots.filter((s) => {
    if (dayFilter !== "ALL" && s.day !== dayFilter) return false;
    if (q && !(s.teacherName ?? "").toLowerCase().includes(q.toLowerCase()) && !(s.subjectName ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    if (tab === "teacher" && q) return true;
    return true;
  }), [slots, dayFilter, q, tab]);

  const classGrid = useMemo(() => {
    const g: Record<string, Record<number, TimetableSlotDTO[]>> = {};
    for (const d of DAYS) { g[d] = {}; for (const p of lectures) g[d][p.number] = []; }
    for (const s of filtered) if (g[s.day]?.[s.periodNumber] !== undefined) g[s.day][s.periodNumber].push(s);
    return g;
  }, [filtered, lectures]);

  // actions
  const saveInline = async (id: string) => {
    if (!inlineS || !inlineE) return toast.error("Start & end required");
    if (inlineS >= inlineE) return toast.error("Start < End");
    try {
      await updatePeriodApi(id, { startTime: inlineS, endTime: inlineE });
      toast.success("Time updated");
      setInlineId(null);
      fetchGrid();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Update failed");
    }
  };

  const openCreate = (day?: DayOfWeek, period?: number) => {
    if (!chosenClassId) return toast.error("Please choose a class first");
    setEditing(null);
    reset({ day: day ?? "MONDAY", periodNumber: period ? String(period) : "1", classId: chosenClassId, section: chosenSection, sectionId: chosenSection, subjectId: "", teacherId: "", roomNumber: "" });
    setSlotOpen(true);
  };
  const openEdit = (s: TimetableSlotDTO) => {
    setEditing(s);
    reset({ day: s.day, periodNumber: String(s.periodNumber), classId: s.classId, section: s.section ?? "", sectionId: s.section ?? "", subjectId: s.subjectId, teacherId: s.teacherId, roomNumber: s.roomNumber });
    setSlotOpen(true);
  };
  const onSubmit = async (d: SlotForm) => {
    if (isOffline) return toast.error("You are offline");
    try {
      const payload: Record<string, unknown> = {
        day: d.day,
        periodNumber: Number(d.periodNumber),
        subjectId: d.subjectId,
        teacherId: d.teacherId,
        classId: d.classId,
        section: d.section || d.sectionId || chosenSection || null,
        roomNumber: d.roomNumber,
        campusId,
      };
      if (editing) {
        await updateSlotApi(editing.uuid ?? editing.id, payload);
        toast.success("Slot updated");
      } else {
        await createSlotApi(payload, campusId);
        toast.success("Slot created");
      }
      setSlotOpen(false);
      fetchGrid();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      toast.error(msg);
    }
  };

  const handleDeleteSlot = async (s: TimetableSlotDTO) => {
    if (isOffline) return toast.error("Offline");
    try {
      await deleteSlotApi(s.uuid ?? s.id);
      toast.success("Deleted");
      fetchGrid();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Delete failed");
    }
  };

  const openBuilder = () => {
    if (!chosenClassId) return toast.error("Choose a class first");
    if (!chosenClass) return toast.error("No class");
    const g: any = {};
    for (const d of DAYS) { g[d] = {}; for (const p of lectures) {
      const ex = slots.find((s) => s.classId === chosenClassId && (s.section ?? "") === (chosenSection ?? "") && s.day === d && s.periodNumber === p.number);
      g[d][p.number] = ex ? { subjectId: ex.subjectId, teacherId: ex.teacherId, room: ex.roomNumber } : { subjectId: "", teacherId: "", room: "" };
    }}
    setGridBuilder(g); setBuilderOpen(true);
  };
  const saveBuilder = async () => {
    if (!chosenClassId || !chosenClass) return toast.error("Class required");
    if (isOffline) return toast.error("You are offline");
    const payload = {
      classId: chosenClassId,
      section: chosenSection || null,
      slots: [] as Array<{ day: string; periodNumber: number; subjectId: string; teacherId: string; roomNumber?: string }>,
    };
    for (const d of DAYS) for (const p of lectures) {
      const cell = gridBuilder[d]?.[p.number]; if (!cell?.subjectId) continue;
      payload.slots.push({ day: d, periodNumber: p.number, subjectId: cell.subjectId, teacherId: cell.teacherId, roomNumber: cell.room || "Room 101" });
    }
    if (payload.slots.length === 0) return toast.error("Pick at least one subject");
    try {
      await bulkSlotsApi(payload, campusId);
      toast.success(`${payload.slots.length} slots saved`);
      setBuilderOpen(false);
      fetchGrid();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Bulk save failed");
    }
  };

  const handleSavePeriods = async () => {
    // naive: upsert via delete+create for demo — use update for existing, create for new
    for (const p of draft) {
      const exists = periods.find((x) => x.id === p.id || x.uuid === p.id);
      try {
        if (exists) {
          await updatePeriodApi(exists.uuid ?? exists.id, { number: p.number, label: p.label, startTime: p.startTime, endTime: p.endTime, type: p.type, isBreak: p.isBreak });
        } else {
          await createPeriodApi({ number: p.number, label: p.label, startTime: p.startTime, endTime: p.endTime, type: p.type, isBreak: p.isBreak }, campusId);
        }
      } catch {}
    }
    setPeriodOpen(false);
    toast.success("Periods updated");
    fetchGrid();
  };

  // ── Render ──
  return (
    <div className="space-y-4">
      {isOffline && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <WifiOff className="h-4 w-4" /> You are offline — timetable data may be stale. Reconnect to save changes.
        </div>
      )}

      {/* 1. Class chooser — REQUIRED first step per spec */}
      <div className="p-4 rounded-xl bg-card border shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Choose Class to view Timetable</h3>
          {chosenClass && <Badge variant="secondary" className="text-[11px]">{chosenClass.name} {chosenSection ? `• Sec ${chosenSection}` : ""}</Badge>}
        </div>

        {classesLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading classes…</div>
        ) : classesError ? (
          <div className="flex items-center gap-2 text-xs text-rose-600"><AlertTriangle className="h-4 w-4" /> {classesError} <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={fetchClassesList}><RefreshCw className="h-3 w-3" /> Retry</Button></div>
        ) : classes.length === 0 ? (
          <EmptyState title="No Classes" description="Create a class in Academics first, then build its timetable." />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Select value={chosenClassId} onValueChange={(v) => { setChosenClassId(v); const c = classes.find((x) => x.id === v); setChosenSection(c?.sections[0]?.name ?? ""); }}>
              <SelectTrigger className="w-[200px] h-9 text-xs"><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} {c.sections.length ? `(${c.sections.length} sec)` : ""}</SelectItem>)}</SelectContent>
            </Select>

            <Select value={chosenSection} onValueChange={setChosenSection}>
              <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Section" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sections</SelectItem>
                {sectionOptions.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5" onClick={fetchGrid} disabled={gridLoading}>
              {gridLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh
            </Button>

            <div className="ml-auto flex gap-2">
              <Button variant="secondary" size="sm" className="h-9 text-xs gap-1.5" onClick={openBuilder} disabled={isOffline || !chosenClassId}><LayoutGrid className="h-3.5 w-3.5" /> Create Full Timetable</Button>
              <Button variant="gradient" size="sm" className="h-9 gap-1.5" onClick={() => openCreate()} disabled={isOffline || !chosenClassId}><Plus className="h-3.5 w-3.5" /> Add Slot</Button>
            </div>
          </div>
        )}
        {!chosenClassId && !classesLoading && classes.length > 0 && (
          <p className="text-xs text-muted-foreground">Please select a class above — timetable will appear here.</p>
        )}
      </div>

      {!chosenClassId ? (
        <EmptyState title="Select a class" description="Choose a class and section above to load its weekly timetable." />
      ) : gridLoading ? (
        <div className="rounded-xl border bg-card p-8 flex flex-col items-center gap-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /><p className="text-xs text-muted-foreground">Loading timetable…</p></div>
      ) : gridError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 flex flex-col items-center gap-2 text-center">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <p className="text-sm font-medium text-rose-800">Failed to load timetable</p>
          <p className="text-xs text-rose-600">{gridError}</p>
          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs" onClick={fetchGrid}><RefreshCw className="h-3 w-3" /> Retry</Button>
        </div>
      ) : periods.length === 0 ? (
        <div className="space-y-3">
          <EmptyState title="No Periods configured" description="Set up daily periods & breaks for this campus before building timetable." />
          <div className="flex justify-center"><Button onClick={() => { setDraft([]); setPeriodOpen(true); }} variant="outline"><Settings2 className="h-4 w-4" /> Configure Periods</Button></div>
        </div>
      ) : (
        <>
          {/* filters */}
          <div className="flex flex-col xl:flex-row gap-3 p-3 rounded-xl bg-card border">
            <div className="flex flex-1 flex-wrap gap-2">
              <Select value={dayFilter} onValueChange={setDayFilter}><SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Day" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Days</SelectItem>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search faculty/subject..." className="pl-9 h-9 text-xs" /></div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}><TabsList className="h-8"><TabsTrigger value="class" className="text-xs">Class</TabsTrigger><TabsTrigger value="teacher" className="text-xs">Faculty</TabsTrigger></TabsList></Tabs>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setDraft(periods); setPeriodOpen(true); }}><Settings2 className="h-3.5 w-3.5" /> Edit Periods</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400/60 border border-amber-500" /> Lunch</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-400/40 border border-sky-500" /> Break</span>
            <span className="hidden sm:flex items-center gap-1"><Edit3 className="h-3 w-3" /> Period time pe ✏️ se direct edit</span>
            <span className="ml-auto text-[11px]">{filtered.length} slots • {chosenClass?.name} {chosenSection ? `Sec ${chosenSection}` : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="space-y-3">
              <EmptyState title="No timetable yet" description={`No slots found for ${chosenClass?.name ?? "this class"} ${chosenSection ? `(Sec ${chosenSection})` : ""}. Create a full weekly timetable or add slots one by one.`} />
              <div className="flex justify-center gap-2"><Button onClick={openBuilder} variant="gradient" disabled={isOffline}><LayoutGrid className="h-4 w-4" /> Create Full Timetable</Button><Button onClick={() => openCreate()} variant="outline" disabled={isOffline}><Plus className="h-4 w-4" /> Add Slot</Button></div>
            </div>
          ) : (
            <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead><tr>
                  <th className="sticky left-0 z-10 bg-muted/50 border-b border-r px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground uppercase">Period</th>
                  {DAYS.map((d) => <th key={d} className="bg-muted/50 border-b border-r last:border-r-0 px-3 py-2 text-center min-w-[140px]"><div className="text-xs font-bold">{d}</div><div className="text-[10px] font-normal text-muted-foreground">{DAY_SHORT[d]}</div></th>)}
                </tr></thead>
                <tbody>
                  {periods.map((p) => {
                    if (p.isBreak) {
                      const Icon = p.type === "LUNCH" ? Utensils : Coffee;
                      const editingInline = inlineId === p.id;
                      return (
                        <tr key={p.id} className={p.type === "LUNCH" ? "bg-amber-400/10" : "bg-sky-500/5"}>
                          <td className="sticky left-0 z-10 border-r px-3 py-2 min-w-[160px]" style={{ background: p.type === "LUNCH" ? "rgb(251 191 36 / 0.12)" : "rgb(14 165 233 / 0.07)" }}>
                            <div className="text-xs font-bold flex items-center gap-1"><Icon className="h-3 w-3" /> {p.label}</div>
                            {editingInline ? (
                              <div className="flex items-center gap-1 mt-1"><Input type="time" value={inlineS} onChange={(e) => setInlineS(e.target.value)} className="h-7 w-[88px] text-xs" /><span className="text-xs">-</span><Input type="time" value={inlineE} onChange={(e) => setInlineE(e.target.value)} className="h-7 w-[88px] text-xs" /><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveInline(p.id)}><Save className="h-3 w-3 text-emerald-600" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setInlineId(null)}><X className="h-3 w-3" /></Button></div>
                            ) : (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {p.startTime}–{p.endTime}<button onClick={() => { setInlineId(p.id); setInlineS(p.startTime.slice(0,5)); setInlineE(p.endTime.slice(0,5)); }} className="ml-1 p-0.5 hover:bg-black/5 rounded"><Edit3 className="h-3 w-3" /></button></div>
                            )}
                          </td>
                          <td colSpan={6} className="text-center py-3"><span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white ${p.type === "LUNCH" ? "bg-amber-500" : "bg-sky-500"}`}><Icon className="h-3.5 w-3.5" /> {p.label} — {p.startTime.slice(0,5)} to {p.endTime.slice(0,5)}</span></td>
                        </tr>
                      );
                    }
                    const editingInline = inlineId === p.id;
                    return (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="sticky left-0 z-10 bg-card border-r px-3 py-3 min-w-[160px] align-top">
                          <div className="text-xs font-bold">Period {p.number}</div>
                          {editingInline ? (
                            <div className="flex items-center gap-1 mt-1"><Input type="time" value={inlineS} onChange={(e) => setInlineS(e.target.value)} className="h-7 w-[88px] text-xs" /><span>-</span><Input type="time" value={inlineE} onChange={(e) => setInlineE(e.target.value)} className="h-7 w-[88px] text-xs" /><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveInline(p.id)}><Save className="h-3 w-3 text-emerald-600" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setInlineId(null)}><X className="h-3 w-3" /></Button></div>
                          ) : (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {p.startTime.slice(0,5)}–{p.endTime.slice(0,5)}<button onClick={() => { setInlineId(p.id); setInlineS(p.startTime.slice(0,5)); setInlineE(p.endTime.slice(0,5)); }} className="ml-1 p-0.5 hover:bg-muted rounded"><Edit3 className="h-3 w-3" /></button></div>
                          )}
                          <div className="text-[10px] text-muted-foreground">{p.label}</div>
                        </td>
                        {DAYS.map((day) => {
                          const list = classGrid[day]?.[p.number] || [];
                          return (
                            <td key={day} className="border-r last:border-0 p-1.5 align-top">
                              {list.length === 0 ? (
                                <button onClick={() => openCreate(day, p.number)} className="w-full min-h-[56px] rounded-lg border border-dashed flex flex-col items-center justify-center text-[10px] text-muted-foreground/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5"><Plus className="h-3 w-3" /> Free</button>
                              ) : (
                                <div className="space-y-1">
                                  {list.map((s) => (
                                    <div key={s.id} className={`group p-2 rounded-lg border-l-[3px] text-xs shadow-xs ${getColor(s.subjectId)}`}>
                                      <div className="font-bold truncate">{s.subjectName ?? "Subject"}</div>
                                      <div className="text-[11px] text-muted-foreground truncate">{s.teacherName ?? "—"}</div>
                                      <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5"><span>{s.className ?? ""} {s.section ? `• ${s.section}` : ""}</span><span className="font-mono">{s.roomNumber}</span></div>
                                      <div className="hidden group-hover:flex gap-1 pt-1"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(s)}><Edit3 className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteSlot(s)}><Trash2 className="h-3 w-3" /></Button></div>
                                    </div>
                                  ))}
                                  <Button variant="ghost" size="sm" className="w-full h-6 text-[10px]" onClick={() => openCreate(day, p.number)}><Plus className="h-3 w-3" /> Add</Button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Slot */}
      <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Slot" : "Add Slot"}</DialogTitle><DialogDescription>Lecture period ke liye subject & room — dynamic via API</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Day</label><Select value={watch("day")} onValueChange={(v) => setValue("day", v)}><SelectTrigger className={errors.day ? "border-rose-500" : ""}><SelectValue /></SelectTrigger><SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs font-medium">Period</label><Select value={watch("periodNumber")} onValueChange={(v) => setValue("periodNumber", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{lectures.map((p) => <SelectItem key={p.number} value={String(p.number)}>P{p.number} {p.startTime.slice(0,5)}-{p.endTime.slice(0,5)}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Class</label><Select value={watch("classId")} onValueChange={(v) => { setValue("classId", v); setValue("section", ""); setValue("subjectId", ""); }}><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs font-medium">Section</label><Select value={watch("section") ?? ""} onValueChange={(v) => setValue("section", v)}><SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger><SelectContent>{(selClass?.sections ?? sectionOptions).map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><label className="text-xs font-medium">Subject</label><Select value={watch("subjectId")} onValueChange={(v) => setValue("subjectId", v)}><SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger><SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs font-medium">Teacher</label><Select value={watch("teacherId")} onValueChange={(v) => setValue("teacherId", v)}><SelectTrigger><SelectValue placeholder="Teacher" /></SelectTrigger><SelectContent>{teachers.length ? teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>) : <SelectItem value="temp" disabled>No teachers — assign in Staff</SelectItem>}</SelectContent></Select></div>
            <div><label className="text-xs font-medium">Room</label><Input {...register("roomNumber")} placeholder="Room 301" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setSlotOpen(false)}>Cancel</Button><Button type="submit" variant="gradient" disabled={isOffline}><Save className="h-3.5 w-3.5" /> {editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Period Editor */}
      <Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
        <DialogContent className="max-w-md !max-h-[70vh] !flex !flex-col !p-0 !gap-0 !overflow-hidden sm:!max-w-[440px]">
          <DialogHeader className="px-4 pt-4 pb-2.5 border-b shrink-0 bg-background">
            <DialogTitle className="flex items-center gap-2 pr-8 text-sm"><span className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><Settings2 className="h-3.5 w-3.5" /></span> Edit Periods & Lunch Breaks</DialogTitle>
            <DialogDescription className="text-[11px] leading-tight">Har period ka time + lunch/break — saved to campus via API</DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5 bg-muted/20">
            <div className="flex gap-2.5 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Lect</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Break</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Lunch</span><span className="ml-auto">{draft.length} slots</span></div>
            {draft.map((p, idx) => {
              const isLunch = p.type === "LUNCH", isBreak = !!p.isBreak;
              return (
                <div key={p.id} className={`rounded-xl border p-2.5 bg-card shadow-xs ${isLunch ? "border-amber-200 dark:border-amber-900" : isBreak ? "border-sky-200 dark:border-sky-900" : "border-border/60"}`}>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={isLunch ? "warning" : isBreak ? "info" : "secondary"} className="shrink-0 text-[10px] px-2 py-0 rounded-full leading-none h-5">{isLunch ? "LUNCH" : isBreak ? "BREAK" : `P${p.number || idx + 1}`}</Badge>
                    <Input value={p.label} onChange={(e) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} className="h-7 flex-1 rounded-full bg-muted/40 border-0 text-xs font-medium px-3 focus-visible:ring-1" placeholder="Label" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={async () => { if (periods.find((x)=> x.id===p.id)) { try { await deletePeriodApi(p.id); toast.success("Deleted"); fetchGrid(); } catch { toast.error("Delete failed");} } setDraft((a) => a.filter((_, i) => i !== idx)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-[10px] font-semibold tracking-wider text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> START</label><Input type="time" value={p.startTime.slice(0,5)} onChange={(e) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, startTime: e.target.value } : x))} className="h-7 rounded-full bg-muted/30 border-border/40 text-xs px-2.5 w-full" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold tracking-wider text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> END</label><Input type="time" value={p.endTime.slice(0,5)} onChange={(e) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, endTime: e.target.value } : x))} className="h-7 rounded-full bg-muted/30 border-border/40 text-xs px-2.5 w-full" /></div>
                  </div>
                  <div className="mt-2 space-y-1"><label className="text-[10px] font-semibold tracking-wider text-muted-foreground">TYPE</label><Select value={p.type || "LECTURE"} onValueChange={(v) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, type: v as any, isBreak: v !== "LECTURE" } : x))}><SelectTrigger className="h-7 rounded-full bg-muted/30 border-border/40 px-3 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LECTURE">Lecture</SelectItem><SelectItem value="BREAK">Break</SelectItem><SelectItem value="LUNCH">Lunch</SelectItem></SelectContent></Select></div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"><span className={`h-1 w-1 rounded-full ${isLunch ? "bg-amber-500" : isBreak ? "bg-sky-500" : "bg-emerald-500"}`} />{isLunch ? "Lunch" : isBreak ? "Break" : `P${p.number || idx + 1}`}<span className="ml-auto font-mono text-[10px]">{p.startTime.slice(0,5)}–{p.endTime.slice(0,5)}</span></div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t bg-card shrink-0 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="rounded-full h-7 text-[11px] px-2.5 gap-1" onClick={() => setDraft((a) => [...a, { id: `per-${Date.now()}`, uuid: `per-${Date.now()}`, number: a.filter((x) => !x.isBreak).length + 1, label: `Period ${a.filter((x) => !x.isBreak).length + 1}`, startTime: "15:30", endTime: "16:15", type: "LECTURE", isBreak: false, campusId: campusId ?? "" } as any])}><Plus className="h-3 w-3" /> Lect</Button>
            <Button variant="outline" size="sm" className="rounded-full h-7 text-[11px] px-2.5 gap-1" onClick={() => setDraft((a) => [...a, { id: `per-break-${Date.now()}`, uuid: `per-break-${Date.now()}`, number: 0, label: "Short Break", startTime: "10:00", endTime: "10:15", type: "BREAK", isBreak: true, campusId: campusId ?? "" } as any])}><Coffee className="h-3 w-3" /> Break</Button>
            <Button variant="outline" size="sm" className="rounded-full h-7 text-[11px] px-2.5 gap-1" onClick={() => setDraft((a) => [...a, { id: `per-lunch-${Date.now()}`, uuid: `per-lunch-${Date.now()}`, number: 0, label: "Lunch Break", startTime: "13:00", endTime: "14:00", type: "LUNCH", isBreak: true, campusId: campusId ?? "" } as any])}><Utensils className="h-3 w-3" /> Lunch</Button>
            <Button variant="ghost" size="sm" className="ml-auto h-7 text-[11px] px-2" onClick={() => setDraft(periods)}>Reset</Button>
          </div>
          <DialogFooter className="px-4 py-2.5 border-t bg-muted/20 shrink-0 gap-2"><Button variant="outline" size="sm" className="rounded-full h-8 text-xs" onClick={() => setPeriodOpen(false)}>Cancel</Button><Button size="sm" className="rounded-full h-8 text-xs gap-1" variant="gradient" onClick={handleSavePeriods} disabled={isOffline}><Save className="h-3 w-3" /> Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Builder */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-[95vw] w-[1120px] max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Full Timetable — {chosenClass?.name} {chosenSection ? `Sec ${chosenSection}` : ""}</DialogTitle><DialogDescription>Class/Section ka pura week ek sath — dynamic bulk API</DialogDescription></DialogHeader>
          <div className="flex gap-3 p-2 bg-muted/20 rounded-lg border">
            <Select value={chosenClassId} onValueChange={(v) => { setChosenClassId(v); const c = classes.find((x)=> x.id===v); setChosenSection(c?.sections[0]?.name ?? ""); }}><SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <Select value={chosenSection} onValueChange={setChosenSection}><SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">No section</SelectItem>{sectionOptions.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full min-w-[900px] border-collapse">
              <thead><tr className="bg-muted/50"><th className="border p-2 text-xs text-left w-[110px]">Day</th>{lectures.map((p) => <th key={p.number} className="border p-1.5 text-center"><div className="text-xs font-bold">P{p.number}</div><div className="text-[10px] text-muted-foreground">{p.startTime.slice(0,5)}</div></th>)}</tr></thead>
              <tbody>{DAYS.map((d) => <tr key={d}><td className="border p-2 bg-muted/20"><div className="text-xs font-bold">{d}</div><Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 mt-1" onClick={() => { const src = gridBuilder[d]; if (!src) return; const n: any = { ...gridBuilder }; for (const x of DAYS) if (x !== d) n[x] = Object.fromEntries(Object.entries(src).map(([k, v]) => [k, { ...(v as any) }])); setGridBuilder(n); toast.success(`${d} copied`); }}><Copy className="h-3 w-3" /> Copy</Button></td>{lectures.map((p) => { const c = gridBuilder[d]?.[p.number] || { subjectId: "", teacherId: "", room: "" }; return <td key={p.number} className="border p-1"><div className="space-y-1"><Select value={c.subjectId} onValueChange={(v) => setGridBuilder((a) => { const n = { ...a, [d]: { ...a[d] } }; const cell = { ...n[d][p.number] } as any; cell.subjectId = v; const sub = subjects.find((s) => s.id === v); if (sub?.teacherId) cell.teacherId = sub.teacherId; n[d][p.number] = cell; return n; })}><SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Subject" /></SelectTrigger><SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><Select value={c.teacherId} onValueChange={(v) => setGridBuilder((a) => { const n = { ...a, [d]: { ...a[d] } }; n[d][p.number] = { ...n[d][p.number], teacherId: v }; return n; })}><SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Teacher" /></SelectTrigger><SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}</SelectContent></Select><Input value={c.room} onChange={(e) => setGridBuilder((a) => { const n = { ...a, [d]: { ...a[d] } }; n[d][p.number] = { ...n[d][p.number], room: e.target.value }; return n; })} placeholder="Room" className="h-7 text-[11px]" /></div></td>; })}</tr>)}</tbody>
            </table>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button><Button variant="gradient" onClick={saveBuilder} disabled={isOffline}><Save className="h-3.5 w-3.5" /> Save Full</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
