"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Announcement, AnnouncementPriority, AnnouncementStatus, AnnouncementTarget, ClassRoom } from "@/types";
import { useERP } from "@/components/providers/erp-provider";
import { fetchClasses } from "@/lib/api/classes";
import { useCampusData } from "@/lib/hooks/use-campus-data";

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onSave: (data: Partial<Announcement> & { targetClass?: string }) => Promise<void> | void;
}

const DEFAULT_CLASSES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12"
];

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  onSave,
}: AnnouncementDialogProps) {
  const { activeBranchId } = useERP();
  const { data: rawClasses } = useCampusData<ClassRoom[]>({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "classes",
  });

  const realClasses = Array.isArray(rawClasses) ? rawClasses : [];

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<AnnouncementPriority>("NORMAL");
  const [target, setTarget] = useState<AnnouncementTarget>("ALL");
  const [targetClass, setTargetClass] = useState<string>("ALL");
  const [status, setStatus] = useState<AnnouncementStatus>("PUBLISHED");
  const [loading, setLoading] = useState(false);

  const classNames = useMemo(() => {
    if (realClasses && realClasses.length > 0) {
      const names = realClasses.map((c) => c?.name).filter(Boolean);
      if (names.length > 0) return Array.from(new Set(names)).sort();
    }
    return DEFAULT_CLASSES;
  }, [realClasses]);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || "");
      setSummary(announcement.summary || "");
      setContent(announcement.content || "");
      setPriority(announcement.priority || "NORMAL");
      setTarget(announcement.target || "ALL");
      setTargetClass((announcement as any).targetClass || "ALL");
      setStatus(announcement.status || "PUBLISHED");
    } else {
      setTitle("");
      setSummary("");
      setContent("");
      setPriority("NORMAL");
      setTarget("ALL");
      setTargetClass("ALL");
      setStatus("PUBLISHED");
    }
  }, [announcement, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      await onSave({
        ...(announcement ? { id: announcement.id } : {}),
        title,
        summary: summary || title,
        content,
        priority: priority || "NORMAL",
        target: target || "ALL",
        targetClass,
        status: status || "PUBLISHED",
        author: announcement?.author || "School Admin",
        publishDate: announcement?.publishDate || new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = Boolean(announcement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Announcement Title *</label>
            <Input
              placeholder="e.g. Q2 Fee Payment Reminder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Priority</label>
              <Select value={priority} onValueChange={(val) => setPriority(val as AnnouncementPriority)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Audience</label>
              <Select value={target} onValueChange={(val) => setTarget(val as AnnouncementTarget)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Everyone</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                  <SelectItem value="TEACHERS">Teachers</SelectItem>
                  <SelectItem value="PARENTS">Parents</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="CLASS">Specific Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Class</label>
              <Select value={targetClass} onValueChange={setTargetClass}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Class" />
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val as AnnouncementStatus)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Short Summary</label>
            <Input
              placeholder="Brief 1-line summary for notice cards"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Content / Description *</label>
            <Textarea
              placeholder="Write detailed announcement content here..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Announcement" : "Publish Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
