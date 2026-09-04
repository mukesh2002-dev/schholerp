"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Calendar, Clock, CheckCircle2, Users } from "lucide-react";

export function EventsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const events = mockDb.getEvents(activeBranchId) || [];

  const upcomingCount = events.filter((e) => e.status === "UPCOMING").length;
  const ongoingCount = events.filter((e) => e.status === "ONGOING").length;
  const totalParticipants = events.reduce((sum, e) => sum + (e.participantCount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Calendar Events
          </span>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {events.length}
        </span>
        <span className="text-[11px] text-muted-foreground">Total scheduled</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            Upcoming
          </span>
          <Clock className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
          {upcomingCount}
        </span>
        <span className="text-[11px] text-blue-600 font-medium">Coming next</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            Ongoing / Live
          </span>
          <CheckCircle2 className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
          {ongoingCount}
        </span>
        <span className="text-[11px] text-amber-600 font-medium">Currently active</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Total Attendees
          </span>
          <Users className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {totalParticipants}
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Registered participants</span>
      </div>
    </div>
  );
}
