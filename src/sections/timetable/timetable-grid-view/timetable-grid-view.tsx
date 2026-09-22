"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchClasses, fetchSubjects } from "@/lib/api/classes";
import { fetchStaffDirectory } from "@/lib/api/hr";
import { fetchTimetableGrid, createSlotApi, updateSlotApi, deleteSlotApi, bulkSlotsApi, updatePeriodApi, createPeriodApi, deletePeriodApi } from "@/lib/api/timetable";
import type { PeriodDTO, TimetableSlotDTO } from "@/lib/api/timetable";
import type { ClassRoom, Subject } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Save,
  Coffee,
  Utensils,
  Settings2,
  LayoutGrid,
  Copy,
  X,
  AlertTriangle,
  WifiOff,
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  ArrowRight,
  User,
  Wand2,
  Paintbrush,
  Eraser,
  RotateCcw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

// Color palettes for subjects
const SUBJECT_PALETTES = [
  { border: "border-l-blue-500 border-blue-200 dark:border-blue-900/60", bg: "bg-blue-50/70 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-300", chip: "bg-blue-500" },
  { border: "border-l-emerald-500 border-emerald-200 dark:border-emerald-900/60", bg: "bg-emerald-50/70 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-300", chip: "bg-emerald-500" },
  { border: "border-l-purple-500 border-purple-200 dark:border-purple-900/60", bg: "bg-purple-50/70 dark:bg-purple-950/20", text: "text-purple-700 dark:text-purple-300", chip: "bg-purple-500" },
  { border: "border-l-amber-500 border-amber-200 dark:border-amber-900/60", bg: "bg-amber-50/70 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-300", chip: "bg-amber-500" },
  { border: "border-l-rose-500 border-rose-200 dark:border-rose-900/60", bg: "bg-rose-50/70 dark:bg-rose-950/20", text: "text-rose-700 dark:text-rose-300", chip: "bg-rose-500" },
  { border: "border-l-cyan-500 border-cyan-200 dark:border-cyan-900/60", bg: "bg-cyan-50/70 dark:bg-cyan-950/20", text: "text-cyan-700 dark:text-cyan-300", chip: "bg-cyan-500" },
  { border: "border-l-indigo-500 border-indigo-200 dark:border-indigo-900/60", bg: "bg-indigo-50/70 dark:bg-indigo-950/20", text: "text-indigo-700 dark:text-indigo-300", chip: "bg-indigo-500" },
  { border: "border-l-orange-500 border-orange-200 dark:border-orange-900/60", bg: "bg-orange-50/70 dark:bg-orange-950/20", text: "text-orange-700 dark:text-orange-300", chip: "bg-orange-500" },
];

function getSubjectTheme(subjectId: string, index = 0) {
  let hash = 0;
  for (let i = 0; i < (subjectId?.length || 0); i++) {
    hash = (hash << 5) - hash + subjectId.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash + index) % SUBJECT_PALETTES.length;
  return SUBJECT_PALETTES[idx];
}

