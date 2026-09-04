"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";

export function ExpensesHeader() {
  const { activeBranchId } = useERP();
  const expenses = mockDb.getExpenseEntries(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Expenses & Ledger
            </h1>
            <Badge variant="outline" className="text-xs">
              {expenses.length} Entries
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track operational expenditures, category budgets, and approval workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
