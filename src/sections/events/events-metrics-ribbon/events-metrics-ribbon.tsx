"use client";

import { useERP } from "@/components/providers/erp-provider";
import { fetchEvents } from "@/lib/api/events";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SchoolEvent } from "@/types";
import { Calendar, Clock, CheckCircle2, Send } from "lucide-react";

export function EventsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const { data: events } = useCampusData<SchoolEvent[]>({
    fetcher: (cid) => fetchEvents({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "events",
  });

  const published = events.filter((e) => e.status === "PUBLISHED").length;
  const pending = events.filter((e) => e.status === "PENDING_APPROVAL").length;
  const drafts = events.filter((e) => e.status === "DRAFT").length;
  const completed = events.filter((e) => e.status === "COMPLETED").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Calendar Events</span>
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{events.length}</span>
        <span className="text-[11px] text-muted-foreground">Total scheduled</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Published</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{published}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Live on calendar</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Pending Approval</span>
          <Send className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">{pending}</span>
        <span className="text-[11px] text-amber-600 font-medium">Awaiting principal</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Drafts / Done</span>
          <Clock className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">{drafts} / {completed}</span>
        <span className="text-[11px] text-blue-600 font-medium">Drafts / completed</span>
      </div>
    </div>
  );
}