"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { formatCurrency } from "@/lib/utils";
import { Users, CheckCircle2, DollarSign, Award } from "lucide-react";

export function ParentsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const students = mockDb.getStudents(activeBranchId) || [];
  const invoices = mockDb.getInvoices() || [];

  const totalPendingFees = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + (i.balanceAmount || 0), 0);

  const avgAttendance = students.length
    ? Math.round(
        students.reduce((sum, s) => sum + (s.attendanceSummary?.attendanceRate || 95), 0) /
          students.length
      )
    : 96;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Enrolled Wards
          </span>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {students.length}
        </span>
        <span className="text-[11px] text-muted-foreground">Connected student profiles</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Avg Attendance
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {avgAttendance}%
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Biometric tracked</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Total Fees Due
          </span>
          <DollarSign className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
          {formatCurrency(totalPendingFees)}
        </span>
        <span className="text-[11px] text-amber-600 font-medium">Outstanding invoices</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
            Academic Status
          </span>
          <Award className="h-4 w-4 text-purple-600" />
        </div>
        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">
          Active
        </span>
        <span className="text-[11px] text-purple-600 font-medium">Term 2026 In-Session</span>
      </div>
    </div>
  );
}
