import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MessagesDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-64 rounded-md" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border/80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-60" />
                    <Skeleton className="h-3 w-80" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-24 ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
