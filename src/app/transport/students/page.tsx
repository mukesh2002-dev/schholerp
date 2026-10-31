"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { TransportStudents } from "@/sections/transport/transport-students";

export default function TransportStudentsPage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Transport Students"
        subtitle="All students on transport, route/stop mapping, billing plan aur new assignment add karo."
      >
        <TransportStudents />
      </TransportPageShell>
    </SectionGuard>
  );
}
