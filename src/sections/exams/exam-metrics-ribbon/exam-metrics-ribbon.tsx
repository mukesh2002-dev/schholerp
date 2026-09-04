"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Trophy, Award, BookOpen } from "lucide-react";

export function ExamMetricsRibbon() {
  const { activeBranchId } = useERP();
  const examSchedules = mockDb.getExamSchedules(activeBranchId);
  const results = mockDb.getResults(activeBranchId);

  const passingRate = Math.round(
    (results.filter((r) => r.status === "PASS").length / (results.length || 1)) * 100
  );
  const avgPercentage = Math.round(
    results.reduce((acc, r) => acc + r.percentage, 0) / (results.length || 1)
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Assessment Series
          </span>
          <FileSpreadsheet className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{examSchedules.length}</span>
        <span className="text-[11px] text-muted-foreground">Active exam cycles</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Published Results
          </span>
          <BookOpen className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{results.length}</span>
        <span className="text-[11px] text-purple-600 font-medium">Student scorecards</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Overall Pass Rate
          </span>
          <Trophy className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{passingRate}%</span>
        <span className="text-[11px] text-emerald-600 font-medium">Academic benchmark</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Grade Average
          </span>
          <Award className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{avgPercentage}%</span>
        <span className="text-[11px] text-muted-foreground">Grade A- equivalent</span>
      </Card>
    </div>
  );
}
