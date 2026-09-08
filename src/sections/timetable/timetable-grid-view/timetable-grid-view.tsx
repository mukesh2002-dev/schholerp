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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, MapPin, AlertTriangle, Clock, Plus, Edit3, Trash2, Save, Coffee, Utensils, Settings2, LayoutGrid, Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

const SUBJECT_COLORS: Record<string, string> = {
  "sub-101": "border-l-blue-500 bg-blue-500/5",
  "sub-102": "border-l-emerald-500 bg-emerald-500/5",
  "sub-103": "border-l-purple-500 bg-purple-500/5",
  "sub-104": "border-l-amber-500 bg-amber-500/5",
  "sub-105": "border-l-rose-500 bg-rose-500/5",
  "sub-901": "border-l-cyan-500 bg-cyan-500/5",
  "sub-902": "border-l-violet-500 bg-violet-500/5",
  "sub-903": "border-l-lime-500 bg-lime-500/5",
  "sub-1201": "border-l-indigo-500 bg-indigo-500/5",
  "sub-1202": "border-l-teal-500 bg-teal-500/5",
  "sub-1203": "border-l-orange-500 bg-orange-500/5",
};

function getSubjectColor(subjectId: string): string {
  return SUBJECT_COLORS[subjectId] || "border-l-gray-400 bg-gray-500/5";
}

function findConflicts(slots: TimetableSlot[]): Set<string> {
  const conflictIds = new Set<string>();
  const byTeacher = new Map<string, Map<string, TimetableSlot[]>>();
  for (const slot of slots) {
    if (!byTeacher.has(slot.teacherId)) byTeacher.set(slot.teacherId, new Map());
    const dayMap = byTeacher.get(slot.teacherId)!;
    if (!dayMap.has(slot.day)) dayMap.set(slot.day, []);
    dayMap.get(slot.day)!.push(slot);
  }
  for (const dayMap of byTeacher.values()) {
    for (const daySlots of dayMap.values()) {
      if (daySlots.length > 1) {
        const periodSet = new Set<number>();
        for (const slot of daySlots) {
          if (periodSet.has(slot.periodNumber)) conflictIds.add(slot.id);
          else periodSet.add(slot.periodNumber);
        }
      }
    }
  }
  return conflictIds;
}

const PERIOD_STORAGE_KEY = "school_erp_periods_v1";

function loadPeriods(): Period[] {
  if (typeof window === "undefined") return defaultPeriods;
  try {
    const stored = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Period[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
    localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(defaultPeriods));
  } catch {}
  return defaultPeriods;
}

const slotSchema = z.object({
  day: z.string().min(1, "Day required"),
  periodNumber: z.string().min(1, "Period required"),
  classId: z.string().min(1, "Class required"),
  sectionId: z.string().min(1, "Section required"),
  subjectId: z.string().min(1, "Subject required"),
  teacherId: z.string().min(1, "Teacher required"),
  roomNumber: z.string().min(1, "Room required"),
});

type SlotFormValues = z.infer<typeof slotSchema>;

