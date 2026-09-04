import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CampusCapacityQuotasSkeleton() {
  return (
    <Card className="border-border/80 p-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-0 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-60" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4 px-0 pb-0 pt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
