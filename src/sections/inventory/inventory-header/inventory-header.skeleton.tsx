import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function InventoryHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-5 w-36 rounded-full" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>
    </div>
  );
}
