import { Suspense } from "react";
import {
  DocumentsHeader,
  DocumentsHeaderSkeleton,
  DocumentsMetricsRibbon,
  DocumentsMetricsRibbonSkeleton,
  DocumentsDirectoryView,
  DocumentsDirectoryViewSkeleton,
} from "@/sections/documents";

export default function DocumentsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
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
  );
}