export function TimetableGridView() {
  const { activeBranchId } = useERP();
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));
  const [teachers] = useState(() => mockDb.getTeachers(activeBranchId));
  const [slots, setSlots] = useState(() => mockDb.getTimetableSlots(activeBranchId));
  const [periods, setPeriods] = useState<Period[]>(() => loadPeriods());

  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"class" | "teacher">("class");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Period editor
  const [periodEditorOpen, setPeriodEditorOpen] = useState(false);
  const [editPeriods, setEditPeriods] = useState<Period[]>(periods);

  // Full timetable builder
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderClassId, setBuilderClassId] = useState<string>(classes[0]?.id || "");
  const [builderSectionId, setBuilderSectionId] = useState<string>(classes[0]?.sections[0]?.id || "");
  const [builderGrid, setBuilderGrid] = useState<Record<string, Record<number, { subjectId: string; teacherId: string; room: string }>>>({});

  const lecturePeriods = useMemo(() => periods.filter((p) => !p.isBreak && p.type !== "BREAK" && p.type !== "LUNCH"), [periods]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SlotFormValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: { day: "MONDAY", periodNumber: "1", classId: "", sectionId: "", subjectId: "", teacherId: "", roomNumber: "" },
  });

  const watchedClassId = watch("classId");
  const watchedSubjectId = watch("subjectId");

  const selectedClass = useMemo(() => classes.find((c) => c.id === watchedClassId), [classes, watchedClassId]);
  const sections = selectedClass?.sections ?? [];
  const subjects = selectedClass?.subjects ?? [];

  const builderClass = useMemo(() => classes.find((c) => c.id === builderClassId), [classes, builderClassId]);
  const builderSubjects = builderClass?.subjects ?? [];
  const builderSections = builderClass?.sections ?? [];

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      const matchesClass = classFilter === "ALL" || s.classId === classFilter;
      const matchesDay = dayFilter === "ALL" || s.day === dayFilter;
      const matchesTeacher = !teacherSearch || s.teacherName.toLowerCase().includes(teacherSearch.toLowerCase());
      return matchesClass && matchesDay && matchesTeacher;
    });
  }, [slots, classFilter, dayFilter, teacherSearch]);

  const conflictIds = useMemo(() => findConflicts(filteredSlots), [filteredSlots]);

  const classViewGrid = useMemo(() => {
    const grid: Record<string, Record<number, TimetableSlot[]>> = {};
    for (const day of DAYS) {
      grid[day] = {};
      for (const p of lecturePeriods) grid[day][p.number] = [];
    }
    for (const slot of filteredSlots) {
      if (grid[slot.day]?.[slot.periodNumber] !== undefined) grid[slot.day][slot.periodNumber].push(slot);
    }
    return grid;
  }, [filteredSlots, lecturePeriods]);

  const refresh = () => setSlots([...mockDb.getTimetableSlots(activeBranchId)]);

  const persistPeriods = (next: Period[]) => {
    setPeriods(next);
    setEditPeriods(next);
    if (typeof window !== "undefined") localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(next));
  };

  const openCreate = (day?: DayOfWeek, period?: number) => {
    setEditingSlot(null);
    reset({
      day: day ?? "MONDAY",
      periodNumber: period ? String(period) : "1",
      classId: classFilter !== "ALL" ? classFilter : classes[0]?.id ?? "",
      sectionId: "",
      subjectId: "",
      teacherId: "",
      roomNumber: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    reset({
      day: slot.day,
      periodNumber: String(slot.periodNumber),
      classId: slot.classId,
      sectionId: slot.sectionId,
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      roomNumber: slot.roomNumber,
    });
    setDialogOpen(true);
  };

  const handleDelete = (slotId: string) => {
    mockDb.deleteTimetableSlot(slotId);
    toast.success("Slot deleted");
    refresh();
  };

  const onSubmit = (data: SlotFormValues) => {
    const cls = classes.find((c) => c.id === data.classId);
    const sec = cls?.sections.find((s) => s.id === data.sectionId);
    const sub = cls?.subjects.find((s) => s.id === data.subjectId);
    const tch = teachers.find((t) => t.id === data.teacherId);
    if (!cls || !sec || !sub) {
      toast.error("Please select valid class / section / subject");
      return;
    }
    const branchId = cls.branchId;
    const branchName = cls.branchName;
    const duplicate = slots.find(
      (s) => s.day === data.day as DayOfWeek && s.periodNumber === Number(data.periodNumber) && s.classId === data.classId && s.sectionId === data.sectionId && s.id !== editingSlot?.id
    );
    if (duplicate) {
      toast.error("This period is already occupied for selected class/section");
      return;
    }
    const payload: TimetableSlot = {
      id: editingSlot?.id ?? `ts-${Date.now().toString(36)}`,
      day: data.day as DayOfWeek,
      periodNumber: Number(data.periodNumber),
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      teacherId: tch?.id ?? sub.teacherId,
      teacherName: tch?.fullName ?? sub.teacherName,
      classId: cls.id,
      className: cls.name,
      sectionId: sec.id,
      sectionName: sec.name,
      roomNumber: data.roomNumber,
      branchId,
      branchName,
    };
    mockDb.saveTimetableSlot(payload);
    toast.success(editingSlot ? "Slot updated" : "Slot created");
    setDialogOpen(false);
    refresh();
  };

  // Builder helpers
  const openBuilder = () => {
    const cls = classes[0];
    if (!cls) { toast.error("No classes found"); return; }
    setBuilderClassId(cls.id);
    setBuilderSectionId(cls.sections[0]?.id || "");
    // build grid from existing slots for that class/section
    const g: Record<string, Record<number, { subjectId: string; teacherId: string; room: string }>> = {};
    for (const d of DAYS) {
      g[d] = {};
      for (const p of lecturePeriods) {
        const existing = slots.find((s) => s.classId === cls.id && s.sectionId === cls.sections[0]?.id && s.day === d && s.periodNumber === p.number);
        if (existing) g[d][p.number] = { subjectId: existing.subjectId, teacherId: existing.teacherId, room: existing.roomNumber };
        else g[d][p.number] = { subjectId: "", teacherId: "", room: cls.sections[0]?.roomNumber || "" };
      }
    }
    setBuilderGrid(g);
    setBuilderOpen(true);
  };

  const handleBuilderClassChange = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;
    setBuilderClassId(classId);
    setBuilderSectionId(cls.sections[0]?.id || "");
    const g: Record<string, Record<number, any>> = {};
    for (const d of DAYS) {
      g[d] = {};
      for (const p of lecturePeriods) {
        const existing = slots.find((s) => s.classId === cls.id && s.sectionId === cls.sections[0]?.id && s.day === d && s.periodNumber === p.number);
        g[d][p.number] = existing ? { subjectId: existing.subjectId, teacherId: existing.teacherId, room: existing.roomNumber } : { subjectId: "", teacherId: "", room: cls.sections[0]?.roomNumber || "" };
      }
    }
    setBuilderGrid(g);
  };

  const handleBuilderCellChange = (day: DayOfWeek, periodNumber: number, field: "subjectId" | "teacherId" | "room", value: string) => {
    setBuilderGrid((prev) => {
      const next = { ...prev, [day]: { ...prev[day] } };
      const cell = { ...(next[day][periodNumber] || { subjectId: "", teacherId: "", room: "" }) };
      (cell as any)[field] = value;
      // auto-fill teacher when subject changes
      if (field === "subjectId" && builderClass) {
        const sub = builderClass.subjects.find((s) => s.id === value);
        if (sub) cell.teacherId = sub.teacherId;
      }
      next[day][periodNumber] = cell;
      return next;
    });
  };

  const copyDayToAll = (sourceDay: DayOfWeek) => {
    setBuilderGrid((prev) => {
      const source = prev[sourceDay];
      if (!source) return prev;
      const next: any = { ...prev };
      for (const d of DAYS) {
        if (d === sourceDay) continue;
        next[d] = { ...source };
        // deep copy
        for (const k of Object.keys(next[d])) next[d][k] = { ...source[Number(k)] };
      }
      return next;
    });
    toast.success(`${DAY_LABELS[sourceDay]} copied to all days`);
  };

  const saveBuilder = () => {
    const cls = classes.find((c) => c.id === builderClassId);
    const sec = cls?.sections.find((s) => s.id === builderSectionId);
    if (!cls || !sec) { toast.error("Select class & section"); return; }
    let saved = 0;
    let skipped = 0;
    for (const day of DAYS) {
      for (const p of lecturePeriods) {
        const cell = builderGrid[day]?.[p.number];
        if (!cell || !cell.subjectId) { skipped++; continue; }
        const sub = cls.subjects.find((s) => s.id === cell.subjectId);
        const tch = teachers.find((t) => t.id === cell.teacherId) || (sub ? teachers.find((t) => t.id === sub.teacherId) : undefined);
        if (!sub) continue;
        const existing = slots.find((s) => s.day === day && s.periodNumber === p.number && s.classId === cls.id && s.sectionId === sec.id);
        const payload: TimetableSlot = {
          id: existing?.id ?? `ts-${Date.now().toString(36)}-${day}-${p.number}`,
          day,
          periodNumber: p.number,
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          teacherId: tch?.id ?? sub.teacherId,
          teacherName: tch?.fullName ?? sub.teacherName,
          classId: cls.id,
          className: cls.name,
          sectionId: sec.id,
          sectionName: sec.name,
          roomNumber: cell.room || sec.roomNumber,
          branchId: cls.branchId,
          branchName: cls.branchName,
        };
        mockDb.saveTimetableSlot(payload);
        saved++;
      }
    }
    toast.success(`Full timetable saved: ${saved} slots`, { description: skipped ? `${skipped} empty periods skipped` : "All lecture periods filled" });
    setBuilderOpen(false);
    refresh();
  };

  // Auto-fill room when section changes (single slot dialog)
  React.useEffect(() => {
    if (selectedClass && watch("sectionId")) {
      const sec = selectedClass.sections.find((s) => s.id === watch("sectionId"));
      if (sec && !editingSlot) setValue("roomNumber", sec.roomNumber);
    }
  }, [watchedClassId, watch("sectionId")]);

  // Auto-fill teacher when subject changes
  React.useEffect(() => {
    if (watchedSubjectId && selectedClass) {
      const sub = selectedClass.subjects.find((s) => s.id === watchedSubjectId);
      if (sub) setValue("teacherId", sub.teacherId);
    }
  }, [watchedSubjectId]);

  return (
    <div className="space-y-4">
      {conflictIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{conflictIds.size} Schedule Conflicts Detected: Some faculty members are double-booked for the same period.</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Days</SelectItem>
              {DAYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder="Search faculty..." className="pl-9 h-9 text-xs" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="class" className="text-xs px-3">Class View</TabsTrigger>
              <TabsTrigger value="teacher" className="text-xs px-3">Faculty View</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { setEditPeriods(periods); setPeriodEditorOpen(true); }}>
            <Settings2 className="h-3.5 w-3.5" /> Edit Periods & Lunch
          </Button>
          <Button onClick={openBuilder} size="sm" variant="secondary" className="gap-1.5 h-8 text-xs">
            <LayoutGrid className="h-3.5 w-3.5" /> Create Full Timetable
          </Button>
          <Button onClick={() => openCreate()} size="sm" variant="gradient" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" /> Add Slot
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 flex-wrap">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400/60 border border-amber-500" /> Lunch Break 13:00-14:00</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-400/40 border border-sky-500" /> Short Break</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pura time table khud se bana sakte hain — Full Timetable</span>
      </div>

      {filteredSlots.length === 0 ? (
        <div className="space-y-3">
          <EmptyState title="No Timetable Slots Found" description="Pura timetable khud se create karein — lunch & breaks sahit. Full Timetable button se ek sath pura week bhar sakte hain." />
          <div className="flex justify-center gap-2">
            <Button onClick={openBuilder} variant="gradient" className="gap-2">
              <LayoutGrid className="h-4 w-4" /> Create Full Timetable
            </Button>
            <Button onClick={() => openCreate()} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Add Single Slot
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-muted/50 border-b border-r border-border/80 px-3 py-2 text-left">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Period</span>
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="bg-muted/50 border-b border-r border-border/80 last:border-r-0 px-3 py-2 text-center min-w-[140px]">
                    <span className="text-xs font-bold text-foreground">{day}</span>
                    <span className="block text-[10px] font-normal text-muted-foreground">{DAY_LABELS[day]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => {
                const isBreak = !!period.isBreak;
                if (isBreak) {
                  const Icon = period.type === "LUNCH" ? Utensils : Coffee;
                  return (
                    <tr key={period.id} className={period.type === "LUNCH" ? "bg-amber-400/10" : "bg-sky-500/5"}>
                      <td className="sticky left-0 z-10 border-r border-border/80 px-3 py-2 align-middle min-w-[120px]" style={{ background: period.type === "LUNCH" ? "rgb(251 191 36 / 0.15)" : "rgb(14 165 233 / 0.08)" }}>
                        <span className="text-xs font-bold flex items-center gap-1"><Icon className="h-3 w-3" /> {period.label}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {period.startTime} - {period.endTime}</span>
                      </td>
                      <td colSpan={6} className="px-3 py-3 text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border ${period.type === "LUNCH" ? "bg-amber-500 text-white border-amber-600" : "bg-sky-500 text-white border-sky-600"}`}>
                          <Icon className="h-3.5 w-3.5" /> {period.label} — {period.startTime} to {period.endTime} {period.type === "LUNCH" ? "• Sabhi classes ke liye lunch" : "• Break"}
                        </div>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={period.id} className="border-b border-border/60 last:border-b-0">
                    <td className="sticky left-0 z-10 bg-card border-r border-border/80 px-3 py-3 align-top min-w-[120px]">
                      <span className="text-xs font-bold text-foreground block">Period {period.number}</span>
                      <span className="text-[10px] text-muted-foreground block flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {period.startTime} - {period.endTime}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{period.label}</span>
                    </td>
                    {DAYS.map((day) => {
                      const daySlots = classViewGrid[day]?.[period.number] || [];
                      return (
                        <td key={day} className="border-r border-border/60 last:border-r-0 p-1.5 align-top min-h-[70px]">
                          {daySlots.length === 0 ? (
                            <button
                              onClick={() => openCreate(day, period.number)}
                              className="w-full h-full min-h-[56px] rounded-lg border border-dashed border-border/40 flex flex-col items-center justify-center text-[10px] text-muted-foreground/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                            >
                              <Plus className="h-3 w-3" /> Free
                            </button>
                          ) : (
                            <div className="space-y-1">
                              {daySlots.map((slot) => {
                                const isConflict = conflictIds.has(slot.id);
                                return (
                                  <div
                                    key={slot.id}
                                    className={`group relative p-2 rounded-lg border-l-3 text-xs space-y-1 transition-all shadow-2xs ${getSubjectColor(slot.subjectId)} ${isConflict ? "ring-2 ring-destructive/80 bg-destructive/10" : "border-border/60"}`}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-foreground text-xs truncate">{slot.subjectName}</span>
                                      {isConflict && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate">{slot.teacherName}</div>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                      <span>{slot.className} • {slot.sectionName?.split(" ")[0]} {slot.sectionName?.split(" ")[1]}</span>
                                      <span className="font-mono">Rm {slot.roomNumber}</span>
                                    </div>
                                    <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(slot)}>
                                        <Edit3 className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(slot.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                              <Button variant="ghost" size="sm" className="w-full h-6 text-[10px] gap-1 mt-1" onClick={() => openCreate(day, period.number)}>
                                <Plus className="h-3 w-3" /> Add
                              </Button>
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

      <div className="text-xs text-muted-foreground px-1">
        Lunch & breaks har din same rahenge — periods ko Edit Periods se time badal sakte hain. Pura timetable ek sath banane ke liye <strong>Create Full Timetable</strong> use karein — class/section select karke har din ke 8 periods ek sath bhar sakte hain.
      </div>

      {/* Single Slot Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Edit Timetable Slot" : "Create Timetable Slot"}</DialogTitle>
            <DialogDescription>Lecture period ke liye subject, faculty aur room assign karein — lunch/break me slot nahi banta.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Day</label>
                <Select value={watch("day")} onValueChange={(v) => setValue("day", v)}>
                  <SelectTrigger className={errors.day ? "border-rose-500" : ""}><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d} ({DAY_LABELS[d]})</SelectItem>)}</SelectContent>
                </Select>
                {errors.day && <p className="text-[11px] text-rose-500 mt-1">{errors.day.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Period (Lecture only)</label>
                <Select value={watch("periodNumber")} onValueChange={(v) => setValue("periodNumber", v)}>
                  <SelectTrigger className={errors.periodNumber ? "border-rose-500" : ""}><SelectValue /></SelectTrigger>
                  <SelectContent>{lecturePeriods.map((p) => <SelectItem key={p.number} value={String(p.number)}>P{p.number} — {p.startTime}-{p.endTime} ({p.label})</SelectItem>)}</SelectContent>
                </Select>
                {errors.periodNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.periodNumber.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Class</label>
                <Select value={watch("classId")} onValueChange={(v) => { setValue("classId", v); setValue("sectionId", ""); setValue("subjectId", ""); }}>
                  <SelectTrigger className={errors.classId ? "border-rose-500" : ""}><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                {errors.classId && <p className="text-[11px] text-rose-500 mt-1">{errors.classId.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Section</label>
                <Select value={watch("sectionId")} onValueChange={(v) => setValue("sectionId", v)} disabled={!selectedClass}>
                  <SelectTrigger className={errors.sectionId ? "border-rose-500" : ""}><SelectValue placeholder={selectedClass ? "Select Section" : "Pick class first"} /></SelectTrigger>
                  <SelectContent>{sections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.roomNumber}</SelectItem>)}</SelectContent>
                </Select>
                {errors.sectionId && <p className="text-[11px] text-rose-500 mt-1">{errors.sectionId.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Subject</label>
              <Select value={watch("subjectId")} onValueChange={(v) => setValue("subjectId", v)} disabled={!selectedClass}>
                <SelectTrigger className={errors.subjectId ? "border-rose-500" : ""}><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
              </Select>
              {errors.subjectId && <p className="text-[11px] text-rose-500 mt-1">{errors.subjectId.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Teacher</label>
              <Select value={watch("teacherId")} onValueChange={(v) => setValue("teacherId", v)}>
                <SelectTrigger className={errors.teacherId ? "border-rose-500" : ""}><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName} — {t.department}</SelectItem>)}</SelectContent>
              </Select>
              {errors.teacherId && <p className="text-[11px] text-rose-500 mt-1">{errors.teacherId.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Room Number</label>
              <Input {...register("roomNumber")} placeholder="e.g. Room 301 / Lab 12" className={errors.roomNumber ? "border-rose-500" : ""} />
              {errors.roomNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.roomNumber.message}</p>}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" className="gap-1"><Save className="h-3.5 w-3.5" /> {editingSlot ? "Update Slot" : "Create Slot"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Period Editor */}
      <Dialog open={periodEditorOpen} onOpenChange={setPeriodEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Edit Periods & Lunch Breaks</DialogTitle>
            <DialogDescription>Har period ka time + lunch/break khud se set karein. Changes localStorage me save honge — pura school ka bell timing yahin se control.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-3">
            {editPeriods.map((p, idx) => (
              <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border ${p.isBreak ? (p.type === "LUNCH" ? "bg-amber-50 border-amber-200" : "bg-sky-50 border-sky-200") : "bg-card"}`}>
                <Badge variant={p.isBreak ? (p.type === "LUNCH" ? "warning" : "info") : "outline"} className="text-[10px] shrink-0">{p.isBreak ? p.type : `P${p.number}`}</Badge>
                <Input value={p.label} onChange={(e) => setEditPeriods((prev) => prev.map((x, i) => i === idx ? { ...x, label: e.target.value } : x))} className="h-8 text-xs flex-1" placeholder="Label" />
                <Input type="time" value={p.startTime} onChange={(e) => setEditPeriods((prev) => prev.map((x, i) => i === idx ? { ...x, startTime: e.target.value } : x))} className="h-8 text-xs w-[110px]" />
                <span className="text-xs">-</span>
                <Input type="time" value={p.endTime} onChange={(e) => setEditPeriods((prev) => prev.map((x, i) => i === idx ? { ...x, endTime: e.target.value } : x))} className="h-8 text-xs w-[110px]" />
                <Select value={p.type || "LECTURE"} onValueChange={(v) => setEditPeriods((prev) => prev.map((x, i) => i === idx ? { ...x, type: v as any, isBreak: v !== "LECTURE" } : x))}>
                  <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LECTURE">Lecture</SelectItem>
                    <SelectItem value="BREAK">Break</SelectItem>
                    <SelectItem value="LUNCH">Lunch</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setEditPeriods((prev) => prev.filter((_, i) => i !== idx))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setEditPeriods((prev) => [...prev, { id: `per-${Date.now()}`, number: prev.filter((p) => !p.isBreak).length + 1, label: `Period ${prev.filter((p) => !p.isBreak).length + 1}`, startTime: "15:30", endTime: "16:15", type: "LECTURE" }])}><Plus className="h-3.5 w-3.5" /> Add Lecture</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setEditPeriods((prev) => [...prev, { id: `per-break-${Date.now()}`, number: 0, label: "Short Break", startTime: "10:00", endTime: "10:15", type: "BREAK", isBreak: true }])}><Coffee className="h-3.5 w-3.5" /> Add Break</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setEditPeriods((prev) => [...prev, { id: `per-lunch-${Date.now()}`, number: 0, label: "Lunch Break", startTime: "13:00", endTime: "14:00", type: "LUNCH", isBreak: true }])}><Utensils className="h-3.5 w-3.5" /> Add Lunch</Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs ml-auto" onClick={() => setEditPeriods(defaultPeriods)}>Reset to Default</Button>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setPeriodEditorOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => { persistPeriods(editPeriods); setPeriodEditorOpen(false); toast.success("Periods & lunch timing updated"); }} className="gap-1"><Save className="h-3.5 w-3.5" /> Save Periods</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Timetable Builder */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-[95vw] w-[1150px] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Create Full Timetable — Pura Week Ek Sath</DialogTitle>
            <DialogDescription>Class + Section select karke har din ke 8 lecture periods ek sath bhar sakte hain. Lunch/Break auto lagega — sirf lecture periods fill karein. Khud se pura timetable create karein.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-3 p-2 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Class *</span>
              <Select value={builderClassId} onValueChange={handleBuilderClassChange}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Section *</span>
              <Select value={builderSectionId} onValueChange={(v) => setBuilderSectionId(v)}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{builderSections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <span className="text-[11px] text-muted-foreground self-center">Bina ek-ek cell khole, pura week ka matrix bhar ke Save karein. Subject change par teacher auto-fill.</span>
          </div>
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-2 text-xs text-left w-[100px]">Day / Period</th>
                  {lecturePeriods.map((p) => (
                    <th key={p.number} className="border p-1.5 text-center">
                      <div className="text-xs font-bold">P{p.number}</div>
                      <div className="text-[10px] text-muted-foreground">{p.startTime}-{p.endTime}</div>
                      <div className="text-[10px]"> {p.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-t">
                    <td className="border p-2 bg-muted/20">
                      <div className="text-xs font-bold">{day} <span className="text-[10px] font-normal">({DAY_LABELS[day]})</span></div>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 mt-1" onClick={() => copyDayToAll(day)}><Copy className="h-3 w-3" /> Copy to all</Button>
                    </td>
                    {lecturePeriods.map((p) => {
                      const cell = builderGrid[day]?.[p.number] || { subjectId: "", teacherId: "", room: "" };
                      return (
                        <td key={p.number} className="border p-1 align-top">
                          <div className="space-y-1">
                            <Select value={cell.subjectId} onValueChange={(v) => handleBuilderCellChange(day, p.number, "subjectId", v)}>
                              <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Subject" /></SelectTrigger>
                              <SelectContent>{builderSubjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={cell.teacherId} onValueChange={(v) => handleBuilderCellChange(day, p.number, "teacherId", v)}>
                              <SelectTrigger className="h-7 text-[11px]"><SelectValue placeholder="Teacher" /></SelectTrigger>
                              <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input value={cell.room} onChange={(e) => handleBuilderCellChange(day, p.number, "room", e.target.value)} placeholder="Room" className="h-7 text-[11px]" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Lunch/Break info row */}
                <tr className="bg-amber-50 dark:bg-amber-950/20">
                  <td colSpan={lecturePeriods.length + 1} className="border p-2 text-center text-xs">
                    <span className="inline-flex items-center gap-2"><Utensils className="h-3 w-3" /> Lunch 13:00-14:00 + Short Breaks auto — inke liye slot nahi banana padta</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={saveBuilder} className="gap-1"><Save className="h-3.5 w-3.5" /> Save Full Timetable ({lecturePeriods.length * DAYS.length} periods)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
