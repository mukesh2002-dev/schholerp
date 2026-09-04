"use client";

import React, { Suspense } from "react";
import {
  TransportHeader,
  TransportHeaderSkeleton,
  TransportMetricsRibbon,
  TransportMetricsRibbonSkeleton,
  TransportDirectoryView,
  TransportDirectoryViewSkeleton,
} from "@/sections/transport";

export default function TransportPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Breadcrumbs */}
      <Suspense fallback={<TransportHeaderSkeleton />}>
        <TransportHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<TransportMetricsRibbonSkeleton />}>
        <TransportMetricsRibbon />
      </Suspense>

      {/* 3. Transport Routes, Vehicles, Drivers & Student Assignments */}
      <Suspense fallback={<TransportDirectoryViewSkeleton />}>
        <TransportDirectoryView />
      </Suspense>
    </div>
  );
}
