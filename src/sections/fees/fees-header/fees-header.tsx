"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export function FeesHeader() {
  const { activeBranchId } = useERP();
  const invoices = mockDb.getInvoices(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Fee Collection &amp; Invoicing Engine
            </h1>
            <Badge variant="outline" className="text-xs">
              {invoices.length} Invoices Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Student fee heads, automated invoice generation, online stripe receipts, and dues recovery.
          </p>
        </div>

        <Button
          variant="gradient"
          className="gap-2 shrink-0"
          onClick={() =>
            toast.info("Generate Invoices", {
              description: "Batch generation wizard for Term 1 tuition billing.",
            })
          }
        >
          <CreditCard className="h-4 w-4" />
          <span>Generate Invoices</span>
        </Button>
      </div>
    </div>
  );
}
