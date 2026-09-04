"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function LibraryMetricsRibbon() {
  const { activeBranchId } = useERP();
  const books = mockDb.getLibraryBooks(activeBranchId);
  const issues = mockDb.getBookIssues(activeBranchId);
  const fines = mockDb.getLibraryFines(activeBranchId);

  const totalCopies = books.reduce((s, b) => s + b.totalCopies, 0);
  const available = books.reduce((s, b) => s + b.availableCopies, 0);
  const overdue = issues.filter((i) => i.status === "OVERDUE").length;
  const pendingFines = fines
    .filter((f) => f.status === "PENDING")
    .reduce((s, f) => s + (f.amount - f.paidAmount), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Catalog Titles
            </span>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">{books.length}</span>
          <span className="text-[11px] text-muted-foreground">{totalCopies} total copies</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Available Copies
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{available}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Ready to issue</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Issued / Overdue
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {issues.filter((i) => i.status === "ISSUED").length} / {overdue}
          </span>
          <span className="text-[11px] text-amber-600 font-medium">Active borrower loans</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Pending Fines
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {formatCurrency(pendingFines)}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">
            {fines.filter((f) => f.status === "PENDING").length} fines pending
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
