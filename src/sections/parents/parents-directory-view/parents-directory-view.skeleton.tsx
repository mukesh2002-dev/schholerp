import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ParentsDirectoryViewSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-border/70">
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="h-9 w-64 rounded-md" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-36 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardContent className="p-5 flex gap-5">
          <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
