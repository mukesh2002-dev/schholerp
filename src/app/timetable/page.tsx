"use client";

import React, { Suspense } from "react";
import {
  TimetableHeader,
  TimetableHeaderSkeleton,
  TimetableMetricsRibbon,
  TimetableMetricsRibbonSkeleton,
  TimetableGridView,
  TimetableGridViewSkeleton,
} from "@/sections/timetable";
import { SectionGuard } from "@/components/layout/section-guard";

export default function TimetablePage() {
  return (
    <SectionGuard featureKey="academics">
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* 1. Header & Actions */}
        <Suspense fallback={<TimetableHeaderSkeleton />}>
          <TimetableHeader />
        </Suspense>

        {/* 2. Key Metrics Ribbon */}
        <Suspense fallback={<TimetableMetricsRibbonSkeleton />}>
          <TimetableMetricsRibbon />
        </Suspense>

        {/* 3. Interactive Class & Faculty Timetable Matrix */}
        <Suspense fallback={<TimetableGridViewSkeleton />}>
          <TimetableGridView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
