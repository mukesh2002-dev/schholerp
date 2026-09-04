import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function EventsDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-2 flex-wrap">
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <Card className="border-border/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
