"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { InvoiceGenerate } from "@/sections/fees";

export default function GenerateInvoicesPage() {
  return (
    <SectionGuard
      featureKey="fees"
    >
      <FeesPageShell
        title="Generate Invoices"
        subtitle="Monthly engine (student or whole class) with duplicate-period guards — or a manual one-off invoice."
      >
        <InvoiceGenerate />
      </FeesPageShell>
    </SectionGuard>
  );
}