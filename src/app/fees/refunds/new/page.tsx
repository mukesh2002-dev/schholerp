"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { RefundNew } from "@/sections/fees";

export default function NewRefundPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="New Refund Request"
        subtitle="Pro-rata auto-calculated; status starts at PENDING until approved."
      >
        <RefundNew />
      </FeesPageShell>
    </SectionGuard>
  );
}