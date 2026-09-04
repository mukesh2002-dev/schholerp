"use client";

import React, { Suspense } from "react";
import {
  BranchHeader,
  BranchHeaderSkeleton,
  BranchMetricsRibbon,
  BranchMetricsRibbonSkeleton,
  BranchDirectoryView,
  BranchDirectoryViewSkeleton,
} from "@/sections/branches";

export default function BranchesPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header & Primary Actions */}
      <Suspense fallback={<BranchHeaderSkeleton />}>
        <BranchHeader />
      </Suspense>

      {/* 2. Consolidated Metrics Ribbon */}
      <Suspense fallback={<BranchMetricsRibbonSkeleton />}>
        <BranchMetricsRibbon />
      </Suspense>

      {/* 3. Search, Filters, Switcher & Branch Directory (Cards/Table) */}
      <Suspense fallback={<BranchDirectoryViewSkeleton />}>
        <BranchDirectoryView />
      </Suspense>
    </div>
  );
}
