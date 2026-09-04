"use client";

import React, { useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Teacher, TeacherStatus } from "@/types";
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
import { Users } from "lucide-react";

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherToEdit?: Teacher | null;
  onSuccess?: () => void;
}

const departmentsList = [
  "Mathematics & Computing",
  "Science & Technology",
  "Humanities & Languages",
  "Computer Science & AI",
  "Early Childhood (Toddler & Primary)",
  "International Baccalaureate (IB)",
  "Visual Arts & Digital Design",
  "Physical Education & Sports",
];

const teacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().optional(),
  gender: z.string().min(1),
  dateOfBirth: z.string().min(1),
  qualification: z.string().optional(),
  joiningDate: z.string().min(1),
  branchId: z.string().min(1),
  department: z.string().min(1),
  designation: z.string().optional(),
  status: z.string().min(1),
  subjectsString: z.string().optional(),
  experienceYears: z.number().min(0),
  baseSalary: z.number().min(0),
  allowances: z.number().min(0),
  bio: z.string().optional(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

export function TeacherFormDialog({
  open,
  onOpenChange,
  teacherToEdit,
  onSuccess,
}: TeacherFormDialogProps) {
  const { branches, activeBranchId } = useERP();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "Female",
      dateOfBirth: "1985-05-20",
      qualification: "",
      joiningDate: "2020-08-01",
      branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
      department: "Mathematics & Computing",
      designation: "Senior Subject Teacher",
      status: "ACTIVE",
      subjectsString: "Mathematics, AP Calculus, Statistics",
      experienceYears: 8,
      baseSalary: 6500,
      allowances: 1000,
      bio: "",
    },
  });

  const gender = watch("gender");
  const branchId = watch("branchId");
  const department = watch("department");
  const status = watch("status");

  useEffect(() => {
    if (open) {
      if (teacherToEdit) {
        reset({
          firstName: teacherToEdit.firstName,
          lastName: teacherToEdit.lastName,
          email: teacherToEdit.email,
          phone: teacherToEdit.phone,
          gender: teacherToEdit.gender,
          dateOfBirth: teacherToEdit.dateOfBirth,
          qualification: teacherToEdit.qualification,
          joiningDate: teacherToEdit.joiningDate,
          branchId: teacherToEdit.branchId,
          department: teacherToEdit.department,
          designation: teacherToEdit.designation,
          status: teacherToEdit.status,
          subjectsString: teacherToEdit.subjectsTaught.join(", "),
          experienceYears: teacherToEdit.experienceYears,
          baseSalary: teacherToEdit.salarySummary.baseSalary,
          allowances: teacherToEdit.salarySummary.allowances,
          bio: teacherToEdit.bio || "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "Female",
          dateOfBirth: "1988-04-12",
          qualification: "M.Sc. Mathematics, B.Ed.",
          joiningDate: new Date().toISOString().split("T")[0],
          branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
          department: "Mathematics & Computing",
          designation: "Senior Mathematics Educator",
          status: "ACTIVE",
          subjectsString: "Mathematics, Algebra, Calculus",
          experienceYears: 6,
          baseSalary: 6200,
          allowances: 1000,
          bio: "",
        });
      }
    }
  }, [teacherToEdit, open, activeBranchId, reset]);

  const onSubmit = (data: TeacherFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];
    const subjects = (data.subjectsString || "").split(",").map((s) => s.trim()).filter(Boolean);

    const teacherPayload: Omit<Teacher, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      ...(teacherToEdit?.id ? { id: teacherToEdit.id } : {}),
      employeeId: teacherToEdit?.employeeId || `TCH-${Math.floor(Math.random() * 800) + 100}`,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      avatar: teacherToEdit?.avatar || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`,
      email: data.email,
      phone: data.phone || "+1 (555) 234-9988",
      gender: data.gender as "Male" | "Female" | "Other",
      dateOfBirth: data.dateOfBirth,
      qualification: data.qualification || "",
      joiningDate: data.joiningDate,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      department: data.department,
      designation: data.designation || "",
      status: data.status as TeacherStatus,
      subjectsTaught: subjects.length > 0 ? subjects : ["General Studies"],
      assignedClasses: teacherToEdit?.assignedClasses || [
        { classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A", subjectName: subjects[0] || "Math", weeklyPeriods: 6 },
      ],
      attendanceRate: teacherToEdit?.attendanceRate || 98.0,
      leaveSummary: teacherToEdit?.leaveSummary || {
        totalAllowed: 24,
        used: 2,
        balance: 22,
        casualLeaves: 1,
        medicalLeaves: 1,
      },
      salarySummary: {
        baseSalary: Number(data.baseSalary),
        allowances: Number(data.allowances),
        grossSalary: Number(data.baseSalary) + Number(data.allowances),
        paymentStatus: "PAID",
        lastDisbursedDate: "2026-08-31",
      },
      bio: data.bio || "",
      experienceYears: Number(data.experienceYears),
    };

    setTimeout(() => {
      mockDb.saveTeacher(teacherPayload);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {teacherToEdit ? `Edit Faculty: ${teacherToEdit.fullName}` : "Add Faculty Instructor"}
              </DialogTitle>
              <DialogDescription>
                Record teacher credentials, department assignment, subject specializations, and payroll base.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                First Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("firstName")}
                placeholder="e.g. Sarah"
                className={errors.firstName ? "border-rose-500" : ""}
              />
              {errors.firstName && <p className="text-[11px] text-rose-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("lastName")}
                placeholder="e.g. Lin"
                className={errors.lastName ? "border-rose-500" : ""}
              />
              {errors.lastName && <p className="text-[11px] text-rose-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                {...register("email")}
                placeholder="teacher@campus.edu"
                className={errors.email ? "border-rose-500" : ""}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
              <Input
                {...register("phone")}
                placeholder="+1 (555) 234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="text-xs font-medium text-foreground mb-1 block">Department</label>
              <Select value={department} onValueChange={(val) => setValue("department", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
              <Select value={status} onValueChange={(val) => setValue("status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active Faculty</SelectItem>
                  <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                  <SelectItem value="PROBATION">Probation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Designation / Title</label>
              <Input
                {...register("designation")}
                placeholder="e.g. Senior AP Physics Instructor"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Qualifications</label>
              <Input
                {...register("qualification")}
                placeholder="e.g. Ph.D. Physics, M.Ed."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Subjects Taught (Comma-separated)
            </label>
            <Input
              {...register("subjectsString")}
              placeholder="e.g. AP Calculus, Linear Algebra, Grade 10 Math"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Experience (Years)</label>
              <Input
                type="number"
                {...register("experienceYears", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Monthly Base ($)</label>
              <Input
                type="number"
                {...register("baseSalary", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Allowances ($)</label>
              <Input
                type="number"
                {...register("allowances", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Professional Bio & Notes</label>
            <Textarea
              {...register("bio")}
              placeholder="Research background, publications, Olympiad mentoring..."
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="gradient">
              {isSubmitting ? "Saving..." : teacherToEdit ? "Update Faculty" : "Register Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
