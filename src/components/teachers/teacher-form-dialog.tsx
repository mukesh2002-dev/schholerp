"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import { Users, Upload, Image as ImageIcon, FileText, X, Plus, Trash2 } from "lucide-react";
import {
  SOCIAL_CATEGORIES,
  TEACHING_DESIGNATIONS,
  INDIAN_MOBILE_REGEX,
  INDIAN_PAN_REGEX,
  normaliseIndianMobile,
  isValidAadhaar,
} from "@/lib/india";
import { toast } from "sonner";

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherToEdit?: Teacher | null;
  onSuccess?: () => void;
}

const departmentsList = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Hindi",
  "Sanskrit",
  "Computer Science",
  "Physical Education",
  "Arts",
  "Pre-Primary",
  "Library",
];

const teacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || INDIAN_MOBILE_REGEX.test(normaliseIndianMobile(v)),
      "Enter a valid 10-digit mobile number"
    ),
  gender: z.string().min(1),
  dateOfBirth: z.string().min(1),
  panNumber: z
    .string()
    .optional()
    .refine((v) => !v || INDIAN_PAN_REGEX.test(v.trim().toUpperCase()), "Enter a valid PAN (e.g. ABCDE1234F)"),
  aadhaarNumber: z
    .string()
    .optional()
    .refine((v) => !v || isValidAadhaar(v), "Enter a valid 12-digit Aadhaar number"),
  category: z.string().optional(),
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<{ id: string; name: string; type: string; size: string; fileUrl?: string; verified: boolean; uploadedAt: string }[]>([]);

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
      panNumber: "",
      aadhaarNumber: "",
      category: "General",
      qualification: "",
      joiningDate: "2020-08-01",
      branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
      department: "Mathematics",
      designation: "TGT (Trained Graduate Teacher)",
      status: "ACTIVE",
      subjectsString: "Mathematics, Algebra, Geometry",
      experienceYears: 8,
      baseSalary: 55000,
      allowances: 15000,
      bio: "",
    },
  });

  const gender = watch("gender");
  const branchId = watch("branchId");
  const department = watch("department");
  const designation = watch("designation");
  const category = watch("category");
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
          panNumber: teacherToEdit.panNumber || "",
          aadhaarNumber: teacherToEdit.aadhaarNumber || "",
          category: teacherToEdit.category || "General",
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
        setAvatarPreview(teacherToEdit.avatar || null);
        setAvatarDataUrl("");
        // load existing documents for this teacher from central store
        const existingDocs = mockDb.getDocuments().filter((d) => d.ownerId === teacherToEdit.id && d.ownerType === "TEACHER");
        if (existingDocs.length) {
          setDocs(existingDocs.map((d) => ({ id: d.id, name: d.name, type: d.fileType, size: d.fileSize, verified: d.verificationStatus === "VERIFIED", uploadedAt: d.uploadDate, fileUrl: undefined })));
        } else {
          setDocs([]);
        }
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          gender: "Female",
          dateOfBirth: "1988-04-12",
          panNumber: "",
          aadhaarNumber: "",
          category: "General",
          qualification: "M.Sc. Mathematics, B.Ed.",
          joiningDate: new Date().toISOString().split("T")[0],
          branchId: activeBranchId !== "all" ? activeBranchId : "br-apex-01",
          department: "Mathematics",
          designation: "TGT (Trained Graduate Teacher)",
          status: "ACTIVE",
          subjectsString: "Mathematics, Algebra, Geometry",
          experienceYears: 6,
          baseSalary: 52000,
          allowances: 14000,
          bio: "",
        });
        setAvatarPreview(null);
        setAvatarDataUrl("");
        setDocs([]);
      }
    }
  }, [teacherToEdit, open, activeBranchId, reset]);

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
      toast.success("Photo attached — will be saved with faculty profile");
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
        setDocs((prev) => [...prev, newDoc]);
        toast.success(`${file.name} added — will be stored in Documents module`);
      };
      reader.readAsDataURL(file);
    });
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));
  const toggleVerified = (id: string) => setDocs((prev) => prev.map((d) => d.id === id ? { ...d, verified: !d.verified } : d));

  const onSubmit = (data: TeacherFormValues) => {
    const targetBranch = branches.find((b) => b.id === data.branchId) || branches[0];
    const subjects = (data.subjectsString || "").split(",").map((s) => s.trim()).filter(Boolean);
    const avatar = avatarDataUrl || teacherToEdit?.avatar || `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150`;

    const teacherPayload: Omit<Teacher, "id" | "createdAt" | "updatedAt"> & { id?: string } = {
      ...(teacherToEdit?.id ? { id: teacherToEdit.id } : {}),
      employeeId: teacherToEdit?.employeeId || `TCH-${Math.floor(Math.random() * 800) + 100}`,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      avatar,
      email: data.email,
      phone: data.phone ? `+91 ${normaliseIndianMobile(data.phone)}` : "+91 98220 00000",
      gender: data.gender as "Male" | "Female" | "Other",
      dateOfBirth: data.dateOfBirth,
      panNumber: data.panNumber?.trim().toUpperCase() || undefined,
      aadhaarNumber: data.aadhaarNumber?.replace(/[\s-]/g, "") || undefined,
      category: data.category || undefined,
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
      const saved = mockDb.saveTeacher(teacherPayload);
      // persist documents to central Document store — Documents module me bhi dikhega
      docs.forEach((d) => {
        // if already exists (id starts with doc- from stored), update, else create
        const isExisting = mockDb.getDocumentById(d.id);
        if (isExisting) {
          mockDb.saveDocument({
            id: d.id,
            name: `${saved.fullName} — ${d.name}`,
            category: d.name.toLowerCase().includes("degree") || d.name.toLowerCase().includes("certificate") ? "EMPLOYMENT" : d.name.toLowerCase().includes("aadhaar") || d.name.toLowerCase().includes("pan") ? "IDENTITY" : "OTHER",
            description: `Faculty ${saved.employeeId} document`,
            ownerId: saved.id,
            ownerName: saved.fullName,
            ownerType: "TEACHER",
            branchId: saved.branchId,
            branchName: saved.branchName,
            fileType: d.type,
            fileSize: d.size,
            uploadDate: d.uploadedAt,
            verificationStatus: d.verified ? "VERIFIED" : "PENDING",
            tags: ["faculty"],
          } as any);
        } else {
          mockDb.saveDocument({
            name: `${saved.fullName} — ${d.name}`,
            category: d.name.toLowerCase().includes("degree") || d.name.toLowerCase().includes("certificate") ? "EMPLOYMENT" : d.name.toLowerCase().includes("aadhaar") || d.name.toLowerCase().includes("pan") ? "IDENTITY" : "OTHER",
            description: `Faculty ${saved.employeeId} document`,
            ownerId: saved.id,
            ownerName: saved.fullName,
            ownerType: "TEACHER",
            branchId: saved.branchId,
            branchName: saved.branchName,
            fileType: d.type,
            fileSize: d.size,
            uploadDate: d.uploadedAt,
            verificationStatus: d.verified ? "VERIFIED" : "PENDING",
            tags: ["faculty"],
          } as any);
        }
      });
      if (avatarDataUrl) {
        toast.success("Photo uploaded and saved");
      }
      toast.success(teacherToEdit ? "Faculty updated" : "Faculty registered", { description: `${saved.fullName} • ${saved.employeeId}` });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {teacherToEdit ? `Edit Faculty: ${teacherToEdit.fullName}` : "Add Faculty Instructor"}
              </DialogTitle>
              <DialogDescription>
                Photo + qualifications / certificates upload — sab Documents module me bhi store hoga.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Photo upload — preview & store */}
        <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
          <div className="relative">
            <AppImage src={avatarPreview || teacherToEdit?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"} alt="Faculty photo" className="h-16 w-16 rounded-xl ring-1 ring-border object-cover" />
            {avatarPreview && <button type="button" onClick={() => { setAvatarPreview(null); setAvatarDataUrl(""); }} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>}
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-xs font-semibold flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Faculty Photo *</div>
            <p className="text-[11px] text-muted-foreground">JPG/PNG, {"<"}2MB. Yehi photo directory aur profile me dikhega. localStorage me save hoga.</p>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => avatarInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> {avatarPreview ? "Change Photo" : "Upload Photo"}</Button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                First Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register("firstName")}
                placeholder="e.g. Sunita"
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
                placeholder="e.g. Rao"
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
                placeholder="teacher@apex.edu.in"
                className={errors.email ? "border-rose-500" : ""}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Mobile Number</label>
              <Input
                {...register("phone")}
                placeholder="98765 43210"
                inputMode="numeric"
                className={errors.phone ? "border-rose-500" : ""}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">PAN (for TDS)</label>
              <Input
                {...register("panNumber")}
                placeholder="ABCDE1234F"
                className={errors.panNumber ? "border-rose-500" : ""}
              />
              {errors.panNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.panNumber.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Aadhaar (optional)</label>
              <Input
                {...register("aadhaarNumber")}
                placeholder="12-digit Aadhaar"
                inputMode="numeric"
                className={errors.aadhaarNumber ? "border-rose-500" : ""}
              />
              {errors.aadhaarNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.aadhaarNumber.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
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
              <label className="text-xs font-medium text-foreground mb-1 block">Designation</label>
              <Select value={designation || ""} onValueChange={(val) => setValue("designation", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {TEACHING_DESIGNATIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Qualifications</label>
              <Input
                {...register("qualification")}
                placeholder="e.g. M.Sc. Physics, B.Ed."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Subjects Taught (Comma-separated)
            </label>
            <Input
              {...register("subjectsString")}
              placeholder="e.g. Mathematics, Algebra, Geometry"
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
              <label className="text-xs font-medium text-foreground mb-1 block">Monthly Base (₹)</label>
              <Input
                type="number"
                {...register("baseSalary", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Allowances (₹)</label>
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
              placeholder="B.Ed. background, NTSE/Olympiad mentoring, board-examiner experience..."
              rows={2}
            />
          </div>

          {/* Documents upload — stored in Documents module */}
          <div className="space-y-3 p-3 rounded-xl border bg-muted/20">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Faculty Documents — Upload & Store <Badge variant="outline" className="text-[10px]">{docs.length} files</Badge></h4>
            <p className="text-[11px] text-muted-foreground">Degree, B.Ed, Aadhaar, PAN, experience letters yahan upload karein — yehi files <strong>Documents</strong> module me bhi dikhengi, verification ke saath.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => docInputRef.current?.click()}><Plus className="h-3.5 w-3.5" /> Add Document</Button>
              <input ref={docInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleDocUpload} />
              <span className="text-[11px] text-muted-foreground self-center">PDF / JPG / PNG — multiple, max 5MB each</span>
            </div>
            {docs.length === 0 ? (
              <div className="text-xs text-muted-foreground p-3 border border-dashed rounded-lg text-center">No documents yet — upload Degree, PAN, Aadhaar etc. (jaise student me kiya)</div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{d.name}</div>
                        <div className="text-[11px] text-muted-foreground">{d.type} • {d.size} • {d.uploadedAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => toggleVerified(d.id)} className={`text-[10px] px-2 py-1 rounded-full border ${d.verified ? "bg-emerald-500 text-white border-emerald-600" : "bg-muted text-muted-foreground"}`}>{d.verified ? "Verified" : "Pending"}</button>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeDoc(d.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
