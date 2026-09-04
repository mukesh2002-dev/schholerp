import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ExamScheduleViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/80 p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </Card>
        ))}
      </div>
    </div>
  );
}
