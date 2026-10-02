"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { MarkSimple } from "@/sections/attendance";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarkAttendancePage() {
  return (
    <SectionGuard featureKey="attendance">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <MarkSimple />
      </Suspense>
    </SectionGuard>
  );
}
