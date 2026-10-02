"use client";

import { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesPageShell } from "@/components/layout/fees-subnav";
import { StudentsTab } from "@/sections/fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeesStudentsPage() {
  return (
    <SectionGuard featureKey="fees">
      <FeesPageShell
        title="Student Fees"
        subtitle="Every student with assigned/paid/due from their fee plan. Open a student for the full statement."
      >
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <StudentsTab />
        </Suspense>
      </FeesPageShell>
    </SectionGuard>
  );
}