// ── Time & Duration Formatting Utilities ──
export function extract24hTime(timeStr?: string | null): string {
  if (!timeStr) return "08:00";
  const s = String(timeStr).trim();
  const match = s.match(/(?:^|\b|\s|T)(\d{1,2}):(\d{2})/);
  if (match) {
    const hh = match[1].padStart(2, "0");
    const mm = match[2].padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return "08:00";
}

export function formatTime12h(timeStr?: string | null): string {
  if (!timeStr) return "";
  const s = String(timeStr).trim();
  const match = s.match(/(?:^|\b|\s|T)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    if (!isNaN(hours) && hours >= 0 && hours <= 23) {
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const hoursStr = String(hours).padStart(2, "0");
      return `${hoursStr}:${minutes} ${period}`;
    }
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
  }
  return s;
}

export function formatTimeRange(start?: string, end?: string): string {
  if (!start || !end) return "";
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

export function getDurationMinutes(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const sTime = extract24hTime(start);
  const eTime = extract24hTime(end);
  const sParts = sTime.split(":").map(Number);
  const eParts = eTime.split(":").map(Number);
  if (sParts.length < 2 || eParts.length < 2) return 0;
  const startMin = (sParts[0] || 0) * 60 + (sParts[1] || 0);
  const endMin = (eParts[0] || 0) * 60 + (eParts[1] || 0);
  const diff = endMin - startMin;
  return diff > 0 ? diff : 0;
}

export function formatDuration(start?: string, end?: string): string {
  const diff = getDurationMinutes(start, end);
  if (diff <= 0) return "";
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function calculateEndTime(start: string, durationMinutes: number): string {
  const sTime = extract24hTime(start);
  const sParts = sTime.split(":").map(Number);
  const startMin = (sParts[0] || 0) * 60 + (sParts[1] || 0);
  const endMin = startMin + durationMinutes;
  const hours = Math.floor(endMin / 60) % 24;
  const mins = endMin % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}


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
      const all: ClassRoom[] = [];
      for (let page = 1; page <= 5; page++) {
        const list = await fetchClasses({ campusId, page, limit: 100 });
        all.push(...list);
        if (list.length < 100) break;
      }
      setClasses(all);
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
      let loadedSubjects: Subject[] = chosenClass?.subjects ?? [];
      try {
        const subs = await fetchSubjects({ campusId, classId: chosenClassId });
        const mapped: Subject[] = (Array.isArray(subs) ? subs : []).map((s: any) => ({
          id: s.uuid ?? s.id,
          name: s.name,
          code: s.code ?? "",
          teacherId: s.teacher?.uuid ?? s.teacherId ?? "",
          teacherName: s.teacher?.name ?? "",
          weeklyPeriods: 4,
        }));
        if (mapped.length) loadedSubjects = mapped;
        setSubjects(loadedSubjects);
      } catch {
        setSubjects(loadedSubjects);
      }
      let staffUsers: Array<{ id: string; fullName: string }> = [];
      try {
        const res = await fetchStaffDirectory({ campusId, role: "teacher", limit: 100 });
        if (res.data?.length) staffUsers = res.data.map((u) => ({ id: u.uuid, fullName: u.name }));
      } catch {}
      if (!staffUsers.length) {
        try {
          const res = await fetchStaffDirectory({ campusId, role: "TEACHER", limit: 100 });
          if (res.data?.length) staffUsers = res.data.map((u) => ({ id: u.uuid, fullName: u.name }));
        } catch {}
      }
      if (!staffUsers.length) {
        try {
          const res = await fetchStaffDirectory({ campusId, limit: 100 });
          if (res.data?.length) {
            const filt = res.data.filter((u: any) => !u.role || u.role.toLowerCase().includes("teach") || u.role.toLowerCase().includes("faculty"));
            staffUsers = (filt.length ? filt : res.data).map((u) => ({ id: u.uuid, fullName: u.name }));
          }
        } catch {}
      }

      // Merge with teachers designated on subjects
      const tMap = new Map<string, { id: string; fullName: string }>();
      staffUsers.forEach((t) => { if (t.id && t.fullName) tMap.set(t.id, t); });
      loadedSubjects.forEach((s: any) => {
        if (s.teacherId && s.teacherName && !tMap.has(s.teacherId)) {
          tMap.set(s.teacherId, { id: s.teacherId, fullName: s.teacherName });
        } else if (!s.teacherId && s.teacherName) {
          const pseudoId = `teach-${s.id || s.name}`;
          if (!tMap.has(pseudoId)) tMap.set(pseudoId, { id: pseudoId, fullName: s.teacherName });
        }
      });
      setTeachers(Array.from(tMap.values()));
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
  const wPeriodNumber = watch("periodNumber");
  const selClass = useMemo(() => classes.find((c) => c.id === wClassId) ?? chosenClass, [classes, wClassId, chosenClass]);

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
    if (inlineS >= inlineE) return toast.error("Start must be before End time");
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

  const subjectTeacherOf = useCallback((subjectId: string) => {
    const s = subjects.find((x) => x.id === subjectId);
    if (!s) return null;
    if (s.teacherId) {
      const match = teachers.find((t) => t.id === s.teacherId);
      return { id: s.teacherId, name: match?.fullName || s.teacherName || "" };
    }
    if (s.teacherName) {
      const match = teachers.find((t) => t.fullName.toLowerCase() === s.teacherName?.toLowerCase());
      if (match) return { id: match.id, name: match.fullName };
      return { id: `teach-${s.id}`, name: s.teacherName };
    }
    return null;
  }, [subjects, teachers]);

  const openBuilder = () => {
    if (!chosenClassId) return toast.error("Choose a class first");
    if (!chosenClass) return toast.error("No class");
    const g: any = {};
    for (const d of DAYS) {
      g[d] = {};
      for (const p of lectures) {
        const ex = slots.find((s) => s.classId === chosenClassId && (s.section ?? "") === (chosenSection ?? "") && s.day === d && s.periodNumber === p.number);
        let tId = ex?.teacherId ?? "";
        if (ex && !tId) tId = subjectTeacherOf(ex.subjectId)?.id ?? "";
        g[d][p.number] = ex ? { subjectId: ex.subjectId, teacherId: tId, room: ex.roomNumber } : { subjectId: "", teacherId: "", room: "" };
      }
    }
    setGridBuilder(g);
    setActiveSubjectId(null);
    setBuilderOpen(true);
  };

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  const autoFillBalancedSchedule = () => {
    if (subjects.length === 0) return toast.error("No subjects available for this class");
    const n: any = {};
    let subIndex = 0;
    const roomName = chosenClass?.name ? `Room ${chosenClass.name.replace(/\D/g, "") || "101"}` : "Room 101";

    for (const d of DAYS) {
      n[d] = {};
      for (let i = 0; i < lectures.length; i++) {
        const p = lectures[i];
        const sub = subjects[(subIndex + i) % subjects.length];
        const autoT = subjectTeacherOf(sub.id);
        n[d][p.number] = {
          subjectId: sub.id,
          teacherId: autoT?.id || sub.teacherId || (teachers[0]?.id ?? ""),
          room: roomName,
        };
      }
      subIndex = (subIndex + 2) % subjects.length;
    }
    setGridBuilder(n);
    toast.success("Balanced weekly timetable generated! You can edit any slot below.");
  };

  const copyDayToWeekdays = (sourceDay: DayOfWeek) => {
    const src = gridBuilder[sourceDay];
    if (!src) return;
    const weekdays: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    setGridBuilder((prev) => {
      const n = { ...prev };
      for (const d of weekdays) {
        if (d !== sourceDay) {
          n[d] = Object.fromEntries(Object.entries(src).map(([k, v]) => [k, { ...(v as any) }]));
        }
      }
      return n;
    });
    toast.success(`${sourceDay}'s schedule copied to all weekdays (Mon-Fri)`);
  };

  const clearDay = (day: DayOfWeek) => {
    setGridBuilder((prev) => {
      const n = { ...prev };
      n[day] = {};
      for (const p of lectures) {
        n[day][p.number] = { subjectId: "", teacherId: "", room: "" };
      }
      return n;
    });
    toast.success(`Cleared ${day}`);
  };

  const autoAssignBuilderTeachers = () => {
    setGridBuilder((prev) => {
      const n: any = {};
      let filled = 0;
      for (const d of DAYS) {
        n[d] = {};
        for (const p of lectures) {
          const cell = prev[d]?.[p.number] ?? { subjectId: "", teacherId: "", room: "" };
          if (cell.subjectId && !cell.teacherId) {
            const t = subjectTeacherOf(cell.subjectId);
            if (t) { n[d][p.number] = { ...cell, teacherId: t.id }; filled++; continue; }
          }
          n[d][p.number] = { ...cell };
        }
      }
      toast.success(filled ? `${filled} teachers auto-assigned` : "All set — every subject already has a teacher");
      return n;
    });
  };

  const builderStats = useMemo(() => {
    let filled = 0, missingTeacher = 0;
    for (const d of DAYS) {
      for (const p of lectures) {
        const cell = gridBuilder[d]?.[p.number];
        if (cell?.subjectId) {
          filled++;
          if (!cell.teacherId) missingTeacher++;
        }
      }
    }
    return { filled, total: DAYS.length * lectures.length, missingTeacher };
  }, [gridBuilder, lectures]);

  const saveBuilder = async () => {
    if (!chosenClassId || !chosenClass) return toast.error("Class required");
    if (isOffline) return toast.error("You are offline");
    const payload = {
      classId: chosenClassId,
      section: chosenSection || null,
      slots: [] as Array<{ day: string; periodNumber: number; subjectId: string; teacherId: string; roomNumber?: string }>,
    };
    for (const d of DAYS) {
      for (const p of lectures) {
        const cell = gridBuilder[d]?.[p.number];
        if (!cell?.subjectId) continue;
        const teacherId = cell.teacherId || subjectTeacherOf(cell.subjectId)?.id || "";
        if (!teacherId) {
          toast.error(`${d} Period ${p.number}: Please pick a teacher or assign one to the subject`);
          return;
        }
        payload.slots.push({ day: d, periodNumber: p.number, subjectId: cell.subjectId, teacherId, roomNumber: cell.room || "Room 101" });
      }
    }
    if (payload.slots.length === 0) return toast.error("Pick at least one subject to save timetable");
    try {
      await bulkSlotsApi(payload, campusId);
      toast.success(`${payload.slots.length} slots saved successfully`);
      setBuilderOpen(false);
      fetchGrid();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Bulk save failed");
    }
  };

  const handleSavePeriods = async () => {
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
    toast.success("Periods and timings updated");
    fetchGrid();
  };

  const applyStandardSchoolPreset = () => {
    const campus = campusId ?? "";
    const preset: PeriodDTO[] = [
      { id: `preset-1`, uuid: `preset-1`, number: 1, label: "Period 1", startTime: "08:30", endTime: "09:15", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-2`, uuid: `preset-2`, number: 2, label: "Period 2", startTime: "09:15", endTime: "10:00", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-3`, uuid: `preset-3`, number: 0, label: "Morning Recess", startTime: "10:00", endTime: "10:20", type: "BREAK", isBreak: true, campusId: campus },
      { id: `preset-4`, uuid: `preset-4`, number: 3, label: "Period 3", startTime: "10:20", endTime: "11:05", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-5`, uuid: `preset-5`, number: 4, label: "Period 4", startTime: "11:05", endTime: "11:50", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-6`, uuid: `preset-6`, number: 0, label: "Lunch Break", startTime: "11:50", endTime: "12:35", type: "LUNCH", isBreak: true, campusId: campus },
      { id: `preset-7`, uuid: `preset-7`, number: 5, label: "Period 5", startTime: "12:35", endTime: "13:20", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-8`, uuid: `preset-8`, number: 6, label: "Period 6", startTime: "13:20", endTime: "14:05", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-9`, uuid: `preset-9`, number: 7, label: "Period 7", startTime: "14:05", endTime: "14:50", type: "LECTURE", isBreak: false, campusId: campus },
      { id: `preset-10`, uuid: `preset-10`, number: 8, label: "Period 8", startTime: "14:50", endTime: "15:35", type: "LECTURE", isBreak: false, campusId: campus },
    ];
    setDraft(preset);
    toast.success("Standard 8-Period school schedule loaded. Click 'Save' to apply.");
  };

  const setPeriodDuration = (idx: number, minutes: number) => {
    setDraft((arr) =>
      arr.map((p, i) => {
        if (i !== idx) return p;
        const newEnd = calculateEndTime(p.startTime, minutes);
        return { ...p, endTime: newEnd };
      })
    );
  };

  const selectedLecture = useMemo(() => {
    return lectures.find((p) => String(p.number) === String(wPeriodNumber)) ?? lectures[0];
  }, [lectures, wPeriodNumber]);

  // ── Render ──
  return (
    <div className="space-y-4">
      {isOffline && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <WifiOff className="h-4 w-4" /> You are offline — timetable data may be stale. Reconnect to save changes.
        </div>
      )}

      {/* 1. Class chooser — REQUIRED first step */}
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
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setDraft(periods); setPeriodOpen(true); }}><Settings2 className="h-3.5 w-3.5" /> Edit Periods & Timings</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground px-1 items-center">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400/60 border border-amber-500" /> Lunch</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-400/40 border border-sky-500" /> Break</span>
            <span className="hidden sm:flex items-center gap-1"><Edit3 className="h-3 w-3" /> Click ✏️ on any period to quickly adjust timing</span>
            <span className="ml-auto text-[11px] font-medium">{filtered.length} slots active • {chosenClass?.name} {chosenSection ? `Sec ${chosenSection}` : ""}</span>
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
                  <th className="sticky left-0 z-10 bg-muted/70 border-b border-r px-3.5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase">Period & Time</th>
                  {DAYS.map((d) => <th key={d} className="bg-muted/70 border-b border-r last:border-r-0 px-3 py-2.5 text-center min-w-[140px]"><div className="text-xs font-bold text-foreground">{d}</div><div className="text-[10px] font-normal text-muted-foreground">{DAY_SHORT[d]}</div></th>)}
                </tr></thead>
                <tbody>
                  {periods.map((p) => {
                    if (p.isBreak) {
                      const Icon = p.type === "LUNCH" ? Utensils : Coffee;
                      const editingInline = inlineId === p.id;
                      return (
                        <tr key={p.id} className={p.type === "LUNCH" ? "bg-amber-400/10" : "bg-sky-500/5"}>
                          <td className="sticky left-0 z-10 border-r px-3.5 py-2.5 min-w-[180px]" style={{ background: p.type === "LUNCH" ? "rgb(251 191 36 / 0.14)" : "rgb(14 165 233 / 0.08)" }}>
                            <div className="text-xs font-bold flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {p.label}</div>
                            {editingInline ? (
                              <div className="space-y-1 mt-1.5">
                                <div className="flex items-center gap-1">
                                  <Input type="time" value={inlineS} onChange={(e) => setInlineS(e.target.value)} className="h-7 w-[82px] text-xs px-1" />
                                  <span className="text-xs">-</span>
                                  <Input type="time" value={inlineE} onChange={(e) => setInlineE(e.target.value)} className="h-7 w-[82px] text-xs px-1" />
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveInline(p.id)} title="Save"><Save className="h-3 w-3 text-emerald-600" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setInlineId(null)} title="Cancel"><X className="h-3 w-3" /></Button>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono">{formatTimeRange(inlineS, inlineE)} ({formatDuration(inlineS, inlineE)})</div>
                              </div>
                            ) : (
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 flex-wrap">
                                <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                                <span className="font-medium text-foreground">{formatTimeRange(p.startTime, p.endTime)}</span>
                                <span className="text-[10px] px-1 py-0.2 rounded bg-muted font-mono">{formatDuration(p.startTime, p.endTime)}</span>
                                <button onClick={() => { setInlineId(p.id); setInlineS(p.startTime.slice(0,5)); setInlineE(p.endTime.slice(0,5)); }} className="ml-1 p-0.5 hover:bg-black/5 rounded text-muted-foreground hover:text-foreground" title="Edit timing"><Edit3 className="h-3 w-3" /></button>
                              </div>
                            )}
                          </td>
                          <td colSpan={6} className="text-center py-3">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-xs ${p.type === "LUNCH" ? "bg-amber-500" : "bg-sky-500"}`}>
                              <Icon className="h-3.5 w-3.5" /> {p.label} — {formatTimeRange(p.startTime, p.endTime)} ({formatDuration(p.startTime, p.endTime)})
                            </span>
                          </td>
                        </tr>
                      );
                    }
                    const editingInline = inlineId === p.id;
                    return (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="sticky left-0 z-10 bg-card border-r px-3.5 py-3 min-w-[180px] align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">Period {p.number}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-medium">{p.label}</span>
                          </div>
                          {editingInline ? (
                            <div className="space-y-1 mt-1.5">
                              <div className="flex items-center gap-1">
                                <Input type="time" value={inlineS} onChange={(e) => setInlineS(e.target.value)} className="h-7 w-[82px] text-xs px-1" />
                                <span className="text-xs">-</span>
                                <Input type="time" value={inlineE} onChange={(e) => setInlineE(e.target.value)} className="h-7 w-[82px] text-xs px-1" />
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveInline(p.id)} title="Save"><Save className="h-3 w-3 text-emerald-600" /></Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setInlineId(null)} title="Cancel"><X className="h-3 w-3" /></Button>
                              </div>
                              <div className="text-[10px] text-muted-foreground font-mono">{formatTimeRange(inlineS, inlineE)} ({formatDuration(inlineS, inlineE)})</div>
                            </div>
                          ) : (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 flex-wrap">
                              <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                              <span className="font-medium text-foreground">{formatTimeRange(p.startTime, p.endTime)}</span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-muted font-mono">{formatDuration(p.startTime, p.endTime)}</span>
                              <button onClick={() => { setInlineId(p.id); setInlineS(p.startTime.slice(0,5)); setInlineE(p.endTime.slice(0,5)); }} className="ml-1 p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Edit timing"><Edit3 className="h-3 w-3" /></button>
                            </div>
                          )}
                        </td>
                        {DAYS.map((day) => {
                          const list = classGrid[day]?.[p.number] || [];
                          return (
                            <td key={day} className="border-r last:border-0 p-1.5 align-top">
                              {list.length === 0 ? (
                                <button onClick={() => openCreate(day, p.number)} className="w-full min-h-[56px] rounded-lg border border-dashed flex flex-col items-center justify-center text-[10px] text-muted-foreground/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"><Plus className="h-3 w-3" /> Free</button>
                              ) : (
                                <div className="space-y-1">
                                  {list.map((s) => (
                                    <div key={s.id} className={`group p-2 rounded-lg border-l-[3px] text-xs shadow-xs ${getColor(s.subjectId)}`}>
                                      <div className="font-bold truncate">{s.subjectName ?? "Subject"}</div>
                                      <div className="text-[11px] text-muted-foreground truncate">{s.teacherName ?? "—"}</div>
                                      <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5"><span>{s.className ?? ""} {s.section ? `• ${s.section}` : ""}</span><span className="font-mono font-medium">{s.roomNumber}</span></div>
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

      {/* ── Dialog 1: Add/Edit Single Slot ── */}
      <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
        <DialogContent className="!max-w-xl sm:!max-w-2xl w-[92vw] sm:!rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><BookOpen className="h-4 w-4" /></span>
              {editing ? "Edit Lecture Slot" : "Add Lecture Slot"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign subject, faculty, and classroom for this period. Changes reflect in teacher timetable and attendance.
            </DialogDescription>
          </DialogHeader>

          {/* Live Timing Banner */}
          {selectedLecture && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs mt-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">{watch("day")}</span>
                <span>•</span>
                <span className="font-medium text-primary">Period {selectedLecture.number}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-foreground">{formatTimeRange(selectedLecture.startTime, selectedLecture.endTime)}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">⏱️ {formatDuration(selectedLecture.startTime, selectedLecture.endTime)}</Badge>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Day of Week</label>
                <Select value={watch("day")} onValueChange={(v) => setValue("day", v)}>
                  <SelectTrigger className={`h-9 text-xs mt-1 ${errors.day ? "border-rose-500" : ""}`}><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Period & Timing</label>
                <Select value={watch("periodNumber")} onValueChange={(v) => setValue("periodNumber", v)}>
                  <SelectTrigger className="h-9 text-xs mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {lectures.map((p) => (
                      <SelectItem key={p.number} value={String(p.number)}>
                        Period {p.number} ({formatTimeRange(p.startTime, p.endTime)} • {formatDuration(p.startTime, p.endTime)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Class</label>
                <Select value={watch("classId")} onValueChange={(v) => { setValue("classId", v); setValue("section", ""); setValue("subjectId", ""); }}>
                  <SelectTrigger className="h-9 text-xs mt-1"><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Section</label>
                <Select value={watch("section") ?? ""} onValueChange={(v) => setValue("section", v)}>
                  <SelectTrigger className="h-9 text-xs mt-1"><SelectValue placeholder="Section" /></SelectTrigger>
                  <SelectContent>{(selClass?.sections ?? sectionOptions).map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Subject ({subjects.length})</label>
              <Select value={watch("subjectId")} onValueChange={(v) => setValue("subjectId", v)}>
                <SelectTrigger className="h-9 text-xs mt-1"><SelectValue placeholder={subjects.length ? "Choose Subject" : "No subjects configured for this class"} /></SelectTrigger>
                <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}{s.teacherName ? ` • ${s.teacherName}` : ""}</SelectItem>)}</SelectContent>
              </Select>
              {(() => {
                const sel = subjects.find((s) => s.id === wSubId);
                return sel?.teacherName ? <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><span className="text-amber-500">★</span> Assigned Faculty: <strong className="text-foreground">{sel.teacherName}</strong> (auto-selected, changeable below)</p> : null;
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Assigned Faculty ({teachers.length})</label>
                <Select value={watch("teacherId")} onValueChange={(v) => setValue("teacherId", v)}>
                  <SelectTrigger className="h-9 text-xs mt-1"><SelectValue placeholder="Teacher" /></SelectTrigger>
                  <SelectContent>{teachers.length ? teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>) : <SelectItem value="temp" disabled>No teachers found</SelectItem>}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Room Number / Lab</label>
                <Input {...register("roomNumber")} placeholder="e.g. Room 301 / Lab 2" className="h-9 text-xs mt-1" />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setSlotOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={isOffline}><Save className="h-3.5 w-3.5" /> {editing ? "Update Slot" : "Create Slot"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
        <DialogContent
          style={{ width: "min(95vw, 940px)", maxWidth: "min(95vw, 940px)", height: "88vh", maxHeight: "88vh" }}
          className="max-w-none sm:max-w-none w-[95vw] h-[88vh] max-h-[88vh] flex flex-col p-0 gap-0 sm:rounded-2xl border bg-background shadow-2xl overflow-hidden"
        >
          <DialogHeader className="px-6 pt-5 pb-3.5 border-b shrink-0 bg-background">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2.5 text-base font-bold pr-6">
                <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><Settings2 className="h-4 w-4" /></span>
                <span>Campus Daily Periods & Timings</span>
                <Badge variant="secondary" className="ml-1 text-xs">{draft.length} slots configured</Badge>
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Define daily lecture periods, start & end timings, recess, and lunch break. All class timetables automatically align to these hours.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Presets & Action Toolbar */}
          <div className="px-6 py-2.5 border-b bg-muted/20 shrink-0 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10" onClick={applyStandardSchoolPreset}>
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Load Standard 8-Period Day (CBSE / School Standard)
            </Button>
            <span className="text-muted-foreground/40 hidden sm:inline">|</span>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setDraft((a) => [...a, { id: `per-${Date.now()}`, uuid: `per-${Date.now()}`, number: a.filter((x) => !x.isBreak).length + 1, label: `Period ${a.filter((x) => !x.isBreak).length + 1}`, startTime: "15:30", endTime: "16:15", type: "LECTURE", isBreak: false, campusId: campusId ?? "" } as any])}>
              <Plus className="h-3.5 w-3.5" /> Add Lecture
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setDraft((a) => [...a, { id: `per-break-${Date.now()}`, uuid: `per-break-${Date.now()}`, number: 0, label: "Short Recess", startTime: "10:00", endTime: "10:15", type: "BREAK", isBreak: true, campusId: campusId ?? "" } as any])}>
              <Coffee className="h-3.5 w-3.5" /> Short Break
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setDraft((a) => [...a, { id: `per-lunch-${Date.now()}`, uuid: `per-lunch-${Date.now()}`, number: 0, label: "Lunch Break", startTime: "12:00", endTime: "12:45", type: "LUNCH", isBreak: true, campusId: campusId ?? "" } as any])}>
              <Utensils className="h-3.5 w-3.5" /> Lunch Break
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => setDraft(periods)}>
              Reset
            </Button>
          </div>

          {/* Period List with Inner Scroll & Rich Card Controls */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-3 bg-muted/15">
            {draft.map((p, idx) => {
              const isLunch = p.type === "LUNCH";
              const isBreak = p.type === "BREAK" || (p.isBreak && !isLunch);
              const duration = formatDuration(p.startTime, p.endTime);
              const timeRange12h = formatTimeRange(p.startTime, p.endTime);

              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-3.5 bg-card shadow-xs transition-all ${
                    isLunch
                      ? "border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10"
                      : isBreak
                      ? "border-sky-300 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/10"
                      : "border-border/70 hover:border-border"
                  }`}
                >
                  {/* Top Row: Badge, Label, Type, Delete */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={isLunch ? "warning" : isBreak ? "info" : "secondary"}
                      className="shrink-0 text-xs px-2.5 py-0.5 font-bold rounded-lg"
                    >
                      {isLunch ? "LUNCH BREAK" : isBreak ? "SHORT RECESS" : `PERIOD ${p.number || idx + 1}`}
                    </Badge>

                    <Input
                      value={p.label}
                      onChange={(e) => setDraft((a) => a.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))}
                      className="h-8 flex-1 min-w-[160px] text-xs font-semibold px-3 bg-background"
                      placeholder="Period Label (e.g. Period 1, Recess, Assembly)"
                    />

                    <div className="w-[130px] shrink-0">
                      <Select
                        value={p.type || "LECTURE"}
                        onValueChange={(v) =>
                          setDraft((a) =>
                            a.map((x, i) => (i === idx ? { ...x, type: v as any, isBreak: v !== "LECTURE" } : x))
                          )
                        }
                      >
                        <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LECTURE">Lecture</SelectItem>
                          <SelectItem value="BREAK">Short Break</SelectItem>
                          <SelectItem value="LUNCH">Lunch Break</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                      onClick={async () => {
                        if (periods.find((x) => x.id === p.id)) {
                          try {
                            await deletePeriodApi(p.id);
                            toast.success("Period deleted");
                            fetchGrid();
                          } catch {
                            toast.error("Delete failed");
                          }
                        }
                        setDraft((a) => a.filter((_, i) => i !== idx));
                      }}
                      title="Remove period"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Middle Row: Time Pickers + 12h Live Preview Badge */}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Start
                      </span>
                      <Input
                        type="time"
                        value={p.startTime.slice(0, 5)}
                        onChange={(e) => setDraft((a) => a.map((x, i) => (i === idx ? { ...x, startTime: e.target.value } : x)))}
                        className="h-8 w-[100px] text-xs font-medium bg-background"
                      />
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Clock className="h-3 w-3" /> End
                      </span>
                      <Input
                        type="time"
                        value={p.endTime.slice(0, 5)}
                        onChange={(e) => setDraft((a) => a.map((x, i) => (i === idx ? { ...x, endTime: e.target.value } : x)))}
                        className="h-8 w-[100px] text-xs font-medium bg-background"
                      />
                    </div>

                    {/* 12-Hour Live Preview & Duration Pill */}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                        <Clock className="h-3 w-3" /> {timeRange12h}
                      </span>
                      {duration && (
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-mono font-medium">
                          ⏱️ {duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Quick Duration Presets for 1-click end-time setting */}
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold mr-1">Quick Duration:</span>
                    {[30, 35, 40, 45, 50, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setPeriodDuration(idx, mins)}
                        className="px-2 py-0.5 rounded-md border text-[11px] bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                        title={`Set period duration to ${mins} minutes`}
                      >
                        +{mins}m
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="px-6 py-3.5 border-t bg-muted/20 shrink-0 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{draft.length} total periods & breaks in schedule</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPeriodOpen(false)}>Cancel</Button>
              <Button size="sm" variant="gradient" onClick={handleSavePeriods} disabled={isOffline} className="gap-1.5">
                <Save className="h-3.5 w-3.5" /> Save Periods & Timings
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent
          style={{ width: "min(96vw, 1560px)", maxWidth: "min(96vw, 1560px)", height: "92vh", maxHeight: "92vh" }}
          className="max-w-none sm:max-w-none w-[96vw] h-[92vh] max-h-[92vh] flex flex-col p-0 gap-0 sm:rounded-2xl border bg-background shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-4 pb-3 border-b shrink-0 bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 ring-1 ring-primary/20">
                  <LayoutGrid className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base font-bold text-foreground">
                      Master Timetable Builder
                    </DialogTitle>
                    <Badge variant="outline" className="font-semibold text-xs border-primary/30 text-primary bg-primary/5">
                      {chosenClass?.name} {chosenSection ? `• Sec ${chosenSection}` : ""}
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Interactive weekly routine designer. Use the quick stamp palette or smart fill to rapidly build your schedule.
                  </DialogDescription>
                </div>
              </div>

              {/* Progress & Readiness Pill */}
              <div className="flex items-center gap-3 bg-muted/30 border border-border/60 px-3.5 py-1.5 rounded-xl">
                <div className="text-right">
                  <div className="text-xs font-semibold text-foreground">
                    {builderStats.filled} / {builderStats.total} Filled
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {builderStats.total > 0 ? Math.round((builderStats.filled / builderStats.total) * 100) : 0}% Complete
                  </div>
                </div>
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${builderStats.total > 0 ? Math.min(100, Math.round((builderStats.filled / builderStats.total) * 100)) : 0}%`,
                    }}
                  />
                </div>
                {builderStats.missingTeacher > 0 ? (
                  <Badge variant="destructive" className="text-[10px] gap-1 px-2 py-0.5">
                    <AlertTriangle className="h-3 w-3" /> {builderStats.missingTeacher} need faculty
                  </Badge>
                ) : builderStats.filled > 0 && builderStats.filled === builderStats.total ? (
                  <Badge className="text-[10px] bg-emerald-600 text-white gap-1 px-2 py-0.5 hover:bg-emerald-600">
                    <Check className="h-3 w-3" /> All Set
                  </Badge>
                ) : null}
              </div>
            </div>
          </DialogHeader>

          {/* Toolbar with Smart Routine Fillers */}
          <div className="px-6 py-2.5 border-b bg-muted/20 shrink-0 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Class:</span>
              <Select value={chosenClassId} onValueChange={(v) => { setChosenClassId(v); const c = classes.find((x) => x.id === v); setChosenSection(c?.sections[0]?.name ?? ""); }}>
                <SelectTrigger className="w-[170px] h-8 text-xs bg-background shadow-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Section:</span>
              <Select value={chosenSection} onValueChange={setChosenSection}>
                <SelectTrigger className="w-[140px] h-8 text-xs bg-background shadow-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sections</SelectItem>
                  {sectionOptions.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Smart Action Buttons */}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                variant="gradient"
                size="sm"
                className="h-8 text-xs gap-1.5 shadow-xs"
                onClick={autoFillBalancedSchedule}
                disabled={isOffline || subjects.length === 0}
                title="Automatically generate a balanced weekly subject routine"
              >
                <Sparkles className="h-3.5 w-3.5" /> Auto-Fill Balanced Routine
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                onClick={autoAssignBuilderTeachers}
                disabled={isOffline || subjects.length === 0}
                title="Fill all empty faculty assignments with the subject's designated teacher"
              >
                <Wand2 className="h-3.5 w-3.5 text-primary" /> Auto-Assign Teachers
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() =>
                  setGridBuilder((a) => {
                    const n: any = {};
                    for (const d of DAYS) {
                      n[d] = {};
                      for (const p of lectures) n[d][p.number] = { subjectId: "", teacherId: "", room: "" };
                    }
                    return n;
                  })
                }
                title="Reset all cells in the timetable"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>

          {/* Interactive Quick Subject Palette Ribbon */}
          <div className="px-6 py-2 bg-card border-b shrink-0 flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 mr-1">
              <Paintbrush className="h-3.5 w-3.5 text-primary" />
              <span>Quick Stamp:</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubjectId(null)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all shrink-0 ${
                activeSubjectId === null
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/70"
              }`}
            >
              Select / Edit Mode
            </button>

            {subjects.map((s, idx) => {
              const theme = getSubjectTheme(s.id, idx);
              const isSelected = activeSubjectId === s.id;
              const assignedCount = Object.values(gridBuilder).flatMap((dayObj) =>
                Object.values(dayObj).filter((cell: any) => cell.subjectId === s.id)
              ).length;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSubjectId(isSelected ? null : s.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all shrink-0 ${
                    isSelected
                      ? `ring-2 ring-primary ${theme.bg} ${theme.border} font-bold shadow-xs`
                      : "bg-background hover:bg-muted/40 text-foreground border-border/70"
                  }`}
                  title={`Click to activate ${s.name} stamp mode. Then click any slot to place.`}
                >
                  <span className={`h-2 w-2 rounded-full ${theme.chip}`} />
                  <span>{s.name}</span>
                  {s.teacherName && (
                    <span className="text-[10px] text-muted-foreground font-normal hidden sm:inline">
                      ({s.teacherName.split(" ")[0]})
                    </span>
                  )}
                  <span className="text-[10px] px-1 rounded-full bg-muted font-mono">
                    {assignedCount}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveSubjectId(activeSubjectId === "ERASER" ? null : "ERASER")}
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all shrink-0 ml-auto ${
                activeSubjectId === "ERASER"
                  ? "bg-destructive text-destructive-foreground border-destructive shadow-xs ring-2 ring-destructive/40"
                  : "bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive border-border/70"
              }`}
              title="Click any period cell to erase it"
            >
              <Eraser className="h-3 w-3" />
              <span>Eraser</span>
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="p-8 flex-1 grid place-items-center">
              <EmptyState title="No subjects found for this class" description="Please configure subjects in Academics before creating the timetable." />
            </div>
          ) : (
            /* Smooth 2-Axis Scrolling Table */
            <div className="flex-1 min-h-0 overflow-auto overscroll-contain relative border-t bg-muted/10 select-none">
              <table className="w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-30 bg-muted/95 backdrop-blur-md shadow-xs">
                  <tr>
                    {/* Top-Left Corner: Anchored on both X and Y */}
                    <th className="sticky top-0 left-0 z-40 bg-muted border-b border-r px-3 py-2 text-left w-[130px] min-w-[130px] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)]">
                      <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Day \ Period</div>
                      <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{lectures.length} Periods/Day</div>
                    </th>

                    {/* Period Column Headers */}
                    {lectures.map((p) => (
                      <th key={p.number} className="border-b border-r last:border-r-0 p-2 text-center min-w-[175px] max-w-[210px] bg-muted/90">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          <span>Period {p.number}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-foreground flex items-center justify-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatTimeRange(p.startTime, p.endTime)}</span>
                        </div>
                        <div className="mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-background text-muted-foreground border border-border/50">
                            ⏱️ {formatDuration(p.startTime, p.endTime)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {DAYS.map((d) => {
                    const dayFilled = lectures.filter((p) => !!gridBuilder[d]?.[p.number]?.subjectId).length;

                    return (
                      <tr key={d} className="border-b last:border-0 hover:bg-muted/5 transition-colors">
                        {/* Sticky Left Day Column */}
                        <td className="sticky left-0 z-20 bg-card/95 backdrop-blur-md border-r border-b p-2.5 align-middle min-w-[130px] w-[130px] shadow-[3px_0_8px_-3px_rgba(0,0,0,0.08)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-foreground">{d}</div>
                              <div className="text-[10px] text-muted-foreground font-medium">{DAY_SHORT[d]}</div>
                            </div>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold ${
                              dayFilled === lectures.length
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : dayFilled > 0
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {dayFilled}/{lectures.length}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] gap-1 px-1.5 flex-1 justify-center border-border/70 hover:border-primary/40"
                              onClick={() => copyDayToWeekdays(d)}
                              title={`Copy ${d}'s routine to all weekdays (Mon-Fri)`}
                            >
                              <Copy className="h-2.5 w-2.5" /> Mon-Fri
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => clearDay(d)}
                              title={`Clear ${d}`}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </td>

                        {/* Interactive Period Cells */}
                        {lectures.map((p) => {
                          const c = gridBuilder[d]?.[p.number] || { subjectId: "", teacherId: "", room: "" };
                          const sub = subjects.find((s) => s.id === c.subjectId);
                          const autoT = subjectTeacherOf(c.subjectId);
                          const isFilled = !!c.subjectId;
                          const isMissingTeacher = isFilled && !c.teacherId;
                          const theme = getSubjectTheme(c.subjectId);

                          return (
                            <td key={p.number} className="border-r border-b last:border-r-0 p-1.5 align-top min-w-[175px] max-w-[210px]">
                              {!isFilled ? (
                                /* Empty Cell Card */
                                <div
                                  onClick={() => {
                                    if (activeSubjectId === "ERASER") return;
                                    if (activeSubjectId) {
                                      const activeSub = subjects.find((s) => s.id === activeSubjectId);
                                      const activeAutoT = subjectTeacherOf(activeSubjectId);
                                      const defaultRoom = chosenClass?.name ? `Room ${chosenClass.name.replace(/\D/g, "") || "101"}` : "Room 101";
                                      setGridBuilder((prev) => ({
                                        ...prev,
                                        [d]: {
                                          ...prev[d],
                                          [p.number]: {
                                            subjectId: activeSubjectId,
                                            teacherId: activeAutoT?.id || activeSub?.teacherId || "",
                                            room: c.room || defaultRoom,
                                          },
                                        },
                                      }));
                                    }
                                  }}
                                  className={`h-[84px] rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                                    activeSubjectId && activeSubjectId !== "ERASER"
                                      ? "hover:border-primary hover:bg-primary/5 cursor-pointer bg-card/40 border-primary/40"
                                      : activeSubjectId === "ERASER"
                                      ? "bg-card/20 cursor-default"
                                      : "bg-card/40 hover:bg-card/70 border-border/60"
                                  }`}
                                >
                                  {activeSubjectId && activeSubjectId !== "ERASER" ? (
                                    <div className="flex flex-col items-center gap-1 text-[11px] text-primary font-semibold">
                                      <Plus className="h-3.5 w-3.5" />
                                      <span className="truncate max-w-[130px]">
                                        {subjects.find((s) => s.id === activeSubjectId)?.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <Select
                                      value=""
                                      onValueChange={(v) => {
                                        const selectedSub = subjects.find((s) => s.id === v);
                                        const selectedAutoT = subjectTeacherOf(v);
                                        const defaultRoom = chosenClass?.name ? `Room ${chosenClass.name.replace(/\D/g, "") || "101"}` : "Room 101";
                                        setGridBuilder((prev) => ({
                                          ...prev,
                                          [d]: {
                                            ...prev[d],
                                            [p.number]: {
                                              subjectId: v,
                                              teacherId: selectedAutoT?.id || selectedSub?.teacherId || "",
                                              room: c.room || defaultRoom,
                                            },
                                          },
                                        }));
                                      }}
                                    >
                                      <SelectTrigger className="h-7 text-[11px] border-0 bg-muted/40 hover:bg-muted font-medium w-auto px-2.5 gap-1 text-muted-foreground rounded-lg">
                                        <Plus className="h-3 w-3" />
                                        <span>Assign</span>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {subjects.map((s) => (
                                          <SelectItem key={s.id} value={s.id}>
                                            {s.name} {s.teacherName ? `• ${s.teacherName}` : ""}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              ) : (
                                /* Filled Subject Card */
                                <div
                                  onClick={() => {
                                    if (activeSubjectId === "ERASER") {
                                      setGridBuilder((prev) => ({
                                        ...prev,
                                        [d]: { ...prev[d], [p.number]: { subjectId: "", teacherId: "", room: "" } },
                                      }));
                                    } else if (activeSubjectId && activeSubjectId !== c.subjectId) {
                                      const newSub = subjects.find((s) => s.id === activeSubjectId);
                                      const newAutoT = subjectTeacherOf(activeSubjectId);
                                      setGridBuilder((prev) => ({
                                        ...prev,
                                        [d]: {
                                          ...prev[d],
                                          [p.number]: {
                                            subjectId: activeSubjectId,
                                            teacherId: newAutoT?.id || newSub?.teacherId || "",
                                            room: c.room || "Room 101",
                                          },
                                        },
                                      }));
                                    }
                                  }}
                                  className={`h-[84px] rounded-xl border-l-[3.5px] border p-2 flex flex-col justify-between shadow-xs transition-all group ${
                                    activeSubjectId === "ERASER"
                                      ? "hover:border-destructive hover:bg-destructive/10 cursor-pointer"
                                      : activeSubjectId && activeSubjectId !== c.subjectId
                                      ? "hover:ring-1 hover:ring-primary cursor-pointer"
                                      : ""
                                  } ${theme.border} ${theme.bg}`}
                                >
                                  {/* Row 1: Subject Name + Quick Clear */}
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-[11px] font-bold truncate ${theme.text}`} title={sub?.name || "Subject"}>
                                      {sub?.name || "Subject"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setGridBuilder((prev) => ({
                                          ...prev,
                                          [d]: { ...prev[d], [p.number]: { subjectId: "", teacherId: "", room: "" } },
                                        }));
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                                      title="Clear slot"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>

                                  {/* Row 2: Teacher dropdown selector */}
                                  <div className="flex items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                    <Select
                                      value={c.teacherId}
                                      onValueChange={(v) => {
                                        setGridBuilder((prev) => ({
                                          ...prev,
                                          [d]: { ...prev[d], [p.number]: { ...prev[d][p.number], teacherId: v } },
                                        }));
                                      }}
                                    >
                                      <SelectTrigger
                                        className={`h-5 text-[10px] px-1.5 py-0 rounded border-0 bg-background/85 hover:bg-background shadow-none font-medium truncate ${
                                          isMissingTeacher
                                            ? "text-rose-600 bg-rose-50 border border-rose-300 ring-1 ring-rose-400"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1 truncate">
                                          <User className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                                          <span className="truncate">
                                            {teachers.find((t) => t.id === c.teacherId)?.fullName || autoT?.name || "Assign Teacher"}
                                          </span>
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {teachers.map((t) => (
                                          <SelectItem key={t.id} value={t.id} className="text-xs">
                                            {t.fullName} {autoT?.id === t.id ? "★ (Designated)" : ""}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Row 3: Room micro-input + period badge */}
                                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60">Rm:</span>
                                      <input
                                        type="text"
                                        value={c.room}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setGridBuilder((prev) => ({
                                            ...prev,
                                            [d]: { ...prev[d], [p.number]: { ...prev[d][p.number], room: val } },
                                          }));
                                        }}
                                        placeholder="101"
                                        className="h-4 w-14 text-[10px] px-1 rounded bg-background/80 border border-border/40 font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                      />
                                    </div>
                                    <span className="text-[9px] font-mono opacity-50">P{p.number}</span>
                                  </div>
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

          {/* Sticky Footer */}
          <DialogFooter className="px-6 py-3.5 border-t bg-card shrink-0 flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">💡 <strong>Quick Tip:</strong> Click a subject in the Quick Stamp bar to rapidly fill slots across days, or click + Assign inside cells.</span>
              <span className="sm:hidden">{builderStats.filled} of {builderStats.total} slots filled</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setBuilderOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" size="sm" onClick={saveBuilder} disabled={isOffline} className="gap-1.5 shadow-sm">
                <Save className="h-3.5 w-3.5" /> Save Full Week ({builderStats.filled} Slots)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
