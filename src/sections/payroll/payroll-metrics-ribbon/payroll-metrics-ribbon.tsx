"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";

export function PayrollMetricsRibbon() {
  const { activeBranchId } = useERP();
  const records = mockDb.getPayrollRecords(activeBranchId);

  const draftCount = records.filter((r) => r.status === "DRAFT").length;
  const processingCount = records.filter((r) => r.status === "PROCESSING").length;
  const paidCount = records.filter((r) => r.status === "PAID").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Total Records
        </span>
        <span className="text-2xl font-bold text-foreground mt-1 block">{records.length}</span>
        <span className="text-[11px] text-muted-foreground">All time</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Draft
        </span>
        <span className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1 block">{draftCount}</span>
        <span className="text-[11px] text-gray-600 font-medium">Pending review</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Processing
        </span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{processingCount}</span>
        <span className="text-[11px] text-blue-600 font-medium">In progress</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Paid
        </span>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{paidCount}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Disbursed</span>
      </div>
    </div>
  );
}
