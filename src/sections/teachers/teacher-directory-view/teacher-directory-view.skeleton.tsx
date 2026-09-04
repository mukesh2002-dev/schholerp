import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function TeacherDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <Skeleton className="h-9 w-64 max-w-sm rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg hidden sm:block" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg self-end md:self-auto" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5 rounded-2xl border border-border/80 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Skeleton className="h-3 w-20" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
