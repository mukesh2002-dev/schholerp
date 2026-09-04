import { Suspense } from "react";
import {
  ParentsHeader,
  ParentsHeaderSkeleton,
  ParentsMetricsRibbon,
  ParentsMetricsRibbonSkeleton,
  ParentsDirectoryView,
  ParentsDirectoryViewSkeleton,
} from "@/sections/parents";

export default function ParentsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Suspense fallback={<ParentsHeaderSkeleton />}>
        <ParentsHeader />
      </Suspense>

      <Suspense fallback={<ParentsMetricsRibbonSkeleton />}>
        <ParentsMetricsRibbon />
      </Suspense>

      <Suspense fallback={<ParentsDirectoryViewSkeleton />}>
        <ParentsDirectoryView />
      </Suspense>
    </div>
  );
}
