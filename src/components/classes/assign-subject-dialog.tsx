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
import { fetchSubjects } from "@/lib/api/classes";
import { createClassSubjectApi } from "@/lib/api/classSubjects";
import { fetchTeachers } from "@/lib/api/teachers";
import { apiFetch } from "@/lib/api/client";
import { useERP } from "@/components/providers/erp-provider";
import { ApiError } from "@/lib/api/client";
import { Layers } from "lucide-react";

const assignSchema = z.object({
  subjectId: z.string().min(1, "Subject selection is required"),
  teacherId: z.string().optional(),
  academicYearId: z.string().optional(),
  maxMarks: z.coerce.number().min(1).default(100),
  passingMarks: z.coerce.number().min(0).default(33),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

type AssignFormValues = z.infer<typeof assignSchema>;

interface AssignSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className?: string;
  onSuccess?: () => void;
}

export function AssignSubjectDialog({
  open,
  onOpenChange,
  classId,
  className,
  onSuccess,
}: AssignSubjectDialogProps) {
  const { activeBranchId } = useERP();
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [academicYears, setAcademicYears] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      subjectId: "",
      teacherId: "NONE",
      academicYearId: "NONE",
      maxMarks: 100,
      passingMarks: 33,
      status: "ACTIVE",
    },
  });

  const subjectId = watch("subjectId");
  const teacherId = watch("teacherId");
  const academicYearId = watch("academicYearId");
  const status = watch("status");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const effectiveCid = activeBranchId && activeBranchId !== "all" ? activeBranchId : undefined;
    Promise.all([
      fetchSubjects({ campusId: effectiveCid, limit: 500 }).catch((e) => {
        console.error("fetchSubjects error in AssignSubjectDialog:", e);
        return [];
      }),
      fetchTeachers({ campusId: effectiveCid, limit: 100 }).catch(() => ({ data: [] as any, total: 0 })),
      apiFetch<{ data: any[] }>("/academics/academic-years").catch(() => ({ data: [] })),
    ]).then(([subs, staffRes, ayRes]) => {
      if (!cancelled) {
        const rawSubs = subs || [];
        const seen = new Set<string>();
        const uniqueSubs: any[] = [];
        // Prioritize master subjects (classId is null or empty) and sort alphabetically
        const sorted = [...rawSubs].sort((a, b) => {
          const aMaster = !a.classId || a.classId === "";
          const bMaster = !b.classId || b.classId === "";
          if (aMaster && !bMaster) return -1;
          if (!aMaster && bMaster) return 1;
          return (a.name || "").localeCompare(b.name || "");
        });
        for (const s of sorted) {
          const key = (s.name || "").trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSubs.push(s);
          }
        }
        setSubjects(uniqueSubs);
        setTeachers(staffRes?.data ? staffRes.data.map((u: any) => ({ id: u.id || u.uuid, name: u.fullName || u.name })) : []);
        setAcademicYears(ayRes?.data ? ayRes.data.map((y: any) => ({ id: y.uuid || y.id, name: y.name })) : []);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open, activeBranchId]);

  useEffect(() => {
    if (open) {
      reset({
        subjectId: "",
        teacherId: "NONE",
        academicYearId: "NONE",
        maxMarks: 100,
        passingMarks: 33,
        status: "ACTIVE",
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: AssignFormValues) => {
    setSubmitting(true);
    try {
      await createClassSubjectApi({
        classId,
        subjectId: data.subjectId,
        teacherId: data.teacherId && data.teacherId !== "NONE" ? data.teacherId : null,
        academicYearId: data.academicYearId && data.academicYearId !== "NONE" ? data.academicYearId : null,
        maxMarks: Number(data.maxMarks),
        passingMarks: Number(data.passingMarks),
        status: data.status,
      });

      toast.success("Subject assigned to class successfully");
      onOpenChange(false);
      onSuccess?.();
      window.dispatchEvent(new Event("class-subjects:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to assign subject";
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
              <DialogTitle className="text-xl font-bold">Assign Subject to Class</DialogTitle>
              <DialogDescription>
                {className ? `For ${className} • ` : ""}Select a master subject and assign a subject teacher.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Master Subject <span className="text-rose-500">*</span>
            </label>
            <Select value={subjectId} onValueChange={(val) => setValue("subjectId", val)}>
              <SelectTrigger className={errors.subjectId ? "border-rose-500" : ""}>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                {loading && <SelectItem value="loading" disabled>Loading subjects...</SelectItem>}
                {!loading && subjects.length === 0 && (
                  <SelectItem value="empty" disabled>No subjects available</SelectItem>
                )}
                {subjects.map((s) => (
                  <SelectItem key={s.id || s.uuid} value={s.id || s.uuid}>
                    {s.name} {s.code ? `(${s.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subjectId && <p className="text-[11px] text-rose-500 mt-1">{errors.subjectId.message}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Subject Teacher (Optional)</label>
            <Select value={teacherId || "NONE"} onValueChange={(val) => setValue("teacherId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                <SelectItem value="NONE">No Teacher Assigned</SelectItem>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Academic Year (Optional)</label>
            <Select value={academicYearId || "NONE"} onValueChange={(val) => setValue("academicYearId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent className="max-h-[50vh]">
                <SelectItem value="NONE">Default / Current Year</SelectItem>
                {academicYears.map((ay) => (
                  <SelectItem key={ay.id} value={ay.id}>
                    {ay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {submitting ? "Assigning..." : "Assign Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
