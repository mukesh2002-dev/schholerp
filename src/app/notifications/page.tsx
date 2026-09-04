import { Suspense } from "react";
import {
  NotificationsHeader,
  NotificationsHeaderSkeleton,
  NotificationsMetricsRibbon,
  NotificationsMetricsRibbonSkeleton,
  NotificationsDirectoryView,
  NotificationsDirectoryViewSkeleton,
} from "@/sections/notifications";

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Suspense fallback={<NotificationsHeaderSkeleton />}>
        <NotificationsHeader />
      </Suspense>

      <Suspense fallback={<NotificationsMetricsRibbonSkeleton />}>
        <NotificationsMetricsRibbon />
      </Suspense>

      <Suspense fallback={<NotificationsDirectoryViewSkeleton />}>
        <NotificationsDirectoryView />
      </Suspense>
    </div>
  );
}
