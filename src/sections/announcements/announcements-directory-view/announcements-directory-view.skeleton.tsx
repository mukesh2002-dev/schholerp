import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function AnnouncementsDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-9 w-64 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-border/80">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="space-y-1.5 pt-2 border-t">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
