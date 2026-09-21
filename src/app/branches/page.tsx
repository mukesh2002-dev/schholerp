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
import { SectionGuard } from "@/components/layout/section-guard";

export default function BranchesPage() {
  return (
    <SectionGuard>
      <div className="space-y-8 animate-in fade-in duration-300">
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
    </SectionGuard>
  );
}
