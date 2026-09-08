"use client";

import React, { Suspense, useCallback, useState } from "react";
import { ExamHeader, ExamHeaderSkeleton, ExamMetricsRibbon, ExamMetricsRibbonSkeleton, ExamWorkspace, ExamWorkspaceSkeleton } from "@/sections/exams";

export default function ExamsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleNew = useCallback(() => {
    // trigger tab to exams and open dialog via custom event
    window.history.pushState({}, "", "/exams?tab=exams");
    window.dispatchEvent(new PopStateEvent("popstate"));
    setTimeout(() => window.dispatchEvent(new CustomEvent("exams:new")), 100);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Suspense fallback={<ExamHeaderSkeleton />}>
        <ExamHeader onNewExam={handleNew} />
      </Suspense>

      <Suspense fallback={<ExamMetricsRibbonSkeleton />}>
        <ExamMetricsRibbon key={refreshKey} />
      </Suspense>

      <Suspense fallback={<ExamWorkspaceSkeleton />}>
        <ExamWorkspace />
      </Suspense>
    </div>
  );
}
