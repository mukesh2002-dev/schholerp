"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { AssignmentNew } from "@/sections/fees";

export default function NewAssignmentPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Assign Fee Structure"
        subtitle="Single student or bulk (promotion flow). Duplicates are skipped/rejected — one plan per student per structure."
      >
        <AssignmentNew />
      </FeesPageShell>
    </SectionGuard>
  );
}