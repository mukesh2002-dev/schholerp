"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AdmissionApplication, AdmissionStatus } from "@/types";
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
import { UserPlus } from "lucide-react";

interface AdmissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const gradesList = [
  "Montessori Primary",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const admissionSchema = z.object({
  firstName: z.string().min(1, "Applicant name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  gradeApplied: z.string().min(1),
  branchId: z.string().min(1),
  academicYear: z.string().min(1),
  parentName: z.string().min(1, "Parent name is required"),
  parentRelationship: z.string().min(1),
  parentEmail: z.string().min(1, "Parent email is required").email("Invalid email"),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  previousSchool: z.string().optional(),
  previousGrade: z.string().optional(),
  previousGpa: z.string().optional(),
  entranceTestScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

export function AdmissionFormDialog({ open, onOpenChange, onSuccess }: AdmissionFormDialogProps) {
  const { branches, activeBranchId } = useERP();

  const [step, setStep] = useState<1 | 2>(1);
  const [docBirthCert, setDocBirthCert] = useState(true);
  const [docReportCard, setDocReportCard] = useState(true);
  const [docImmunization, setDocImmunization] = useState(true);
  const [docProofAddress, setDocProofAddress] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "2012-05-15",
      gender: "Male",
      gradeApplied: "Grade 9",
      branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
      academicYear: "2026-2027",
      parentName: "",
      parentRelationship: "Father",
      parentEmail: "",
      parentPhone: "",
      address: "",
      city: "Metro City",
      state: "CA",
      postalCode: "94105",
      previousSchool: "",
      previousGrade: "",
      previousGpa: "",
      entranceTestScore: 88,
      notes: "",
    },
  });

  const gender = watch("gender");
  const gradeApplied = watch("gradeApplied");
  const branchId = watch("branchId");
  const parentRelationship = watch("parentRelationship");

  useEffect(() => {
    if (open) {
      reset({
        firstName: "",
        lastName: "",
        dateOfBirth: "2012-05-15",
        gender: "Male",
        gradeApplied: "Grade 9",
        branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
        academicYear: "2026-2027",
        parentName: "",
        parentRelationship: "Father",
        parentEmail: "",
        parentPhone: "",
        address: "",
        city: "Metro City",
        state: "CA",
        postalCode: "94105",
        previousSchool: "",
        previousGrade: "",
        previousGpa: "",
        entranceTestScore: 88,
        notes: "",
      });
      setStep(1);
    }
  }, [open, activeBranchId, reset]);

  const onSubmit = (data: AdmissionFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];

    const applicationPayload: Omit<AdmissionApplication, "id" | "createdAt" | "updatedAt"> = {
      applicationNumber: `ADM-2026-${Math.floor(Math.random() * 800) + 200}`,
      applicantFirstName: data.firstName,
      applicantLastName: data.lastName,
      applicantFullName: `${data.firstName} ${data.lastName}`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as "Male" | "Female" | "Other",
      gradeApplied: data.gradeApplied,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      academicYear: data.academicYear,
      submissionDate: new Date().toISOString(),
      status: "NEW" as AdmissionStatus,
      parentName: data.parentName,
      parentRelationship: data.parentRelationship,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone || "+1 (555) 000-1122",
      address: data.address || "100 Campus View Way",
      city: data.city || "Metro City",
      state: data.state || "CA",
      postalCode: data.postalCode || "94105",
      previousSchool: data.previousSchool || "Heritage Prep Academy",
      previousGrade: data.previousGrade || "Grade 8",
      previousGpa: data.previousGpa || "3.85",
      entranceTestScore: Number(data.entranceTestScore) || 85,
      documents: [
        { id: "doc-1", name: "Birth_Certificate.pdf", required: true, submitted: docBirthCert, verified: false },
        { id: "doc-2", name: "Previous_Report_Card.pdf", required: true, submitted: docReportCard, verified: false },
        { id: "doc-3", name: "Immunization_Records.pdf", required: true, submitted: docImmunization, verified: false },
        { id: "doc-4", name: "Proof_Of_Address.pdf", required: true, submitted: docProofAddress, verified: false },
      ],
      notes: data.notes || "",
    };

    setTimeout(() => {
      mockDb.saveAdmission(applicationPayload);
      onOpenChange(false);
      setStep(1);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">New Student Admission Application</DialogTitle>
              <DialogDescription>
                Register a new candidate dossier, choose campus & grade level, and record guardian credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Multi-step Header */}
        <div className="flex items-center justify-center gap-2 border-y border-border py-2.5 my-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg ${
              step === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>1. Student & Campus</span>
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg ${
              step === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>2. Guardian & Documents</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    {...register("firstName")}
                    placeholder="e.g. Julian"
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
                    placeholder="e.g. Vance"
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
                  <label className="text-xs font-medium text-foreground mb-1 block">Grade Applied For</label>
                  <Select value={gradeApplied} onValueChange={(val) => setValue("gradeApplied", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradesList.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Target Campus Branch</label>
                  <Select value={branchId} onValueChange={(val) => setValue("branchId", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous School</label>
                  <Input
                    {...register("previousSchool")}
                    placeholder="e.g. St. Jude Middle School"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous GPA / %</label>
                  <Input
                    {...register("previousGpa")}
                    placeholder="3.90 or 92%"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Entrance Exam Score (%)</label>
                  <Input
                    type="number"
                    {...register("entranceTestScore", { valueAsNumber: true })}
                    placeholder="90"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    Parent / Guardian Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    {...register("parentName")}
                    placeholder="e.g. Dr. Robert Vance"
                    className={errors.parentName ? "border-rose-500" : ""}
                  />
                  {errors.parentName && <p className="text-[11px] text-rose-500 mt-1">{errors.parentName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Relationship</label>
                  <Select value={parentRelationship} onValueChange={(val) => setValue("parentRelationship", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Relationship" />
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
                    Parent Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    {...register("parentEmail")}
                    placeholder="parent@domain.com"
                    className={errors.parentEmail ? "border-rose-500" : ""}
                  />
                  {errors.parentEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.parentEmail.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Parent Phone</label>
                  <Input
                    {...register("parentPhone")}
                    placeholder="+1 (555) 234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1 block">Residential Address</label>
                  <Input
                    {...register("address")}
                    placeholder="740 Oakridge Lane"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">City</label>
                  <Input
                    {...register("city")}
                    placeholder="Metro City"
                  />
                </div>
              </div>

              {/* Document Checklist Selection */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Mandatory Document Checklist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docBirthCert}
                      onChange={(e) => setDocBirthCert(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Birth Certificate Attached</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docReportCard}
                      onChange={(e) => setDocReportCard(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Previous Academic Transcript</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docImmunization}
                      onChange={(e) => setDocImmunization(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Immunization / Health Card</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docProofAddress}
                      onChange={(e) => setDocProofAddress(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Proof of Address / Utility</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Counselor Notes / Remarks</label>
                <Textarea
                  {...register("notes")}
                  placeholder="Special learning needs, sports interests, scholarship eligibility..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            {step === 2 ? (
              <>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="gradient">
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setStep(2)}>
                  Continue to Guardian & Docs →
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
