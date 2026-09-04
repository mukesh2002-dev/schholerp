"use client";

import React, { Suspense } from "react";
import {
  HrHeader,
  HrHeaderSkeleton,
  HrMetricsRibbon,
  HrMetricsRibbonSkeleton,
  HrDirectoryView,
  HrDirectoryViewSkeleton,
} from "@/sections/hr";

export default function HRPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Quick Actions */}
      <Suspense fallback={<HrHeaderSkeleton />}>
        <HrHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<HrMetricsRibbonSkeleton />}>
        <HrMetricsRibbon />
      </Suspense>

      {/* 3. Staff Directory & Leave Request Tabs */}
      <Suspense fallback={<HrDirectoryViewSkeleton />}>
        <HrDirectoryView />
      </Suspense>
    </div>
  );
}
