"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { FileText, ShieldCheck, Shield, AlertTriangle } from "lucide-react";

export function DocumentsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const documents = mockDb.getDocuments(activeBranchId);

  const verifiedCount = documents.filter((d) => d.verificationStatus === "VERIFIED").length;
  const pendingCount = documents.filter((d) => d.verificationStatus === "PENDING").length;
  const expiredOrRejectedCount = documents.filter(
    (d) => d.verificationStatus === "EXPIRED" || d.verificationStatus === "REJECTED"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Files
          </span>
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{documents.length}</span>
        <span className="text-[11px] text-muted-foreground">Archived records</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Verified
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {verifiedCount}
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Compliance approved</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Pending Audit
          </span>
          <Shield className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
          {pendingCount}
        </span>
        <span className="text-[11px] text-amber-600 font-medium">Awaiting review</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Action Required
          </span>
          <AlertTriangle className="h-4 w-4 text-rose-600" />
        </div>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
          {expiredOrRejectedCount}
        </span>
        <span className="text-[11px] text-rose-600 font-medium">Rejected or expired</span>
      </div>
    </div>
  );
}
