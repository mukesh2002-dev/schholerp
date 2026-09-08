"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function FeesMetricsRibbon() {
  const { activeBranchId } = useERP();
  const assignments = mockDb.getFeeAssignments(activeBranchId);
  const payments = mockDb.getPayments(activeBranchId);

  const totalCollected = assignments.reduce((s, a) => s + a.totalPaid, 0);
  const totalPending = assignments.reduce((s, a) => s + a.totalPending, 0);
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysCollection = payments.filter((p) => p.date === todayStr).reduce((s, p) => s + p.amount, 0);
  const defaultersCount = assignments.filter((a) => a.status === "OVERDUE" || (a.totalPending > 0 && a.status !== "PAID")).length;
  const totalAssignedNet = assignments.reduce((s, a) => s + a.totalAssigned - (a.discount ?? 0), 0);
  const collectionRate = totalAssignedNet > 0 ? Math.round((totalCollected / totalAssignedNet) * 100) : 0;

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
          <span className="text-[11px] text-emerald-600 font-medium">{collectionRate}% of net assigned</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Total Pending
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {formatCurrency(totalPending)}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Due = Assigned − Discount − Paid</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider block">
              Today&apos;s Collection
            </span>
            <Wallet className="h-4 w-4 text-sky-500" />
          </div>
          <span className="text-2xl font-bold text-sky-600 mt-1 block">
            {formatCurrency(todaysCollection)}
          </span>
          <span className="text-[11px] text-muted-foreground">{todayStr} • {payments.filter((p) => p.date === todayStr).length} receipts</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Defaulters Count
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {defaultersCount}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">Overdue &gt;15 days • SMS active</span>
        </CardContent>
      </Card>
    </div>
  );
}
