"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { BookOpen, Layers, Users, Building2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function ClassMetricsRibbon() {
  const { activeBranchId } = useERP();
  const classes = mockDb.getClasses(activeBranchId);

  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, c) => acc + c.sections.length, 0);
  const totalStudentsEnrolled = classes.reduce((acc, c) => acc + c.totalStudents, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Grade Levels
          </span>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{totalClassesCount}</span>
        <span className="text-[11px] text-muted-foreground">K through 12</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Sections
          </span>
          <Layers className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{totalSectionsCount}</span>
        <span className="text-[11px] text-purple-600 font-medium">Cohort divisions</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Students Enrolled
          </span>
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {formatNumber(totalStudentsEnrolled)}
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Assigned to cohorts</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Class Teachers
          </span>
          <Building2 className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{totalSectionsCount}</span>
        <span className="text-[11px] text-muted-foreground">100% faculty mapped</span>
      </Card>
    </div>
  );
}
