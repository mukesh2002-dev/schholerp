"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Megaphone, AlertCircle, CheckCircle2, Eye } from "lucide-react";

export function AnnouncementsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const announcements = mockDb.getAnnouncements(activeBranchId);

  const urgentCount = announcements.filter(
    (a) => a.priority === "URGENT" || a.priority === "HIGH"
  ).length;
  const publishedCount = announcements.filter((a) => a.status === "PUBLISHED").length;
  const totalViews = announcements.reduce((sum, a) => sum + (a.viewCount || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Announcements
          </span>
          <Megaphone className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {announcements.length}
        </span>
        <span className="text-[11px] text-muted-foreground">Active circulars</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Urgent / High
          </span>
          <AlertCircle className="h-4 w-4 text-rose-600" />
        </div>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
          {urgentCount}
        </span>
        <span className="text-[11px] text-rose-600 font-medium">Priority alerts</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Published
          </span>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {publishedCount}
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Live for stakeholders</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Views
          </span>
          <Eye className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {totalViews}
        </span>
        <span className="text-[11px] text-muted-foreground">Community engagement</span>
      </div>
    </div>
  );
}
