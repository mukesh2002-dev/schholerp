"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
  teacherId: z.string().min(1, "Teacher is required"),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.string().optional(),
  homeworkType: z.enum(["CW", "HW", "ASSIGNMENT", "PROJECT"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

type HomeworkFormValues = z.infer<typeof homeworkSchema>;

export function HomeworkHeader({ onHomeworkAdded }: { onHomeworkAdded?: () => void }) {
  const { activeBranchId } = useERP();
  const homeworkList = mockDb.getHomeworkList(activeBranchId);
  const classes = mockDb.getClasses(activeBranchId);
  const teachers = mockDb.getTeachers(activeBranchId);

  const [dialogOpen, setDialogOpen] = useState(false);

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
      teacherId: "",
      dueDate: "",
      maxMarks: "100",
      homeworkType: "HW",
      priority: "MEDIUM",
    },
  });

  const classId = watch("classId");
  const teacherId = watch("teacherId");
  const homeworkType = watch("homeworkType");

  const handleCreateHomework = (data: HomeworkFormValues) => {
    const selectedClass = classes.find((c) => c.id === data.classId);
    const selectedTeacher = teachers.find((t) => t.id === data.teacherId);

    mockDb.saveHomework({
      title: data.title,
      description: data.description || "",
      classId: data.classId,
      className: selectedClass?.name || "",
      sectionId: selectedClass?.sections[0]?.id || "sec-1",
      sectionName: selectedClass?.sections[0]?.name || "A",
      subjectId: selectedClass?.subjects[0]?.id || "sub-1",
      subjectName: selectedClass?.subjects[0]?.name || "General",
      subjectCode: "GEN-101",
      teacherId: data.teacherId,
      teacherName: selectedTeacher?.fullName || "",
      branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId,
      branchName: selectedClass?.branchName || "Main Campus",
      assignedDate: new Date().toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      maxMarks: Number(data.maxMarks) || 100,
      status: "ACTIVE" as HomeworkStatus,
      homeworkType: data.homeworkType as HomeworkType,
      priority: data.priority as any,
      attachments: [],
    });

    toast.success(`${data.homeworkType} created successfully`, { description: `${data.title} — ${selectedClass?.name}` });
    setDialogOpen(false);
    reset();
    if (onHomeworkAdded) onHomeworkAdded();
    // force reload so directory view reflects immediately (client localStorage)
    if (typeof window !== "undefined") window.dispatchEvent(new Event("homework-updated"));
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
                {homeworkList.length} Tasks
              </Badge>
              <span className="hidden sm:inline-flex gap-1">
                <Badge variant="info" className="text-[10px]">CW</Badge>
                <Badge variant="secondary" className="text-[10px]">HW</Badge>
                <Badge variant="purple" className="text-[10px]">Assignment</Badge>
                <Badge variant="warning" className="text-[10px]">Project</Badge>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              CW / HW / Assignment / Project — create, edit, track submissions & grading. College pattern reference.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Create CW/HW</span>
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Homework / Task</DialogTitle>
            <DialogDescription>
              Choose type: CW (Class Work), HW (Home Work), Assignment or Project. College-style tracking.
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Class Cohort</label>
                <Select value={classId} onValueChange={(val) => setValue("classId", val)}>
                  <SelectTrigger className={errors.classId ? "border-rose-500" : ""}>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && <p className="text-[11px] text-rose-500 mt-1">{errors.classId.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Instructor</label>
                <Select value={teacherId} onValueChange={(val) => setValue("teacherId", val)}>
                  <SelectTrigger className={errors.teacherId ? "border-rose-500" : ""}>
                    <SelectValue placeholder="Assign Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.teacherId && <p className="text-[11px] text-rose-500 mt-1">{errors.teacherId.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Due Date</label>
                <Input type="date" {...register("dueDate")} className={errors.dueDate ? "border-rose-500" : ""} />
                {errors.dueDate && <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Max Marks</label>
                <Input type="number" {...register("maxMarks")} placeholder="100" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Instructions</label>
              <Textarea {...register("description")} placeholder="Detail the instructions or problem numbers..." rows={3} />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="gradient">
                Publish Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
