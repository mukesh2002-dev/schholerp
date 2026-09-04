import { Suspense } from "react";
import {
  EventsHeader,
  EventsHeaderSkeleton,
  EventsMetricsRibbon,
  EventsMetricsRibbonSkeleton,
  EventsDirectoryView,
  EventsDirectoryViewSkeleton,
} from "@/sections/events";

export default function EventsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Suspense fallback={<EventsHeaderSkeleton />}>
        <EventsHeader />
      </Suspense>

      <Suspense fallback={<EventsMetricsRibbonSkeleton />}>
        <EventsMetricsRibbon />
      </Suspense>

      <Suspense fallback={<EventsDirectoryViewSkeleton />}>
        <EventsDirectoryView />
      </Suspense>
    </div>
  );
}
