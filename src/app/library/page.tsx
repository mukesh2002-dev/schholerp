"use client";

import React, { Suspense } from "react";
import {
  LibraryHeader,
  LibraryHeaderSkeleton,
  LibraryMetricsRibbon,
  LibraryMetricsRibbonSkeleton,
  LibraryDirectoryView,
  LibraryDirectoryViewSkeleton,
} from "@/sections/library";

export default function LibraryPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <Suspense fallback={<LibraryHeaderSkeleton />}>
        <LibraryHeader />
      </Suspense>

      {/* 2. Key Metrics Ribbon */}
      <Suspense fallback={<LibraryMetricsRibbonSkeleton />}>
        <LibraryMetricsRibbon />
      </Suspense>

      {/* 3. Book Catalog, Loans & Fine Collection View */}
      <Suspense fallback={<LibraryDirectoryViewSkeleton />}>
        <LibraryDirectoryView />
      </Suspense>
    </div>
  );
}
