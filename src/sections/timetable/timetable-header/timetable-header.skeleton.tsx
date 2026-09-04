import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function TimetableHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
  );
}
