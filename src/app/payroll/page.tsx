import { Suspense } from "react";
import {
  PayrollHeader,
  PayrollHeaderSkeleton,
  PayrollMetricsRibbon,
  PayrollMetricsRibbonSkeleton,
  PayrollDirectoryView,
  PayrollDirectoryViewSkeleton,
} from "@/sections/payroll";

export default function PayrollPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <Suspense fallback={<PayrollHeaderSkeleton />}>
        <PayrollHeader />
      </Suspense>

      <Suspense fallback={<PayrollMetricsRibbonSkeleton />}>
        <PayrollMetricsRibbon />
      </Suspense>

      <Suspense fallback={<PayrollDirectoryViewSkeleton />}>
        <PayrollDirectoryView />
      </Suspense>
    </div>
  );
}
