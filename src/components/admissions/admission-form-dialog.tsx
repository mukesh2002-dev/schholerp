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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import {
  User,
  Users,
  MapPin,
  GraduationCap,
  HeartPulse,
  Bus,
  FileCheck,
  PenLine,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Baby,
  Phone,
  Home,
} from "lucide-react";
import {
  INDIAN_GRADES,
  INDIAN_STATE_NAMES,
  SCHOOL_BOARDS,
  SOCIAL_CATEGORIES,
  RELIGIONS,
  MOTHER_TONGUES,
  INDIAN_MOBILE_REGEX,
  INDIAN_PIN_REGEX,
  isValidAadhaar,
  normaliseIndianMobile,
} from "@/lib/india";
import { toast } from "sonner";

interface AdmissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const NATIONALITIES = ["Indian", "Other"] as const;
const INCOME_RANGES = ["Below 1 Lakh", "1-3 Lakhs", "3-5 Lakhs", "5-10 Lakhs", "10 Lakhs+"] as const;
const MEDIUMS = ["English", "Hindi", "Regional", "Other"] as const;

// ── All optional — no refine blocking — submit always works ──
const admissionSchema = z.object({
  firstName: z.string().max(60).optional().or(z.literal("")),
  middleName: z.string().max(60).optional().or(z.literal("")),
  lastName: z.string().max(60).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  gradeApplied: z.string().optional().or(z.literal("")),
  academicYear: z.string().optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  motherTongue: z.string().optional().or(z.literal("")),
  aadhaarNumber: z.string().optional().or(z.literal("")),
  fatherName: z.string().max(120).optional().or(z.literal("")),
  fatherQualification: z.string().max(60).optional().or(z.literal("")),
  fatherOccupation: z.string().max(60).optional().or(z.literal("")),
  fatherOrganization: z.string().max(120).optional().or(z.literal("")),
  fatherAnnualIncome: z.string().optional().or(z.literal("")),
  fatherMobile: z.string().optional().or(z.literal("")),
  fatherEmail: z.string().optional().or(z.literal("")),
  fatherAadhaar: z.string().optional().or(z.literal("")),
  motherName: z.string().max(120).optional().or(z.literal("")),
  motherQualification: z.string().max(60).optional().or(z.literal("")),
  motherOccupation: z.string().max(60).optional().or(z.literal("")),
  motherOrganization: z.string().max(120).optional().or(z.literal("")),
  motherAnnualIncome: z.string().optional().or(z.literal("")),
  motherMobile: z.string().optional().or(z.literal("")),
  motherEmail: z.string().optional().or(z.literal("")),
  motherAadhaar: z.string().optional().or(z.literal("")),
  guardianName: z.string().max(120).optional().or(z.literal("")),
  guardianRelation: z.string().max(30).optional().or(z.literal("")),
  guardianContact: z.string().optional().or(z.literal("")),
  guardianEmail: z.string().optional().or(z.literal("")),
  presentHouseNo: z.string().max(60).optional().or(z.literal("")),
  presentStreet: z.string().max(120).optional().or(z.literal("")),
  presentArea: z.string().max(120).optional().or(z.literal("")),
  presentDistrict: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  permanentSameAsPresent: z.boolean().optional(),
  permanentHouseNo: z.string().max(60).optional().or(z.literal("")),
  permanentStreet: z.string().max(120).optional().or(z.literal("")),
  permanentArea: z.string().max(120).optional().or(z.literal("")),
  permanentCity: z.string().max(60).optional().or(z.literal("")),
  permanentDistrict: z.string().max(60).optional().or(z.literal("")),
  permanentState: z.string().max(60).optional().or(z.literal("")),
  permanentPostalCode: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().max(120).optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  emergencyContactRelation: z.string().max(30).optional().or(z.literal("")),
  previousSchool: z.string().max(120).optional().or(z.literal("")),
  previousSchoolLocation: z.string().max(120).optional().or(z.literal("")),
  board: z.string().max(30).optional().or(z.literal("")),
  lastClassAttended: z.string().max(20).optional().or(z.literal("")),
  lastClassPassed: z.string().max(20).optional().or(z.literal("")),
  percentageGrade: z.string().max(20).optional().or(z.literal("")),
  mediumOfInstruction: z.string().max(20).optional().or(z.literal("")),
  reasonForLeaving: z.string().max(500).optional().or(z.literal("")),
  allergies: z.string().max(500).optional().or(z.literal("")),
  chronicIllness: z.string().max(500).optional().or(z.literal("")),
  specialNeeds: z.boolean().optional(),
  specialNeedsDetails: z.string().max(500).optional().or(z.literal("")),
  transportRequired: z.boolean().optional(),
  busStop: z.string().max(120).optional().or(z.literal("")),
  pickupRoute: z.string().max(120).optional().or(z.literal("")),
  siblingName: z.string().max(120).optional().or(z.literal("")),
  siblingClass: z.string().max(30).optional().or(z.literal("")),
  siblingAdmissionNo: z.string().max(30).optional().or(z.literal("")),
  siblingCategory: z.string().max(30).optional().or(z.literal("")),
  declarationAccepted: z.boolean().optional(),
  declarationPlace: z.string().max(60).optional().or(z.literal("")),
});

