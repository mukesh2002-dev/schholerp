import { Skeleton } from "@/components/ui/skeleton";

export function ExamMetricsRibbonSkeleton() {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
}
