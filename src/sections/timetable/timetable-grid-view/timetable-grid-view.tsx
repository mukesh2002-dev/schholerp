"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { defaultPeriods } from "@/lib/mock-data/timetable";
import { TimetableSlot, DayOfWeek, Period } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Clock, Plus, Edit3, Trash2, Save, Coffee, Utensils, Settings2, LayoutGrid, Copy, X, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────
   API-ready layer — static now, 1-line swap to real API
   Replace these 4 fns with fetch('/api/timetable/...') later
   ────────────────────────────────────────────────────────── */
const PERIOD_KEY = "school_erp_periods_v1";
const api = {
  getPeriods(): Period[] {
    if (typeof window === "undefined") return defaultPeriods;
    try {
      const s = localStorage.getItem(PERIOD_KEY);
      if (s) { const p = JSON.parse(s); if (Array.isArray(p) && p.length) return p; }
      localStorage.setItem(PERIOD_KEY, JSON.stringify(defaultPeriods));
    } catch {}
    return defaultPeriods;
  },
  savePeriods(next: Period[]) {
    if (typeof window !== "undefined") localStorage.setItem(PERIOD_KEY, JSON.stringify(next));
  },
  getSlots(branchId?: string) { return mockDb.getTimetableSlots(branchId); },
  saveSlot(slot: TimetableSlot) { return mockDb.saveTimetableSlot(slot); },
  deleteSlot(id: string) { return mockDb.deleteTimetableSlot(id); },
};

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
  sectionId: z.string().min(1, "Section"),
  subjectId: z.string().min(1, "Subject"),
  teacherId: z.string().min(1, "Teacher"),
  roomNumber: z.string().min(1, "Room"),
});
type SlotForm = z.infer<typeof slotSchema>;

