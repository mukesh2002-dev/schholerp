"use client";

import React, { Suspense } from "react";
import {
  AttendanceHeader,
  AttendanceHeaderSkeleton,
  AttendanceMetricsRibbon,
  AttendanceMetricsRibbonSkeleton,
  AttendanceDirectoryView,
  AttendanceDirectoryViewSkeleton,
} from "@/sections/attendance";

export default function AttendancePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Live Sync Actions */}
      <Suspense fallback={<AttendanceHeaderSkeleton />}>
        <AttendanceHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<AttendanceMetricsRibbonSkeleton />}>
        <AttendanceMetricsRibbon />
      </Suspense>

      {/* 3. Daily Roll-Call, Day Summary & Individual Compliance Tabs */}
      <Suspense fallback={<AttendanceDirectoryViewSkeleton />}>
        <AttendanceDirectoryView />
      </Suspense>
    </div>
  );
}
