"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { DriverForm } from "@/sections/transport/driver-form";

export default function NewDriverPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Add Driver"
        subtitle="Employee details + driving license with expiry for compliance tracking."
      >
        <DriverForm />
      </TransportPageShell>
    </SectionGuard>
  );
}