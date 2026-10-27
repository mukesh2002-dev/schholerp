"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { TransportCrew } from "@/sections/transport/transport-crew";

export default function TransportCrewPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Transport Crew"
        subtitle="Drivers, conductors, attendants aur ayahs — vehicle/route assignment ke saath."
      >
        <TransportCrew />
      </TransportPageShell>
    </SectionGuard>
  );
}
