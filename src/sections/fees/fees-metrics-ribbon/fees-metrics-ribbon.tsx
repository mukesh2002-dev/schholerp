"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchFeeCollectionReport } from "@/lib/api/fees";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function FeesMetricsRibbon() {
  const { activeBranchId } = useERP();
  const { data: report } = useCampusData<any>({
    fetcher: (cid) => fetchFeeCollectionReport({ campusId: cid }),
    campusId: activeBranchId,
    fallback: null,
    queryKeyPrefix: "fees-collection-report",
  });

  const totalCollected = Number(report?.totalCollected ?? 0);
  const totalBilled = Number(report?.totalBilled ?? 0);
  const totalPending = Number(report?.totalOutstanding ?? 0);
  const totalInvoices = Number(report?.totalInvoices ?? 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Total Collected
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">{collectionRate}% of total billed</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Outstanding
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {formatCurrency(totalPending)}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Due = Billed − Collected</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block">
              Total Billed
            </span>
            <Wallet className="h-4 w-4 text-sky-500" />
          </div>
          <span className="text-2xl font-bold text-sky-600 mt-1 block">
            {formatCurrency(totalBilled)}
          </span>
          <span className="text-[11px] text-muted-foreground">{totalInvoices} invoices issued</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Collection Rate
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {collectionRate}%
          </span>
          <span className="text-[11px] text-rose-600 font-medium">Live from fee records</span>
        </CardContent>
      </Card>
    </div>
  );
}
