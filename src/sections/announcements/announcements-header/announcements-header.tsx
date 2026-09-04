"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";

export function AnnouncementsHeader() {
  const { activeBranchId } = useERP();
  const announcements = mockDb.getAnnouncements(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Announcements &amp; Notices
            </h1>
            <Badge variant="outline" className="text-xs">
              {announcements.length} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View and manage school-wide announcements, notices, and institutional circulars.
          </p>
        </div>
      </div>
    </div>
  );
}
