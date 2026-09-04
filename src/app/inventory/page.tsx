import { Suspense } from "react";
import {
  InventoryHeader,
  InventoryHeaderSkeleton,
  InventoryMetricsRibbon,
  InventoryMetricsRibbonSkeleton,
  InventoryDirectoryView,
  InventoryDirectoryViewSkeleton,
} from "@/sections/inventory";

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <Suspense fallback={<InventoryHeaderSkeleton />}>
        <InventoryHeader />
      </Suspense>

      <Suspense fallback={<InventoryMetricsRibbonSkeleton />}>
        <InventoryMetricsRibbon />
      </Suspense>

      <Suspense fallback={<InventoryDirectoryViewSkeleton />}>
        <InventoryDirectoryView />
      </Suspense>
    </div>
  );
}
