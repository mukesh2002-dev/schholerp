"use client";

import React, { useEffect, useState } from "react";
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
import { apiFetch } from "@/lib/api/client";
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
  academicYearId: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be greater than 0"),
  description: z.string().optional(),
  sectionName: z.string().min(1, "Initial section name is required"),
});

type ClassFormValues = z.infer<typeof classSchema>;

export function ClassFormDialog({ open, onOpenChange, onSuccess, editingClass }: ClassFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const isEditing = !!editingClass;
  const [submitting, setSubmitting] = useState(false);
  const [academicYears, setAcademicYears] = useState<Array<{ id: string; name: string }>>([]);

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
      academicYearId: "NONE",
      capacity: 120,
      description: "",
      sectionName: "A",
    },
  });

  const category = watch("category");
  const branchId = watch("branchId");
  const academicYearId = watch("academicYearId");

  useEffect(() => {
    if (!open) return;
    apiFetch<{ data: any[] }>("/academics/academic-years")
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setAcademicYears(res.data.map((y) => ({ id: y.uuid || y.id, name: y.name })));
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editingClass) {
        reset({
          name: editingClass.name,
          gradeLevel: editingClass.gradeLevel,
          category: editingClass.category,
          branchId: editingClass.branchId,
          academicYearId: (editingClass as any).academicYearId || "NONE",
          capacity: editingClass.capacity,
          description: editingClass.description || "",
          sectionName: editingClass.sections[0]?.name?.replace(/^Section\s+/i, "") || "A",
        });
      } else {
        reset({
          name: "",
          gradeLevel: 10,
          category: "High School",
          branchId: activeBranchId !== "all" ? activeBranchId : branches[0]?.id || "",
          academicYearId: "NONE",
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
      const basePayload: Record<string, unknown> = {
        name: data.name.trim(),
        section: data.sectionName.trim(),
        gradeLevel: Number(data.gradeLevel),
        category: data.category,
        capacity: Number(data.capacity),
        description: data.description?.trim() || null,
        academicYearId: data.academicYearId && data.academicYearId !== "NONE" ? data.academicYearId : null,
      };

      if (isEditing && editingClass) {
        await updateClassApi(editingClass.id, basePayload);
        toast.success(`Class "${data.name}" updated successfully`);
      } else {
        await createClassApi({ ...basePayload, campusId: data.branchId }, data.branchId);
        toast.success(`Class "${data.name}" created successfully`);
      }

      onOpenChange(false);
      onSuccess?.();
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save class. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Academic Class" : "Add Academic Class / Grade"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update grade level, capacity and academic details." : "Define a new grade level, capacity quota, and initial section."}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Academic Year</label>
              <Select value={academicYearId || "NONE"} onValueChange={(val) => setValue("academicYearId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  <SelectItem value="NONE">Default / None</SelectItem>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={ay.id}>
                      {ay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isEditing && (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Initial Section</label>
                <Input {...register("sectionName")} placeholder="A" className="h-9" />
                {errors.sectionName && <p className="text-[11px] text-rose-500 mt-1">{errors.sectionName.message}</p>}
              </div>
            )}
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
