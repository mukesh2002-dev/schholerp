"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSubjectApi, updateSubjectApi } from "@/lib/api/classes";
import { useERP } from "@/components/providers/erp-provider";
import { ApiError } from "@/lib/api/client";
import { Layers } from "lucide-react";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required (e.g. Mathematics)"),
  code: z.string().min(1, "Subject code is required (e.g. MATH-10)"),
  subjectType: z.enum(["THEORY", "PRACTICAL", "BOTH"]).default("THEORY"),
  maxMarks: z.coerce.number().min(1).default(100),
  passingMarks: z.coerce.number().min(0).default(33),
  description: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialClassId?: string;
  editingSubject?: any | null;
  onSuccess?: () => void;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  editingSubject,
  onSuccess,
}: SubjectFormDialogProps) {
  const { activeBranchId } = useERP();
  const isEditing = !!editingSubject;
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
      subjectType: "THEORY",
      maxMarks: 100,
      passingMarks: 33,
      description: "",
    },
  });

  const subjectType = watch("subjectType");

  useEffect(() => {
    if (open) {
      if (editingSubject) {
        reset({
          name: editingSubject.name || "",
          code: editingSubject.code || "",
          subjectType: (editingSubject.subjectType || editingSubject.type || "THEORY") as any,
          maxMarks: editingSubject.maxMarks || 100,
          passingMarks: editingSubject.passingMarks || 33,
          description: editingSubject.description || "",
        });
      } else {
        reset({
          name: "",
          code: "",
          subjectType: "THEORY",
          maxMarks: 100,
          passingMarks: 33,
          description: "",
        });
      }
    }
  }, [open, editingSubject, reset]);

  const onSubmit = async (data: SubjectFormValues) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        subjectType: data.subjectType,
        maxMarks: Number(data.maxMarks),
        passingMarks: Number(data.passingMarks),
        description: data.description?.trim() || null,
        campusId: activeBranchId !== "all" ? activeBranchId : undefined,
      };

      if (isEditing && editingSubject) {
        await updateSubjectApi(editingSubject.id || editingSubject.uuid, payload);
        toast.success(`Subject "${data.name}" updated successfully`);
      } else {
        await createSubjectApi(payload, activeBranchId);
        toast.success(`Subject "${data.name}" created in Subject Master`);
      }

      onOpenChange(false);
      onSuccess?.();
      window.dispatchEvent(new Event("subjects:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save subject";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Subject Master" : "Add Subject Master"}
              </DialogTitle>
              <DialogDescription>
                Reusable subject definition across multiple classes and sections.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Mathematics, Science, English"
              className={errors.name ? "border-rose-500" : ""}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Subject Code <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("code")}
                placeholder="e.g. MATH-10"
                className={errors.code ? "border-rose-500" : ""}
              />
              {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Subject Type</label>
              <Select value={subjectType} onValueChange={(val: any) => setValue("subjectType", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THEORY">Theory</SelectItem>
                  <SelectItem value="PRACTICAL">Practical</SelectItem>
                  <SelectItem value="BOTH">Both (Theory & Lab)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Max Marks</label>
              <Input type="number" {...register("maxMarks", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Passing Marks</label>
              <Input type="number" {...register("passingMarks", { valueAsNumber: true })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Description (Optional)</label>
            <Textarea
              {...register("description")}
              placeholder="Curriculum overview, prescribed textbook, syllabus details..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} variant="gradient">
              {submitting ? "Saving..." : isEditing ? "Update Subject" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
