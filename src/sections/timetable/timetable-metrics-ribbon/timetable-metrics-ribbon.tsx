"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { Calendar, Users, BookOpen, MapPin } from "lucide-react";

export function TimetableMetricsRibbon() {
  const { activeBranchId } = useERP();
  const slots = mockDb.getTimetableSlots(activeBranchId);

  const uniqueSubjects = new Set(slots.map((s) => s.subjectId)).size;
  const uniqueTeachers = new Set(slots.map((s) => s.teacherId)).size;
  const uniqueRooms = new Set(slots.map((s) => s.roomNumber)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Scheduled Periods
          </span>
          <Calendar className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{slots.length}</span>
        <span className="text-[11px] text-muted-foreground">Across weekly cycle</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Subjects Mapped
          </span>
          <BookOpen className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{uniqueSubjects}</span>
        <span className="text-[11px] text-purple-600 font-medium">Curriculum streams</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Faculty Assigned
          </span>
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{uniqueTeachers}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Active instructors</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Classrooms &amp; Labs
          </span>
          <MapPin className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{uniqueRooms}</span>
        <span className="text-[11px] text-muted-foreground">Allocated rooms</span>
      </Card>
    </div>
  );
}
