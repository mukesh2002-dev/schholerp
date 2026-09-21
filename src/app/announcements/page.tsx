"use client";

import React, { Suspense } from "react";
import {
  AnnouncementsHeader,
  AnnouncementsHeaderSkeleton,
  AnnouncementsMetricsRibbon,
  AnnouncementsMetricsRibbonSkeleton,
  AnnouncementsDirectoryView,
  AnnouncementsDirectoryViewSkeleton,
} from "@/sections/announcements";
import { SectionGuard } from "@/components/layout/section-guard";

export default function AnnouncementsPage() {
  return (
    <SectionGuard featureKey="broadcast">
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <Suspense fallback={<AnnouncementsHeaderSkeleton />}>
          <AnnouncementsHeader />
        </Suspense>

        <Suspense fallback={<AnnouncementsMetricsRibbonSkeleton />}>
          <AnnouncementsMetricsRibbon />
        </Suspense>

        <Suspense fallback={<AnnouncementsDirectoryViewSkeleton />}>
          <AnnouncementsDirectoryView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
