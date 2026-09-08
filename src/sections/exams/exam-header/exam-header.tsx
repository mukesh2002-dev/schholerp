"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus } from "lucide-react";

export function ExamHeader({ onNewExam }: { onNewExam?: () => void }) {
  const { activeBranchId } = useERP();
  const exams = mockDb.getExams(activeBranchId);
  const schedules = mockDb.getExamSchedules(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Exams & Results
            </h1>
            <Badge variant="outline" className="text-xs">
              {exams.length} Exams • {schedules.length} Schedules
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Exam setup, datesheet scheduling, bulk marks entry (AB-supported), result processing with tie-aware ranking, printable report cards & analytics.
          </p>
        </div>
        {onNewExam && (
          <Button onClick={onNewExam} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> New Exam
          </Button>
        )}
      </div>
    </div>
  );
}