export function TimetableGridView() {
  const { activeBranchId } = useERP();
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));
  const [teachers] = useState(() => mockDb.getTeachers(activeBranchId));
  const [slots, setSlots] = useState(() => api.getSlots(activeBranchId));
  const [periods, setPeriods] = useState<Period[]>(() => api.getPeriods());

  const [classFilter, setClassFilter] = useState("ALL");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"class" | "teacher">("class");

  const [slotOpen, setSlotOpen] = useState(false);
  const [editing, setEditing] = useState<TimetableSlot | null>(null);

  const [periodOpen, setPeriodOpen] = useState(false);
  const [draft, setDraft] = useState<Period[]>(periods);

  const [inlineId, setInlineId] = useState<string | null>(null);
  const [inlineS, setInlineS] = useState("");
  const [inlineE, setInlineE] = useState("");

  const [builderOpen, setBuilderOpen] = useState(false);
  const [bClassId, setBClassId] = useState(classes[0]?.id || "");
  const [bSecId, setBSecId] = useState(classes[0]?.sections[0]?.id || "");
  const [grid, setGrid] = useState<Record<string, Record<number, { subjectId: string; teacherId: string; room: string }>>>({});

  const lectures = useMemo(() => periods.filter((p) => !p.isBreak && p.type !== "BREAK" && p.type !== "LUNCH"), [periods]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SlotForm>({
    resolver: zodResolver(slotSchema),
    defaultValues: { day: "MONDAY", periodNumber: "1", classId: "", sectionId: "", subjectId: "", teacherId: "", roomNumber: "" },
  });
  const wClassId = watch("classId");
  const wSubId = watch("subjectId");
  const selClass = useMemo(() => classes.find((c) => c.id === wClassId), [classes, wClassId]);
  const bClass = useMemo(() => classes.find((c) => c.id === bClassId), [classes, bClassId]);

  const filtered = useMemo(() => slots.filter((s) => {
    if (classFilter !== "ALL" && s.classId !== classFilter) return false;
    if (dayFilter !== "ALL" && s.day !== dayFilter) return false;
    if (q && !s.teacherName.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [slots, classFilter, dayFilter, q]);

  const classGrid = useMemo(() => {
    const g: Record<string, Record<number, TimetableSlot[]>> = {};
    for (const d of DAYS) { g[d] = {}; for (const p of lectures) g[d][p.number] = []; }
    for (const s of filtered) if (g[s.day]?.[s.periodNumber] !== undefined) g[s.day][s.periodNumber].push(s);
    return g;
  }, [filtered, lectures]);

  const refresh = () => setSlots([...api.getSlots(activeBranchId)]);
  const savePeriods = (next: Period[]) => { setPeriods(next); setDraft(next); api.savePeriods(next); };

  // inline time
  const startInline = (p: Period) => { setInlineId(p.id); setInlineS(p.startTime); setInlineE(p.endTime); };
  const saveInline = (id: string) => {
    if (!inlineS || !inlineE) return toast.error("Start & end required");
    if (inlineS >= inlineE) return toast.error("Start < End");
    savePeriods(periods.map((p) => p.id === id ? { ...p, startTime: inlineS, endTime: inlineE } : p));
    setInlineId(null); toast.success("Time updated");
  };

  // slot crud
  const openCreate = (day?: DayOfWeek, period?: number) => {
    setEditing(null);
    reset({ day: day ?? "MONDAY", periodNumber: period ? String(period) : "1", classId: classFilter !== "ALL" ? classFilter : classes[0]?.id ?? "", sectionId: "", subjectId: "", teacherId: "", roomNumber: "" });
    setSlotOpen(true);
  };
  const openEdit = (s: TimetableSlot) => {
    setEditing(s);
    reset({ day: s.day, periodNumber: String(s.periodNumber), classId: s.classId, sectionId: s.sectionId, subjectId: s.subjectId, teacherId: s.teacherId, roomNumber: s.roomNumber });
    setSlotOpen(true);
  };
  const onSubmit = (d: SlotForm) => {
    const cls = classes.find((c) => c.id === d.classId);
    const sec = cls?.sections.find((s) => s.id === d.sectionId);
    const sub = cls?.subjects.find((s) => s.id === d.subjectId);
    const tch = teachers.find((t) => t.id === d.teacherId);
    if (!cls || !sec || !sub) return toast.error("Class/Section/Subject required");
    if (slots.find((s) => s.day === d.day && s.periodNumber === Number(d.periodNumber) && s.classId === d.classId && s.sectionId === d.sectionId && s.id !== editing?.id))
      return toast.error("Period already occupied");
    api.saveSlot({
      id: editing?.id ?? `ts-${Date.now().toString(36)}`,
      day: d.day as DayOfWeek, periodNumber: Number(d.periodNumber),
      subjectId: sub.id, subjectName: sub.name, subjectCode: sub.code,
      teacherId: tch?.id ?? sub.teacherId, teacherName: tch?.fullName ?? sub.teacherName,
      classId: cls.id, className: cls.name, sectionId: sec.id, sectionName: sec.name,
      roomNumber: d.roomNumber, branchId: cls.branchId, branchName: cls.branchName,
    } as TimetableSlot);
    toast.success(editing ? "Slot updated" : "Slot created"); setSlotOpen(false); refresh();
  };

  // builder
  const openBuilder = () => {
    const c = classes[0]; if (!c) return toast.error("No class");
    setBClassId(c.id); setBSecId(c.sections[0]?.id || "");
    const g: any = {};
    for (const d of DAYS) { g[d] = {}; for (const p of lectures) {
      const ex = slots.find((s) => s.classId === c.id && s.sectionId === c.sections[0]?.id && s.day === d && s.periodNumber === p.number);
      g[d][p.number] = ex ? { subjectId: ex.subjectId, teacherId: ex.teacherId, room: ex.roomNumber } : { subjectId: "", teacherId: "", room: c.sections[0]?.roomNumber || "" };
    }}
    setGrid(g); setBuilderOpen(true);
  };
  const saveBuilder = () => {
    const cls = classes.find((c) => c.id === bClassId);
    const sec = cls?.sections.find((s) => s.id === bSecId);
    if (!cls || !sec) return toast.error("Class/Section required");
    let n = 0;
    for (const d of DAYS) for (const p of lectures) {
      const cell = grid[d]?.[p.number]; if (!cell?.subjectId) continue;
      const sub = cls.subjects.find((s) => s.id === cell.subjectId); if (!sub) continue;
      const tch = teachers.find((t) => t.id === cell.teacherId) || teachers.find((t) => t.id === sub.teacherId);
      const ex = slots.find((s) => s.day === d && s.periodNumber === p.number && s.classId === cls.id && s.sectionId === sec.id);
      api.saveSlot({
        id: ex?.id ?? `ts-${Date.now().toString(36)}-${d}-${p.number}`,
        day: d, periodNumber: p.number, subjectId: sub.id, subjectName: sub.name, subjectCode: sub.code,
        teacherId: tch?.id ?? sub.teacherId, teacherName: tch?.fullName ?? sub.teacherName,
        classId: cls.id, className: cls.name, sectionId: sec.id, sectionName: sec.name,
        roomNumber: cell.room || sec.roomNumber, branchId: cls.branchId, branchName: cls.branchName,
      } as TimetableSlot); n++;
    }
    toast.success(`${n} slots saved`); setBuilderOpen(false); refresh();
  };

  React.useEffect(() => {
    if (selClass && watch("sectionId")) {
      const s = selClass.sections.find((x) => x.id === watch("sectionId"));
      if (s && !editing) setValue("roomNumber", s.roomNumber);
    }
  }, [wClassId, watch("sectionId")]);
  React.useEffect(() => {
    if (wSubId && selClass) { const s = selClass.subjects.find((x) => x.id === wSubId); if (s) setValue("teacherId", s.teacherId); }
  }, [wSubId]);

  return (
    <div className="space-y-4">
      {/* filters */}
      <div className="flex flex-col xl:flex-row gap-3 p-3 rounded-xl bg-card border">
        <div className="flex flex-1 flex-wrap gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}><SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Classes</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={dayFilter} onValueChange={setDayFilter}><SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Day" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Days</SelectItem>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
          <div className="relative flex-1 min-w-[200px] max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search faculty..." className="pl-9 h-9 text-xs" /></div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}><TabsList className="h-8"><TabsTrigger value="class" className="text-xs">Class</TabsTrigger><TabsTrigger value="teacher" className="text-xs">Faculty</TabsTrigger></TabsList></Tabs>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setDraft(periods); setPeriodOpen(true); }}><Settings2 className="h-3.5 w-3.5" /> Edit Periods</Button>
          <Button variant="secondary" size="sm" className="h-8 text-xs gap-1.5" onClick={openBuilder}><LayoutGrid className="h-3.5 w-3.5" /> Create Full Timetable</Button>
          <Button variant="gradient" size="sm" className="h-8 gap-1.5" onClick={() => openCreate()}><Plus className="h-3.5 w-3.5" /> Add Slot</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground px-1">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400/60 border border-amber-500" /> Lunch</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-400/40 border border-sky-500" /> Break</span>
        <span className="hidden sm:flex items-center gap-1"><Edit3 className="h-3 w-3" /> Period time pe ✏️ se direct edit</span>
      </div>

      {filtered.length === 0 ? (
        <div className="space-y-3"><EmptyState title="No Slots" description="Full timetable banao ya single slot add karo" />
          <div className="flex justify-center gap-2"><Button onClick={openBuilder} variant="gradient"><LayoutGrid className="h-4 w-4" /> Create Full</Button><Button onClick={() => openCreate()} variant="outline"><Plus className="h-4 w-4" /> Add Slot</Button></div>
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
                  const editing = inlineId === p.id;
                  return (
                    <tr key={p.id} className={p.type === "LUNCH" ? "bg-amber-400/10" : "bg-sky-500/5"}>
                      <td className="sticky left-0 z-10 border-r px-3 py-2 min-w-[160px]" style={{ background: p.type === "LUNCH" ? "rgb(251 191 36 / 0.12)" : "rgb(14 165 233 / 0.07)" }}>
                        <div className="text-xs font-bold flex items-center gap-1"><Icon className="h-3 w-3" /> {p.label}</div>
                        {editing ? (
                          <div className="flex items-center gap-1 mt-1"><Input type="time" value={inlineS} onChange={(e) => setInlineS(e.target.value)} className="h-7 w-[88px] text-xs" /><span className="text-xs">-</span><Input type="time" value={inlineE} onChange={(e) => setInlineE(e.target.value)} className="h-7 w-[88px] text-xs" /><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveInline(p.id)}><Save className="h-3 w-3 text-emerald-600" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setInlineId(null)}><X className="h-3 w-3" /></Button></div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {p.startTime}–{p.endTime}<button onClick={() => startInline(p)} className="ml-1 p-0.5 hover:bg-black/5 rounded"><Edit3 className="h-3 w-3" /></button></div>
                        )}
                      </td>
                      <td colSpan={6} className="text-center py-3"><span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white ${p.type === "LUNCH" ? "bg-amber-500" : "bg-sky-500"}`}><Icon className="h-3.5 w-3.5" /> {p.label} — {p.startTime} to {p.endTime}</span></td>
                    </tr>
                  );
                }
                const editing = inlineId === p.id;
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="sticky left-0 z-10 bg-card border-r px-3 py-3 min-w-[160px] align-top">
                      <div className="text-xs font-bold">Period {p.number}</div>
                      {editing ? (
                        <div className="flex items-center gap-1 mt-1"><Input type="time" value={inlineS} onChange={(e) => setInlineS(e.target.value)} className="h-7 w-[88px] text-xs" /><span>-</span><Input type="time" value={inlineE} onChange={(e) => setInlineE(e.target.value)} className="h-7 w-[88px] text-xs" /><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveInline(p.id)}><Save className="h-3 w-3 text-emerald-600" /></Button><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setInlineId(null)}><X className="h-3 w-3" /></Button></div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {p.startTime}–{p.endTime}<button onClick={() => startInline(p)} className="ml-1 p-0.5 hover:bg-muted rounded"><Edit3 className="h-3 w-3" /></button></div>
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
                                  <div className="font-bold truncate">{s.subjectName}</div>
                                  <div className="text-[11px] text-muted-foreground truncate">{s.teacherName}</div>
                                  <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5"><span>{s.className} • {s.sectionName.split(" ").slice(0,2).join(" ")}</span><span className="font-mono">{s.roomNumber}</span></div>
                                  <div className="hidden group-hover:flex gap-1 pt-1"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(s)}><Edit3 className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => { api.deleteSlot(s.id); refresh(); toast.success("Deleted"); }}><Trash2 className="h-3 w-3" /></Button></div>
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

      {/* Add/Edit Slot */}
      <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Slot" : "Add Slot"}</DialogTitle><DialogDescription>Lecture period ke liye subject & room</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Day</label><Select value={watch("day")} onValueChange={(v) => setValue("day", v)}><SelectTrigger className={errors.day ? "border-rose-500" : ""}><SelectValue /></SelectTrigger><SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs font-medium">Period</label><Select value={watch("periodNumber")} onValueChange={(v) => setValue("periodNumber", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{lectures.map((p) => <SelectItem key={p.number} value={String(p.number)}>P{p.number} {p.startTime}-{p.endTime}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Class</label><Select value={watch("classId")} onValueChange={(v) => { setValue("classId", v); setValue("sectionId", ""); setValue("subjectId", ""); }}><SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs font-medium">Section</label><Select value={watch("sectionId")} onValueChange={(v) => setValue("sectionId", v)}><SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger><SelectContent>{selClass?.sections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><label className="text-xs font-medium">Subject</label><Select value={watch("subjectId")} onValueChange={(v) => setValue("subjectId", v)}><SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger><SelectContent>{selClass?.subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs font-medium">Teacher</label><Select value={watch("teacherId")} onValueChange={(v) => setValue("teacherId", v)}><SelectTrigger><SelectValue placeholder="Teacher" /></SelectTrigger><SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}</SelectContent></Select></div>
            <div><label className="text-xs font-medium">Room</label><Input {...register("roomNumber")} placeholder="Room 301" /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setSlotOpen(false)}>Cancel</Button><Button type="submit" variant="gradient"><Save className="h-3.5 w-3.5" /> {editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Period Editor — chhota compact innerscroll */}
      <Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
        <DialogContent className="max-w-md !max-h-[70vh] !flex !flex-col !p-0 !gap-0 !overflow-hidden sm:!max-w-[440px]">
          <DialogHeader className="px-4 pt-4 pb-2.5 border-b shrink-0 bg-background">
            <DialogTitle className="flex items-center gap-2 pr-8 text-sm"><span className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><Settings2 className="h-3.5 w-3.5" /></span> Edit Periods & Lunch Breaks</DialogTitle>
            <DialogDescription className="text-[11px] leading-tight">Har period ka time + lunch/break</DialogDescription>
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
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setDraft((a) => a.filter((_, i) => i !== idx))}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-[10px] font-semibold tracking-wider text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> START</label><Input type="time" value={p.startTime} onChange={(e) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, startTime: e.target.value } : x))} className="h-7 rounded-full bg-muted/30 border-border/40 text-xs px-2.5 w-full" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-semibold tracking-wider text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> END</label><Input type="time" value={p.endTime} onChange={(e) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, endTime: e.target.value } : x))} className="h-7 rounded-full bg-muted/30 border-border/40 text-xs px-2.5 w-full" /></div>
                  </div>
                  <div className="mt-2 space-y-1"><label className="text-[10px] font-semibold tracking-wider text-muted-foreground">TYPE</label><Select value={p.type || "LECTURE"} onValueChange={(v) => setDraft((a) => a.map((x, i) => i === idx ? { ...x, type: v as any, isBreak: v !== "LECTURE" } : x))}><SelectTrigger className="h-7 rounded-full bg-muted/30 border-border/40 px-3 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LECTURE">Lecture</SelectItem><SelectItem value="BREAK">Break</SelectItem><SelectItem value="LUNCH">Lunch</SelectItem></SelectContent></Select></div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground"><span className={`h-1 w-1 rounded-full ${isLunch ? "bg-amber-500" : isBreak ? "bg-sky-500" : "bg-emerald-500"}`} />{isLunch ? "Lunch" : isBreak ? "Break" : `P${p.number || idx + 1}`}<span className="ml-auto font-mono text-[10px]">{p.startTime}–{p.endTime}</span></div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t bg-card shrink-0 flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" className="rounded-full h-7 text-[11px] px-2.5 gap-1" onClick={() => setDraft((a) => [...a, { id: `per-${Date.now()}`, number: a.filter((x) => !x.isBreak).length + 1, label: `Period ${a.filter((x) => !x.isBreak).length + 1}`, startTime: "15:30", endTime: "16:15", type: "LECTURE" }])}><Plus className="h-3 w-3" /> Lect</Button>
            <Button variant="outline" size="sm" className="rounded-full h-7 text-[11px] px-2.5 gap-1" onClick={() => setDraft((a) => [...a, { id: `per-break-${Date.now()}`, number: 0, label: "Short Break", startTime: "10:00", endTime: "10:15", type: "BREAK", isBreak: true }])}><Coffee className="h-3 w-3" /> Break</Button>
            <Button variant="outline" size="sm" className="rounded-full h-7 text-[11px] px-2.5 gap-1" onClick={() => setDraft((a) => [...a, { id: `per-lunch-${Date.now()}`, number: 0, label: "Lunch Break", startTime: "13:00", endTime: "14:00", type: "LUNCH", isBreak: true }])}><Utensils className="h-3 w-3" /> Lunch</Button>
            <Button variant="ghost" size="sm" className="ml-auto h-7 text-[11px] px-2" onClick={() => setDraft(defaultPeriods)}>Reset</Button>
          </div>
          <DialogFooter className="px-4 py-2.5 border-t bg-muted/20 shrink-0 gap-2"><Button variant="outline" size="sm" className="rounded-full h-8 text-xs" onClick={() => setPeriodOpen(false)}>Cancel</Button><Button size="sm" className="rounded-full h-8 text-xs gap-1" variant="gradient" onClick={() => { savePeriods(draft); setPeriodOpen(false); toast.success("Periods updated"); }}><Save className="h-3 w-3" /> Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Builder */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-[95vw] w-[1120px] max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Full Timetable</DialogTitle><DialogDescription>Class/Section ka pura week ek sath</DialogDescription></DialogHeader>
          <div className="flex gap-3 p-2 bg-muted/20 rounded-lg border"><Select value={bClassId} onValueChange={(v) => { setBClassId(v); setBSecId(classes.find((c) => c.id === v)?.sections[0]?.id || ""); }}><SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><Select value={bSecId} onValueChange={setBSecId}><SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{bClass?.sections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full min-w-[900px] border-collapse">
              <thead><tr className="bg-muted/50"><th className="border p-2 text-xs text-left w-[110px]">Day</th>{lectures.map((p) => <th key={p.number} className="border p-1.5 text-center"><div className="text-xs font-bold">P{p.number}</div><div className="text-[10px] text-muted-foreground">{p.startTime}</div></th>)}</tr></thead>
              <tbody>{DAYS.map((d) => <tr key={d}><td className="border p-2 bg-muted/20"><div className="text-xs font-bold">{d}</div><Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 mt-1" onClick={() => { const src = grid[d]; if (!src) return; const n: any = { ...grid }; for (const x of DAYS) if (x !== d) n[x] = Object.fromEntries(Object.entries(src).map(([k, v]) => [k, { ...(v as any) }])); setGrid(n); toast.success(`${d} copied`); }}><Copy className="h-3 w-3" /> Copy</Button></td>{lectures.map((p) => { const c = grid[d]?.[p.number] || { subjectId: "", teacherId: "", room: "" }; return <td key={p.number} className="border p-1"><div className="space-y-1"><Select value={c.subjectId} onValueChange={(v) => setGrid((a) => { const n = { ...a, [d]: { ...a[d] } }; const cell = { ...n[d][p.number] } as any; cell.subjectId = v; const sub = bClass?.subjects.find((s) => s.id === v); if (sub) cell.teacherId = sub.teacherId; n[d][p.number] = cell; return n; })}><SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Subject" /></SelectTrigger><SelectContent>{bClass?.subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><Select value={c.teacherId} onValueChange={(v) => setGrid((a) => { const n = { ...a, [d]: { ...a[d] } }; n[d][p.number] = { ...n[d][p.number], teacherId: v }; return n; })}><SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Teacher" /></SelectTrigger><SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}</SelectContent></Select><Input value={c.room} onChange={(e) => setGrid((a) => { const n = { ...a, [d]: { ...a[d] } }; n[d][p.number] = { ...n[d][p.number], room: e.target.value }; return n; })} placeholder="Room" className="h-7 text-[11px]" /></div></td>; })}</tr>)}</tbody>
            </table>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button><Button variant="gradient" onClick={saveBuilder}><Save className="h-3.5 w-3.5" /> Save Full</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
