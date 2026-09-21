"use client";

import React, { useEffect, useRef } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { ClassRoom, Subject } from "@/types";
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
import { fetchClasses, createSubjectApi, updateSubjectApi } from "@/lib/api/classes";
import { fetchStaffDirectory } from "@/lib/api/hr";
import { ApiError } from "@/lib/api/client";

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialClassId?: string;
  editingSubject?: (Subject & { classId: string }) | null;
}

interface TeacherOption {
  id: string;
  fullName: string;
  department: string;
}

const schema = z.object({
  classId: z.string().min(1, "Select class"),
  name: z.string().min(2, "Subject name required"),
  code: z.string().min(2, "Code required"),
  teacherId: z.string().min(1, "Select teacher"),
  weeklyPeriods: z.coerce.number().min(1).max(60),
  credits: z.coerce.number().min(0).max(20).optional(),
  description: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function SubjectFormDialog({ open, onOpenChange, onSuccess, initialClassId, editingSubject }: SubjectFormDialogProps) {
  const { activeBranchId } = useERP();
  const [classes, setClasses] = React.useState<ClassRoom[]>([]);
  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const cls = await fetchClasses({ campusId: activeBranchId });
        if (!cancelled) setClasses(cls);
      } catch {
        // keep empty list — form stays usable with no preselect
      }
      try {
        const dir = await fetchStaffDirectory({ campusId: activeBranchId, role: "teacher" });
        if (!cancelled) {
          setTeachers(
            dir.data.map((u) => ({
              id: u.uuid,
              fullName: u.name,
              department: "Teaching Staff",
            }))
          );
        }
      } catch {
        // offline: teacher dropdown will just be empty
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, activeBranchId]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      classId: initialClassId || classes[0]?.id || "",
      name: "",
      code: "",
      teacherId: "",
      weeklyPeriods: 4,
      credits: 4,
      description: "",
    },
  });

  const classId = watch("classId");
  const teacherId = watch("teacherId");

  // Keep the latest values readable from the reset effect without putting the
  // arrays in its deps (that caused "Maximum update depth exceeded" loops).
  const classesRef = useRef(classes);
  classesRef.current = classes;
  const teachersRef = useRef(teachers);
  teachersRef.current = teachers;

  useEffect(() => {
    if (!open) return;
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
        classId: initialClassId || classesRef.current[0]?.id || "",
        name: "",
        code: "",
        teacherId: teachersRef.current[0]?.id || "",
        weeklyPeriods: 4,
        credits: 4,
        description: "",
      });
    }
  }, [open, editingSubject, initialClassId, reset]);

  const onSubmit = async (data: Values) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        teacherId: data.teacherId,
        weeklyPeriods: Number(data.weeklyPeriods),
        credits: data.credits ? Number(data.credits) : undefined,
        description: data.description?.trim() || null,
      };
      if (editingSubject) {
        await updateSubjectApi(editingSubject.id, payload);
        toast.success(`Subject "${data.name}" updated`);
      } else {
        await createSubjectApi({ ...payload, classId: data.classId, campusId: activeBranchId }, activeBranchId);
        const className = classes.find((c) => c.id === data.classId)?.name ?? "this class";
        toast.success(`Subject "${data.name}" added to ${className}`);
      }
      onOpenChange(false);
      onSuccess?.();
      window.dispatchEvent(new Event("subjects:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save subject. Try again.");
    } finally {
      setSubmitting(false);
    }
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
            <Select value={classId} onValueChange={(v) => setValue("classId", v)} disabled={!!editingSubject || loading}>
              <SelectTrigger className={errors.classId ? "border-rose-500" : ""}><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                {loading && <SelectItem value="" disabled>Loading classes…</SelectItem>}
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} — {c.branchName} ({c.subjects.length} subs)</SelectItem>)}
              </SelectContent>
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
              <SelectContent>
                {loading && <SelectItem value="" disabled>Loading teachers…</SelectItem>}
                {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName} — {t.department}</SelectItem>)}
              </SelectContent>
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
            <Button type="submit" disabled={submitting} variant="gradient">{submitting ? "Saving..." : editingSubject ? "Update Subject" : "Add Subject"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}