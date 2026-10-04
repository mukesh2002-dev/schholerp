"use client";

import { useParams } from "next/navigation";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { HeadEdit } from "@/sections/fees";

export default function EditHeadPage() {
  const params = useParams<{ id: string }>();
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Edit Fee Head"
        subtitle="Change name, category, color and flags."
      >
        <HeadEdit uuid={params.id} />
      </FeesPageShell>
    </SectionGuard>
  );
}