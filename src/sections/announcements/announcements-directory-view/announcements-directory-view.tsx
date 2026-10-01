"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { fetchNotices, createNoticeApi, updateNoticeApi, deleteNoticeApi, safeString } from "@/lib/api/notices";
import { fetchClasses } from "@/lib/api/classes";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { Announcement, AnnouncementPriority, AnnouncementStatus, AnnouncementTarget, ClassRoom } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LayoutGrid,
  List,
  Megaphone,
  User,
  CalendarDays,
  Eye,
  Users,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AnnouncementDialog } from "../announcements-dialog";
import { AnnouncementDeleteDialog } from "../announcements-delete-dialog";

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

const DEFAULT_CLASSES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12"
];

export function AnnouncementsDirectoryView() {
  const { activeBranchId } = useERP();
  const { data: rawNotices, isOffline, error, isLoading } = useCampusData({
    fetcher: (cid) => fetchNotices({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "notices",
  });

  const { data: rawClasses } = useCampusData<ClassRoom[]>({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "classes",
  });

  const notices = useMemo(() => (Array.isArray(rawNotices) ? rawNotices : []), [rawNotices]);
  const realClasses = useMemo(() => (Array.isArray(rawClasses) ? rawClasses : []), [rawClasses]);

  const classNames = useMemo(() => {
    if (realClasses && realClasses.length > 0) {
      const names = realClasses.map((c) => safeString(c?.name)).filter(Boolean);
      if (names.length > 0) return Array.from(new Set(names)).sort();
    }
    return DEFAULT_CLASSES;
  }, [realClasses]);

  const [localItems, setLocalItems] = useState<(Announcement & { targetClass?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [targetFilter, setTargetFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modals state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Announcement | null>(null);

  useEffect(() => {
    if (notices && notices.length > 0) {
      const mapped: (Announcement & { targetClass?: string })[] = notices.map((n) => ({
        id: safeString(n?.id, `ann-${Date.now()}`),
        title: safeString(n?.title, "Untitled"),
        content: safeString(n?.content, ""),
        summary: safeString(n?.summary || n?.content, ""),
        author: safeString(n?.author, "Administration"),
        authorRole: "Administration",
        branchId: safeString(n?.branchId, "all"),
        branchName: safeString(n?.branchName, "All Campuses"),
        priority: (safeString(n?.priority, "NORMAL").toUpperCase()) as AnnouncementPriority,
        status: (safeString(n?.status, "PUBLISHED").toUpperCase()) as AnnouncementStatus,
        target: (safeString(n?.target, "ALL").toUpperCase()) as AnnouncementTarget,
        targetClass: safeString((n as any)?.targetClass, "ALL"),
        publishDate: safeString(n?.date, new Date().toISOString()),
        viewCount: 0,
        createdAt: safeString(n?.date, new Date().toISOString()),
        updatedAt: safeString(n?.date, new Date().toISOString()),
      }));
      setLocalItems(mapped);
    }
  }, [notices]);

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (ann: Announcement, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingItem(ann);
    setDialogOpen(true);
  };

  const handleDeletePrompt = (ann: Announcement, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingItem(ann);
    setDeleteDialogOpen(true);
  };

  const handleSaveAnnouncement = async (data: Partial<Announcement> & { targetClass?: string }) => {
    try {
      if (editingItem) {
        await updateNoticeApi(editingItem.id, data, activeBranchId);
        setLocalItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? {
            ...item,
            ...data,
            title: safeString(data.title || item.title),
            content: safeString(data.content || item.content),
            author: safeString(data.author || item.author),
          } as Announcement : item))
        );
      } else {
        const created = await createNoticeApi(data, activeBranchId);
        const newAnn: Announcement & { targetClass?: string } = {
          id: safeString(created?.id, `ann-${Date.now()}`),
          title: safeString(data.title || created?.title, "Untitled Announcement"),
          content: safeString(data.content || created?.content, ""),
          summary: safeString(data.summary || created?.summary || data.content, ""),
          author: safeString(created?.author || data.author, "School Admin"),
          authorRole: "Administration",
          branchId: safeString(created?.branchId, activeBranchId || "all"),
          branchName: safeString(created?.branchName, "All Campuses"),
          priority: (safeString(data.priority, "NORMAL").toUpperCase()) as AnnouncementPriority,
          status: (safeString(data.status, "PUBLISHED").toUpperCase()) as AnnouncementStatus,
          target: (safeString(data.target, "ALL").toUpperCase()) as AnnouncementTarget,
          targetClass: safeString(data.targetClass, "ALL"),
          publishDate: safeString(created?.date, new Date().toISOString()),
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setLocalItems((prev) => [newAnn, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save announcement:", err);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteNoticeApi(id, activeBranchId);
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return localItems.filter((ann) => {
      if (!ann) return false;
      const titleText = safeString(ann.title).toLowerCase();
      const contentText = safeString(ann.content).toLowerCase();
      const authorText = safeString(ann.author).toLowerCase();
      const query = (searchQuery || "").toLowerCase();

      const matchesSearch = !query || titleText.includes(query) || contentText.includes(query) || authorText.includes(query);

      const matchesPriority = priorityFilter === "ALL" || safeString(ann.priority).toUpperCase() === priorityFilter.toUpperCase();
      const matchesStatus = statusFilter === "ALL" || safeString(ann.status).toUpperCase() === statusFilter.toUpperCase();
      const matchesTarget = targetFilter === "ALL" || safeString(ann.target).toUpperCase() === targetFilter.toUpperCase();
      const matchesClass = classFilter === "ALL" || safeString(ann.targetClass) === classFilter || !ann.targetClass || safeString(ann.targetClass) === "ALL";

      return matchesSearch && matchesPriority && matchesStatus && matchesTarget && matchesClass;
    });
  }, [localItems, searchQuery, priorityFilter, statusFilter, targetFilter, classFilter]);

  return (
    <div className="space-y-6">
      <SectionOfflineBanner isOffline={isOffline} error={error} isLoading={isLoading} />

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={targetFilter} onValueChange={setTargetFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="All Targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Targets</SelectItem>
              <SelectItem value="STUDENTS">Students</SelectItem>
              <SelectItem value="TEACHERS">Teachers</SelectItem>
              <SelectItem value="PARENTS">Parents</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="CLASS">Specific Class</SelectItem>
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              <SelectItem value="ALL">All Classes</SelectItem>
              {classNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button onClick={handleCreate} size="sm" className="h-9 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Announcement</span>
          </Button>

          <div className="flex items-center gap-1 border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No Announcements Found"
          description="No announcements matched your current filters. Try adjusting your search or create a new announcement."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAnnouncements.map((ann) => {
            const pKey = safeString(ann.priority, "NORMAL").toUpperCase();
            const sKey = safeString(ann.status, "PUBLISHED").toUpperCase();
            const tKey = safeString(ann.target, "ALL").toUpperCase();
            const pConf = priorityConfig[pKey] || priorityConfig.NORMAL;
            const sConf = statusConfig[sKey] || statusConfig.PUBLISHED;
            const tLabel = targetLabels[tKey] || safeString(ann.target, "Everyone");
            const authorName = safeString(ann.author, "Administration");

            return (
              <Card key={ann.id} className="border-border/80 shadow-xs hover:shadow-md transition-shadow h-full group relative flex flex-col justify-between">
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/announcements/${ann.id}`} className="font-bold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors flex-1">
                      {safeString(ann.title)}
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={pConf.variant} className="text-[10px]">
                        {pConf.label}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-80 group-hover:opacity-100 hover:bg-muted"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={(e) => handleEdit(ann, e as any)} className="gap-2 text-xs">
                            <Pencil className="h-3.5 w-3.5 text-primary" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDeletePrompt(ann, e as any)} className="gap-2 text-xs text-destructive focus:text-destructive">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <Link href={`/announcements/${ann.id}`} className="block flex-1 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {safeString(ann.summary || ann.content)}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{authorName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {tLabel}
                        {ann.targetClass && ann.targetClass !== "ALL" ? ` (${safeString(ann.targetClass)})` : ""}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs mt-auto">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(ann.publishDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{ann.viewCount || 0}</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] border ${sConf.className}`}>
                        {sConf.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => {
            const pKey = safeString(ann.priority, "NORMAL").toUpperCase();
            const sKey = safeString(ann.status, "PUBLISHED").toUpperCase();
            const tKey = safeString(ann.target, "ALL").toUpperCase();
            const pConf = priorityConfig[pKey] || priorityConfig.NORMAL;
            const sConf = statusConfig[sKey] || statusConfig.PUBLISHED;
            const tLabel = targetLabels[tKey] || safeString(ann.target, "Everyone");
            const authorName = safeString(ann.author, "Administration");

            return (
              <Card key={ann.id} className="border-border/80 shadow-xs hover:shadow-md transition-shadow group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Megaphone className="h-5 w-5" />
                  </div>

                  <Link href={`/announcements/${ann.id}`} className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                        {safeString(ann.title)}
                      </h3>
                      <Badge variant={pConf.variant} className="text-[10px]">
                        {pConf.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {safeString(ann.summary || ann.content)}
                    </p>
                  </Link>

                  <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {tLabel}
                        {ann.targetClass && ann.targetClass !== "ALL" ? ` (${safeString(ann.targetClass)})` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(ann.publishDate)}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] border ${sConf.className}`}>
                      {sConf.label}
                    </Badge>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleEdit(ann, e as any)}
                      title="Edit Announcement"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleDeletePrompt(ann, e as any)}
                      title="Delete Announcement"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        announcement={editingItem}
        onSave={handleSaveAnnouncement}
      />

      <AnnouncementDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        announcement={deletingItem}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
