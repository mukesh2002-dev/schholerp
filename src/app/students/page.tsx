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

export default function StudentsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Quick Actions */}
      <Suspense fallback={<StudentHeaderSkeleton />}>
        <StudentHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<StudentMetricsRibbonSkeleton />}>
        <StudentMetricsRibbon />
      </Suspense>

      {/* 3. Search, Filters, Cards & Table View */}
      <Suspense fallback={<StudentDirectoryViewSkeleton />}>
        <StudentDirectoryView />
      </Suspense>
    </div>
  );
}
