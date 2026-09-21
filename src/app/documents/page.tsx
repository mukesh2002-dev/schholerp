"use client";

import React, { Suspense } from "react";
import {
  DocumentsHeader,
  DocumentsHeaderSkeleton,
  DocumentsMetricsRibbon,
  DocumentsMetricsRibbonSkeleton,
  DocumentsDirectoryView,
  DocumentsDirectoryViewSkeleton,
} from "@/sections/documents";
import { SectionGuard } from "@/components/layout/section-guard";

export default function DocumentsPage() {
  return (
    <SectionGuard>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <Suspense fallback={<DocumentsHeaderSkeleton />}>
          <DocumentsHeader />
        </Suspense>

        <Suspense fallback={<DocumentsMetricsRibbonSkeleton />}>
          <DocumentsMetricsRibbon />
        </Suspense>

        <Suspense fallback={<DocumentsDirectoryViewSkeleton />}>
          <DocumentsDirectoryView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
