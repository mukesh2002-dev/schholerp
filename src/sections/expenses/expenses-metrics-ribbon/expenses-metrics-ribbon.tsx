"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { formatCurrency } from "@/lib/utils";
import { Receipt, CheckCircle2, Clock, XCircle } from "lucide-react";

export function ExpensesMetricsRibbon() {
  const { activeBranchId } = useERP();
  const expenses = mockDb.getExpenseEntries(activeBranchId);

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const approvedTotal = expenses
    .filter((e) => e.status === "APPROVED" || e.status === "PAID")
    .reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === "PENDING").length;
  const pendingTotal = expenses
    .filter((e) => e.status === "PENDING")
    .reduce((sum, e) => sum + e.amount, 0);
  const rejectedCount = expenses.filter((e) => e.status === "REJECTED").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Spent
          </span>
          <Receipt className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {formatCurrency(totalAmount)}
        </span>
        <span className="text-[11px] text-muted-foreground">{expenses.length} Total entries</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Approved / Paid
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {formatCurrency(approvedTotal)}
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Processed</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Pending Approval
          </span>
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
          {formatCurrency(pendingTotal)}
        </span>
        <span className="text-[11px] text-amber-600 font-medium">{pendingCount} Entries pending</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Rejected
          </span>
          <XCircle className="h-4 w-4 text-rose-600" />
        </div>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
          {rejectedCount}
        </span>
        <span className="text-[11px] text-rose-600 font-medium">Declined vouchers</span>
      </div>
    </div>
  );
}
