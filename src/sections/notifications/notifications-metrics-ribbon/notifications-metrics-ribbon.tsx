"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Bell, AlertTriangle, Eye, Settings } from "lucide-react";

export function NotificationsMetricsRibbon() {
  const { activeBranchId } = useERP();
  const notifications = mockDb.getNotifications(activeBranchId) || [];
  const preferences = mockDb.getNotificationPreferences() || [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentCount = notifications.filter(
    (n) => n.priority === "URGENT" || n.priority === "HIGH"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Alerts
          </span>
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {notifications.length}
        </span>
        <span className="text-[11px] text-muted-foreground">Logged system triggers</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Unread
          </span>
          <Eye className="h-4 w-4 text-rose-600" />
        </div>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
          {unreadCount}
        </span>
        <span className="text-[11px] text-rose-600 font-medium">Pending acknowledgment</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
            High Priority
          </span>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
          {urgentCount}
        </span>
        <span className="text-[11px] text-amber-600 font-medium">Urgent attention needed</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            Channels
          </span>
          <Settings className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {preferences.length} Rules
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">Synced delivery routes</span>
      </div>
    </div>
  );
}
