"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Announcement } from "@/types";

interface AnnouncementDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
  onConfirm: (id: string) => Promise<void> | void;
}

export function AnnouncementDeleteDialog({
  open,
  onOpenChange,
  announcement,
  onConfirm,
}: AnnouncementDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!announcement) return;
    setLoading(true);
    try {
      await onConfirm(announcement.id);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Announcement</DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Are you sure you want to delete <strong className="text-foreground">"{announcement?.title}"</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
