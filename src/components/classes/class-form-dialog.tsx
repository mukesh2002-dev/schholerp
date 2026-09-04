"use client";

import React, { useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
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
import { SCHOOL_BOARDS, MEDIUMS_OF_INSTRUCTION } from "@/lib/india";

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const classSchema = z.object({
  name: z.string().min(1, "Class name is required (e.g. Grade 10)"),
  gradeLevel: z.number().min(1).max(12),
  category: z.string().min(1),
  branchId: z.string().min(1),
  board: z.string().min(1, "Select board"),
  medium: z.string().min(1, "Select medium"),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  description: z.string().optional(),
  sectionName: z.string().min(1),
  roomNumber: z.string().min(1),
  classTeacherId: z.string().min(1),
});

type ClassFormValues = z.infer<typeof classSchema>;

export function ClassFormDialog({ open, onOpenChange, onSuccess }: ClassFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [teachers] = React.useState(() => mockDb.getTeachers());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      gradeLevel: 10,
      category: "High School",
      branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
      board: "CBSE",
      medium: "English",
      capacity: 120,
      description: "",
      sectionName: "Section A",
      roomNumber: "Room 101",
      classTeacherId: teachers[0]?.id || "tch-01",
    },
  });

  const category = watch("category");
  const branchId = watch("branchId");
  const board = watch("board");
  const medium = watch("medium");
  const classTeacherId = watch("classTeacherId");

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        gradeLevel: 10,
        category: "High School",
        branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
        board: "CBSE",
        medium: "English",
        capacity: 120,
        description: "",
        sectionName: "Section A",
        roomNumber: "Room 101",
        classTeacherId: teachers[0]?.id || "tch-01",
      });
    }
  }, [open, activeBranchId, reset, teachers]);

  const onSubmit = (data: ClassFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];
    const assignedTeacher = teachers.find((t) => t.id === data.classTeacherId) || teachers[0];

    const classPayload: Omit<ClassRoom, "id"> = {
      name: data.name,
      gradeLevel: Number(data.gradeLevel),
      category: data.category as ClassRoom["category"],
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      totalStudents: 32,
      capacity: Number(data.capacity),
      description: data.description || `${data.name} academic curriculum and subject tracks.`,
      sections: [
        {
          id: `sec-${Date.now().toString(36)}`,
          name: data.sectionName,
          roomNumber: data.roomNumber,
          classTeacherId: assignedTeacher?.id || "tch-01",
          classTeacherName: assignedTeacher?.fullName || "Assigned Teacher",
          studentCount: 32,
          capacity: Math.round(Number(data.capacity) / 3),
        },
      ],
      subjects: [
        { id: "sub-gen-1", name: "Mathematics", code: "MATH-CR", teacherId: assignedTeacher?.id || "tch-01", teacherName: assignedTeacher?.fullName || "Lead Faculty", weeklyPeriods: 6 },
        { id: "sub-gen-2", name: "English", code: "ENG-CR", teacherId: assignedTeacher?.id || "tch-01", teacherName: assignedTeacher?.fullName || "Lead Faculty", weeklyPeriods: 5 },
      ],
    };

    setTimeout(() => {
      mockDb.saveClass(classPayload);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
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
              <DialogTitle className="text-xl font-bold">Add Academic Class / Grade</DialogTitle>
              <DialogDescription>
                Define a new grade level, capacity quota, and initial section.
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
              <label className="text-xs font-medium text-foreground mb-1 block">Board</label>
              <Select value={board} onValueChange={(val) => setValue("board", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Board" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_BOARDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Medium</label>
              <Select value={medium} onValueChange={(val) => setValue("medium", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Medium" />
                </SelectTrigger>
                <SelectContent>
                  {MEDIUMS_OF_INSTRUCTION.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Campus Branch</label>
              <Select value={branchId} onValueChange={(val) => setValue("branchId", val)}>
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

          {/* Initial Section Assignment */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-3">
            <span className="text-xs font-semibold text-foreground block">Initial Section & Class Teacher</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-0.5">Section Name</label>
                <Input
                  {...register("sectionName")}
                  placeholder="Section A"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-0.5">Room Number</label>
                <Input
                  {...register("roomNumber")}
                  placeholder="Room 101"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-0.5">Assigned Class Teacher</label>
              <Select value={classTeacherId} onValueChange={(val) => setValue("classTeacherId", val)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName} ({t.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" disabled={isSubmitting} variant="gradient">
              {isSubmitting ? "Creating..." : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
