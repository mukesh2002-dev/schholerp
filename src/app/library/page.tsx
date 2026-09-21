"use client";

import React, { Suspense } from "react";
import {
  LibraryHeader,
  LibraryHeaderSkeleton,
  LibraryMetricsRibbon,
  LibraryMetricsRibbonSkeleton,
  LibraryDirectoryView,
  LibraryDirectoryViewSkeleton,
  LibraryManagementView,
  LibraryOperationsView,
} from "@/sections/library";
import { SectionGuard } from "@/components/layout/section-guard";

export default function LibraryPage() {
  return (
    <SectionGuard>
      <div className="space-y-8 animate-in fade-in duration-300">
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

        {/* 4. Libraries, Sections & Fine Rules Engine (library v2) */}
        <LibraryManagementView />

        {/* 5. Purchase Requests, Announcements & Rules (library v2) */}
        <LibraryOperationsView />
      </div>
    </SectionGuard>
  );
}
