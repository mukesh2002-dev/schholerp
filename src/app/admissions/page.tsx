"use client";

import React, { Suspense } from "react";
import {
  AdmissionsHeader,
  AdmissionsHeaderSkeleton,
  AdmissionsMetricsRibbon,
  AdmissionsMetricsRibbonSkeleton,
  AdmissionsPipelineView,
  AdmissionsPipelineViewSkeleton,
} from "@/sections/admissions";
import { SectionGuard } from "@/components/layout/section-guard";

export default function AdmissionsPage() {
  return (
    <SectionGuard>
      <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <Suspense fallback={<AdmissionsHeaderSkeleton />}>
        <AdmissionsHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<AdmissionsMetricsRibbonSkeleton />}>
        <AdmissionsMetricsRibbon />
      </Suspense>

      {/* 3. Pipeline Search, Filter & Table */}
      <Suspense fallback={<AdmissionsPipelineViewSkeleton />}>
        <AdmissionsPipelineView />
      </Suspense>
      </div>
    </SectionGuard>
  );
}
