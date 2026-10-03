"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { RoutesList } from "@/sections/transport/routes-list";

export default function RoutesPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Routes & Stops"
        subtitle="Every route with its ordered stops, timings and assigned bus/driver."
      >
        <RoutesList />
      </TransportPageShell>
    </SectionGuard>
  );
}