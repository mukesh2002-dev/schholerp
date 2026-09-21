"use client";

import React, { Suspense } from "react";
import {
  HomeworkHeader,
  HomeworkHeaderSkeleton,
  HomeworkMetricsRibbon,
  HomeworkMetricsRibbonSkeleton,
  HomeworkDirectoryView,
  HomeworkDirectoryViewSkeleton,
} from "@/sections/homework";
import { SectionGuard } from "@/components/layout/section-guard";

export default function HomeworkPage() {
  return (
    <SectionGuard>
      <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Quick Actions */}
      <Suspense fallback={<HomeworkHeaderSkeleton />}>
        <HomeworkHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<HomeworkMetricsRibbonSkeleton />}>
        <HomeworkMetricsRibbon />
      </Suspense>

      {/* 3. Filterable Homework Tasks & Submission View */}
      <Suspense fallback={<HomeworkDirectoryViewSkeleton />}>
        <HomeworkDirectoryView />
      </Suspense>
      </div>
    </SectionGuard>
  );
}
