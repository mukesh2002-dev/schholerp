"use client";

import { useERP } from "@/components/providers/erp-provider";
import { fetchNotices } from "@/lib/api/notices";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AnnouncementsHeaderProps {
  onCreateClick?: () => void;
}

export function AnnouncementsHeader({ onCreateClick }: AnnouncementsHeaderProps) {
  const { activeBranchId } = useERP();
  const { data: rawNotices } = useCampusData({
    fetcher: (cid) => fetchNotices({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "notices",
  });

  const notices = Array.isArray(rawNotices) ? rawNotices : [];

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
              {notices.length} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View and manage school-wide announcements, notices, and institutional circulars.
          </p>
        </div>

        {onCreateClick && (
          <Button onClick={onCreateClick} className="gap-2 shrink-0 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            <span>Create Announcement</span>
          </Button>
        )}
      </div>
    </div>
  );
}
