"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { Users, Award, Building2, CheckCircle2 } from "lucide-react";

export function TeacherMetricsRibbon() {
  const { activeBranchId } = useERP();
  const teachers = mockDb.getTeachers(activeBranchId);

  const activeTeachers = teachers.filter((t) => t.status === "ACTIVE").length;
  const departments = new Set(teachers.map((t) => t.department)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Faculty
          </span>
          <Users className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{teachers.length}</span>
        <span className="text-[11px] text-muted-foreground">Certified instructors</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active on Duty
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{activeTeachers}</span>
        <span className="text-[11px] text-emerald-600 font-medium">98.4% Faculty Attendance</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Departments
          </span>
          <Building2 className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{departments}</span>
        <span className="text-[11px] text-purple-600 font-medium">Academic divisions</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Student-Faculty Ratio
          </span>
          <Award className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">1:16</span>
        <span className="text-[11px] text-muted-foreground">Ideal pedagogical balance</span>
      </Card>
    </div>
  );
}
