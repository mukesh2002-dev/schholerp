"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { ParentTransportView } from "@/sections/transport/parent-view";

export default function ParentTransportPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Parent View"
        subtitle="Preview exactly what a parent sees for their child: route, crew, transport fees, invoices and boarding history."
      >
        <ParentTransportView />
      </TransportPageShell>
    </SectionGuard>
  );
}
