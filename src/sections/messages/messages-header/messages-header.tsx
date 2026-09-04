"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";

export function MessagesHeader() {
  const { activeBranchId } = useERP();
  const messages = mockDb.getMessages(activeBranchId) || [];
  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Messages &amp; Communications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="text-xs px-2 py-0.5">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Omni-channel messaging across In-App, Email, SMS, and WhatsApp for staff and parents.
          </p>
        </div>
      </div>
    </div>
  );
}
