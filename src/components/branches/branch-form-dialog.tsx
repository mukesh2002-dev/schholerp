"use client";

import React, { useState, useEffect } from "react";
import { Branch, BranchStatus, BranchType } from "@/types";
import { useERP } from "@/components/providers/erp-provider";
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
import { Building2, Check, Sparkles } from "lucide-react";

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

export function BranchFormDialog({
  open,
  onOpenChange,
  branchToEdit,
  onSuccess,
}: BranchFormDialogProps) {
  const { saveBranch } = useERP();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    tagline: "",
    type: "Main Campus" as BranchType,
    principalName: "",
    principalEmail: "",
    principalPhone: "",
    address: "",
    city: "",
    state: "CA",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    establishedYear: 2020,
    status: "ACTIVE" as BranchStatus,
    capacity: 1000,
    totalStudents: 500,
    totalTeachers: 40,
    totalStaff: 12,
    totalWorkers: 15,
    monthlyRevenue: 200000,
    monthlyExpenses: 120000,
    attendanceRate: 96.0,
    feeCollectionRate: 95.0,
    facilitiesString: "Smart Classrooms, Central Library, Computer Lab, Cafeteria, Sports Ground",
    color: "#3b82f6",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (branchToEdit) {
      setFormData({
        name: branchToEdit.name,
        code: branchToEdit.code,
        tagline: branchToEdit.tagline || "",
        type: branchToEdit.type,
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
      setFormData({
        name: "",
        code: "",
        tagline: "",
        type: "Main Campus",
        principalName: "",
        principalEmail: "",
        principalPhone: "",
        address: "",
        city: "",
        state: "CA",
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
        monthlyRevenue: 220000,
        monthlyExpenses: 140000,
        attendanceRate: 96.2,
        feeCollectionRate: 94.5,
        facilitiesString: "Smart Classrooms, Robotics Lab, Central Library, Sports Arena, Cafeteria",
        color: "#3b82f6",
      });
    }
    setErrors({});
  }, [branchToEdit, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Branch name is required";
    if (!formData.code.trim()) newErrors.code = "Branch code is required (e.g. APX-01)";
    if (!formData.principalName.trim()) newErrors.principalName = "Principal name is required";
    if (!formData.principalEmail.trim()) newErrors.principalEmail = "Principal email is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (formData.capacity <= 0) newErrors.capacity = "Capacity must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const facilities = formData.facilitiesString
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    const branchPayload = {
      ...(branchToEdit?.id ? { id: branchToEdit.id } : {}),
      name: formData.name,
      code: formData.code.toUpperCase(),
      tagline: formData.tagline || `${formData.name} - Excellence in Education`,
      type: formData.type,
      principalName: formData.principalName,
      principalEmail: formData.principalEmail,
      principalPhone: formData.principalPhone || "+1 (555) 000-0000",
      address: formData.address || "Main Campus Avenue",
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode || "90001",
      phone: formData.phone || "+1 (555) 123-4567",
      email: formData.email || `info@${formData.code.toLowerCase()}.edu`,
      website: formData.website || `https://${formData.code.toLowerCase()}.edu`,
      establishedYear: Number(formData.establishedYear),
      status: formData.status,
      capacity: Number(formData.capacity),
      totalStudents: Number(formData.totalStudents),
      totalTeachers: Number(formData.totalTeachers),
      totalStaff: Number(formData.totalStaff),
      totalWorkers: Number(formData.totalWorkers),
      monthlyRevenue: Number(formData.monthlyRevenue),
      monthlyExpenses: Number(formData.monthlyExpenses),
      attendanceRate: Number(formData.attendanceRate),
      feeCollectionRate: Number(formData.feeCollectionRate),
      facilities: facilities.length > 0 ? facilities : ["Smart Classrooms", "Library", "Labs"],
      departments: branchToEdit?.departments || [
        { name: "Academic Faculty", head: formData.principalName, staffCount: Number(formData.totalTeachers) },
        { name: "Administration & Support", head: "Campus Ops", staffCount: Number(formData.totalStaff) },
      ],
      color: formData.color,
    };

    setTimeout(() => {
      saveBranch(branchPayload);
      setIsSubmitting(false);
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
              style={{ backgroundColor: formData.color }}
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

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Global Campus"
                  className={errors.name ? "border-rose-500" : ""}
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Branch Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. APX-01"
                  className={errors.code ? "border-rose-500" : ""}
                />
                {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Campus Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val as BranchType })}
                >
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
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val as BranchStatus })}
                >
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

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Motto / Tagline</label>
              <Input
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Flagship Metro Academic & Innovation Center"
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
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="Dr. Eleanor Vance, Ph.D."
                  className={errors.principalName ? "border-rose-500" : ""}
                />
                {errors.principalName && <p className="text-[11px] text-rose-500 mt-1">{errors.principalName}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  Principal Email <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.principalEmail}
                  onChange={(e) => setFormData({ ...formData, principalEmail: e.target.value })}
                  placeholder="principal@campus.edu"
                  className={errors.principalEmail ? "border-rose-500" : ""}
                />
                {errors.principalEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.principalEmail}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Principal Phone</label>
                <Input
                  value={formData.principalPhone}
                  onChange={(e) => setFormData({ ...formData, principalPhone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                />
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
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="100 Innovation Boulevard"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">
                  City <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Metro City"
                  className={errors.city ? "border-rose-500" : ""}
                />
                {errors.city && <p className="text-[11px] text-rose-500 mt-1">{errors.city}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Student Capacity</label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Current Students</label>
                <Input
                  type="number"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Faculty Count</label>
                <Input
                  type="number"
                  value={formData.totalTeachers}
                  onChange={(e) => setFormData({ ...formData, totalTeachers: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Support Workers</label>
                <Input
                  type="number"
                  value={formData.totalWorkers}
                  onChange={(e) => setFormData({ ...formData, totalWorkers: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Key Facilities (Comma-separated)
              </label>
              <Textarea
                value={formData.facilitiesString}
                onChange={(e) => setFormData({ ...formData, facilitiesString: e.target.value })}
                placeholder="Smart Classrooms, Robotics AI Lab, Olympic Swimming Pool, Central Library"
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
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-background ${
                      formData.color === c.value ? "ring-primary" : "ring-transparent"
                    }`}
                    style={{
                      backgroundColor: c.value,
                    }}
                    title={c.name}
                  >
                    {formData.color === c.value && <Check className="h-4 w-4 text-white" />}
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
