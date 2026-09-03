"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Student, StudentStatus } from "@/types";
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
import { GraduationCap, Sparkles } from "lucide-react";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentToEdit?: Student | null;
  onSuccess?: () => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  studentToEdit,
  onSuccess,
}: StudentFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [classes, setClasses] = useState(() => mockDb.getClasses());

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "Male" as "Male" | "Female" | "Other",
    dateOfBirth: "2010-06-15",
    bloodGroup: "O+",
    branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
    classId: "cls-g10",
    sectionId: "sec-g10-a",
    status: "ACTIVE" as StudentStatus,
    guardianName: "",
    guardianRelation: "Father" as "Father" | "Mother" | "Guardian",
    guardianEmail: "",
    guardianPhone: "",
    guardianOccupation: "",
    address: "",
    city: "Metro City",
    state: "CA",
    emergencyContact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadedClasses = mockDb.getClasses();
    setClasses(loadedClasses);
    if (studentToEdit) {
      setFormData({
        firstName: studentToEdit.firstName,
        lastName: studentToEdit.lastName,
        gender: studentToEdit.gender,
        dateOfBirth: studentToEdit.dateOfBirth,
        bloodGroup: studentToEdit.bloodGroup,
        branchId: studentToEdit.branchId,
        classId: studentToEdit.classId,
        sectionId: studentToEdit.sectionId,
        status: studentToEdit.status,
        guardianName: studentToEdit.guardian.name,
        guardianRelation: studentToEdit.guardian.relation as any,
        guardianEmail: studentToEdit.guardian.email,
        guardianPhone: studentToEdit.guardian.phone,
        guardianOccupation: studentToEdit.guardian.occupation,
        address: studentToEdit.address,
        city: studentToEdit.city,
        state: studentToEdit.state,
        emergencyContact: studentToEdit.guardian.emergencyContact,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        gender: "Male",
        dateOfBirth: "2010-06-15",
        bloodGroup: "O+",
        branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
        classId: loadedClasses[0]?.id || "cls-g10",
        sectionId: loadedClasses[0]?.sections[0]?.id || "sec-g10-a",
        status: "ACTIVE",
        guardianName: "",
        guardianRelation: "Father",
        guardianEmail: "",
        guardianPhone: "",
        guardianOccupation: "Executive",
        address: "500 Horizon Boulevard",
        city: "Metro City",
        state: "CA",
        emergencyContact: "+1 (555) 234-9988",
      });
    }
  }, [studentToEdit, open, activeBranchId]);

  const selectedClass = classes.find((c) => c.id === formData.classId) || classes[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First and last name are required");
      return;
    }
    if (!formData.guardianName.trim() || !formData.guardianEmail.trim()) {
      setError("Guardian contact info is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const targetBranch = branches.find((b) => b.id === formData.branchId) || branches[0];
    const targetSection = selectedClass?.sections.find((s) => s.id === formData.sectionId) || selectedClass?.sections[0];

    const studentPayload: Omit<Student, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      ...(studentToEdit?.id ? { id: studentToEdit.id } : {}),
      rollNumber: studentToEdit?.rollNumber || `STU-${Math.floor(Math.random() * 800) + 1050}`,
      admissionNumber: studentToEdit?.admissionNumber || `ADM-2026-${Math.floor(Math.random() * 800) + 200}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      avatar: studentToEdit?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      classId: selectedClass?.id || "cls-g10",
      className: selectedClass?.name || "Grade 10",
      sectionId: targetSection?.id || "sec-g10-a",
      sectionName: targetSection?.name || "Section A",
      admissionDate: studentToEdit?.admissionDate || new Date().toISOString().split("T")[0],
      status: formData.status,
      guardian: {
        name: formData.guardianName,
        relation: formData.guardianRelation,
        email: formData.guardianEmail,
        phone: formData.guardianPhone || "+1 (555) 234-5678",
        occupation: formData.guardianOccupation,
        address: formData.address,
        emergencyContact: formData.emergencyContact || formData.guardianPhone,
      },
      attendanceSummary: studentToEdit?.attendanceSummary || {
        totalDays: 140,
        presentDays: 136,
        absentDays: 2,
        lateDays: 2,
        attendanceRate: 97.1,
      },
      feeSummary: studentToEdit?.feeSummary || {
        totalAssigned: 12000,
        totalPaid: 6000,
        totalPending: 6000,
        status: "PARTIAL",
      },
      academicHistory: studentToEdit?.academicHistory || [
        { term: "Term 1 - 2025-26", grade: "A", gpa: 3.9, percentage: 94.5, rank: 3, remarks: "Excellent academic performance and participation." },
      ],
      documents: studentToEdit?.documents || [
        { id: "doc-std-1", name: "Birth_Certificate.pdf", type: "PDF", uploadedAt: "2026-08-10", verified: true, size: "1.2 MB" },
      ],
      address: formData.address,
      city: formData.city,
      state: formData.state,
    };

    setTimeout(() => {
      mockDb.saveStudent(studentPayload);
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

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Liam"
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
                  placeholder="e.g. Chen"
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
                <label className="text-xs font-medium text-foreground mb-1 block">Blood Group</label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                >
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

          {/* Section: Academic Class & Campus Assignment */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Campus, Class & Section
            </h4>
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
                <label className="text-xs font-medium text-foreground mb-1 block">Class / Grade</label>
                <Select
                  value={formData.classId}
                  onValueChange={(val) => {
                    const cl = classes.find((c) => c.id === val);
                    setFormData({
                      ...formData,
                      classId: val,
                      sectionId: cl?.sections[0]?.id || "",
                    });
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
                <Select
                  value={formData.sectionId}
                  onValueChange={(val) => setFormData({ ...formData, sectionId: val })}
                >
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
              <Select
                value={formData.status}
                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
              >
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
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  placeholder="e.g. David & Vivian Chen"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Relationship</label>
                <Select
                  value={formData.guardianRelation}
                  onValueChange={(val: any) => setFormData({ ...formData, guardianRelation: val })}
                >
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
                  value={formData.guardianEmail}
                  onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                  placeholder="parent@email.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Guardian Phone</label>
                <Input
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="+1 (555) 789-4321"
                />
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
