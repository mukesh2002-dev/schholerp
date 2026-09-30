"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchNotices, updateNoticeApi, deleteNoticeApi, safeString } from "@/lib/api/notices";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { Announcement, AnnouncementPriority, AnnouncementStatus, AnnouncementTarget } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Megaphone,
  User,
  CalendarDays,
  Eye,
  Users,
  Clock,
  AlertTriangle,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AnnouncementDialog, AnnouncementDeleteDialog } from "@/sections/announcements";

const priorityConfig: Record<string, { label: string; variant: "destructive" | "warning" | "default" | "secondary" }> = {
  URGENT: { label: "Urgent", variant: "destructive" },
  HIGH: { label: "High", variant: "warning" },
  NORMAL: { label: "Normal", variant: "default" },
  LOW: { label: "Low", variant: "secondary" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  DRAFT: { label: "Draft", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

const targetLabels: Record<string, string> = {
  ALL: "Everyone",
  STUDENTS: "Students",
  TEACHERS: "Teachers",
  PARENTS: "Parents",
  STAFF: "Staff",
  CLASS: "Specific Class",
  SECTION: "Specific Section",
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { activeBranchId } = useERP();
  const id = params.id as string;

  const { data: rawNotices, isLoading } = useCampusData({
    fetcher: (cid) => fetchNotices({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "notices",
  });

  const notices = Array.isArray(rawNotices) ? rawNotices : [];
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [customAnnouncement, setCustomAnnouncement] = useState<Announcement | null>(null);

  const found = notices.find((n) => n.id === id);
  const announcement: Announcement | undefined = customAnnouncement || (found
    ? {
        id: safeString(found.id),
        title: safeString(found.title),
        content: safeString(found.content),
        summary: safeString(found.summary || found.content),
        author: safeString(found.author, "Administration"),
        authorRole: "Administration",
        branchId: safeString(found.branchId, "all"),
        branchName: safeString(found.branchName, "All Campuses"),
        priority: (safeString(found.priority, "NORMAL").toUpperCase()) as AnnouncementPriority,
        status: (safeString(found.status, "PUBLISHED").toUpperCase()) as AnnouncementStatus,
        target: (safeString(found.target, "ALL").toUpperCase()) as AnnouncementTarget,
        publishDate: safeString(found.date, new Date().toISOString()),
        viewCount: 0,
        createdAt: safeString(found.date, new Date().toISOString()),
        updatedAt: safeString(found.date, new Date().toISOString()),
      }
    : undefined);

  const handleSave = async (data: Partial<Announcement>) => {
    if (!announcement) return;
    await updateNoticeApi(announcement.id, data, activeBranchId);
    setCustomAnnouncement({
      ...announcement,
      ...data,
      title: safeString(data.title || announcement.title),
      content: safeString(data.content || announcement.content),
      author: safeString(data.author || announcement.author),
    } as Announcement);
  };

  const handleDelete = async (annId: string) => {
    await deleteNoticeApi(annId, activeBranchId);
    router.push("/announcements");
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading announcement...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Megaphone className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Announcement Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested announcement record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/announcements">Back to Announcements</Link>
        </Button>
      </div>
    );
  }

  const pKey = safeString(announcement.priority, "NORMAL").toUpperCase();
  const sKey = safeString(announcement.status, "PUBLISHED").toUpperCase();
  const tKey = safeString(announcement.target, "ALL").toUpperCase();
  const pConf = priorityConfig[pKey] || priorityConfig.NORMAL;
  const sConf = statusConfig[sKey] || statusConfig.PUBLISHED;
  const tLabel = targetLabels[tKey] || safeString(announcement.target, "Everyone");
  const authorName = safeString(announcement.author, "Administration");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={pConf.variant} className="text-[10px]">
                {pConf.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] border ${sConf.className}`}>
                {sConf.label}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {safeString(announcement.title)}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{authorName}</span>
                <span className="text-border">•</span>
                <span>{safeString(announcement.authorRole, "Administration")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{tLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5 text-xs">
              <Pencil className="h-3.5 w-3.5 text-primary" />
              <span>Edit</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="gap-1.5 text-xs text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/announcements" className="gap-1.5 text-xs">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Views</span>
            <span className="font-bold text-foreground text-sm">{announcement.viewCount || 0}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Published</span>
            <span className="font-bold text-foreground text-sm">{formatDate(announcement.publishDate)}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Expiry Date</span>
            <span className="font-bold text-foreground text-sm">
              {announcement.expiryDate ? formatDate(announcement.expiryDate) : "-"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Branch</span>
            <span className="font-bold text-foreground text-sm">{safeString(announcement.branchName, "All Campuses")}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            Announcement Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {safeString(announcement.content)}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Announcement Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              View Count
            </span>
            <span className="font-bold text-foreground">{announcement.viewCount || 0}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Published On
            </span>
            <span className="font-bold text-foreground">{formatDate(announcement.publishDate)}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Target Audience
            </span>
            <span className="font-bold text-foreground">{tLabel}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Author
            </span>
            <span className="font-bold text-foreground">{authorName}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className={`text-[10px] border ${sConf.className}`}>
              {sConf.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit & Delete Dialogs */}
      <AnnouncementDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        announcement={announcement}
        onSave={handleSave}
      />

      <AnnouncementDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        announcement={announcement}
        onConfirm={handleDelete}
      />
    </div>
  );
}
