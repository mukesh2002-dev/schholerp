"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Teacher, TeacherStatus } from "@/types";
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
import { Users, Sparkles } from "lucide-react";

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

export function TeacherFormDialog({
  open,
  onOpenChange,
  teacherToEdit,
  onSuccess,
}: TeacherFormDialogProps) {
  const { branches, activeBranchId } = useERP();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Female" as "Male" | "Female" | "Other",
    dateOfBirth: "1985-05-20",
    qualification: "",
    joiningDate: "2020-08-01",
    branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
    department: "Mathematics & Computing",
    designation: "Senior Subject Teacher",
    status: "ACTIVE" as TeacherStatus,
    subjectsString: "Mathematics, AP Calculus, Statistics",
    experienceYears: 8,
    baseSalary: 6500,
    allowances: 1000,
    bio: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherToEdit) {
      setFormData({
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
      setFormData({
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
  }, [teacherToEdit, open, activeBranchId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError("Name and email are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const targetBranch = branches.find((b) => b.id === formData.branchId) || branches[0];
    const subjects = formData.subjectsString.split(",").map((s) => s.trim()).filter(Boolean);

    const teacherPayload: Omit<Teacher, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      ...(teacherToEdit?.id ? { id: teacherToEdit.id } : {}),
      employeeId: teacherToEdit?.employeeId || `TCH-${Math.floor(Math.random() * 800) + 100}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      avatar: teacherToEdit?.avatar || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`,
      email: formData.email,
      phone: formData.phone || "+1 (555) 234-9988",
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      qualification: formData.qualification,
      joiningDate: formData.joiningDate,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      department: formData.department,
      designation: formData.designation,
      status: formData.status,
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
        baseSalary: Number(formData.baseSalary),
        allowances: Number(formData.allowances),
        grossSalary: Number(formData.baseSalary) + Number(formData.allowances),
        paymentStatus: "PAID",
        lastDisbursedDate: "2026-08-31",
      },
      bio: formData.bio,
      experienceYears: Number(formData.experienceYears),
    };

    setTimeout(() => {
      mockDb.saveTeacher(teacherPayload);
      setIsSubmitting(false);
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

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                First Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Sarah"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Lin"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@campus.edu"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 234-5678"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="text-xs font-medium text-foreground mb-1 block">Department</label>
              <Select
                value={formData.department}
                onValueChange={(val) => setFormData({ ...formData, department: val })}
              >
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
              <Select
                value={formData.status}
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
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
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Senior AP Physics Instructor"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Qualifications</label>
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. Ph.D. Physics, M.Ed."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Subjects Taught (Comma-separated)
            </label>
            <Input
              value={formData.subjectsString}
              onChange={(e) => setFormData({ ...formData, subjectsString: e.target.value })}
              placeholder="e.g. AP Calculus, Linear Algebra, Grade 10 Math"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Experience (Years)</label>
              <Input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Monthly Base ($)</label>
              <Input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Allowances ($)</label>
              <Input
                type="number"
                value={formData.allowances}
                onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Professional Bio & Notes</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
