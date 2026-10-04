"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { RefundsList } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function RefundsPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Refunds"
        subtitle="Withdrawal / overpayment / error refunds. Approve (admin) then Mark Paid — admission fees are excluded from pro-rata automatically."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <RefundsList />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}