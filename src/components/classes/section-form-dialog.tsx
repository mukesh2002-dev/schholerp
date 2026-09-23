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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSectionApi, updateSectionApi, BackendSection } from "@/lib/api/sections";
import { fetchTeachers } from "@/lib/api/teachers";
import { useERP } from "@/components/providers/erp-provider";
import { ApiError } from "@/lib/api/client";
import { DoorClosed } from "lucide-react";

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required (e.g. A, B, Rose)"),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  classTeacherId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className?: string;
  editingSection?: BackendSection | null;
  onSuccess?: () => void;
}

export function SectionFormDialog({
  open,
  onOpenChange,
  classId,
  className,
  editingSection,
  onSuccess,
}: SectionFormDialogProps) {
  const { activeBranchId } = useERP();
  const isEditing = !!editingSection;
  const [submitting, setSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: "",
      roomNumber: "",
      capacity: 40,
      classTeacherId: "NONE",
      status: "ACTIVE",
    },
  });

  const classTeacherId = watch("classTeacherId");
  const status = watch("status");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingTeachers(true);
    fetchTeachers({ campusId: activeBranchId, limit: 100 })
      .then((res: any) => {
        if (!cancelled && res?.data) {
          setTeachers(res.data.map((u: any) => ({ id: u.id || u.uuid, name: u.fullName || u.name })));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingTeachers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, activeBranchId]);

  useEffect(() => {
    if (open) {
      if (editingSection) {
        reset({
          name: editingSection.name.replace(/^Section\s+/i, ""),
          roomNumber: editingSection.roomNumber || "",
          capacity: editingSection.capacity || 40,
          classTeacherId: editingSection.classTeacherId || editingSection.classTeacher?.uuid || "NONE",
          status: (editingSection.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
        });
      } else {
        reset({
          name: "",
          roomNumber: "",
          capacity: 40,
          classTeacherId: "NONE",
          status: "ACTIVE",
        });
      }
    }
  }, [open, editingSection, reset]);

  const onSubmit = async (data: SectionFormValues) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        classId,
        name: data.name.trim(),
        roomNumber: data.roomNumber?.trim() || null,
        capacity: Number(data.capacity),
        classTeacherId: data.classTeacherId && data.classTeacherId !== "NONE" ? data.classTeacherId : null,
        status: data.status,
      };

      if (isEditing && editingSection) {
        await updateSectionApi(editingSection.uuid, payload);
        toast.success(`Section "${data.name}" updated successfully`);
      } else {
        await createSectionApi(payload);
        toast.success(`Section "${data.name}" created successfully`);
      }

      onOpenChange(false);
      onSuccess?.();
      window.dispatchEvent(new Event("sections:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save section";
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DoorClosed className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Section" : "Add Section"}
              </DialogTitle>
              <DialogDescription>
                {className ? `For ${className} • ` : ""}Configure section name, capacity, and teacher.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Section Name / Identifier <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. A, B, C or Blue, Red"
              className={errors.name ? "border-rose-500" : ""}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Room Number</label>
              <Input {...register("roomNumber")} placeholder="e.g. Room 104" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Capacity <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                className={errors.capacity ? "border-rose-500" : ""}
              />
              {errors.capacity && <p className="text-[11px] text-rose-500 mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Class Teacher (Optional)</label>
            <Select
              value={classTeacherId || "NONE"}
              onValueChange={(val) => setValue("classTeacherId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class teacher" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                <SelectItem value="NONE">No Teacher Assigned</SelectItem>
                {loadingTeachers && <SelectItem value="loading" disabled>Loading teachers...</SelectItem>}
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
            <Select value={status} onValueChange={(val: "ACTIVE" | "INACTIVE") => setValue("status", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} variant="gradient">
              {submitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Section" : "Create Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
