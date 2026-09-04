"use client";

import React, { useEffect } from "react";
import { Branch, BranchStatus, BranchType } from "@/types";
import { useERP } from "@/components/providers/erp-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Building2, Check } from "lucide-react";
import {
  SCHOOL_BOARDS,
  INDIAN_STATES,
  INDIAN_MOBILE_REGEX,
  INDIAN_PIN_REGEX,
  UDISE_REGEX,
  normaliseIndianMobile,
} from "@/lib/india";

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchToEdit?: Branch | null;
  onSuccess?: () => void;
}

const campusTypes: BranchType[] = [
  "Main Campus",
  "STEM Academy",
  "Montessori & Prep",
  "International",
  "High School",
  "Arts & Sports",
];

const campusColors = [
  { name: "Ocean Blue", value: "#3b82f6" },
  { name: "Royal Purple", value: "#8b5cf6" },
  { name: "Emerald Green", value: "#10b981" },
  { name: "Amber Gold", value: "#f59e0b" },
  { name: "Rose Pink", value: "#ec4899" },
  { name: "Forest Green", value: "#059669" },
];

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z.string().min(1, "Branch code is required (e.g. APX-01)"),
  tagline: z.string().optional(),
  type: z.string().min(1),
  board: z.string().min(1, "Select affiliation board"),
  udiseCode: z
    .string()
    .optional()
    .refine((v) => !v || UDISE_REGEX.test(v.trim()), "UDISE code must be 11 digits"),
  affiliationNumber: z.string().optional(),
  principalName: z.string().min(1, "Principal name is required"),
  principalEmail: z.string().min(1, "Principal email is required").email("Invalid email"),
  principalPhone: z
    .string()
    .optional()
    .refine(
      (v) => !v || INDIAN_MOBILE_REGEX.test(normaliseIndianMobile(v)),
      "Enter a valid 10-digit mobile number"
    ),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z
    .string()
    .optional()
    .refine((v) => !v || INDIAN_PIN_REGEX.test(v.trim()), "Enter a valid 6-digit PIN code"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || INDIAN_MOBILE_REGEX.test(normaliseIndianMobile(v)),
      "Enter a valid 10-digit mobile number"
    ),
  email: z.string().optional(),
  website: z.string().optional(),
  establishedYear: z.number().min(1900).max(2100),
  status: z.string().min(1),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  totalStudents: z.number().min(0),
  totalTeachers: z.number().min(0),
  totalStaff: z.number().min(0),
  totalWorkers: z.number().min(0),
  monthlyRevenue: z.number().min(0),
  monthlyExpenses: z.number().min(0),
  attendanceRate: z.number().min(0).max(100),
  feeCollectionRate: z.number().min(0).max(100),
  facilitiesString: z.string().optional(),
  color: z.string().min(1),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export function BranchFormDialog({
  open,
  onOpenChange,
  branchToEdit,
  onSuccess,
}: BranchFormDialogProps) {
  const { saveBranch } = useERP();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: "",
      code: "",
      tagline: "",
      type: "Main Campus",
      board: "CBSE",
      udiseCode: "",
      affiliationNumber: "",
      principalName: "",
      principalEmail: "",
      principalPhone: "",
      address: "",
      city: "",
      state: "Maharashtra",
      postalCode: "",
      phone: "",
      email: "",
      website: "",
      establishedYear: 2020,
      status: "ACTIVE",
      capacity: 1000,
      totalStudents: 500,
      totalTeachers: 40,
      totalStaff: 12,
      totalWorkers: 15,
      monthlyRevenue: 4500000,
      monthlyExpenses: 2800000,
      attendanceRate: 96.0,
      feeCollectionRate: 95.0,
      facilitiesString: "Smart Classrooms, Atal Tinkering Lab, Central Library, Cricket Ground, Canteen",
      color: "#3b82f6",
    },
  });

  const type = watch("type");
  const board = watch("board");
  const state = watch("state");
  const status = watch("status");
  const color = watch("color");

  useEffect(() => {
    if (open) {
      if (branchToEdit) {
        reset({
          name: branchToEdit.name,
          code: branchToEdit.code,
          tagline: branchToEdit.tagline || "",
          type: branchToEdit.type,
          board: branchToEdit.board || "CBSE",
          udiseCode: branchToEdit.udiseCode || "",
          affiliationNumber: branchToEdit.affiliationNumber || "",
          principalName: branchToEdit.principalName,
          principalEmail: branchToEdit.principalEmail,
          principalPhone: branchToEdit.principalPhone,
          address: branchToEdit.address,
          city: branchToEdit.city,
          state: branchToEdit.state,
          postalCode: branchToEdit.postalCode,
          phone: branchToEdit.phone,
          email: branchToEdit.email,
          website: branchToEdit.website,
          establishedYear: branchToEdit.establishedYear,
          status: branchToEdit.status,
          capacity: branchToEdit.capacity,
          totalStudents: branchToEdit.totalStudents,
          totalTeachers: branchToEdit.totalTeachers,
          totalStaff: branchToEdit.totalStaff,
          totalWorkers: branchToEdit.totalWorkers,
          monthlyRevenue: branchToEdit.monthlyRevenue,
          monthlyExpenses: branchToEdit.monthlyExpenses,
          attendanceRate: branchToEdit.attendanceRate,
          feeCollectionRate: branchToEdit.feeCollectionRate,
          facilitiesString: branchToEdit.facilities.join(", "),
          color: branchToEdit.color || "#3b82f6",
        });
      } else {
        reset({
          name: "",
          code: "",
          tagline: "",
          type: "Main Campus",
          board: "CBSE",
          udiseCode: "",
          affiliationNumber: "",
          principalName: "",
          principalEmail: "",
          principalPhone: "",
          address: "",
          city: "",
          state: "Maharashtra",
          postalCode: "",
          phone: "",
          email: "",
          website: "",
          establishedYear: 2022,
          status: "ACTIVE",
          capacity: 1200,
          totalStudents: 650,
          totalTeachers: 45,
          totalStaff: 14,
          totalWorkers: 18,
          monthlyRevenue: 4800000,
          monthlyExpenses: 3000000,
          attendanceRate: 96.2,
          feeCollectionRate: 94.5,
          facilitiesString: "Smart Classrooms, Atal Tinkering Lab, Central Library, Cricket Ground, Canteen",
          color: "#3b82f6",
        });
      }
    }
  }, [branchToEdit, open, reset]);

  const onSubmit = (data: BranchFormValues) => {
    const facilities = (data.facilitiesString || "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const branchPayload = {
      ...(branchToEdit?.id ? { id: branchToEdit.id } : {}),
      name: data.name,
      code: data.code.toUpperCase(),
      tagline: data.tagline || `${data.name} - Excellence in Education`,
      type: data.type as BranchType,
      board: data.board,
      udiseCode: data.udiseCode?.trim() || undefined,
      affiliationNumber: data.affiliationNumber?.trim() || undefined,
      principalName: data.principalName,
      principalEmail: data.principalEmail,
      principalPhone: data.principalPhone ? `+91 ${normaliseIndianMobile(data.principalPhone)}` : "+91 98220 00000",
      address: data.address || "Main School Road",
      city: data.city,
      state: data.state || "Maharashtra",
      postalCode: data.postalCode || "411001",
      phone: data.phone ? `+91 ${normaliseIndianMobile(data.phone)}` : "+91 20 2545 0000",
      email: data.email || `info@${data.code.toLowerCase()}.edu.in`,
      website: data.website || `https://${data.code.toLowerCase()}.edu.in`,
      establishedYear: Number(data.establishedYear),
      status: data.status as BranchStatus,
      capacity: Number(data.capacity),
      totalStudents: Number(data.totalStudents),
      totalTeachers: Number(data.totalTeachers),
      totalStaff: Number(data.totalStaff),
      totalWorkers: Number(data.totalWorkers),
      monthlyRevenue: Number(data.monthlyRevenue),
      monthlyExpenses: Number(data.monthlyExpenses),
      attendanceRate: Number(data.attendanceRate),
      feeCollectionRate: Number(data.feeCollectionRate),
      facilities: facilities.length > 0 ? facilities : ["Smart Classrooms", "Library", "Labs"],
      departments: branchToEdit?.departments || [
        { name: "Academic Faculty", head: data.principalName, staffCount: Number(data.totalTeachers) },
        { name: "Administration & Support", head: "Campus Ops", staffCount: Number(data.totalStaff) },
      ],
      color: data.color,
    };

    setTimeout(() => {
      saveBranch(branchPayload);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
              style={{ backgroundColor: color }}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {branchToEdit ? `Edit Branch: ${branchToEdit.name}` : "Register New Campus Branch"}
              </DialogTitle>
              <DialogDescription>
                Configure campus credentials, principal contact info, capacity quotas, and branch facilities.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Section: General Campus Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              General Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Campus Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Apex Global Campus"
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Branch Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("code")}
                  placeholder="e.g. APX-01"
                  className={errors.code ? "border-rose-500" : ""}
                />
                {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Campus Type</label>
                <Select value={type} onValueChange={(val) => setValue("type", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {campusTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
                <Select value={status} onValueChange={(val) => setValue("status", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active (Operational)</SelectItem>
                    <SelectItem value="EXPANDING">Expanding / New Wing</SelectItem>
                    <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                    <SelectItem value="INACTIVE">Inactive / Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Affiliation Board</label>
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
                <label className="text-xs font-medium text-foreground mb-1 block">UDISE+ Code</label>
                <Input
                  {...register("udiseCode")}
                  placeholder="11-digit UDISE code"
                  inputMode="numeric"
                  className={errors.udiseCode ? "border-rose-500" : ""}
                />
                {errors.udiseCode && <p className="text-[11px] text-rose-500 mt-1">{errors.udiseCode.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Affiliation No.</label>
                <Input
                  {...register("affiliationNumber")}
                  placeholder="e.g. 1130456"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Motto / Tagline</label>
              <Input
                {...register("tagline")}
                placeholder="e.g. CBSE Campus — Kothrud, Pune"
              />
            </div>
          </div>

          {/* Section: Principal & Administration */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Principal & Leadership Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Principal Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("principalName")}
                  placeholder="Dr. Meera Kapoor, Ph.D."
                  className={errors.principalName ? "border-rose-500" : ""}
                />
                {errors.principalName && <p className="text-[11px] text-rose-500 mt-1">{errors.principalName.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Principal Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("principalEmail")}
                  placeholder="principal@apex.edu.in"
                  className={errors.principalEmail ? "border-rose-500" : ""}
                />
                {errors.principalEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.principalEmail.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Principal Mobile</label>
                <Input
                  {...register("principalPhone")}
                  placeholder="98220 45678"
                  inputMode="numeric"
                  className={errors.principalPhone ? "border-rose-500" : ""}
                />
                {errors.principalPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.principalPhone.message}</p>}
              </div>
            </div>
          </div>

          {/* Section: Location & Capacity */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1">
              Location & Capacity Metrics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-foreground mb-1 block">Campus Address</label>
                <Input
                  {...register("address")}
                  placeholder="100 Paud Road, Kothrud"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  City <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("city")}
                  placeholder="Pune"
                  className={errors.city ? "border-rose-500" : ""}
                />
                {errors.city && <p className="text-[11px] text-rose-500 mt-1">{errors.city.message}</p>}
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Student Capacity</label>
                <Input
                  type="number"
                  {...register("capacity", { valueAsNumber: true })}
                />
                {errors.capacity && <p className="text-[11px] text-rose-500 mt-1">{errors.capacity.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Current Students</label>
                <Input
                  type="number"
                  {...register("totalStudents", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Faculty Count</label>
                <Input
                  type="number"
                  {...register("totalTeachers", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Support Workers</label>
                <Input
                  type="number"
                  {...register("totalWorkers", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Key Facilities (Comma-separated)
              </label>
              <Textarea
                {...register("facilitiesString")}
                placeholder="Smart Classrooms, Atal Tinkering Lab, Cricket Ground, Central Library"
                rows={2}
              />
            </div>

            {/* Campus Color Accent */}
            <div>
              <label className="text-xs font-medium text-foreground mb-2 block">Campus Accent Theme Color</label>
              <div className="flex items-center gap-3">
                {campusColors.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setValue("color", c.value)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-background ${
                      color === c.value ? "ring-primary" : "ring-transparent"
                    }`}
                    style={{
                      backgroundColor: c.value,
                    }}
                    title={c.name}
                  >
                    {color === c.value && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="gradient">
              {isSubmitting ? "Saving Branch..." : branchToEdit ? "Update Branch" : "Create Campus Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
