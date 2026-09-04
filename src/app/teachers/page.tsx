"use client";

import React, { Suspense } from "react";
import {
  TeacherHeader,
  TeacherHeaderSkeleton,
  TeacherMetricsRibbon,
  TeacherMetricsRibbonSkeleton,
  TeacherDirectoryView,
  TeacherDirectoryViewSkeleton,
} from "@/sections/teachers";

export default function TeachersPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <Suspense fallback={<TeacherHeaderSkeleton />}>
        <TeacherHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<TeacherMetricsRibbonSkeleton />}>
        <TeacherMetricsRibbon />
      </Suspense>

      {/* 3. Search, Filter & Faculty Directory (Cards/Table) */}
      <Suspense fallback={<TeacherDirectoryViewSkeleton />}>
        <TeacherDirectoryView />
      </Suspense>
    </div>
  );
}
