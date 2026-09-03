"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ClassRoom } from "@/types";
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

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClassFormDialog({ open, onOpenChange, onSuccess }: ClassFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [teachers] = useState(() => mockDb.getTeachers());

  const [formData, setFormData] = useState({
    name: "",
    gradeLevel: 10,
    category: "High School" as ClassRoom["category"],
    branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
    capacity: 120,
    description: "",
    sectionName: "Section A",
    roomNumber: "Room 101",
    classTeacherId: teachers[0]?.id || "tch-01",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Class name is required (e.g. Grade 10)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const targetBranch = branches.find((b) => b.id === formData.branchId) || branches[0];
    const assignedTeacher = teachers.find((t) => t.id === formData.classTeacherId) || teachers[0];

    const classPayload: Omit<ClassRoom, "id"> = {
      name: formData.name,
      gradeLevel: Number(formData.gradeLevel),
      category: formData.category,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      totalStudents: 32,
      capacity: Number(formData.capacity),
      description: formData.description || `${formData.name} academic curriculum and subject tracks.`,
      sections: [
        {
          id: `sec-${Date.now().toString(36)}`,
          name: formData.sectionName,
          roomNumber: formData.roomNumber,
          classTeacherId: assignedTeacher?.id || "tch-01",
          classTeacherName: assignedTeacher?.fullName || "Assigned Teacher",
          studentCount: 32,
          capacity: Math.round(Number(formData.capacity) / 3),
        },
      ],
      subjects: [
        { id: "sub-gen-1", name: "Core Mathematics", code: "MATH-CR", teacherId: assignedTeacher?.id || "tch-01", teacherName: assignedTeacher?.fullName || "Lead Faculty", weeklyPeriods: 6 },
        { id: "sub-gen-2", name: "Language & Literature", code: "LANG-CR", teacherId: assignedTeacher?.id || "tch-01", teacherName: assignedTeacher?.fullName || "Lead Faculty", weeklyPeriods: 5 },
      ],
    };

    setTimeout(() => {
      mockDb.saveClass(classPayload);
      setIsSubmitting(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
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

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Class / Grade Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Grade 10 or Kindergarten Prep"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Grade Level (Numeric)</label>
              <Input
                type="number"
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(val: any) => setFormData({ ...formData, category: val })}
              >
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
              <Select
                value={formData.branchId}
                onValueChange={(val) => setFormData({ ...formData, branchId: val })}
              >
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
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Initial Section Assignment */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-3">
            <span className="text-xs font-semibold text-foreground block">Initial Section & Class Teacher</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-0.5">Section Name</label>
                <Input
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="Section A"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-0.5">Room Number</label>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="Room 101"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground block mb-0.5">Assigned Class Teacher</label>
              <Select
                value={formData.classTeacherId}
                onValueChange={(val) => setFormData({ ...formData, classTeacherId: val })}
              >
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Curriculum track, honors requirements, AP course offerings..."
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
