"use client";

import { useParams } from "next/navigation";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { StructureDetail } from "@/sections/fees";

export default function StructureDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Fee Structure"
        subtitle="Items are snapshotted into invoices at generation time. Amount changes are blocked once invoices exist — use Rollover for the next year."
      >
        <StructureDetail uuid={params.id} />
      </FeesPageShell>
    </SectionGuard>
  );
}