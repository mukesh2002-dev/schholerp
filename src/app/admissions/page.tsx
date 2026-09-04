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

export default function AdmissionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
  );
}
