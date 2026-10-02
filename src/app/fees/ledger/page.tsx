"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { LedgerTab } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function LedgerPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Student Ledger"
        subtitle="Fee statement: billed, paid, discount, late fee, balance — with head-wise breakup. balance = billed − paid − discount + lateFee."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <LedgerTab />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}