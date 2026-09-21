"use client";

import React, { Suspense } from "react";
import { SubjectHeader, SubjectHeaderSkeleton, SubjectDirectoryView, SubjectDirectoryViewSkeleton } from "@/sections/subjects";
import { SectionGuard } from "@/components/layout/section-guard";

export default function SubjectsPage() {
  return (
    <SectionGuard featureKey="academics">
      <div className="space-y-8 animate-in fade-in duration-300">
        <Suspense fallback={<SubjectHeaderSkeleton />}>
          <SubjectHeader />
        </Suspense>
        <Suspense fallback={<SubjectDirectoryViewSkeleton />}>
          <SubjectDirectoryView />
        </Suspense>
      </div>
    </SectionGuard>
  );
}
