"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { DefaultersTab } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function DefaultersPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Defaulters"
        subtitle="Open invoices past due date — worst first. Discontinued students excluded by default. Run the overdue job to refresh statuses."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <DefaultersTab />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}