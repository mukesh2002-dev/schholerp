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

export default function HomeworkPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
  );
}
