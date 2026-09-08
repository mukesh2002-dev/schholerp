"use client";

import React, { useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Subject } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers } from "lucide-react";
import { toast } from "sonner";

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialClassId?: string;
  editingSubject?: (Subject & { classId: string }) | null;
}

const schema = z.object({
  classId: z.string().min(1, "Select class"),
  name: z.string().min(2, "Subject name required"),
  code: z.string().min(2, "Code required"),
  teacherId: z.string().min(1, "Select teacher"),
  weeklyPeriods: z.coerce.number().min(1).max(20),
  credits: z.coerce.number().min(0).max(10).optional(),
  description: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function SubjectFormDialog({ open, onOpenChange, onSuccess, initialClassId, editingSubject }: SubjectFormDialogProps) {
  const { activeBranchId } = useERP();
  const classes = mockDb.getClasses(activeBranchId);
  const teachers = mockDb.getTeachers(activeBranchId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: initialClassId || classes[0]?.id || "",
      name: "",
      code: "",
      teacherId: teachers[0]?.id || "",
      weeklyPeriods: 4,
      credits: 4,
      description: "",
    },
  });

  const classId = watch("classId");
  const teacherId = watch("teacherId");

  useEffect(() => {
    if (open) {
      if (editingSubject) {
        reset({
          classId: editingSubject.classId,
          name: editingSubject.name,
          code: editingSubject.code,
          teacherId: editingSubject.teacherId,
          weeklyPeriods: editingSubject.weeklyPeriods,
          credits: editingSubject.credits ?? 4,
          description: editingSubject.description || "",
        });
      } else {
        reset({
          classId: initialClassId || classes[0]?.id || "",
          name: "",
          code: "",
          teacherId: teachers[0]?.id || "",
          weeklyPeriods: 4,
          credits: 4,
          description: "",
        });
      }
    }
  }, [open, editingSubject, initialClassId, classes, teachers, reset]);

  const onSubmit = (data: Values) => {
    const teacher = teachers.find((t) => t.id === data.teacherId);
    if (!teacher) { toast.error("Teacher not found"); return; }
    const payload: Omit<Subject, "id"> & { id?: string } = {
      id: editingSubject?.id,
      name: data.name,
      code: data.code.toUpperCase(),
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      weeklyPeriods: Number(data.weeklyPeriods),
      credits: data.credits ? Number(data.credits) : undefined,
      description: data.description,
      topics: editingSubject?.topics || [],
    };
    const res = mockDb.saveSubject(data.classId, payload as any);
    if (!res) { toast.error("Class not found"); return; }
    toast.success(editingSubject ? `Subject "${data.name}" updated` : `Subject "${data.name}" added to ${classes.find((c) => c.id === data.classId)?.name}`);
    onOpenChange(false);
    onSuccess?.();
    window.dispatchEvent(new Event("subjects:refresh"));
    window.dispatchEvent(new Event("classes:refresh"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{editingSubject ? "Edit Subject" : "Add Subject"}</DialogTitle>
              <DialogDescription>Class-wise subject — editable. Topics managed separately.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium mb-1 block">Class *</label>
            <Select value={classId} onValueChange={(v) => setValue("classId", v)} disabled={!!editingSubject}>
              <SelectTrigger className={errors.classId ? "border-rose-500" : ""}><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} — {c.branchName} ({c.subjects.length} subs)</SelectItem>)}</SelectContent>
            </Select>
            {errors.classId && <p className="text-[11px] text-rose-500">{errors.classId.message}</p>}
            {editingSubject && <p className="text-[11px] text-muted-foreground">Class cannot be changed while editing — delete & re-add to move.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Subject Name *</label>
              <Input {...register("name")} placeholder="e.g. Mathematics" className={errors.name ? "border-rose-500" : ""} />
              {errors.name && <p className="text-[11px] text-rose-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Code *</label>
              <Input {...register("code")} placeholder="MATH-10" className={errors.code ? "border-rose-500" : ""} />
              {errors.code && <p className="text-[11px] text-rose-500">{errors.code.message}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Teacher *</label>
            <Select value={teacherId} onValueChange={(v) => setValue("teacherId", v)}>
              <SelectTrigger className={errors.teacherId ? "border-rose-500" : ""}><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName} — {t.department}</SelectItem>)}</SelectContent>
            </Select>
            {errors.teacherId && <p className="text-[11px] text-rose-500">{errors.teacherId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium mb-1 block">Weekly Periods</label><Input type="number" {...register("weeklyPeriods")} /></div>
            <div><label className="text-xs font-medium mb-1 block">Credits</label><Input type="number" {...register("credits")} /></div>
          </div>
          <div><label className="text-xs font-medium mb-1 block">Description</label><Textarea {...register("description")} rows={2} placeholder="Optional — syllabus brief" /></div>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} variant="gradient">{editingSubject ? "Update Subject" : "Add Subject"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
