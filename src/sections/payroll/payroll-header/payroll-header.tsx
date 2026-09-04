"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";

export function PayrollHeader() {
  const { activeBranchId } = useERP();
  const records = mockDb.getPayrollRecords(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Payroll Management
            </h1>
            <Badge variant="outline" className="text-xs">
              {records.length} Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage salary structures, process monthly payroll, and view payment history.
          </p>
        </div>

        <Button
          variant="gradient"
          className="gap-2 shrink-0"
          onClick={() =>
            toast.info("Generate Payroll — demo placeholder", {
              description: "Automated payroll generation for August 2026 is coming soon.",
            })
          }
        >
          <DollarSign className="h-4 w-4" />
          <span>Generate Payroll</span>
        </Button>
      </div>
    </div>
  );
}
