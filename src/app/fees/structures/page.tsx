"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { StructuresList } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function StructuresPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Fee Structures"
        subtitle="One plan per class per academic year. Open a structure for items, safe edits and year rollover — old years never change."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <StructuresList />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}