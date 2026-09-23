"use client";

import React, { Suspense } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { AcademicHeader, AcademicHeaderSkeleton } from "@/sections/academics/academic-header";
import { AcademicMetricsRibbon, AcademicMetricsRibbonSkeleton } from "@/sections/academics/academic-metrics-ribbon";
import { AcademicDirectoryView, AcademicDirectoryViewSkeleton } from "@/sections/academics/academic-directory-view";

export default function AcademicsPage() {
  return (
    <SectionGuard featureKey="academics">
      <div className="space-y-8 animate-in fade-in duration-300">
        <Suspense fallback={<AcademicHeaderSkeleton />}>
          <AcademicHeader />
        </Suspense>
        <Suspense fallback={<AcademicMetricsRibbonSkeleton />}>
          <AcademicMetricsRibbon />
        </Suspense>
        <Suspense fallback={<AcademicDirectoryViewSkeleton />}>
          <AcademicDirectoryView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
