"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { AssignmentsList } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignmentsPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Fee Assignments"
        subtitle="Student ↔ structure links that drive billing. Discontinue stops future invoices; history stays untouched."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <AssignmentsList />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}