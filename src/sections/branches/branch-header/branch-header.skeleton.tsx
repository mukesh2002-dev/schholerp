import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BranchHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>
    </div>
  );
}
