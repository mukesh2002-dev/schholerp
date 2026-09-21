"use client";

import React, { Suspense } from "react";
import {
  StudentHeader,
  StudentHeaderSkeleton,
  StudentMetricsRibbon,
  StudentMetricsRibbonSkeleton,
  StudentDirectoryView,
  StudentDirectoryViewSkeleton,
} from "@/sections/students";
import { SectionGuard } from "@/components/layout/section-guard";

export default function StudentsPage() {
  return (
    <SectionGuard featureKey="students">
      <div className="space-y-8 animate-in fade-in duration-300">
        <Suspense fallback={<StudentHeaderSkeleton />}>
          <StudentHeader />
        </Suspense>
        <Suspense fallback={<StudentMetricsRibbonSkeleton />}>
          <StudentMetricsRibbon />
        </Suspense>
        <Suspense fallback={<StudentDirectoryViewSkeleton />}>
          <StudentDirectoryView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
