"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { FinesTab } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinesPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Fines & Waivers"
        subtitle="Add one-off fines to a student and waive them with a reason. Automatic late-payment fines are configured on the Fee Structure."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <FinesTab />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}
