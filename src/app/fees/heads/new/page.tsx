"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { HeadForm } from "@/sections/fees";

export default function NewHeadPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Add Fee Head"
        subtitle="Create heads first — structures are built from these."
      >
        <HeadForm />
      </FeesPageShell>
    </SectionGuard>
  );
}