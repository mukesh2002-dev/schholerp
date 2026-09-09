"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import { UserPlus, Upload, Image as ImageIcon, FileText, Building2, X } from "lucide-react";
import {
  INDIAN_GRADES,
  SCHOOL_BOARDS,
  SOCIAL_CATEGORIES,
  RELIGIONS,
  MOTHER_TONGUES,
  INDIAN_STATES,
  INDIAN_MOBILE_REGEX,
  INDIAN_PIN_REGEX,
  normaliseIndianMobile,
  isValidAadhaar,
} from "@/lib/india";
import { toast } from "sonner";

interface AdmissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const gradesList: string[] = [...INDIAN_GRADES];

const admissionSchema = z.object({
  firstName: z.string().min(1, "Applicant name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1),
  gradeApplied: z.string().min(1),
  branchId: z.string().min(1),
  academicYear: z.string().min(1),
  category: z.string().min(1, "Select social category"),
  religion: z.string().min(1, "Select religion"),
  motherTongue: z.string().min(1, "Select mother tongue"),
  board: z.string().min(1, "Select board"),
  aadhaarNumber: z
    .string()
    .optional()
    .refine((v) => !v || isValidAadhaar(v), "Enter a valid 12-digit Aadhaar number"),
  rteQuota: z.boolean().optional(),
  parentName: z.string().min(1, "Parent name is required"),
  parentRelationship: z.string().min(1),
  parentEmail: z.string().min(1, "Parent email is required").email("Invalid email"),
  parentPhone: z
    .string()
    .optional()
    .refine(
      (v) => !v || INDIAN_MOBILE_REGEX.test(normaliseIndianMobile(v)),
      "Enter a valid 10-digit mobile number"
    ),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z
    .string()
    .optional()
    .refine((v) => !v || INDIAN_PIN_REGEX.test(v.trim()), "Enter a valid 6-digit PIN code"),
  previousSchool: z.string().optional(),
  previousGrade: z.string().optional(),
  previousGpa: z.string().optional(),
  entranceTestScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  // College optional
  programApplied: z.string().optional(),
  departmentPreference: z.string().optional(),
  entranceExam: z.string().optional(),
  entranceRank: z.string().optional(),
  quotaType: z.string().optional(),
  university: z.string().optional(),
  previousDegree: z.string().optional(),
  hostelRequired: z.boolean().optional(),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

type DocItem = { id: string; name: string; required: boolean; submitted: boolean; fileName?: string; fileUrl?: string; fileSize?: string; verified: boolean };

const SCHOOL_DOCS_TEMPLATE: DocItem[] = [
  { id: "doc-1", name: "Birth_Certificate.pdf", required: true, submitted: false, verified: false },
  { id: "doc-2", name: "Previous_Report_Card.pdf", required: true, submitted: false, verified: false },
  { id: "doc-3", name: "Aadhaar_Card.pdf", required: true, submitted: false, verified: false },
  { id: "doc-4", name: "Address_Proof.pdf", required: true, submitted: false, verified: false },
];

export function AdmissionFormDialog({ open, onOpenChange, onSuccess }: AdmissionFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [step, setStep] = useState<1 | 2>(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<DocItem[]>(SCHOOL_DOCS_TEMPLATE);

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
      gradeApplied: "Class 9",
      branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
      academicYear: "2026-2027",
      category: "General",
      religion: "Hindu",
      motherTongue: "Hindi",
      board: "CBSE",
      aadhaarNumber: "",
      rteQuota: false,
      parentName: "",
      parentRelationship: "Father",
      parentEmail: "",
      parentPhone: "",
      address: "",
      city: "Pune",
      state: "Maharashtra",
      postalCode: "411038",
      previousSchool: "",
      previousGrade: "",
      previousGpa: "",
      entranceTestScore: 88,
      notes: "",
      programApplied: "",
      departmentPreference: "",
      entranceExam: "",
      entranceRank: "",
      quotaType: "MERIT (CAP Round)",
      university: "SPPU (Pune)",
      previousDegree: "",
      hostelRequired: false,
    },
  });

  const gender = watch("gender");
  const gradeApplied = watch("gradeApplied");
  const branchId = watch("branchId");
  const parentRelationship = watch("parentRelationship");
  const category = watch("category");
  const religion = watch("religion");
  const motherTongue = watch("motherTongue");
  const board = watch("board");
  const state = watch("state");

  useEffect(() => {
    if (open) {
      reset({
        firstName: "",
        lastName: "",
        dateOfBirth: "2012-05-15",
        gender: "Male",
        gradeApplied: "Class 9",
        branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
        academicYear: "2026-2027",
        category: "General",
        religion: "Hindu",
        motherTongue: "Hindi",
        board: "CBSE",
        aadhaarNumber: "",
        rteQuota: false,
        parentName: "",
        parentRelationship: "Father",
        parentEmail: "",
        parentPhone: "",
        address: "",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411038",
        previousSchool: "",
        previousGrade: "",
        previousGpa: "",
        entranceTestScore: 88,
        notes: "",
        programApplied: "",
        departmentPreference: "",
        entranceExam: "",
        entranceRank: "",
        quotaType: "MERIT (CAP Round)",
        university: "SPPU (Pune)",
        previousDegree: "",
        hostelRequired: false,
      });
      setStep(1);
      setAvatarPreview(null);
      setAvatarDataUrl("");
      setDocs(SCHOOL_DOCS_TEMPLATE.map((d)=>({...d})));
    }
  }, [open, activeBranchId, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be < 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target?.result || "");
      setAvatarPreview(dataUrl);
      setAvatarDataUrl(dataUrl);
      toast.success("Photo attached — will be saved with application");
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleDocFile = (docId: string, file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be < 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = String(ev.target?.result || "");
      setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, submitted: true, fileName: file.name, fileUrl: dataUrl, fileSize: `${(file.size/1024).toFixed(1)} KB` } : d));
      toast.success(`${file.name} attached`);
    };
    reader.readAsDataURL(file);
  };

  const removeDocFile = (docId: string) => {
    setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, submitted: false, fileName: undefined, fileUrl: undefined, fileSize: undefined } : d));
  };

  const onSubmit = (data: AdmissionFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];
    const finalGrade = data.gradeApplied;

    const avatar = avatarDataUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;

    const applicationPayload: Omit<AdmissionApplication, "id" | "createdAt" | "updatedAt"> = {
      applicationNumber: `ADM-2026-${Math.floor(Math.random() * 800) + 200}`,
      applicantFirstName: data.firstName,
      applicantLastName: data.lastName,
      applicantFullName: `${data.firstName} ${data.lastName}`,
      avatar,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender as "Male" | "Female" | "Other",
      gradeApplied: finalGrade,
      branchId: targetBranch.id,
      branchName: targetBranch.name,
      academicYear: data.academicYear,
      submissionDate: new Date().toISOString(),
      status: "NEW" as AdmissionStatus,
      parentName: data.parentName,
      parentRelationship: data.parentRelationship,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone ? `+91 ${normaliseIndianMobile(data.parentPhone)}` : "+91 98220 00000",
      address: data.address || "100 Paud Road, Kothrud",
      city: data.city || "Pune",
      state: data.state || "Maharashtra",
      postalCode: data.postalCode || "411038",
      previousSchool: data.previousSchool || "Zilla Parishad School",
      previousGrade: data.previousGrade || "Class 8",
      previousGpa: data.previousGpa || "85%",
      entranceTestScore: Number(data.entranceTestScore) || 85,
      documents: docs.map((d) => ({ id: d.id, name: d.fileName || d.name, required: d.required, submitted: d.submitted, verified: false, fileUrl: d.fileUrl })),
      notes: data.notes || "",
      aadhaarNumber: data.aadhaarNumber?.replace(/[\s-]/g, "") || undefined,
      category: data.category,
      religion: data.religion,
      motherTongue: data.motherTongue,
      board: data.board,
      rteQuota: data.rteQuota || false,
      programApplied: undefined,
      departmentPreference: undefined,
      entranceExam: undefined,
      entranceRank: undefined,
      quotaType: undefined,
      university: undefined,
      previousDegree: undefined,
      hostelRequired: false,
    };

    setTimeout(() => {
      const saved = mockDb.saveAdmission(applicationPayload as any);
      // also persist documents to central Document store for Documents module
      docs.forEach((d) => {
        if (d.submitted) {
          mockDb.saveDocument({
            name: `${saved.applicantFullName} — ${d.fileName || d.name}`,
            category: d.name.includes("Aadhaar") ? "IDENTITY" : d.name.includes("Marksheet") || d.name.includes("Report") ? "ACADEMIC" : d.name.includes("Scorecard") ? "ACADEMIC" : "OTHER",
            description: `Admission ${saved.applicationNumber} — ${d.name}`,
            ownerId: saved.id,
            ownerName: saved.applicantFullName,
            ownerType: "STUDENT",
            branchId: saved.branchId,
            branchName: saved.branchName,
            fileType: d.fileName?.split(".").pop()?.toUpperCase() || "PDF",
            fileSize: d.fileSize || "1.2 MB",
            uploadDate: new Date().toISOString().split("T")[0],
            verificationStatus: "PENDING",
            tags: ["school", "admission"],
          } as any);
        }
      });
      // persist avatar also as document if uploaded
      if (avatarDataUrl) {
        mockDb.saveDocument({
          name: `${saved.applicantFullName} — Photo.jpg`,
          category: "IDENTITY",
          description: `Applicant photo for ${saved.applicationNumber}`,
          ownerId: saved.id,
          ownerName: saved.applicantFullName,
          ownerType: "STUDENT",
          branchId: saved.branchId,
          branchName: saved.branchName,
          fileType: "JPG",
          fileSize: "180 KB",
          uploadDate: new Date().toISOString().split("T")[0],
          verificationStatus: "VERIFIED",
          tags: ["photo", "admission"],
        } as any);
      }
      toast.success(`School application submitted`, { description: `${saved.applicantFullName} • ${saved.applicationNumber}` });
      onOpenChange(false);
      setStep(1);
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold">New School Admission Application</DialogTitle>
              <DialogDescription>
                Class Nursery–12 — CBSE/ICSE/State — school flow
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Photo upload */}
        <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
          <div className="relative">
            <AppImage src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="Applicant photo" className="h-16 w-16 rounded-xl ring-1 ring-border object-cover" />
            {avatarPreview && <button type="button" onClick={() => { setAvatarPreview(null); setAvatarDataUrl(""); }} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>}
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-xs font-semibold flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Student Photo *</div>
            <p className="text-[11px] text-muted-foreground">Upload passport photo — JPG/PNG, {"<"} 2MB. Stored with application & student dossier.</p>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => avatarInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> {avatarPreview ? "Change Photo" : "Upload Photo"}</Button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <Badge variant="outline" className="text-[10px] hidden sm:flex">School</Badge>
        </div>

        {/* Multi-step Header */}
        <div className="flex items-center justify-center gap-2 border-y border-border py-2 my-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg ${
              step === 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>1. School & Campus</span>
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
                  <label className="text-xs font-medium text-foreground mb-1 block">Grade Applied *</label>
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
                  <label className="text-xs font-medium text-foreground mb-1 block">Target Campus Branch *</label>
                  <Select value={branchId} onValueChange={(val) => setValue("branchId", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchOptions.map((b) => (
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
                    placeholder="e.g. Vidya Valley School"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      checked={watch("rteQuota") || false}
                      onChange={(e) => setValue("rteQuota", e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Admitted under <strong>RTE 25% quota</strong></span>
                  </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous % / GPA</label>
                  <Input
                    {...register("previousGpa")}
                    placeholder="e.g. 92%"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Entrance Score (%)</label>
                  <Input
                    type="number"
                    {...register("entranceTestScore", { valueAsNumber: true })}
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-2 text-xs">
                  <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  <span><strong>School flow</strong> — Class Nursery–12.</span>
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
                    placeholder="e.g. Ramesh Sharma"
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
                  <label className="text-xs font-medium text-foreground mb-1 block">Parent Mobile</label>
                  <Input
                    {...register("parentPhone")}
                    placeholder="98765 43210"
                    inputMode="numeric"
                    className={errors.parentPhone ? "border-rose-500" : ""}
                  />
                  {errors.parentPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.parentPhone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground mb-1 block">Residential Address</label>
                  <Input
                    {...register("address")}
                    placeholder="Flat 4B, Shivtirth Nagar, Paud Road"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">City</label>
                  <Input
                    {...register("city")}
                    placeholder="Pune"
                  />
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
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">PIN Code</label>
                  <Input
                    {...register("postalCode")}
                    placeholder="411038"
                    inputMode="numeric"
                    className={errors.postalCode ? "border-rose-500" : ""}
                  />
                  {errors.postalCode && <p className="text-[11px] text-rose-500 mt-1">{errors.postalCode.message}</p>}
                </div>
              </div>

              {/* Document Upload — with actual file storage */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" /> Required Documents — Upload & Store
                </label>
                <p className="text-[11px] text-muted-foreground">Files are stored in browser (localStorage) + Documents module. Max 5MB per file. Yehi documents student dossier me bhi dikhenge.</p>
                <div className="grid grid-cols-1 gap-2">
                  {docs.map((d) => (
                    <div key={d.id} className={`flex items-center justify-between p-2 rounded-lg border ${d.submitted ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200" : "bg-muted/30 border-border"}`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input type="checkbox" checked={d.submitted} readOnly className="rounded text-primary" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium block truncate">{d.name} {d.required && <span className="text-rose-500">*</span>}</span>
                          {d.fileName ? <span className="text-[11px] text-emerald-700 truncate block">{d.fileName} • {d.fileSize}</span> : <span className="text-[11px] text-muted-foreground">{d.required ? "Mandatory" : "Optional"} • {d.submitted ? "Attached" : "No file"}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {d.submitted ? (
                          <>
                            <Badge variant="success" className="text-[10px] hidden sm:flex">{d.fileName?.split(".").pop()?.toUpperCase() || "FILE"}</Badge>
                            <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeDocFile(d.id)}><X className="h-3.5 w-3.5" /></Button>
                          </>
                        ) : (
                          <label className="cursor-pointer">
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleDocFile(d.id, e.target.files?.[0] || null)} />
                            <span className="inline-flex items-center gap-1 text-xs border rounded-md px-2 py-1 hover:bg-muted"><Upload className="h-3 w-3" /> Upload</span>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
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
                  {isSubmitting ? "Submitting..." : `Submit School Application`}
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
