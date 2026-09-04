"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Calendar, Megaphone, User, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NoticePriority } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const noticeSchema = z.object({
  title: z.string().min(1, "Notice title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.string().min(1),
  category: z.string().min(1),
  branchId: z.string().min(1),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

export function NoticeBoard() {
  const { activeBranchId, branches } = useERP();
  const [notices, setNotices] = useState(() => mockDb.getNotices(activeBranchId));
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: "",
      content: "",
      priority: "NORMAL",
      category: "Administrative",
      branchId: "all",
    },
  });

  const priority = watch("priority");
  const category = watch("category");
  const branchId = watch("branchId");

  const handlePostNotice = (data: NoticeFormValues) => {
    const created = mockDb.addNotice({
      title: data.title,
      content: data.content,
      priority: data.priority as NoticePriority,
      category: data.category as any,
      branchId: data.branchId,
      author: "School Administration",
      targetAudience: ["ALL"],
    });

    setNotices(mockDb.getNotices(activeBranchId));
    setDialogOpen(false);
    reset();
  };

  const priorityVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <Card className="col-span-full lg:col-span-6 border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Notices & Official Circulars
            </CardTitle>
            <CardDescription>Campus broadcasts and institutional announcements</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post Notice</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1">
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-colors space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground line-clamp-1">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{n.category} Circular</span>
                  </div>
                  <Badge variant={priorityVariant(n.priority) as any} className="text-[9px] py-0 px-2 shrink-0">
                    {n.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{n.content}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  <span>Author: <strong className="text-foreground">{n.author}</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(n.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Post Notice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Publish Official Notice</DialogTitle>
            <DialogDescription>
              Broadcast an urgent announcement or circular across chosen campuses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handlePostNotice)} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Notice Title</label>
              <Input
                {...register("title")}
                placeholder="e.g. Early Dismissal for Annual Sports Meet"
                className={errors.title ? "border-rose-500" : ""}
              />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Priority</label>
                <Select value={priority} onValueChange={(val) => setValue("priority", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URGENT">Urgent (Red Alert)</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
                <Select value={category} onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Administrative">Administrative</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Target Campus</label>
              <Select value={branchId} onValueChange={(val) => setValue("branchId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Campuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campuses (Global Broadcast)</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Content & Details</label>
              <Textarea
                {...register("content")}
                placeholder="Write announcement details here..."
                rows={4}
                className={errors.content ? "border-rose-500" : ""}
              />
              {errors.content && <p className="text-[11px] text-rose-500 mt-1">{errors.content.message}</p>}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="gradient">
                Publish Circular
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
