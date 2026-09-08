"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, Trophy, Award, BookOpen, ClipboardCheck, TrendingUp } from "lucide-react";

export function ExamMetricsRibbon() {
  const { activeBranchId } = useERP();
  const exams = mockDb.getExams(activeBranchId);
  const schedules = mockDb.getExamSchedules(activeBranchId);
  const results = mockDb.getResults(activeBranchId);
  const markEntries = mockDb.getMarkEntries();

  const passingRate = Math.round((results.filter((r) => r.status === "PASS").length / (results.length || 1)) * 100);
  const avgPercentage = Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / (results.length || 1));
  const pendingMarks = markEntries.filter((m) => m.workflowStatus === "DRAFT" || m.workflowStatus === "SUBMITTED").length;
  const publishedCount = results.filter((r) => r.isPublished).length;

  const cards = [
    { label: "Exams", value: exams.length, sub: `${exams.filter((e) => e.status === "DRAFT").length} draft`, icon: FileSpreadsheet, color: "text-blue-600" },
    { label: "Schedules", value: schedules.length, sub: `${schedules.filter((s) => s.status === "COMPLETED").length} completed`, icon: BookOpen, color: "text-indigo-600" },
    { label: "Published", value: publishedCount, sub: `${results.length} results`, icon: ClipboardCheck, color: "text-emerald-600" },
    { label: "Pass Rate", value: `${passingRate}%`, sub: `${avgPercentage}% avg`, icon: Trophy, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="p-4 border-border/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</span>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">{c.value}</span>
          <span className="text-[11px] text-muted-foreground">{c.sub}</span>
          {c.label === "Published" && pendingMarks > 0 && (
            <span className="text-[11px] text-amber-600 font-medium block mt-1">{pendingMarks} marks pending verification</span>
          )}
        </Card>
      ))}
    </div>
  );
}
