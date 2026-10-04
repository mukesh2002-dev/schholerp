"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { InvoicesList } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Fee Invoices"
        subtitle="Generated invoices with status tracking. Amounts are snapshots — they never change after generation."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <InvoicesList />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}