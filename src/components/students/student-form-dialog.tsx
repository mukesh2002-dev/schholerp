"use client";

import React, { useEffect, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Student, StudentStatus } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import {
  SOCIAL_CATEGORIES,
  RELIGIONS,
  MOTHER_TONGUES,
  SCHOOL_BOARDS,
  MEDIUMS_OF_INSTRUCTION,
  SCHOOL_HOUSES,
  INDIAN_STATES,
  DEMO_OCCUPATIONS,
  INDIAN_MOBILE_REGEX,
  normaliseIndianMobile,
  isValidAadhaar,
} from "@/lib/india";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentToEdit?: Student | null;
  onSuccess?: () => void;
}

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1),
  dateOfBirth: z.string().min(1),
  bloodGroup: z.string().min(1),
  branchId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().min(1),
  status: z.string().min(1),
  category: z.string().min(1, "Select social category"),
  religion: z.string().min(1),
  motherTongue: z.string().min(1),
  board: z.string().min(1),
  medium: z.string().min(1),
  house: z.string().optional(),
  aadhaarNumber: z
    .string()
    .optional()
    .refine((v) => !v || isValidAadhaar(v), "Enter a valid 12-digit Aadhaar number"),
  rteAdmission: z.boolean().optional(),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianRelation: z.string().min(1),
  guardianEmail: z.string().min(1, "Guardian email is required").email("Invalid email"),
  guardianPhone: z
    .string()
    .optional()
    .refine(
      (v) => !v || INDIAN_MOBILE_REGEX.test(normaliseIndianMobile(v)),
      "Enter a valid 10-digit mobile number"
    ),
  guardianOccupation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  emergencyContact: z
    .string()
    .optional()
    .refine(
      (v) => !v || INDIAN_MOBILE_REGEX.test(normaliseIndianMobile(v)),
      "Enter a valid 10-digit mobile number"
    ),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function StudentFormDialog({
  open,
  onOpenChange,
  studentToEdit,
  onSuccess,
}: StudentFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [classes, setClasses] = useState(() => mockDb.getClasses());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "Male",
      dateOfBirth: "2010-06-15",
      bloodGroup: "O+",
      branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
      classId: "cls-g10",
      sectionId: "sec-g10-a",
      status: "ACTIVE",
      category: "General",
      religion: "Hindu",
      motherTongue: "Hindi",
      board: "CBSE",
      medium: "English",
      house: "Agni",
      aadhaarNumber: "",
      rteAdmission: false,
      guardianName: "",
      guardianRelation: "Father",
      guardianEmail: "",
      guardianPhone: "",
      guardianOccupation: "",
      address: "",
      city: "Pune",
      state: "Maharashtra",
      emergencyContact: "",
    },
  });

  const gender = watch("gender");
  const bloodGroup = watch("bloodGroup");
  const branchId = watch("branchId");
  const classId = watch("classId");
  const sectionId = watch("sectionId");
  const status = watch("status");
  const guardianRelation = watch("guardianRelation");
  const category = watch("category");
  const religion = watch("religion");
  const motherTongue = watch("motherTongue");
  const board = watch("board");
  const medium = watch("medium");
  const house = watch("house");
  const guardianOccupation = watch("guardianOccupation");
  const state = watch("state");

  const selectedClass = classes.find((c) => c.id === classId) || classes[0];

  useEffect(() => {
    const loadedClasses = mockDb.getClasses();
    setClasses(loadedClasses);
    if (open) {
      if (studentToEdit) {
        reset({
          firstName: studentToEdit.firstName,
          lastName: studentToEdit.lastName,
          gender: studentToEdit.gender,
          dateOfBirth: studentToEdit.dateOfBirth,
          bloodGroup: studentToEdit.bloodGroup,
          branchId: studentToEdit.branchId,
          classId: studentToEdit.classId,
          sectionId: studentToEdit.sectionId,
          status: studentToEdit.status,
          category: studentToEdit.category || "General",
          religion: studentToEdit.religion || "Hindu",
          motherTongue: studentToEdit.motherTongue || "Hindi",
          board: studentToEdit.board || "CBSE",
          medium: studentToEdit.medium || "English",
          house: studentToEdit.house || "Agni",
          aadhaarNumber: studentToEdit.aadhaarNumber || "",
          rteAdmission: studentToEdit.rteAdmission || false,
          guardianName: studentToEdit.guardian.name,
          guardianRelation: studentToEdit.guardian.relation,
          guardianEmail: studentToEdit.guardian.email,
          guardianPhone: studentToEdit.guardian.phone,
          guardianOccupation: studentToEdit.guardian.occupation,
          address: studentToEdit.address,
          city: studentToEdit.city,
          state: studentToEdit.state,
          emergencyContact: studentToEdit.guardian.emergencyContact,
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          gender: "Male",
          dateOfBirth: "2010-06-15",
          bloodGroup: "O+",
          branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
          classId: loadedClasses[0]?.id || "cls-g10",
          sectionId: loadedClasses[0]?.sections[0]?.id || "sec-g10-a",
          status: "ACTIVE",
          category: "General",
          religion: "Hindu",
          motherTongue: "Hindi",
          board: "CBSE",
          medium: "English",
          house: "Agni",
          aadhaarNumber: "",
          rteAdmission: false,
          guardianName: "",
          guardianRelation: "Father",
          guardianEmail: "",
          guardianPhone: "",
          guardianOccupation: "",
          address: "",
          city: "Pune",
          state: "Maharashtra",
          emergencyContact: "",
        });
      }
    }
  }, [studentToEdit, open, activeBranchId, reset]);

  const onSubmit = (data: StudentFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];
    const targetSection = selectedClass?.sections.find((s) => s.id === data.sectionId) || selectedClass?.sections[0];

    const studentPayload: Omit<Student, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      ...(studentToEdit?.id ? { id: studentToEdit.id } : {}),
      rollNumber: studentToEdit?.rollNumber || `STU-${Math.floor(Math.random() * 800) + 1050}`,
      admissionNumber: studentToEdit?.admissionNumber || `ADM-2026-${Math.floor(Math.random() * 800) + 200}`,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      avatar: studentToEdit?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as "Male" | "Female" | "Other",
      bloodGroup: data.bloodGroup,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      classId: selectedClass?.id || "cls-g10",
      className: selectedClass?.name || "Grade 10",
      sectionId: targetSection?.id || "sec-g10-a",
      sectionName: targetSection?.name || "Section A",
      admissionDate: studentToEdit?.admissionDate || new Date().toISOString().split("T")[0],
      status: data.status as StudentStatus,
      guardian: {
        name: data.guardianName,
        relation: data.guardianRelation as "Father" | "Mother" | "Guardian" | "Other",
        email: data.guardianEmail,
        phone: data.guardianPhone ? `+91 ${normaliseIndianMobile(data.guardianPhone)}` : "+91 98220 00000",
        occupation: data.guardianOccupation || "",
        address: data.address || "",
        emergencyContact: data.emergencyContact
          ? `+91 ${normaliseIndianMobile(data.emergencyContact)}`
          : data.guardianPhone
            ? `+91 ${normaliseIndianMobile(data.guardianPhone)}`
            : "",
      },
      attendanceSummary: studentToEdit?.attendanceSummary || {
        totalDays: 140,
        presentDays: 136,
        absentDays: 2,
        lateDays: 2,
        attendanceRate: 97.1,
      },
      feeSummary: studentToEdit?.feeSummary || {
        totalAssigned: 68000,
        totalPaid: 34000,
        totalPending: 34000,
        status: "PARTIAL",
      },
      academicHistory: studentToEdit?.academicHistory || [
        { term: "Term 1 - 2025-26", grade: "A2", gpa: 3.9, percentage: 94.5, rank: 3, remarks: "Excellent academic performance and participation." },
      ],
      documents: studentToEdit?.documents || [
        { id: "doc-std-1", name: "Birth_Certificate.pdf", type: "PDF", uploadedAt: "2026-08-10", verified: true, size: "1.2 MB" },
        { id: "doc-std-2", name: "Aadhaar_Card.pdf", type: "PDF", uploadedAt: "2026-08-10", verified: false, size: "0.8 MB" },
      ],
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      aadhaarNumber: data.aadhaarNumber?.replace(/[\s-]/g, "") || undefined,
      category: data.category,
      religion: data.religion,
      motherTongue: data.motherTongue,
      board: data.board,
      medium: data.medium,
      house: data.house || undefined,
      rteAdmission: data.rteAdmission || false,
    };

    setTimeout(() => {
      mockDb.saveStudent(studentPayload);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {studentToEdit ? `Edit Student: ${studentToEdit.fullName}` : "Register New Student"}
              </DialogTitle>
              <DialogDescription>
                Assign class, section, guardian information, and campus enrollment details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Section: Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("firstName")}
                  placeholder="e.g. Aarav"
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
                  placeholder="e.g. Sharma"
                  className={errors.lastName ? "border-rose-500" : ""}
                />
                {errors.lastName && <p className="text-[11px] text-rose-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Date of Birth</label>
                <Input
                  type="date"
                  {...register("dateOfBirth")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Gender</label>
                <Select value={gender} onValueChange={(val) => setValue("gender", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Blood Group</label>
                <Select value={bloodGroup} onValueChange={(val) => setValue("bloodGroup", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Indian Registry Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Indian Registry Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Social Category</label>
                <Select value={category} onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Religion</label>
                <Select value={religion} onValueChange={(val) => setValue("religion", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Mother Tongue</label>
                <Select value={motherTongue} onValueChange={(val) => setValue("motherTongue", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mother tongue" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOTHER_TONGUES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">House</label>
                <Select value={house} onValueChange={(val) => setValue("house", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="House" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_HOUSES.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Aadhaar Number (optional)</label>
                <Input
                  {...register("aadhaarNumber")}
                  placeholder="12-digit Aadhaar"
                  inputMode="numeric"
                  className={errors.aadhaarNumber ? "border-rose-500" : ""}
                />
                {errors.aadhaarNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.aadhaarNumber.message}</p>}
              </div>
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 cursor-pointer self-end text-xs">
                <input
                  type="checkbox"
                  checked={watch("rteAdmission") || false}
                  onChange={(e) => setValue("rteAdmission", e.target.checked)}
                  className="rounded text-primary"
                />
                <span>Admitted under <strong>RTE 25% quota</strong></span>
              </label>
            </div>
          </div>

          {/* Section: Academic Class & Campus Assignment */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Campus, Class & Section
            </h4>
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
                <label className="text-xs font-medium text-foreground mb-1 block">Class / Grade</label>
                <Select
                  value={classId}
                  onValueChange={(val) => {
                    const cl = classes.find((c) => c.id === val);
                    setValue("classId", val);
                    setValue("sectionId", cl?.sections[0]?.id || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Section</label>
                <Select value={sectionId} onValueChange={(val) => setValue("sectionId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass?.sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Enrollment Status</label>
              <Select value={status} onValueChange={(val) => setValue("status", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active (Enrolled)</SelectItem>
                  <SelectItem value="GRADUATED">Graduated Alumni</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section: Guardian Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Guardian Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Guardian Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("guardianName")}
                  placeholder="e.g. Ramesh Sharma"
                  className={errors.guardianName ? "border-rose-500" : ""}
                />
                {errors.guardianName && <p className="text-[11px] text-rose-500 mt-1">{errors.guardianName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Relationship</label>
                <Select value={guardianRelation} onValueChange={(val) => setValue("guardianRelation", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Relation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Legal Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Guardian Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  {...register("guardianEmail")}
                  placeholder="parent@email.com"
                  className={errors.guardianEmail ? "border-rose-500" : ""}
                />
                {errors.guardianEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.guardianEmail.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Guardian Mobile</label>
                <Input
                  {...register("guardianPhone")}
                  placeholder="98765 43210"
                  inputMode="numeric"
                  className={errors.guardianPhone ? "border-rose-500" : ""}
                />
                {errors.guardianPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.guardianPhone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Guardian Occupation</label>
                <Select value={guardianOccupation || ""} onValueChange={(val) => setValue("guardianOccupation", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_OCCUPATIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Emergency Contact</label>
                <Input
                  {...register("emergencyContact")}
                  placeholder="98765 43211"
                  inputMode="numeric"
                  className={errors.emergencyContact ? "border-rose-500" : ""}
                />
                {errors.emergencyContact && <p className="text-[11px] text-rose-500 mt-1">{errors.emergencyContact.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">State</label>
                <Select value={state} onValueChange={(val) => setValue("state", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="gradient">
              {isSubmitting ? "Saving..." : studentToEdit ? "Update Student" : "Enroll Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
