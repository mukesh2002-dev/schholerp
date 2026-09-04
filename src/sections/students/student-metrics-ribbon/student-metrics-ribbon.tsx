"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { GraduationCap, Users, CheckCircle2, DollarSign } from "lucide-react";

export function StudentMetricsRibbon() {
  const { activeBranchId } = useERP();
  const students = mockDb.getStudents(activeBranchId);

  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;
  const avgAttendance = Math.round(
    students.reduce((acc, s) => acc + (s.attendanceSummary?.attendanceRate || 0), 0) / (students.length || 1)
  );
  const paidFeesCount = students.filter((s) => s.feeSummary?.status === "PAID").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Students
          </span>
          <GraduationCap className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{students.length}</span>
        <span className="text-[11px] text-muted-foreground">Across all grades</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Roster
          </span>
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{activeStudents}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Regular attendance</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Avg Attendance
          </span>
          <CheckCircle2 className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{avgAttendance}%</span>
        <span className="text-[11px] text-purple-600 font-medium">Synced via RFID</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Fees Cleared
          </span>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{paidFeesCount}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Term 1 settled</span>
      </Card>
    </div>
  );
}
