import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FeeCollectionsSkeleton() {
  return (
    <Card className="col-span-full lg:col-span-4 border-border/80 p-4">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-0 pt-0">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}
