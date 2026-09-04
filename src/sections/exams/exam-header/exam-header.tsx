"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

export function ExamHeader() {
  const { activeBranchId } = useERP();
  const examSchedules = mockDb.getExamSchedules(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Examinations, Schedules &amp; Results
            </h1>
            <Badge variant="outline" className="text-xs">
              {examSchedules.length} Assessment Series
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Standardized examination series, timetable schedules, grading rubrics, and published student scorecards.
          </p>
        </div>
      </div>
    </div>
  );
}
