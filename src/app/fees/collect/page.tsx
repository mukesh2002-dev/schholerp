"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { CollectTab } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Collect Fees"
        subtitle="Counter flow: search student → see dues → collect with mode/discount → printable receipt. Overpayment goes to advance."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <CollectTab />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}