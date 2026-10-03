"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { VehicleForm } from "@/sections/transport/vehicle-form";

export default function NewVehiclePage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Add Vehicle"
        subtitle="Registration, type, capacity + compliance dates. Driver and route are assigned after creation."
      >
        <VehicleForm />
      </TransportPageShell>
    </SectionGuard>
  );
}