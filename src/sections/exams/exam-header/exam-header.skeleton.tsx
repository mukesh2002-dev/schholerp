import { Skeleton } from "@/components/ui/skeleton";

export function ExamHeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}
