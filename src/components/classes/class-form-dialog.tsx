"use client";

import React, { useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { ClassRoom } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { createClassApi, updateClassApi } from "@/lib/api/classes";
import { ApiError } from "@/lib/api/client";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editingClass?: ClassRoom | null;
}

const classSchema = z.object({
  name: z.string().min(1, "Class name is required (e.g. Grade 10)"),
  gradeLevel: z.coerce.number().min(1).max(20),
  category: z.string().min(1),
  branchId: z.string().min(1),
  capacity: z.coerce.number().min(1, "Capacity must be greater than 0"),
  description: z.string().optional(),
  sectionName: z.string().min(1),
});

type ClassFormValues = z.infer<typeof classSchema>;

export function ClassFormDialog({ open, onOpenChange, onSuccess, editingClass }: ClassFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const isEditing = !!editingClass;
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      gradeLevel: 10,
      category: "High School",
      branchId: activeBranchId !== "all" ? activeBranchId : branches[0]?.id || "",
      capacity: 120,
      description: "",
      sectionName: "A",
    },
  });

  const category = watch("category");
  const branchId = watch("branchId");

  useEffect(() => {
    if (open) {
      if (editingClass) {
        reset({
          name: editingClass.name,
          gradeLevel: editingClass.gradeLevel,
          category: editingClass.category,
          branchId: editingClass.branchId,
          capacity: editingClass.capacity,
          description: editingClass.description || "",
          sectionName: editingClass.sections[0]?.name.replace("Section ", "").trim() || "A",
        });
      } else {
        reset({
          name: "",
          gradeLevel: 10,
          category: "High School",
          branchId: activeBranchId !== "all" ? activeBranchId : branches[0]?.id || "",
          capacity: 120,
          description: "",
          sectionName: "A",
        });
      }
    }
  }, [open, editingClass, activeBranchId, branches, reset]);

  const onSubmit = async (data: ClassFormValues) => {
    setSubmitting(true);
    try {
      const basePayload = {
        name: data.name.trim(),
        section: data.sectionName.trim(),
        gradeLevel: Number(data.gradeLevel),
        category: data.category,
        capacity: Number(data.capacity),
        description: data.description?.trim() || null,
      };
      if (isEditing && editingClass) {
        await updateClassApi(editingClass.id, basePayload);
        toast.success(`Class "${data.name}" updated`);
      } else {
        await createClassApi({ ...basePayload, campusId: data.branchId }, data.branchId);
        toast.success(`Class "${data.name}" created`);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save class. Try again.";
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{isEditing ? "Edit Academic Class" : "Add Academic Class / Grade"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update grade level, capacity and section details." : "Define a new grade level, capacity quota, and initial section."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Class / Grade Name <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. Grade 10 or UKG"
              className={errors.name ? "border-rose-500" : ""}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Grade Level (Numeric)</label>
              <Input
                type="number"
                {...register("gradeLevel", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
              <Select value={category} onValueChange={(val) => setValue("category", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kindergarten">Kindergarten</SelectItem>
                  <SelectItem value="Primary">Primary (1-5)</SelectItem>
                  <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
                  <SelectItem value="High School">High School (9-10)</SelectItem>
                  <SelectItem value="Senior Secondary">Senior Secondary (11-12)</SelectItem>
                  <SelectItem value="UG">UG</SelectItem>
                  <SelectItem value="PG">PG</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Campus Branch</label>
              <Select value={branchId} onValueChange={(val) => setValue("branchId", val)} disabled={isEditing}>
                <SelectTrigger>
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Class Capacity</label>
              <Input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
              />
              {errors.capacity && <p className="text-[11px] text-rose-500 mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Section Name</label>
            <Input {...register("sectionName")} placeholder="A / B / C" className="h-9" />
            {errors.sectionName && <p className="text-[11px] text-rose-500 mt-1">{errors.sectionName.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
            <Textarea
              {...register("description")}
              placeholder="CBSE curriculum track, NCERT pattern, Olympiad / NTSE batches..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} variant="gradient">
              {submitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Class" : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}