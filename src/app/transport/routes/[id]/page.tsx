"use client";

import { useParams } from "next/navigation";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { RouteDetail } from "@/sections/transport/route-detail";

export default function RouteDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <SectionGuard>
      <TransportPageShell
        title="Route Detail"
        subtitle="Stops in pickup order with zone mapping, reorder, edit and guarded delete."
      >
        <RouteDetail uuid={params.id} />
      </TransportPageShell>
    </SectionGuard>
  );
}