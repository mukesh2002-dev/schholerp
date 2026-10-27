"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { AttendanceManifestView } from "@/sections/transport/attendance-manifest";

export default function AttendancePage() {
  return (
    <SectionGuard>
      <TransportPageShell
        title="Trip Attendance"
        subtitle="Mark BOARDED / NOT_BOARDED / NOT_MARKED per student, grouped by stop. Corrections are audited."
      >
        <Suspense fallback={<div className="text-xs text-muted-foreground p-6">Loading attendance…</div>}>
          <AttendanceManifestView />
        </Suspense>
      </TransportPageShell>
    </SectionGuard>
  );
}
