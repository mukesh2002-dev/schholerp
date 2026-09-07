"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { defaultPeriods } from "@/lib/mock-data/timetable";
import { TimetableSlot, DayOfWeek } from "@/types";
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
import { Search, BookOpen, MapPin, AlertTriangle, Clock, Plus, Edit3, Trash2, Save } from "lucide-react";
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

  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"class" | "teacher">("class");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [prefillDay, setPrefillDay] = useState<DayOfWeek | null>(null);
  const [prefillPeriod, setPrefillPeriod] = useState<number | null>(null);

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
  const watchedDay = watch("day");
  const watchedPeriod = watch("periodNumber");

  const selectedClass = useMemo(() => classes.find((c) => c.id === watchedClassId), [classes, watchedClassId]);
  const sections = selectedClass?.sections ?? [];
  const subjects = selectedClass?.subjects ?? [];

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
      for (const p of defaultPeriods) grid[day][p.number] = [];
    }
    for (const slot of filteredSlots) {
      if (grid[slot.day]?.[slot.periodNumber]) grid[slot.day][slot.periodNumber].push(slot);
    }
    return grid;
  }, [filteredSlots]);

  const refresh = () => setSlots([...mockDb.getTimetableSlots(activeBranchId)]);

  const openCreate = (day?: DayOfWeek, period?: number) => {
    setEditingSlot(null);
    setPrefillDay(day ?? null);
    setPrefillPeriod(period ?? null);
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
    // Conflict check: same class+section+day+period already exists (excluding editing)
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

  // Auto-fill room when section changes
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

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
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
            <Input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder="Search faculty instructor..." className="pl-9 h-9 text-xs" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="class" className="text-xs px-3">Class View</TabsTrigger>
              <TabsTrigger value="teacher" className="text-xs px-3">Faculty View</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => openCreate()} size="sm" variant="gradient" className="gap-1.5 h-8">
            <Plus className="h-3.5 w-3.5" /> Add Slot
          </Button>
        </div>
      </div>

      {filteredSlots.length === 0 ? (
        <div className="space-y-3">
          <EmptyState title="No Timetable Slots Found" description="We couldn't find any scheduled periods matching your filter criteria. Try adjusting your class or day filters or create a new slot." />
          <div className="flex justify-center">
            <Button onClick={() => openCreate()} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Create First Period
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
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
              {defaultPeriods.map((period) => (
                <tr key={period.number} className="border-b border-border/60 last:border-b-0">
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-muted-foreground px-1">
        College reference: Like university timetable — each period maps class-section-subject-teacher-room. Conflict detection same as college ERP (teacher double-booking). Add/Edit mirrors school & college software.
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Edit Timetable Slot" : "Create Timetable Slot"}</DialogTitle>
            <DialogDescription>Assign subject, faculty and room for a specific class/section, day and period — college pattern.</DialogDescription>
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
                <label className="text-xs font-medium block mb-1">Period</label>
                <Select value={watch("periodNumber")} onValueChange={(v) => setValue("periodNumber", v)}>
                  <SelectTrigger className={errors.periodNumber ? "border-rose-500" : ""}><SelectValue /></SelectTrigger>
                  <SelectContent>{defaultPeriods.map((p) => <SelectItem key={p.number} value={String(p.number)}>P{p.number} — {p.startTime}-{p.endTime}</SelectItem>)}</SelectContent>
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
    </div>
  );
}
