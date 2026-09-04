import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function TransportDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 rounded-xl border border-border/70">
        <Skeleton className="h-9 w-80 rounded-lg" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 border border-border/80 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
