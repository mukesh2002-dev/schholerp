"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { DriversList } from "@/sections/transport/drivers-list";

export default function DriversPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Drivers"
        subtitle="License compliance at a glance — expiry badges warn before renewal dates. Assigned vehicle shown per driver."
      >
        <DriversList />
      </TransportPageShell>
    </SectionGuard>
  );
}