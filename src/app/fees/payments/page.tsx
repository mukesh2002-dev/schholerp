"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { PaymentsList } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Payments & Receipts"
        subtitle="Every receipt issued. Cancelling a receipt recalculates the invoice's paid amount automatically."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <PaymentsList />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}