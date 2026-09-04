import { Suspense } from "react";
import {
  MessagesHeader,
  MessagesHeaderSkeleton,
  MessagesMetricsRibbon,
  MessagesMetricsRibbonSkeleton,
  MessagesDirectoryView,
  MessagesDirectoryViewSkeleton,
} from "@/sections/messages";

export default function MessagesPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <Suspense fallback={<MessagesHeaderSkeleton />}>
        <MessagesHeader />
      </Suspense>

      <Suspense fallback={<MessagesMetricsRibbonSkeleton />}>
        <MessagesMetricsRibbon />
      </Suspense>

      <Suspense fallback={<MessagesDirectoryViewSkeleton />}>
        <MessagesDirectoryView />
      </Suspense>
    </div>
  );
}
