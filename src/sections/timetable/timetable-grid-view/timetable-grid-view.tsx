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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  BookOpen,
  MapPin,
  AlertTriangle,
  Clock,
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

export function TimetableGridView() {
  const { activeBranchId } = useERP();
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));
  const [slots] = useState(() => mockDb.getTimetableSlots(activeBranchId));

  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [dayFilter, setDayFilter] = useState<string>("ALL");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"class" | "teacher">("class");

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

  return (
    <div className="space-y-4">
      {/* Conflicts Banner if detected */}
      {conflictIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {conflictIds.size} Schedule Conflicts Detected: Some faculty members are double-booked for the same period.
          </span>
        </div>
      )}

      {/* Filter and Tab Strip */}
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
            <Input
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search faculty instructor..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="class" className="text-xs px-3">
              Class View
            </TabsTrigger>
            <TabsTrigger value="teacher" className="text-xs px-3">
              Faculty View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Grid View */}
      {filteredSlots.length === 0 ? (
        <EmptyState
          title="No Timetable Slots Found"
          description="We couldn't find any scheduled periods matching your filter criteria. Try adjusting your class or day filters."
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-muted/50 border-b border-r border-border/80 px-3 py-2.5 text-left">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Period
                  </span>
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="bg-muted/50 border-b border-r border-border/80 last:border-r-0 px-3 py-2.5 text-center min-w-[130px]"
                  >
                    <span className="text-xs font-bold text-foreground">{day}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {defaultPeriods.map((period) => (
                <tr key={period.number} className="border-b border-border/60 last:border-b-0">
                  <td className="sticky left-0 z-10 bg-card border-r border-border/80 px-3 py-3 align-top min-w-[110px]">
                    <span className="text-xs font-bold text-foreground block">
                      Period {period.number}
                    </span>
                    <span className="text-[10px] text-muted-foreground block flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {period.startTime} - {period.endTime}
                    </span>
                  </td>

                  {DAYS.map((day) => {
                    const daySlots = classViewGrid[day]?.[period.number] || [];
                    return (
                      <td
                        key={day}
                        className="border-r border-border/60 last:border-r-0 p-1.5 align-top min-h-[70px]"
                      >
                        {daySlots.length === 0 ? (
                          <div className="h-full min-h-[50px] rounded-lg border border-dashed border-border/40 flex items-center justify-center text-[10px] text-muted-foreground/60">
                            Free
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {daySlots.map((slot) => {
                              const isConflict = conflictIds.has(slot.id);
                              return (
                                <div
                                  key={slot.id}
                                  className={`p-2 rounded-lg border-l-3 text-xs space-y-1 transition-all shadow-2xs ${getSubjectColor(
                                    slot.subjectId
                                  )} ${
                                    isConflict
                                      ? "ring-2 ring-destructive/80 bg-destructive/10"
                                      : "border-border/60"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-foreground text-xs truncate">
                                      {slot.subjectName}
                                    </span>
                                    {isConflict && (
                                      <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                                    )}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground truncate">
                                    {slot.teacherName}
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                                    <span>{slot.className}</span>
                                    <span className="font-mono">Rm {slot.roomNumber}</span>
                                  </div>
                                </div>
                              );
                            })}
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
    </div>
  );
}
