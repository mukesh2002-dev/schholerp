"use client";

import React, { useState, useEffect, useRef } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { createAdmissionApi } from "@/lib/api/admissions";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import { UserPlus, Upload, Image as ImageIcon, X } from "lucide-react";
import { INDIAN_GRADES } from "@/lib/india";
import { toast } from "sonner";

interface AdmissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const gradesList: string[] = [...INDIAN_GRADES];

// Minimal admission form: only the fields needed to open an application and
// later enrol the student. The student record internally copies the guardian
// details (name/phone/email) + applicant identity from this application.
const admissionSchema = z.object({
  firstName: z.string().min(1, "Applicant name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1),
  gradeApplied: z.string().min(1),
  branchId: z.string().min(1),
  academicYear: z.string().optional(),
  parentName: z.string().min(1, "Parent / guardian name is required"),
  parentRelationship: z.string().min(1),
  parentEmail: z.string().optional(),
  parentPhone: z.string().min(1, "Parent mobile is required"),
  // Previous schooling + address (optional at admission, reused at enrollment)
  previousSchool: z.string().max(120).optional(),
  previousGrade: z.string().max(60).optional(),
  board: z.string().max(30).optional(),
  category: z.string().max(20).optional(),
  aadhaarNumber: z.string().max(12).optional(),
  address: z.string().optional(),
  city: z.string().max(60).optional(),
  state: z.string().max(60).optional(),
  postalCode: z.string().max(10).optional(),
  rteQuota: z.boolean().optional(),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

export function AdmissionFormDialog({ open, onOpenChange, onSuccess }: AdmissionFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [step, setStep] = useState<1 | 2>(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<Array<{ file: File; name: string }>>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

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
      parentName: "",
      parentRelationship: "Father",
      parentEmail: "",
      parentPhone: "",
      previousSchool: "",
      previousGrade: "",
      board: "",
      category: "",
      aadhaarNumber: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      rteQuota: false,
    },
  });

  const gender = watch("gender");
  const gradeApplied = watch("gradeApplied");
  const branchId = watch("branchId");
  const parentRelationship = watch("parentRelationship");
  const category = watch("category");
  const rteQuota = watch("rteQuota");

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
        parentName: "",
        parentRelationship: "Father",
        parentEmail: "",
        parentPhone: "",
        previousSchool: "",
        previousGrade: "",
        board: "",
        category: "",
        aadhaarNumber: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        rteQuota: false,
      });
      setStep(1);
      setAvatarPreview(null);
      setAvatarFile(null);
      setDocFiles([]);
    }
  }, [open, activeBranchId, reset]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Photo must be < 10MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    toast.success("Photo attached — uploads to Cloudinary on submit");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const ok = files.filter((f) => {
      if (!(f.type.startsWith("image/") || f.type === "application/pdf")) { toast.error(`${f.name}: images + PDF only`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name}: must be < 10MB`); return false; }
      return true;
    });
    if (docFiles.length + ok.length > 10) { toast.error("Max 10 documents"); return; }
    setDocFiles((prev) => [...prev, ...ok.map((file) => ({ file, name: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") }))]);
    if (docsInputRef.current) docsInputRef.current.value = "";
  };

  const onSubmit = async (data: AdmissionFormValues) => {
    const payload: Record<string, unknown> = {
      firstName: data.firstName,
      lastName: data.lastName,
      gender: String(data.gender).toLowerCase(),
      dob: data.dateOfBirth,
      gradeApplied: data.gradeApplied,
      academicYear: data.academicYear || "2026-2027",
      parentName: data.parentName,
      parentRelationship: data.parentRelationship,
      parentEmail: data.parentEmail || undefined,
      parentPhone: data.parentPhone,
      campusUuid: data.branchId && data.branchId !== "all" ? data.branchId : undefined,
      // Previous schooling + address detail (new fields — persisted in DB)
      previousSchool: data.previousSchool || undefined,
      previousGrade: data.previousGrade || undefined,
      board: data.board || undefined,
      category: data.category || undefined,
      aadhaarNumber: data.aadhaarNumber || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      postalCode: data.postalCode || undefined,
      rteQuota: data.rteQuota ?? false,
    };

    try {
      // Files go as multipart → backend uploads to Cloudinary + saves URLs in DB.
      const saved = await createAdmissionApi(payload, data.branchId !== "all" ? data.branchId : undefined, {
        avatar: avatarFile,
        documents: docFiles,
      });
      toast.success(`School application submitted`, { description: `${saved.applicantFullName} • ${saved.applicationNumber}` });
      onOpenChange(false);
      setStep(1);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application", {
        description: "Check that all required fields are valid.",
      });
    }
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
                Class Nursery–12 — minimal details; guardian info is reused when enrolling the student
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Photo upload */}
        <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
          <div className="relative">
            <AppImage src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="Applicant photo" className="h-16 w-16 rounded-xl ring-1 ring-border object-cover" />
            {avatarPreview && <button type="button" onClick={() => { setAvatarPreview(null); setAvatarFile(null); }} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>}
          </div>
          <div className="space-y-1 flex-1">
            <div className="text-xs font-semibold flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" /> Student Photo</div>
            <p className="text-[11px] text-muted-foreground">Upload passport photo — JPG/PNG, {"<"} 10MB. Stored on Cloudinary with application & student dossier.</p>
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
            <span>1. Applicant</span>
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg ${
              step === 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>2. Guardian</span>
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

              <p className="text-[11px] font-semibold text-foreground mt-1">Last School Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous School</label>
                  <Input {...register("previousSchool")} placeholder="e.g. St. Jude Prep" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Previous Class</label>
                  <Input {...register("previousGrade")} placeholder="e.g. Class 8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Board</label>
                  <Input {...register("board")} placeholder="e.g. CBSE" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Category</label>
                  <Select value={category || ""} onValueChange={(val) => setValue("category", val)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="EWS">EWS</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Aadhaar Number</label>
                  <Input {...register("aadhaarNumber")} placeholder="12-digit" inputMode="numeric" maxLength={12} />
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-5">
                  <input
                    type="checkbox"
                    checked={!!rteQuota}
                    onChange={(e) => setValue("rteQuota", e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  RTE Quota
                </label>
              </div>

              <p className="text-[11px] font-semibold text-foreground mt-1">Address</p>
              <div>
                <Input {...register("address")} placeholder="Street address" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Input {...register("city")} placeholder="City" /></div>
                <div><Input {...register("state")} placeholder="State" /></div>
                <div><Input {...register("postalCode")} placeholder="PIN code" inputMode="numeric" /></div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                These stay saved on the application and are reused at enrollment — HR fills only what is left blank.
              </p>

              {/* Supporting documents → Cloudinary */}
              <div className="space-y-2 p-3 rounded-xl border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold">Supporting Documents {docFiles.length > 0 && <Badge variant="secondary" className="ml-1 text-[10px]">{docFiles.length}</Badge>}</div>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => docsInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Attach Files</Button>
                  <input ref={docsInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleDocsChange} />
                </div>
                <p className="text-[11px] text-muted-foreground">Birth certificate, previous report card, address proof… images + PDF, max 10.</p>
                {docFiles.map((d, i) => (
                  <div key={`${d.file.name}-${i}`} className="flex items-center gap-2">
                    <Input
                      value={d.name}
                      onChange={(e) => setDocFiles((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      placeholder="Document name"
                      className="h-7 text-xs flex-1"
                    />
                    <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{d.file.name}</span>
                    <button type="button" onClick={() => setDocFiles((prev) => prev.filter((_, j) => j !== i))} className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center shrink-0"><X className="h-3 w-3" /></button>
                  </div>
                ))}
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
                    Parent Mobile <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    {...register("parentPhone")}
                    placeholder="98765 43210"
                    inputMode="numeric"
                    className={errors.parentPhone ? "border-rose-500" : ""}
                  />
                  {errors.parentPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.parentPhone.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1 block">Parent Email</label>
                  <Input
                    type="email"
                    {...register("parentEmail")}
                    placeholder="parent@domain.com"
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                These guardian details are copied to the student record when this application is enrolled.
              </p>
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
                  Continue to Guardian →
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}