import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function BranchDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Controls Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-9 w-64 max-w-sm rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg hidden sm:block" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg self-end md:self-auto" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 rounded-2xl border border-border/80 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>

            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
