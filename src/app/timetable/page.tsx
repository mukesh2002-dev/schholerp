"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { defaultPeriods } from "@/lib/mock-data/timetable";
import { TimetableSlot, DayOfWeek } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Search,
  Users,
  BookOpen,
  MapPin,
  AlertTriangle,
  Clock,
  Filter,
} from "lucide-react";

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
    if (!byTeacher.has(slot.teacherId)) {
      byTeacher.set(slot.teacherId, new Map());
    }
    const dayMap = byTeacher.get(slot.teacherId)!;
    if (!dayMap.has(slot.day)) {
      dayMap.set(slot.day, []);
    }
    dayMap.get(slot.day)!.push(slot);
  }

  for (const dayMap of byTeacher.values()) {
    for (const daySlots of dayMap.values()) {
      if (daySlots.length > 1) {
        const periodSet = new Set<number>();
        for (const slot of daySlots) {
          if (periodSet.has(slot.periodNumber)) {
            conflictIds.add(slot.id);
          } else {
            periodSet.add(slot.periodNumber);
          }
        }
      }
    }
  }

  return conflictIds;
}

export default function TimetablePage() {
  const { activeBranchId } = useERP();
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));
  const [slots, setSlots] = useState(() => mockDb.getTimetableSlots(activeBranchId));

  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"class" | "teacher">("class");

  const refreshSlots = () => {
    setSlots(mockDb.getTimetableSlots(activeBranchId));
  };

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      const matchesClass = classFilter === "ALL" || s.classId === classFilter;
      const matchesDay = dayFilter === "ALL" || s.day === dayFilter;
      const matchesTeacher =
        !teacherSearch ||
        s.teacherName.toLowerCase().includes(teacherSearch.toLowerCase());
      return matchesClass && matchesDay && matchesTeacher;
    });
  }, [slots, classFilter, dayFilter, teacherSearch]);

  const conflictIds = useMemo(() => findConflicts(filteredSlots), [filteredSlots]);

  const stats = useMemo(() => {
    const uniqueSubjects = new Set(filteredSlots.map((s) => s.subjectId));
    const uniqueTeachers = new Set(filteredSlots.map((s) => s.teacherId));
    const uniqueRooms = new Set(filteredSlots.map((s) => s.roomNumber));
    return {
      totalSlots: filteredSlots.length,
      subjects: uniqueSubjects.size,
      teachers: uniqueTeachers.size,
      rooms: uniqueRooms.size,
    };
  }, [filteredSlots]);

  const classViewGrid = useMemo(() => {
    const grid: Record<string, Record<number, TimetableSlot[]>> = {};
    for (const day of DAYS) {
      grid[day] = {};
      for (const p of defaultPeriods) {
        grid[day][p.number] = [];
      }
    }
    for (const slot of filteredSlots) {
      if (grid[slot.day]?.[slot.periodNumber]) {
        grid[slot.day][slot.periodNumber].push(slot);
      }
    }
    return grid;
  }, [filteredSlots]);

  const teacherViewGrid = useMemo(() => {
    const grid: Record<string, Record<number, TimetableSlot[]>> = {};
    for (const day of DAYS) {
      grid[day] = {};
      for (const p of defaultPeriods) {
        grid[day][p.number] = [];
      }
    }
    for (const slot of filteredSlots) {
      if (grid[slot.day]?.[slot.periodNumber]) {
        grid[slot.day][slot.periodNumber].push(slot);
      }
    }
    return grid;
  }, [filteredSlots]);

  const hasSlots = filteredSlots.length > 0;

  const renderClassViewGrid = () => (
    <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-muted/50 border-b border-r border-border/80 px-3 py-2.5 text-left">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Period</span>
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="bg-muted/50 border-b border-r border-border/80 last:border-r-0 px-3 py-2.5 text-center min-w-[130px]"
              >
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {DAY_LABELS[day]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {defaultPeriods.map((period) => (
            <tr key={period.id}>
              <td className="sticky left-0 z-10 bg-card border-r border-b border-border/80 px-3 py-3 align-top">
                <div className="text-xs font-bold text-foreground">P{period.number}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{period.startTime}</div>
                <div className="text-[10px] text-muted-foreground">{period.endTime}</div>
              </td>
              {DAYS.map((day) => {
                const cellSlots = classViewGrid[day]?.[period.number] || [];
                return (
                  <td
                    key={`${day}-${period.number}`}
                    className="border-b border-r border-border/80 last:border-r-0 p-1.5 align-top min-h-[72px]"
                  >
                    {cellSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-lg border-l-[3px] px-2 py-1.5 mb-1 last:mb-0 ${getSubjectColor(slot.subjectId)}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-foreground leading-tight truncate">
                            {slot.subjectName}
                          </span>
                          {conflictIds.has(slot.id) && (
                            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block leading-tight truncate">
                          {slot.teacherName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono block leading-tight">
                          {slot.roomNumber}
                        </span>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTeacherViewGrid = () => (
    <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-muted/50 border-b border-r border-border/80 px-3 py-2.5 text-left">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Period</span>
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="bg-muted/50 border-b border-r border-border/80 last:border-r-0 px-3 py-2.5 text-center min-w-[130px]"
              >
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {DAY_LABELS[day]}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {defaultPeriods.map((period) => (
            <tr key={period.id}>
              <td className="sticky left-0 z-10 bg-card border-r border-b border-border/80 px-3 py-3 align-top">
                <div className="text-xs font-bold text-foreground">P{period.number}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{period.startTime}</div>
                <div className="text-[10px] text-muted-foreground">{period.endTime}</div>
              </td>
              {DAYS.map((day) => {
                const cellSlots = teacherViewGrid[day]?.[period.number] || [];
                return (
                  <td
                    key={`${day}-${period.number}`}
                    className="border-b border-r border-border/80 last:border-r-0 p-1.5 align-top min-h-[72px]"
                  >
                    {cellSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`rounded-lg border-l-[3px] px-2 py-1.5 mb-1 last:mb-0 ${getSubjectColor(slot.subjectId)}`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-foreground leading-tight truncate">
                            {slot.className} - {slot.sectionName}
                          </span>
                          {conflictIds.has(slot.id) && (
                            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block leading-tight truncate">
                          {slot.subjectName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono block leading-tight">
                          {slot.roomNumber}
                        </span>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Weekly Timetable
            </h1>
            <Badge variant="outline" className="text-xs">
              {stats.totalSlots} Slots
            </Badge>
            {conflictIds.size > 0 && (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" />
                {conflictIds.size} Conflict{conflictIds.size > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View and manage weekly class schedules across all periods and subjects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Total Slots"
          value={stats.totalSlots}
          icon={<Calendar className="h-5 w-5" />}
          iconColor="bg-primary/10 text-primary"
          className="shadow-xs"
        />
        <StatCard
          title="Subjects"
          value={stats.subjects}
          icon={<BookOpen className="h-5 w-5" />}
          iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          className="shadow-xs"
        />
        <StatCard
          title="Teachers"
          value={stats.teachers}
          icon={<Users className="h-5 w-5" />}
          iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          className="shadow-xs"
        />
        <StatCard
          title="Rooms"
          value={stats.rooms}
          icon={<MapPin className="h-5 w-5" />}
          iconColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          className="shadow-xs"
        />
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="All Classes" />
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
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Days</SelectItem>
              {DAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search teacher..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          {conflictIds.size > 0 && (
            <Badge variant="warning" className="text-[10px] gap-1">
              <AlertTriangle className="h-3 w-3" />
              {conflictIds.size} Overlap{conflictIds.size > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono">{defaultPeriods[0].startTime} - {defaultPeriods[defaultPeriods.length - 1].endTime}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "class" | "teacher")}>
        <TabsList className="h-9">
          <TabsTrigger value="class" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Class View
          </TabsTrigger>
          <TabsTrigger value="teacher" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Teacher View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class">
          {!hasSlots ? (
            <EmptyState
              title="No Schedule Data"
              description="No timetable slots found for the selected filters. Try adjusting your class or day selection."
              icon={<Calendar className="h-7 w-7" />}
            />
          ) : (
            renderClassViewGrid()
          )}
        </TabsContent>

        <TabsContent value="teacher">
          {!hasSlots ? (
            <EmptyState
              title="No Schedule Data"
              description="No timetable slots found for the selected filters. Try adjusting your teacher search or day selection."
              icon={<Users className="h-7 w-7" />}
            />
          ) : (
            renderTeacherViewGrid()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
