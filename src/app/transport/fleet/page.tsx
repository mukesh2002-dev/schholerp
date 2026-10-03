"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { VehiclesList } from "@/sections/transport/fleet-list";

export default function FleetPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Fleet — Vehicles"
        subtitle="Buses, vans and autos with capacity, insurance and fitness-certificate tracking. Expiry badges turn amber ≤30 days, red when expired."
      >
        <VehiclesList />
      </TransportPageShell>
    </SectionGuard>
  );
}