"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { StructureCreateForm } from "@/sections/fees";

export default function NewStructurePage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="New Fee Structure"
        subtitle="Pick class + academic year, add fee heads with amounts, frequency and billing months. Total auto-sums from items."
      >
        <StructureCreateForm />
      </FeesPageShell>
    </SectionGuard>
  );
}