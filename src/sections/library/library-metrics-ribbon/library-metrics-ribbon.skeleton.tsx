import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function LibraryMetricsRibbonSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/70 p-4 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </Card>
      ))}
    </div>
  );
}
