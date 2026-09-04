"use client";

import React, { Suspense } from "react";
import {
  ClassHeader,
  ClassHeaderSkeleton,
  ClassMetricsRibbon,
  ClassMetricsRibbonSkeleton,
  ClassDirectoryView,
  ClassDirectoryViewSkeleton,
} from "@/sections/classes";

export default function ClassesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Class Header & Add Class Dialog */}
      <Suspense fallback={<ClassHeaderSkeleton />}>
        <ClassHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<ClassMetricsRibbonSkeleton />}>
        <ClassMetricsRibbon />
      </Suspense>

      {/* 3. Filterable Academic Class & Section Directory Grid */}
      <Suspense fallback={<ClassDirectoryViewSkeleton />}>
        <ClassDirectoryView />
      </Suspense>
    </div>
  );
}
