"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function NotificationsHeader() {
  const { activeBranchId } = useERP();
  const notifications = mockDb.getNotifications(activeBranchId) || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    mockDb.markAllNotificationsRead();
    toast.success("All notifications marked as read");
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time multi-channel alerts, activity triggers, and delivery preference configurations.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="gradient" className="gap-2 shrink-0" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            <span>Mark All Read</span>
          </Button>
        )}
      </div>
    </div>
  );
}
