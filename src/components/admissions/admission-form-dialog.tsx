"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AdmissionApplication, AdmissionStatus } from "@/types";
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
import { UserPlus, Sparkles, CheckCircle2, FileText } from "lucide-react";

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

export function AdmissionFormDialog({ open, onOpenChange, onSuccess }: AdmissionFormDialogProps) {
  const { branches, activeBranchId } = useERP();

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "2012-05-15",
    gender: "Male" as "Male" | "Female" | "Other",
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

  const [docBirthCert, setDocBirthCert] = useState(true);
  const [docReportCard, setDocReportCard] = useState(true);
  const [docImmunization, setDocImmunization] = useState(true);
  const [docProofAddress, setDocProofAddress] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Applicant name is required");
      return;
    }
    if (!formData.parentName.trim() || !formData.parentEmail.trim()) {
      setError("Parent name and email are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const targetBranch = branches.find((b) => b.id === formData.branchId) || branches[0];

    const applicationPayload: Omit<AdmissionApplication, "id" | "createdAt" | "updatedAt"> = {
      applicationNumber: `ADM-2026-${Math.floor(Math.random() * 800) + 200}`,
      applicantFirstName: formData.firstName,
      applicantLastName: formData.lastName,
      applicantFullName: `${formData.firstName} ${formData.lastName}`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      gradeApplied: formData.gradeApplied,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      academicYear: formData.academicYear,
      submissionDate: new Date().toISOString(),
      status: "NEW" as AdmissionStatus,
      parentName: formData.parentName,
      parentRelationship: formData.parentRelationship,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone || "+1 (555) 000-1122",
      address: formData.address || "100 Campus View Way",
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      previousSchool: formData.previousSchool || "Heritage Prep Academy",
      previousGrade: formData.previousGrade || "Grade 8",
      previousGpa: formData.previousGpa || "3.85",
      entranceTestScore: Number(formData.entranceTestScore) || 85,
      documents: [
        { id: "doc-1", name: "Birth_Certificate.pdf", required: true, submitted: docBirthCert, verified: false },
        { id: "doc-2", name: "Previous_Report_Card.pdf", required: true, submitted: docReportCard, verified: false },
        { id: "doc-3", name: "Immunization_Records.pdf", required: true, submitted: docImmunization, verified: false },
        { id: "doc-4", name: "Proof_Of_Address.pdf", required: true, submitted: docProofAddress, verified: false },
      ],
      notes: formData.notes,
    };

    setTimeout(() => {
      mockDb.saveAdmission(applicationPayload);
      setIsSubmitting(false);
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

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="e.g. Julian"
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
                    placeholder="e.g. Vance"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Gender</label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val: any) => setFormData({ ...formData, gender: val })}
                  >
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
                  <Select
                    value={formData.gradeApplied}
                    onValueChange={(val) => setFormData({ ...formData, gradeApplied: val })}
                  >
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
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous School</label>
                  <Input
                    value={formData.previousSchool}
                    onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                    placeholder="e.g. St. Jude Middle School"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous GPA / %</label>
                  <Input
                    value={formData.previousGpa}
                    onChange={(e) => setFormData({ ...formData, previousGpa: e.target.value })}
                    placeholder="3.90 or 92%"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Entrance Exam Score (%)</label>
                  <Input
                    type="number"
                    value={formData.entranceTestScore}
                    onChange={(e) => setFormData({ ...formData, entranceTestScore: Number(e.target.value) })}
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
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Dr. Robert Vance"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Relationship</label>
                  <Select
                    value={formData.parentRelationship}
                    onValueChange={(val) => setFormData({ ...formData, parentRelationship: val })}
                  >
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
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@domain.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Parent Phone</label>
                  <Input
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+1 (555) 234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1 block">Residential Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="740 Oakridge Lane"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
