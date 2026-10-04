"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { RouteForm } from "@/sections/transport/route-form";

export default function NewRoutePage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Add Route"
        subtitle="Route meta + ordered stop builder. Stops are numbered automatically and later map to fee zones."
      >
        <RouteForm />
      </TransportPageShell>
    </SectionGuard>
  );
}