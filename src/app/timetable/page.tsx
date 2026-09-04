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

export default function TimetablePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
  );
}
