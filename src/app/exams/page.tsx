"use client";

import React, { Suspense } from "react";
import {
  ExamHeader,
  ExamHeaderSkeleton,
  ExamMetricsRibbon,
  ExamMetricsRibbonSkeleton,
  ExamScheduleView,
  ExamScheduleViewSkeleton,
} from "@/sections/exams";

export default function ExamsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <Suspense fallback={<ExamHeaderSkeleton />}>
        <ExamHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<ExamMetricsRibbonSkeleton />}>
        <ExamMetricsRibbon />
      </Suspense>

      {/* 3. Schedules, Published Results & Rubric Tabs */}
      <Suspense fallback={<ExamScheduleViewSkeleton />}>
        <ExamScheduleView />
      </Suspense>
    </div>
  );
}
