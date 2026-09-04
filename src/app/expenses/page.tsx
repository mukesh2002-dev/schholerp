import { Suspense } from "react";
import {
  ExpensesHeader,
  ExpensesHeaderSkeleton,
  ExpensesMetricsRibbon,
  ExpensesMetricsRibbonSkeleton,
  ExpensesDirectoryView,
  ExpensesDirectoryViewSkeleton,
} from "@/sections/expenses";

export default function ExpensesPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <Suspense fallback={<ExpensesHeaderSkeleton />}>
        <ExpensesHeader />
      </Suspense>

      <Suspense fallback={<ExpensesMetricsRibbonSkeleton />}>
        <ExpensesMetricsRibbon />
      </Suspense>

      <Suspense fallback={<ExpensesDirectoryViewSkeleton />}>
        <ExpensesDirectoryView />
      </Suspense>
    </div>
  );
}
