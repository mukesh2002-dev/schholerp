"use client";

import { useERP } from "@/components/providers/erp-provider";
import { fetchEvents } from "@/lib/api/events";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SchoolEvent } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";

export function EventsHeader() {
  const { activeBranchId } = useERP();
  const { data: events } = useCampusData<SchoolEvent[]>({
    fetcher: (cid) => fetchEvents({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "events",
  });
  const publishedCount = events.filter((e) => e.status === "PUBLISHED").length;

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Events &amp; Academic Calendar
            </h1>
            <Badge variant="outline" className="text-xs">
              {publishedCount} Published Events
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            HR creates events → principal approves → published on the calendar → completed.
          </p>
        </div>
      </div>
    </div>
  );
}