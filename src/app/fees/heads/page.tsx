"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { HeadsList } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeadsPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Fee Heads"
        subtitle="Master list — the building blocks of every fee structure."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <HeadsList />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}