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

  const totalAssigned = assignments.reduce((s, a) => s + a.totalAssigned, 0);
  const totalPaid = assignments.reduce((s, a) => s + a.totalPaid, 0);
  const totalPending = assignments.reduce((s, a) => s + a.totalPending, 0);
  const totalOverdue = assignments.reduce((s, a) => s + a.totalOverdue, 0);
  const collectionRate = totalAssigned > 0 ? Math.round((totalPaid / totalAssigned) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Assigned
            </span>
            <Wallet className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {formatCurrency(totalAssigned)}
          </span>
          <span className="text-[11px] text-muted-foreground">Annual academic billing</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Collected MTD
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {formatCurrency(totalPaid)}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">
            {collectionRate}% Realized
          </span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Pending Dues
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {formatCurrency(totalPending)}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Active installment terms</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Overdue Recovery
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {formatCurrency(totalOverdue)}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">SMS reminders active</span>
        </CardContent>
      </Card>
    </div>
  );
}
