"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { ClipboardList, BookOpen, Clock, FileText } from "lucide-react";

export function HomeworkMetricsRibbon() {
  const { activeBranchId } = useERP();
  const homeworkList = mockDb.getHomeworkList(activeBranchId) || [];

  const activeCount = homeworkList.filter((h) => h.status === "ACTIVE").length;
  const totalSubmissions = homeworkList.reduce(
    (acc, h) => acc + mockDb.getHomeworkSubmissions(h.id).length,
    0
  );
  const gradedSubmissions = homeworkList.reduce(
    (acc, h) =>
      acc + mockDb.getHomeworkSubmissions(h.id).filter((s) => s.status === "GRADED").length,
    0
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Tasks
          </span>
          <ClipboardList className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{homeworkList.length}</span>
        <span className="text-[11px] text-muted-foreground">Assigned across terms</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Due
          </span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{activeCount}</span>
        <span className="text-[11px] text-amber-600 font-medium">Pending submission</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Submissions
          </span>
          <BookOpen className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{totalSubmissions}</span>
        <span className="text-[11px] text-purple-600 font-medium">Received from students</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Graded &amp; Reviewed
          </span>
          <FileText className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{gradedSubmissions}</span>
        <span className="text-[11px] text-emerald-600 font-medium">With faculty feedback</span>
      </Card>
    </div>
  );
}