type AdmissionFormValues = z.infer<typeof admissionSchema>;

const STEPS = [
  { id: 1, label: "Student", icon: Baby, desc: "Jankari" },
  { id: 2, label: "Parents", icon: Users, desc: "Mata-Pita" },
  { id: 3, label: "Address", icon: MapPin, desc: "Pata" },
  { id: 4, label: "Academic", icon: GraduationCap, desc: "Purana Record" },
  { id: 5, label: "Services", icon: Bus, desc: "Transport/Sibling" },
  { id: 6, label: "Docs & Sign", icon: FileCheck, desc: "Declaration" },
] as const;

export function AdmissionFormDialog({ open, onOpenChange, onSuccess }: AdmissionFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [docFiles, setDocFiles] = useState<Array<{ file: File; name: string }>>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const docsInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "2015-06-15",
      gender: "Male",
      gradeApplied: "Class 1",
      academicYear: "2026-2027",
      branchId: activeBranchId !== "all" ? activeBranchId : "",
      bloodGroup: "O+",
      nationality: "Indian",
      religion: "",
      category: "General",
      motherTongue: "Hindi",
      aadhaarNumber: "",
      fatherName: "",
      fatherQualification: "",
      fatherOccupation: "",
      fatherOrganization: "",
      fatherAnnualIncome: "",
      fatherMobile: "",
      fatherEmail: "",
      fatherAadhaar: "",
      motherName: "",
      motherQualification: "",
      motherOccupation: "",
      motherOrganization: "",
      motherAnnualIncome: "",
      motherMobile: "",
      motherEmail: "",
      motherAadhaar: "",
      guardianName: "",
      guardianRelation: "",
      guardianContact: "",
      guardianEmail: "",
      presentHouseNo: "",
      presentStreet: "",
      presentArea: "",
      presentDistrict: "",
      city: "",
      state: "Maharashtra",
      postalCode: "",
      permanentSameAsPresent: true,
      permanentHouseNo: "",
      permanentStreet: "",
      permanentArea: "",
      permanentCity: "",
      permanentDistrict: "",
      permanentState: "",
      permanentPostalCode: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "Father",
      previousSchool: "",
      previousSchoolLocation: "",
      board: "CBSE",
      lastClassAttended: "",
      lastClassPassed: "",
      percentageGrade: "",
      mediumOfInstruction: "English",
      reasonForLeaving: "",
      allergies: "None",
      chronicIllness: "None",
      specialNeeds: false,
      specialNeedsDetails: "",
      transportRequired: false,
      busStop: "",
      pickupRoute: "",
      siblingName: "",
      siblingClass: "",
      siblingAdmissionNo: "",
      siblingCategory: "",
      declarationAccepted: false,
      declarationPlace: "",
    },
  });

  const vals = watch();

  useEffect(() => {
    if (open) {
      reset({
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "2015-06-15",
        gender: "Male",
        gradeApplied: "Class 1",
        academicYear: "2026-2027",
        branchId: activeBranchId !== "all" ? activeBranchId : (branches[0]?.id ?? ""),
        bloodGroup: "O+",
        nationality: "Indian",
        religion: "",
        category: "General",
        motherTongue: "Hindi",
        aadhaarNumber: "",
        fatherName: "",
        fatherQualification: "",
        fatherOccupation: "",
        fatherOrganization: "",
        fatherAnnualIncome: "",
        fatherMobile: "",
        fatherEmail: "",
        fatherAadhaar: "",
        motherName: "",
        motherQualification: "",
        motherOccupation: "",
        motherOrganization: "",
        motherAnnualIncome: "",
        motherMobile: "",
        motherEmail: "",
        motherAadhaar: "",
        guardianName: "",
        guardianRelation: "",
        guardianContact: "",
        guardianEmail: "",
        presentHouseNo: "",
        presentStreet: "",
        presentArea: "",
        presentDistrict: "",
        city: "",
        state: "Maharashtra",
        postalCode: "",
        permanentSameAsPresent: true,
        permanentHouseNo: "",
        permanentStreet: "",
        permanentArea: "",
        permanentCity: "",
        permanentDistrict: "",
        permanentState: "",
        permanentPostalCode: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "Father",
        previousSchool: "",
        previousSchoolLocation: "",
        board: "CBSE",
        lastClassAttended: "",
        lastClassPassed: "",
        percentageGrade: "",
        mediumOfInstruction: "English",
        reasonForLeaving: "",
        allergies: "None",
        chronicIllness: "None",
        specialNeeds: false,
        specialNeedsDetails: "",
        transportRequired: false,
        busStop: "",
        pickupRoute: "",
        siblingName: "",
        siblingClass: "",
        siblingAdmissionNo: "",
        siblingCategory: "",
        declarationAccepted: false,
        declarationPlace: "",
      });
      setStep(1);
      setAvatarPreview(null);
      setAvatarFile(null);
      setSignaturePreview(null);
      setSignatureFile(null);
      setDocFiles([]);
    }
  }, [open, activeBranchId, branches, reset]);

  // auto-copy permanent when checkbox
  useEffect(() => {
    if (vals.permanentSameAsPresent) {
      setValue("permanentHouseNo", vals.presentHouseNo);
      setValue("permanentStreet", vals.presentStreet);
      setValue("permanentArea", vals.presentArea);
      setValue("permanentCity", vals.city);
      setValue("permanentDistrict", vals.presentDistrict);
      setValue("permanentState", vals.state);
      setValue("permanentPostalCode", vals.postalCode);
    }
  }, [vals.permanentSameAsPresent, vals.presentHouseNo, vals.presentStreet, vals.presentArea, vals.city, vals.presentDistrict, vals.state, vals.postalCode, setValue]);

  // ── Pincode auto-lookup (India Post) → auto fill district/state/city ──
  const [pinLoading, setPinLoading] = useState<"present" | "permanent" | null>(null);
  const lookupPincode = async (pin: string, which: "present" | "permanent") => {
    const clean = pin.replace(/\D/g, "");
    if (clean.length !== 6 || !/^[1-9]/.test(clean)) return;
    setPinLoading(which);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
      const data = await res.json();
      const po = data?.[0]?.PostOffice?.[0];
      if (po) {
        const district = po.District || "";
        const state = po.State || "";
        const city = po.Block && po.Block !== "NA" ? po.Block : po.District || "";
        if (which === "present") {
          if (district && !vals.presentDistrict) setValue("presentDistrict", district);
          if (state) setValue("state", state);
          if (city && !vals.city) setValue("city", city);
          toast.success(`PIN ${clean}: ${district}, ${state} auto-filled`);
        } else {
          if (district) setValue("permanentDistrict", district);
          if (state) setValue("permanentState", state);
          if (city) setValue("permanentCity", city);
          toast.success(`Permanent PIN ${clean}: ${district}, ${state}`);
        }
      } else {
        toast.error(`PIN ${clean} not found`);
      }
    } catch {
      // silent fallback — local demo mapping
      const demo: Record<string, { district: string; state: string; city: string }> = {
        "411001": { district: "Pune", state: "Maharashtra", city: "Pune" },
        "400001": { district: "Mumbai", state: "Maharashtra", city: "Mumbai" },
        "110001": { district: "Central Delhi", state: "Delhi", city: "New Delhi" },
      };
      const hit = demo[clean];
      if (hit) {
        if (which === "present") {
          setValue("presentDistrict", hit.district);
          setValue("state", hit.state);
          setValue("city", hit.city);
        } else {
          setValue("permanentDistrict", hit.district);
          setValue("permanentState", hit.state);
          setValue("permanentCity", hit.city);
        }
      }
    } finally {
      setPinLoading(null);
    }
  };
  // auto-trigger on 6-digit entry
  const prevPresentPin = useRef("");
  const prevPermPin = useRef("");
  useEffect(() => {
    const pin = (vals.postalCode || "").replace(/\D/g, "");
    if (pin.length === 6 && pin !== prevPresentPin.current) {
      prevPresentPin.current = pin;
      void lookupPincode(pin, "present");
    }
  }, [vals.postalCode]);
  useEffect(() => {
    const pin = (vals.permanentPostalCode || "").replace(/\D/g, "");
    if (pin.length === 6 && pin !== prevPermPin.current) {
      prevPermPin.current = pin;
      void lookupPincode(pin, "permanent");
    }
  }, [vals.permanentPostalCode]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Image only"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("<5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Signature image only"); return; }
    setSignatureFile(file);
    setSignaturePreview(URL.createObjectURL(file));
    if (signatureInputRef.current) signatureInputRef.current.value = "";
  };
  const handleDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const ok = files.filter((f) => {
      if (!(f.type.startsWith("image/") || f.type === "application/pdf")) { toast.error(`${f.name}: images+PDF only`); return false; }
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name}: <10MB`); return false; }
      return true;
    });
    if (docFiles.length + ok.length > 10) { toast.error("Max 10 docs"); return; }
    setDocFiles((prev) => [...prev, ...ok.map((file) => ({ file, name: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ") }))]);
    if (docsInputRef.current) docsInputRef.current.value = "";
  };

  const stepFields: Record<number, (keyof AdmissionFormValues)[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [],
  };

  const goNext = async (next: number) => {
    // No required validation now — all fields optional
    // still trigger to show format errors (e.g. invalid mobile/aadhaar) but don't block
    const fields = stepFields[step] ?? [];
    if (fields.length) {
      await trigger(fields);
    }
    setStep(next as any);
  };

  const onSubmit = async (data: AdmissionFormValues) => {
    // Guard: only submit on final step (6) — prevents auto-submit from Next clicks
    if (step !== 6) {
      console.warn("onSubmit blocked — not on final step", step);
      toast.error("Please go to Docs & Sign step and click Submit");
      return;
    }
    // All fields optional now — provide safe fallbacks for backend required columns
    const dobVal = data.dateOfBirth?.trim() || "2015-06-15";
    const campusFallback = data.branchId?.trim() || (activeBranchId !== "all" ? activeBranchId : (branches[0]?.id ?? ""));
    if (!campusFallback || campusFallback === "all") {
      toast.error("Campus select karo — Step 1 pe campus choose karo");
      setStep(1);
      return;
    }
    const fatherNameVal = data.fatherName?.trim() || data.motherName?.trim() || data.guardianName?.trim() || "Guardian";
    const fatherMobileVal = data.fatherMobile?.trim() ? normaliseIndianMobile(data.fatherMobile) : (data.motherMobile?.trim() ? normaliseIndianMobile(data.motherMobile) : "9999999999");
    const fatherEmailVal = data.fatherEmail?.trim() || data.motherEmail?.trim() || "noemail@school.local";
    const postalClean = data.postalCode?.replace(/\D/g,"") || "";
    const addr = [data.presentHouseNo, data.presentStreet, data.presentArea, data.city].filter(Boolean).join(", ") || data.presentStreet || "";
    const payload: Record<string, unknown> = {
      firstName: data.firstName?.trim() || "Student",
      middleName: data.middleName?.trim() || undefined,
      lastName: data.lastName?.trim() || undefined,
      gender: data.gender ? String(data.gender).toLowerCase() : "other",
      dob: dobVal,
      gradeApplied: data.gradeApplied?.trim() || "Class 1",
      academicYear: data.academicYear?.trim() || "2026-2027",
      campusUuid: campusFallback,
      bloodGroup: data.bloodGroup || undefined,
      nationality: data.nationality || undefined,
      religion: data.religion || undefined,
      category: data.category || undefined,
      motherTongue: data.motherTongue || undefined,
      aadhaarNumber: data.aadhaarNumber?.replace(/\s/g, "") || undefined,
      fatherName: data.fatherName?.trim() || undefined,
      fatherQualification: data.fatherQualification || undefined,
      fatherOccupation: data.fatherOccupation || undefined,
      fatherOrganization: data.fatherOrganization || undefined,
      fatherAnnualIncome: data.fatherAnnualIncome || undefined,
      fatherMobile: data.fatherMobile?.trim() ? normaliseIndianMobile(data.fatherMobile) : undefined,
      fatherEmail: data.fatherEmail || undefined,
      fatherAadhaar: data.fatherAadhaar?.replace(/\s/g,"") || undefined,
      motherName: data.motherName?.trim() || undefined,
      motherQualification: data.motherQualification || undefined,
      motherOccupation: data.motherOccupation || undefined,
      motherOrganization: data.motherOrganization || undefined,
      motherAnnualIncome: data.motherAnnualIncome || undefined,
      motherMobile: data.motherMobile?.trim() ? normaliseIndianMobile(data.motherMobile) : undefined,
      motherEmail: data.motherEmail || undefined,
      motherAadhaar: data.motherAadhaar?.replace(/\s/g,"") || undefined,
      guardianName: data.guardianName || undefined,
      guardianRelation: data.guardianRelation || undefined,
      guardianContact: data.guardianContact ? normaliseIndianMobile(data.guardianContact) : undefined,
      guardianEmail: data.guardianEmail || undefined,
      presentHouseNo: data.presentHouseNo || undefined,
      presentStreet: data.presentStreet || undefined,
      presentArea: data.presentArea || undefined,
      presentDistrict: data.presentDistrict || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      postalCode: postalClean || undefined,
      address: addr || undefined,
      permanentSameAsPresent: data.permanentSameAsPresent,
      permanentHouseNo: data.permanentHouseNo || undefined,
      permanentStreet: data.permanentStreet || undefined,
      permanentArea: data.permanentArea || undefined,
      permanentCity: data.permanentCity || undefined,
      permanentDistrict: data.permanentDistrict || undefined,
      permanentState: data.permanentState || undefined,
      permanentPostalCode: data.permanentPostalCode?.replace(/\D/g,"") || undefined,
      emergencyContactName: data.emergencyContactName || undefined,
      emergencyContactPhone: data.emergencyContactPhone?.trim() ? normaliseIndianMobile(data.emergencyContactPhone) : undefined,
      emergencyContactRelation: data.emergencyContactRelation || undefined,
      previousSchool: data.previousSchool || undefined,
      previousSchoolLocation: data.previousSchoolLocation || undefined,
      board: data.board || undefined,
      lastClassAttended: data.lastClassAttended || undefined,
      lastClassPassed: data.lastClassPassed || undefined,
      percentageGrade: data.percentageGrade || undefined,
      mediumOfInstruction: data.mediumOfInstruction || undefined,
      reasonForLeaving: data.reasonForLeaving || undefined,
      allergies: data.allergies || undefined,
      chronicIllness: data.chronicIllness || undefined,
      specialNeeds: data.specialNeeds ?? false,
      specialNeedsDetails: data.specialNeedsDetails || undefined,
      transportRequired: data.transportRequired ?? false,
      busStop: data.busStop || undefined,
      pickupRoute: data.pickupRoute || undefined,
      siblingName: data.siblingName || undefined,
      siblingClass: data.siblingClass || undefined,
      siblingAdmissionNo: data.siblingAdmissionNo || undefined,
      siblingCategory: data.siblingCategory || undefined,
      declarationAccepted: data.declarationAccepted ?? false,
      declarationDate: new Date().toISOString().slice(0,10),
      declarationPlace: data.declarationPlace || undefined,
      // legacy guardian for backward compat (backend requires)
      parentName: fatherNameVal,
      parentRelationship: "Father",
      parentEmail: fatherEmailVal,
      parentPhone: fatherMobileVal,
    };
    console.log("ADMISSION PAYLOAD", payload);
    try {
      if (!navigator.onLine) {
        toast.error("Offline — internet check karo");
        return;
      }
      const saved = await createAdmissionApi(payload, campusFallback, { avatar: avatarFile, documents: docFiles, signature: signatureFile });
      toast.success("Admission submitted ✅", { description: `${saved.applicantFullName} • ${saved.applicationNumber}` });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("ADMISSION SUBMIT ERROR", err, payload);
      const msg = err?.message || err?.error || "Submit failed";
      const details = err?.details ? JSON.stringify(err.details).slice(0,400) : err?.cause?.message || "";
      // rules.md §6-7: show proper error per standardized format
      toast.error(msg, { description: details || "Check console (F12) for details — backend response" });
    }
  };

  const Req = () => null;
  const branchOptions = branches.filter((b) => !String(b.id).includes("college"));
  const opts = branchOptions.length ? branchOptions : branches;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[94vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="p-6 pb-3 border-b bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 dark:from-indigo-950/20 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow"><FileCheck className="h-5 w-5" /></div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold">Admission Form — 6 Sections</DialogTitle>
              <DialogDescription className="text-xs">All fields optional — bharo jitna chahe, step-by-step.</DialogDescription>
            </div>
            <Badge variant="outline" className="hidden sm:flex">Step {step}/6</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={()=>onOpenChange(false)} aria-label="Close"><X className="h-4 w-4" /></Button>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {STEPS.map((s) => {
              const active = step === s.id;
              const done = step > s.id;
              const Icon = s.icon;
              return (
                <button key={s.id} type="button" onClick={() => { if (s.id < step) setStep(s.id as any); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap ${active ? "bg-primary text-primary-foreground border-primary" : done ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-card border-border text-muted-foreground"}`}>
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${active ? "bg-white/20" : done ? "bg-emerald-500 text-white" : "bg-muted"}`}>{done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}</span>
                  <span className="hidden md:inline">{s.label}</span><span className="md:hidden">{s.id}</span>
                </button>
              );
            })}
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${(step/6)*100}%` }} /></div>
        </DialogHeader>

        <form onSubmit={(e)=>e.preventDefault()} onKeyDown={(e)=>{ if(e.key==="Enter") e.preventDefault(); }} className="p-6 space-y-6">
          {/* STEP 1 - Student */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2"><Baby className="h-4 w-4 text-primary" /> 1. Student Details (Student Ki Jankari)</h3>
              {/* Photo */}
              <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
                <div className="relative"><AppImage src={avatarPreview || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="photo" className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />{avatarPreview && <button type="button" onClick={()=>{setAvatarPreview(null);setAvatarFile(null);}} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>}</div>
                <div className="flex-1"><div className="text-xs font-semibold flex gap-1"><ImageIcon className="h-3 w-3" /> Passport Photo <Req /></div><p className="text-[11px] text-muted-foreground">JPG/PNG &lt;5MB — Cloudinary pe save hogi</p><Button type="button" variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={()=>avatarInputRef.current?.click()}><Upload className="h-3 w-3" /> Upload</Button><input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">First Name <Req /></label><Input {...register("firstName")} placeholder="Aarav" className={errors.firstName?"border-rose-500":""} />{errors.firstName && <p className="text-[11px] text-rose-500">{errors.firstName.message}</p>}</div>
                <div><label className="text-xs font-medium">Middle Name</label><Input {...register("middleName")} placeholder="Kumar" /></div>
                <div><label className="text-xs font-medium">Last Name <Req /></label><Input {...register("lastName")} placeholder="Sharma" className={errors.lastName?"border-rose-500":""} />{errors.lastName && <p className="text-[11px] text-rose-500">{errors.lastName.message}</p>}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">DOB <Req /></label><Input type="date" {...register("dateOfBirth")} className={errors.dateOfBirth?"border-rose-500":""} />{errors.dateOfBirth && <p className="text-[11px] text-rose-500">{errors.dateOfBirth.message}</p>}</div>
                <div><label className="text-xs font-medium">Gender <Req /></label><Select value={vals.gender} onValueChange={(v)=>setValue("gender",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                <div><label className="text-xs font-medium">Blood Group <Req /></label><Select value={vals.bloodGroup} onValueChange={(v)=>setValue("bloodGroup",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">Class for Admission <Req /></label><Select value={vals.gradeApplied} onValueChange={(v)=>setValue("gradeApplied",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INDIAN_GRADES.map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs font-medium">Academic Year <Req /></label><Select value={vals.academicYear} onValueChange={(v)=>setValue("academicYear",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2025-2026">2025-2026</SelectItem><SelectItem value="2026-2027">2026-2027</SelectItem><SelectItem value="2027-2028">2027-2028</SelectItem></SelectContent></Select></div>
                <div><label className="text-xs font-medium">Campus <Req /></label><Select value={vals.branchId} onValueChange={(v)=>setValue("branchId",v)}><SelectTrigger><SelectValue placeholder="Campus" /></SelectTrigger><SelectContent>{opts.map(b=><SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">Aadhaar (Student) <Req /></label><Input {...register("aadhaarNumber")} placeholder="12-digit" maxLength={12} className={errors.aadhaarNumber?"border-rose-500":""} />{errors.aadhaarNumber && <p className="text-[11px] text-rose-500">{errors.aadhaarNumber.message}</p>}</div>
                <div><label className="text-xs font-medium">Nationality <Req /></label><Select value={vals.nationality} onValueChange={(v)=>setValue("nationality",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NATIONALITIES.map(n=><SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs font-medium">Mother Tongue</label><Select value={vals.motherTongue || ""} onValueChange={(v)=>setValue("motherTongue",v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{MOTHER_TONGUES.map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">Category <Req /></label><Select value={vals.category} onValueChange={(v)=>setValue("category",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SOCIAL_CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs font-medium">Religion</label><Select value={vals.religion || ""} onValueChange={(v)=>setValue("religion",v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{RELIGIONS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs font-medium">Nationality</label><Input value={vals.nationality} readOnly className="bg-muted" /></div>
              </div>
            </div>
          )}

          {/* STEP 2 - Parents (Father + Mother merged) */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-bold text-sm flex gap-2"><Users className="h-4 w-4 text-primary" /> 2. Parents Details (Mata-Pita)</h3>
              <div className="p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3">Father's Details</p>
                <div className="grid grid-cols-1 gap-3">
                  <div><label className="text-xs font-medium">Full Name</label><Input {...register("fatherName")} placeholder="Ramesh Sharma" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div><label className="text-xs font-medium">Qualification</label><Input {...register("fatherQualification")} placeholder="B.Com" /></div>
                  <div><label className="text-xs font-medium">Occupation</label><Input {...register("fatherOccupation")} placeholder="Shop Owner" /></div>
                  <div><label className="text-xs font-medium">Organization</label><Input {...register("fatherOrganization")} placeholder="Company" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div><label className="text-xs font-medium">Annual Income</label><Select value={vals.fatherAnnualIncome || ""} onValueChange={(v)=>setValue("fatherAnnualIncome",v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{INCOME_RANGES.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs font-medium">Mobile</label><Input {...register("fatherMobile")} placeholder="9876543210" /></div>
                  <div><label className="text-xs font-medium">Email</label><Input {...register("fatherEmail")} placeholder="father@mail.com" /></div>
                </div>
              </div>
              <div className="p-3 rounded-xl border bg-pink-50/50 dark:bg-pink-950/20">
                <p className="text-xs font-bold text-pink-700 dark:text-pink-300 mb-3">Mother's Details</p>
                <div className="grid grid-cols-1 gap-3">
                  <div><label className="text-xs font-medium">Full Name</label><Input {...register("motherName")} placeholder="Sunita Sharma" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div><label className="text-xs font-medium">Qualification</label><Input {...register("motherQualification")} placeholder="M.A." /></div>
                  <div><label className="text-xs font-medium">Occupation</label><Input {...register("motherOccupation")} placeholder="Teacher" /></div>
                  <div><label className="text-xs font-medium">Organization</label><Input {...register("motherOrganization")} placeholder="School" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div><label className="text-xs font-medium">Annual Income</label><Select value={vals.motherAnnualIncome || ""} onValueChange={(v)=>setValue("motherAnnualIncome",v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{INCOME_RANGES.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                  <div><label className="text-xs font-medium">Mobile</label><Input {...register("motherMobile")} placeholder="9876543211" /></div>
                  <div><label className="text-xs font-medium">Email</label><Input {...register("motherEmail")} placeholder="mother@mail.com" /></div>
                </div>
              </div>
              <div className="p-3 rounded-xl border bg-amber-50 dark:bg-amber-950/20">
                <p className="text-xs font-semibold">Guardian (if parents not available)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div><label className="text-xs font-medium">Guardian Name</label><Input {...register("guardianName")} placeholder="Guardian" /></div>
                  <div><label className="text-xs font-medium">Relation</label><Input {...register("guardianRelation")} placeholder="Uncle" /></div>
                  <div><label className="text-xs font-medium">Contact</label><Input {...register("guardianContact")} placeholder="98765..." /></div>
                </div>
                <div className="mt-2"><label className="text-xs font-medium">Guardian Email</label><Input {...register("guardianEmail")} placeholder="guardian@mail.com" /></div>
              </div>
            </div>
          )}

          {/* STEP 3 - Address */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex gap-2"><Home className="h-4 w-4 text-primary" /> 3. Contact & Address (Pate Ki Jankari)</h3>
              <p className="text-xs font-semibold">Present Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">House/Flat No</label><Input {...register("presentHouseNo")} placeholder="B-204" /></div>
                <div><label className="text-xs font-medium">Street</label><Input {...register("presentStreet")} placeholder="MG Road" /></div>
                <div><label className="text-xs font-medium">Area/Locality</label><Input {...register("presentArea")} placeholder="Kothrud" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs font-medium">City</label><Input {...register("city")} placeholder="Pune" /></div>
                <div><label className="text-xs font-medium">District</label><Input {...register("presentDistrict")} placeholder="Pune" /></div>
                <div><label className="text-xs font-medium">State</label><Select value={vals.state} onValueChange={(v)=>setValue("state",v)}><SelectTrigger><SelectValue placeholder="State" /></SelectTrigger><SelectContent>{INDIAN_STATE_NAMES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><label className="text-xs font-medium">PIN Code</label><div className="flex gap-2 items-center"><Input {...register("postalCode")} placeholder="411001" maxLength={6} className="max-w-[200px]" />{pinLoading==="present" ? <span className="text-[11px] text-primary animate-pulse">loading...</span> : <span className="text-[10px] text-muted-foreground">6-digit → auto district/state</span>}</div></div>

              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="checkbox" checked={!!vals.permanentSameAsPresent} onChange={(e)=>setValue("permanentSameAsPresent",e.target.checked)} className="h-4 w-4" /> Permanent Address same as Present</label>
              {!vals.permanentSameAsPresent && (
                <div className="space-y-3 p-3 border rounded-xl bg-muted/20">
                  <p className="text-xs font-semibold">Permanent Address</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input {...register("permanentHouseNo")} placeholder="House No" />
                    <Input {...register("permanentStreet")} placeholder="Street" />
                    <Input {...register("permanentArea")} placeholder="Area" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input {...register("permanentCity")} placeholder="City" />
                    <Input {...register("permanentDistrict")} placeholder="District" />
                    <Select value={vals.permanentState || ""} onValueChange={(v)=>setValue("permanentState",v)}><SelectTrigger><SelectValue placeholder="State" /></SelectTrigger><SelectContent>{INDIAN_STATE_NAMES.map(s=><SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="flex gap-2 items-center"><Input {...register("permanentPostalCode")} placeholder="PIN" maxLength={6} className="max-w-[200px]" />{pinLoading==="permanent" ? <span className="text-[11px] text-primary animate-pulse">loading...</span> : null}</div>
                </div>
              )}
              <div className="p-3 border rounded-xl bg-muted/10">
                <p className="text-xs font-semibold flex gap-1"><Phone className="h-3 w-3" /> Emergency Contact</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div><label className="text-xs">Name</label><Input {...register("emergencyContactName")} placeholder="Ramesh" /></div>
                  <div><label className="text-xs">Phone</label><Input {...register("emergencyContactPhone")} placeholder="98765..." /></div>
                  <div><label className="text-xs">Relation</label><Input {...register("emergencyContactRelation")} placeholder="Father" /></div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 - Previous Academic */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex gap-2"><GraduationCap className="h-4 w-4 text-primary" /> 4. Previous Academic Background</h3>
              <p className="text-[11px] text-muted-foreground">Nursery/KG ke liye optional</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Previous School Name</label><Input {...register("previousSchool")} placeholder="St. Jude Prep" /></div>
                <div><label className="text-xs font-medium">Location</label><Input {...register("previousSchoolLocation")} placeholder="Pune" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs">Board</label><Select value={vals.board || ""} onValueChange={(v)=>setValue("board",v)}><SelectTrigger><SelectValue placeholder="CBSE/ICSE" /></SelectTrigger><SelectContent>{SCHOOL_BOARDS.map(b=><SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs">Last Class Attended</label><Input {...register("lastClassAttended")} placeholder="Class 8" /></div>
                <div><label className="text-xs">Last Class Passed</label><Input {...register("lastClassPassed")} placeholder="Class 8" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="text-xs">Percentage / Grade</label><Input {...register("percentageGrade")} placeholder="88% / A+" /></div>
                <div><label className="text-xs">Medium</label><Select value={vals.mediumOfInstruction || ""} onValueChange={(v)=>setValue("mediumOfInstruction",v)}><SelectTrigger><SelectValue placeholder="English/Hindi" /></SelectTrigger><SelectContent>{MEDIUMS.map(m=><SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                <div><label className="text-xs">Reason for Leaving</label><Input {...register("reasonForLeaving")} placeholder="Shifting" /></div>
              </div>
            </div>
          )}

          {/* STEP 5 - Services */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex gap-2"><Bus className="h-4 w-4 text-primary" /> 5. School Services & Additional Options</h3>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={!!vals.transportRequired} onChange={(e)=>setValue("transportRequired",e.target.checked)} className="h-4 w-4" /> Transport Required? (Yes/No)</label>
              {vals.transportRequired && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border rounded-xl bg-muted/10">
                  <div><label className="text-xs">Bus Stop / Pickup <Req /></label><Input {...register("busStop")} placeholder="Kothrud Stand" className={errors.busStop?"border-rose-500":""} />{errors.busStop && <p className="text-[11px] text-rose-500">{errors.busStop.message}</p>}</div>
                  <div><label className="text-xs">Pickup & Drop Route</label><Input {...register("pickupRoute")} placeholder="Route A" /></div>
                </div>
              )}
              <div className="p-3 border rounded-xl">
                <p className="text-xs font-semibold">Sibling Details (if any)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div><label className="text-xs">Sibling Name</label><Input {...register("siblingName")} placeholder="Sibling" /></div>
                  <div><label className="text-xs">Class</label><Input {...register("siblingClass")} placeholder="Class 5-A" /></div>
                  <div><label className="text-xs">Admission No</label><Input {...register("siblingAdmissionNo")} placeholder="ADM-..." /></div>
                </div>
                <div className="mt-2"><label className="text-xs">Sibling Category</label><Input {...register("siblingCategory")} placeholder="Real brother/sister" /></div>
              </div>
            </div>
          )}

          {/* STEP 6 - Docs & Declaration */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm flex gap-2"><FileCheck className="h-4 w-4 text-primary" /> 6. Document Uploads & Declaration</h3>
              <div className="space-y-2 p-3 rounded-xl border bg-muted/20">
                <div className="flex items-center justify-between"><div className="text-xs font-semibold">Enclosures {docFiles.length>0 && <Badge variant="secondary" className="ml-1 text-[10px]">{docFiles.length}</Badge>}</div><Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={()=>docsInputRef.current?.click()}><Upload className="h-3 w-3" /> Attach</Button><input ref={docsInputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleDocsChange} /></div>
                <p className="text-[11px] text-muted-foreground">Birth Certificate, Aadhaar (student+parents), TC & Report Card, Address Proof, Caste Certificate, Photos — images+PDF max 10</p>
                {docFiles.map((d,i)=>(
                  <div key={`${d.file.name}-${i}`} className="flex items-center gap-2">
                    <Input value={d.name} onChange={(e)=>setDocFiles(prev=>prev.map((x,j)=>j===i?{...x,name:e.target.value}:x))} placeholder="Document name e.g. Birth Certificate" className="h-7 text-xs flex-1" />
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{d.file.name}</span>
                    <button type="button" onClick={()=>setDocFiles(prev=>prev.filter((_,j)=>j!==i))} className="h-6 w-6 rounded-full hover:bg-destructive/10 flex items-center justify-center"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
                <div className="relative flex h-12 w-32 items-center justify-center rounded border bg-white overflow-hidden">
                  {signaturePreview ? (
                    <>
                      <AppImage src={signaturePreview} alt="sign" className="h-12 w-32 object-contain" />
                      <button type="button" onClick={()=>{setSignaturePreview(null);setSignatureFile(null);}} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                    </>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">No signature</span>
                  )}
                </div>
                <div><div className="text-xs font-semibold flex gap-1"><PenLine className="h-3 w-3" /> Parent/Guardian Signature</div><p className="text-[11px] text-muted-foreground">Digital signature image upload (optional)</p><Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={()=>signatureInputRef.current?.click()}><Upload className="h-3 w-3" /> Upload Sign</Button><input ref={signatureInputRef} type="file" accept="image/*" className="hidden" onChange={handleSignatureChange} /></div>
              </div>

              <div className="p-3 rounded-xl border bg-amber-50 dark:bg-amber-950/20 space-y-2">
                <p className="text-xs leading-relaxed">I hereby declare that the information furnished above is true to the best of my knowledge. I accept the school rules, fee structure and code of conduct. (Parents / Guardian Undertaking)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Place <Req /></label><Input {...register("declarationPlace")} placeholder="Pune" className={errors.declarationPlace?"border-rose-500":""} />{errors.declarationPlace && <p className="text-[11px] text-rose-500">{errors.declarationPlace.message}</p>}</div>
                  <div><label className="text-xs font-medium">Date</label><Input value={new Date().toLocaleDateString()} readOnly className="bg-muted" /></div>
                </div>
                <label className="flex items-start gap-2 text-xs font-medium cursor-pointer"><input type="checkbox" checked={!!vals.declarationAccepted} onChange={(e)=>setValue("declarationAccepted",e.target.checked, {shouldValidate:true})} className="h-4 w-4 mt-0.5" /><span>I accept declaration & allow digital signature <Req /></span></label>
                {errors.declarationAccepted && <p className="text-[11px] text-rose-500 flex gap-1"><AlertCircle className="h-3 w-3" />{errors.declarationAccepted.message}</p>}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-4 sticky bottom-0 bg-background">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={()=>onOpenChange(false)} className="gap-1"><X className="h-3.5 w-3.5" /> Cancel</Button>
                {step > 1 && <Button type="button" variant="ghost" onClick={() => setStep((s)=>Math.max(1,s-1) as any)}>← Back</Button>}
              </div>
              {step < 6 ? (
                <Button type="button" onClick={() => goNext(step+1)}>Next →</Button>
              ) : (
                <Button type="button" onClick={handleSubmit(onSubmit, (errs)=>{ console.log("ADMISSION VALIDATION ERRORS", errs); toast.error("Form error — check fields", { description: Object.keys(errs).slice(0,3).join(", ") || "Unknown" }); })} disabled={isSubmitting} variant="gradient" className="min-w-[160px]">{isSubmitting ? "Submitting..." : "Submit Admission"}</Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
