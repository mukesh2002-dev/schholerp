import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AdmissionsPipelineViewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Controls Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-9 w-64 max-w-sm rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg hidden sm:block" />
        </div>
        <Skeleton className="h-5 w-28 rounded-full self-end md:self-auto" />
      </div>

      {/* Table Skeleton */}
      <Card className="rounded-xl border border-border/80 p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </Card>
    </div>
  );
}
