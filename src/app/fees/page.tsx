"use client";

import React, { Suspense } from "react";
import {
  FeesHeader,
  FeesHeaderSkeleton,
  FeesMetricsRibbon,
  FeesMetricsRibbonSkeleton,
  FeesDirectoryView,
  FeesDirectoryViewSkeleton,
} from "@/sections/fees";
import { SectionGuard } from "@/components/layout/section-guard";

export default function FeesPage() {
  return (
    <SectionGuard featureKey="fees">
      <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <Suspense fallback={<FeesHeaderSkeleton />}>
        <FeesHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<FeesMetricsRibbonSkeleton />}>
        <FeesMetricsRibbon />
      </Suspense>

      {/* 3. Invoices, Dues Defaulters & Ledger Tabs */}
      <Suspense fallback={<FeesDirectoryViewSkeleton />}>
        <FeesDirectoryView />
      </Suspense>
      </div>
    </SectionGuard>
  );
}
