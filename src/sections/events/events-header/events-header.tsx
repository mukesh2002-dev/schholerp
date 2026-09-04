"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";

export function EventsHeader() {
  const { activeBranchId } = useERP();
  const events = mockDb.getEvents(activeBranchId) || [];
  const upcomingCount = events.filter((e) => e.status === "UPCOMING").length;

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
              {upcomingCount} Upcoming Events
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage, schedule, and view campus events, workshops, sports, holidays, and meetings.
          </p>
        </div>
      </div>
    </div>
  );
}
