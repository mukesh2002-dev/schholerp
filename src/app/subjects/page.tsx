"use client";

import React, { Suspense } from "react";
import { SubjectHeader, SubjectHeaderSkeleton, SubjectDirectoryView, SubjectDirectoryViewSkeleton } from "@/sections/subjects";

export default function SubjectsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Suspense fallback={<SubjectHeaderSkeleton />}>
        <SubjectHeader />
      </Suspense>
      <Suspense fallback={<SubjectDirectoryViewSkeleton />}>
        <SubjectDirectoryView />
      </Suspense>
    </div>
  );
}
