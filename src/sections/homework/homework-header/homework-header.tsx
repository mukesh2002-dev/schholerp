"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { createHomeworkApi, fetchHomework } from "@/lib/api/homework";
import { fetchClasses } from "@/lib/api/classes";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Paperclip } from "lucide-react";
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
import { HomeworkStatus, HomeworkType } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const homeworkSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  dueDate: z.string().min(1, "Due date is required"),
  homeworkType: z.enum(["CW", "HW", "ASSIGNMENT", "PROJECT"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

type HomeworkFormValues = z.infer<typeof homeworkSchema>;

interface ClassOption {
  id: string;
  name: string;
  section: string;
}

const todayISO = () => new Date().toISOString().split("T")[0];

export function HomeworkHeader({ onHomeworkAdded }: { onHomeworkAdded?: () => void }) {
  const { activeBranchId, session } = useERP();
  const canWrite = session?.role === "ADMIN" || session?.role === "HR_MANAGER";
  const campusId = activeBranchId === "all" ? null : activeBranchId;

  const [taskCount, setTaskCount] = useState(0);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachPreview, setAttachPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      dueDate: "",
      homeworkType: "HW",
      priority: "MEDIUM",
    },
  });

  const classId = watch("classId");
  const homeworkType = watch("homeworkType");

  const selectedClass = classes.find((c) => c.id === classId);

  const refreshCount = useCallback(async () => {
    try {
      const { total } = await fetchHomework({ campusId, limit: 1 });
      setTaskCount(total);
    } catch {
      // count is best-effort; directory view shows its own errors
    }
  }, [campusId]);

  useEffect(() => {
    refreshCount();
    const h = () => refreshCount();
    if (typeof window !== "undefined") {
      window.addEventListener("homework-updated", h);
      return () => window.removeEventListener("homework-updated", h);
    }
  }, [refreshCount]);

  // Load classes when the dialog opens.
  useEffect(() => {
    if (!dialogOpen) return;
    setClassesLoading(true);
    fetchClasses({ campusId, limit: 100 })
      .then((cls) =>
        setClasses(
          cls.map((c) => ({
            id: c.id,
            name: c.name,
            section: c.sections?.[0]?.name?.replace(/^Section\s*/i, "") || "",
          }))
        )
      )
      .catch(() => toast.error("Failed to load classes"))
      .finally(() => setClassesLoading(false));
  }, [dialogOpen, campusId]);

  const handleAttach = (f: File | null) => {
    setAttachFile(f);
    setAttachPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setAttachFile(null);
    setAttachPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    reset();
  };

  const handleCreateHomework = async (data: HomeworkFormValues) => {
    try {
      await createHomeworkApi(
        {
          title: data.title,
          description: data.description || "",
          campusUuid: campusId ?? undefined,
          classUuid: data.classId,
          section: selectedClass?.section || undefined,
          dueDate: new Date(data.dueDate).toISOString(),
          maxMarks: 100,
          homeworkType: data.homeworkType as HomeworkType,
          priority: data.priority as any,
          status: "ACTIVE" as HomeworkStatus,
        },
        attachFile ? [attachFile] : [],
        campusId
      );
      toast.success(`${data.homeworkType} created successfully`, { description: data.title });
      closeDialog();
      refreshCount();
      if (onHomeworkAdded) onHomeworkAdded();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("homework-updated"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to create homework");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Homework &amp; Assignments
              </h1>
              <Badge variant="outline" className="text-xs">
                {taskCount} Tasks
              </Badge>
              <span className="hidden sm:inline-flex gap-1">
                <Badge variant="info" className="text-[10px]">CW</Badge>
                <Badge variant="secondary" className="text-[10px]">HW</Badge>
                <Badge variant="purple" className="text-[10px]">Assignment</Badge>
                <Badge variant="warning" className="text-[10px]">Project</Badge>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              CW / HW / Assignment / Project — create, edit, track submissions & grading.
            </p>
          </div>

          {canWrite && (
            <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span>Create CW/HW</span>
            </Button>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Homework / Task</DialogTitle>
            <DialogDescription>
              Pick a class for this task. Attach an optional image or PDF.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateHomework)} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Task Title</label>
              <Input {...register("title")} placeholder="e.g. Chapter 4 Trigonometry Problem Set" className={errors.title ? "border-rose-500" : ""} />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Type</label>
                <Select value={homeworkType} onValueChange={(val) => setValue("homeworkType", val as any)}>
                  <SelectTrigger className={errors.homeworkType ? "border-rose-500" : ""}>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CW">CW — Class Work</SelectItem>
                    <SelectItem value="HW">HW — Home Work</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                  </SelectContent>
                </Select>
                {errors.homeworkType && <p className="text-[11px] text-rose-500 mt-1">{errors.homeworkType.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Priority</label>
                <Select value={watch("priority")} onValueChange={(val) => setValue("priority", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assign to</p>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Class (Section)</label>
                <Select value={classId} onValueChange={(val) => setValue("classId", val)}>
                  <SelectTrigger className={errors.classId ? "border-rose-500" : ""}>
                    <SelectValue placeholder={classesLoading ? "Loading classes..." : "Select Class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.section ? ` (Sec ${c.section})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && <p className="text-[11px] text-rose-500 mt-1">{errors.classId.message}</p>}
              </div>
              {selectedClass && (
                <p className="text-[11px] text-muted-foreground">
                  Assigning to <strong className="text-foreground">{selectedClass.name}{selectedClass.section ? ` (Sec ${selectedClass.section})` : ""}</strong>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Due Date</label>
                <Input type="date" min={todayISO()} {...register("dueDate")} className={errors.dueDate ? "border-rose-500" : ""} />
                {errors.dueDate && <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Attachment (optional)</label>
                <label className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-xs text-muted-foreground cursor-pointer hover:border-primary/50">
                  {attachFile ? <Paperclip className="h-3.5 w-3.5 text-primary" /> : <Paperclip className="h-3.5 w-3.5" />}
                  <span className="truncate">{attachFile ? attachFile.name : "Image or PDF, max 10MB"}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleAttach(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {attachPreview && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border border-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachPreview} alt="attachment preview" className="h-14 w-14 rounded-md object-cover border border-border/60" />
                <div className="text-[11px] text-muted-foreground">
                  <p className="font-medium text-foreground truncate max-w-[220px]">{attachFile?.name}</p>
                  <button type="button" className="text-rose-500 hover:underline" onClick={() => handleAttach(null)}>Remove</button>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Instructions</label>
              <Textarea {...register("description")} placeholder="Problem numbers, page references, submission notes..." rows={3} />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="gradient">
                {isSubmitting ? "Publishing..." : "Publish Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
