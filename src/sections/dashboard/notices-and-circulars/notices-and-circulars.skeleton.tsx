import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function NoticesAndCircularsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Notices Skeleton */}
      <Card className="col-span-full lg:col-span-6 border-border/80 p-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-3 px-0 pb-0 pt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-border/70 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity Skeleton */}
      <Card className="col-span-full lg:col-span-6 border-border/80 p-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-60" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-3 px-0 pb-0 pt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl border border-border/40">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
