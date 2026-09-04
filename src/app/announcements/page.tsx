import { Suspense } from "react";
import {
  AnnouncementsHeader,
  AnnouncementsHeaderSkeleton,
  AnnouncementsMetricsRibbon,
  AnnouncementsMetricsRibbonSkeleton,
  AnnouncementsDirectoryView,
  AnnouncementsDirectoryViewSkeleton,
} from "@/sections/announcements";

export default function AnnouncementsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
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
  );
}
