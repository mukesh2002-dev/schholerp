"use client";

import React, { Suspense } from "react";
import {
  PayrollHeader,
  PayrollHeaderSkeleton,
  PayrollMetricsRibbon,
  PayrollMetricsRibbonSkeleton,
  PayrollDirectoryView,
  PayrollDirectoryViewSkeleton,
} from "@/sections/payroll";
import { SectionGuard } from "@/components/layout/section-guard";

export default function PayrollPage() {
  return (
    <SectionGuard>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <Suspense fallback={<PayrollHeaderSkeleton />}>
          <PayrollHeader />
        </Suspense>

        <Suspense fallback={<PayrollMetricsRibbonSkeleton />}>
          <PayrollMetricsRibbon />
        </Suspense>

        <Suspense fallback={<PayrollDirectoryViewSkeleton />}>
          <PayrollDirectoryView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
