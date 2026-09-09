"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import { GraduationCap, Upload, Image as ImageIcon, FileText, X, Plus, Trash2 } from "lucide-react";
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
import { toast } from "sonner";

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
  // College optional
  program: z.string().optional(),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  semester: z.string().optional(),
  enrollmentNumber: z.string().optional(),
  universityPrn: z.string().optional(),
  university: z.string().optional(),
  admissionType: z.string().optional(),
  hostelRequired: z.boolean().optional(),
  scholarshipType: z.string().optional(),
  mentorName: z.string().optional(),
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [studentDocs, setStudentDocs] = useState<{ id: string; name: string; type: string; size: string; fileUrl?: string; verified: boolean; uploadedAt: string }[]>([]);
  const docInputRef = useRef<HTMLInputElement>(null);

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
      program: "",
      department: "",
      yearOfStudy: "",
      semester: "",
      enrollmentNumber: "",
      universityPrn: "",
      university: "SPPU (Pune)",
      admissionType: "REGULAR",
      hostelRequired: false,
      scholarshipType: "None",
      mentorName: "",
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
        setAvatarPreview(studentToEdit.avatar || null);
        setAvatarDataUrl("");
        setStudentDocs((studentToEdit.documents || []).map((d) => ({ id: d.id, name: d.name, type: d.type, size: d.size, verified: d.verified, uploadedAt: d.uploadedAt, fileUrl: undefined })));
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
          program: (studentToEdit as any).program || "",
          department: (studentToEdit as any).department || "",
          yearOfStudy: (studentToEdit as any).yearOfStudy?.toString() || "",
          semester: (studentToEdit as any).semester?.toString() || "",
          enrollmentNumber: (studentToEdit as any).enrollmentNumber || "",
          universityPrn: (studentToEdit as any).universityPrn || "",
          university: (studentToEdit as any).university || "SPPU (Pune)",
          admissionType: (studentToEdit as any).admissionType || "REGULAR",
          hostelRequired: (studentToEdit as any).hostelRequired || false,
          scholarshipType: (studentToEdit as any).scholarshipType || "None",
          mentorName: (studentToEdit as any).mentorName || "",
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
        setAvatarPreview(null);
        setAvatarDataUrl("");
        setStudentDocs([
          { id: "doc-std-1", name: "Birth_Certificate.pdf", type: "PDF", size: "1.2 MB", verified: true, uploadedAt: new Date().toISOString().split("T")[0] },
          { id: "doc-std-2", name: "Aadhaar_Card.pdf", type: "PDF", size: "0.8 MB", verified: false, uploadedAt: new Date().toISOString().split("T")[0] },
        ]);
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
          program: "",
          department: "",
          yearOfStudy: "",
          semester: "",
          enrollmentNumber: "",
          universityPrn: "",
          university: "SPPU (Pune)",
          admissionType: "REGULAR",
          hostelRequired: false,
          scholarshipType: "None",
          mentorName: "",
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be < 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target?.result || "");
      setAvatarPreview(dataUrl);
      setAvatarDataUrl(dataUrl);
      toast.success("Student photo attached — will be saved");
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} too large (>5MB)`); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = String(ev.target?.result || "");
        const newDoc = {
          id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,5)}`,
          name: file.name,
          type: file.name.split(".").pop()?.toUpperCase() || "PDF",
          size: `${(file.size/1024).toFixed(1)} KB`,
          fileUrl: dataUrl,
          verified: false,
          uploadedAt: new Date().toISOString().split("T")[0],
        };
        setStudentDocs((prev) => [...prev, newDoc]);
        toast.success(`${file.name} added`);
      };
      reader.readAsDataURL(file);
    });
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeDoc = (id: string) => setStudentDocs((prev) => prev.filter((d) => d.id !== id));
  const toggleDocVerified = (id: string) => setStudentDocs((prev) => prev.map((d) => d.id === id ? { ...d, verified: !d.verified } : d));

  const onSubmit = (data: StudentFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];
    const targetSection = selectedClass?.sections.find((s) => s.id === data.sectionId) || selectedClass?.sections[0];

    const avatar = avatarDataUrl || studentToEdit?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150";

    const docsToSave = studentDocs.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      uploadedAt: d.uploadedAt,
      verified: d.verified,
      size: d.size,
    }));

    const studentPayload: Omit<Student, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      ...(studentToEdit?.id ? { id: studentToEdit.id } : {}),
      rollNumber: studentToEdit?.rollNumber || `STU-${Math.floor(Math.random() * 800) + 1050}`,
      admissionNumber: studentToEdit?.admissionNumber || `ADM-2026-${Math.floor(Math.random() * 800) + 200}`,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      avatar,
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
      documents: docsToSave as any,
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
      program: undefined,
      department: undefined,
      yearOfStudy: undefined,
      semester: undefined,
      enrollmentNumber: undefined,
      universityPrn: undefined,
      university: undefined,
      admissionType: undefined,
      hostelRequired: false,
      scholarshipType: undefined,
      mentorName: undefined,
    } as any;

    setTimeout(() => {
      const saved = mockDb.saveStudent(studentPayload);
      // also persist documents to central store
      studentDocs.forEach((d) => {
        mockDb.saveDocument({
          name: `${saved.fullName} — ${d.name}`,
          category: d.name.toLowerCase().includes("aadhaar") ? "IDENTITY" : d.name.toLowerCase().includes("marksheet") || d.name.toLowerCase().includes("certificate") ? "ACADEMIC" : "OTHER",
          description: `Student ${saved.rollNumber} document`,
          ownerId: saved.id,
          ownerName: saved.fullName,
          ownerType: "STUDENT",
          branchId: saved.branchId,
          branchName: saved.branchName,
          fileType: d.type,
          fileSize: d.size,
          uploadDate: d.uploadedAt,
          verificationStatus: d.verified ? "VERIFIED" : "PENDING",
          tags: ["school", "student"],
        } as any);
      });
      toast.success(`School student ${studentToEdit ? "updated" : "enrolled"}`, { description: `${saved.fullName} • ${saved.rollNumber}` });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  const filteredBranches = branches.filter((b) => !b.id.includes("college"));
  const branchOptions = filteredBranches.length ? filteredBranches : branches;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">
                {studentToEdit ? `Edit Student: ${studentToEdit.fullName}` : `Register New School Student`}
              </DialogTitle>
              <DialogDescription>
                Nursery–12 — CBSE/ICSE/State — class & section • Photo + Documents stored
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Photo upload */}
        <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
          <div className="relative">
            <AppImage src={avatarPreview || studentToEdit?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"} alt="Student photo" className="h-16 w-16 rounded-xl ring-1 ring-border object-cover" />
            {avatarPreview && <button type="button" onClick={() => { setAvatarPreview(null); setAvatarDataUrl(""); }} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>}
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-xs font-semibold flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Student Photo *</div>
            <p className="text-[11px] text-muted-foreground">Upload JPG/PNG, {"<"} 2MB. Yehi photo directory, ID card aur profile me dikhega. Stored in localStorage.</p>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => avatarInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> {avatarPreview ? "Change Photo" : "Upload Photo"}</Button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <Badge variant="outline" className="text-[10px] hidden sm:flex">School</Badge>
        </div>

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
              Campus, Class & Section (School — class & section)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Campus Branch *</label>
                <Select value={branchId} onValueChange={(val) => setValue("branchId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Campus" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Class / Grade *</label>
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
                    {classes.filter((c) => c.category !== "UG" && c.category !== "PG" && c.category !== "Diploma").map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.program ? `(${c.program})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Section *</label>
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

          <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 text-xs flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
              <span><strong>School flow</strong> — Nursery–12. Class & Section only.</span>
            </div>

          {/* Documents — stored & linked to Documents module */}
          <div className="space-y-3 p-3 rounded-xl border bg-muted/20">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Student Documents — Upload & Store <Badge variant="outline" className="text-[10px]">{studentDocs.length} files</Badge></h4>
            <p className="text-[11px] text-muted-foreground">Files yahan upload karein — yehi documents <strong>Documents module</strong> me bhi store honge, verified toggle ke saath. Max 5MB per file.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => docInputRef.current?.click()}><Plus className="h-3.5 w-3.5" /> Add Document</Button>
              <input ref={docInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />
              <span className="text-[11px] text-muted-foreground self-center">PDF / JPG / PNG — multiple allowed</span>
            </div>
            {studentDocs.length === 0 ? (
              <div className="text-xs text-muted-foreground p-3 border border-dashed rounded-lg text-center">No documents yet — upload Birth Certificate, Aadhaar, Marksheet etc.</div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {studentDocs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{d.name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.type} • {d.size} • {d.uploadedAt} {d.fileUrl ? "• stored" : ""}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => toggleDocVerified(d.id)} className={`text-[10px] px-2 py-1 rounded-full border ${d.verified ? "bg-emerald-500 text-white border-emerald-600" : "bg-muted text-muted-foreground"}`}>{d.verified ? "Verified" : "Pending"}</button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeDoc(d.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {isSubmitting ? "Saving..." : studentToEdit ? "Update Student" : `Enroll School Student`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
