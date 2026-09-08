"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { UserPlus, Clock, Sparkles, CheckCircle2 } from "lucide-react";

export function AdmissionsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const admissions = mockDb.getAdmissions(activeBranchId);

  const totalCount = admissions.length;
  const newCount = admissions.filter((a) => a.status === "NEW").length;
  const reviewCount = admissions.filter((a) => a.status === "UNDER_REVIEW").length;
  const interviewCount = admissions.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
  const approvedCount = admissions.filter((a) => a.status === "APPROVED").length;
  const collegeLeads = admissions.filter((a) => !!(a as any).programApplied).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            New Leads
          </span>
          <UserPlus className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{newCount}</span>
        <span className="text-[11px] text-muted-foreground">Pending triage • {collegeLeads} College</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            In Assessment
          </span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{reviewCount}</span>
        <span className="text-[11px] text-amber-600 font-medium">CET/JEE/CAT doc verify</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Interviews / GD-PI
          </span>
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{interviewCount}</span>
        <span className="text-[11px] text-purple-600 font-medium">School + College PI</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Admitted
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{approvedCount}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Ready for class / sem enroll</span>
      </Card>
    </div>
  );
}
