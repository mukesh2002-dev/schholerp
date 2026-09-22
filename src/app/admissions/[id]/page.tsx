"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchAdmissionById,
  updateAdmissionStatusApi,
  updateAdmissionDocumentApi,
  uploadAdmissionDocumentApi,
  approveAdmissionApi,
} from "@/lib/api/admissions";
import { fetchClasses } from "@/lib/api/classes";
import { AdmissionApplication, AdmissionStatus, ClassRoom } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
import { AppImage } from "@/components/ui/app-image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  Award,
  Loader2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const enrollSchema = z.object({
  classId: z.string().min(1, "Select a class cohort"),
  sectionId: z.string().min(1, "Select a section"),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

const ENROLL_DEFAULTS: EnrollFormValues = {
  classId: "",
  sectionId: "",
};

export default function AdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const { session } = useERP();
  // Approve & enroll is a principal / HR operation (also admin / super_admin).
  const canApprove = ["super_admin", "admin", "principal", "hr"].includes(
    String(session?.rawRole ?? session?.role ?? "").toLowerCase()
  );

  const [application, setApplication] = useState<AdmissionApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  const loadAdmission = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const [appData, clsData] = await Promise.all([
        fetchAdmissionById(applicationId),
        fetchClasses(),
      ]);
      setApplication(appData);
      setClasses(clsData);
    } catch {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadAdmission();
  }, [loadAdmission]);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
    defaultValues: ENROLL_DEFAULTS,
  });
  const selectedClassId = watch("classId");
  const selectedSectionId = watch("sectionId");

  // Fresh defaults every time the enroll modal opens.
  React.useEffect(() => {
    if (enrollModalOpen) {
      reset({
        classId: classes[0]?.id || "",
        sectionId: classes[0]?.sections[0]?.id || "",
      });
    }
  }, [enrollModalOpen, reset, classes]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading application dossier...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <UserPlus className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Application Record Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested admission candidate record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/admissions">Back to Admissions Pipeline</Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: AdmissionStatus) => {
    try {
      const updated = await updateAdmissionStatusApi(application.id, {
        status: newStatus,
        notes: application.notes ?? undefined,
      });
      setApplication(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleToggleDocVerification = async (docId: string) => {
    const doc = application.documents.find((d) => d.id === docId);
    if (!doc) return;
    try {
      const updated = await updateAdmissionDocumentApi(application.id, doc.name, {
        verified: !doc.verified,
      });
      setApplication({
        ...application,
        documents: application.documents.map((d) =>
          d.id === docId ? { ...d, verified: updated.verified } : d
        ),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update document");
    }
  };

  const handleClassChange = (classId: string) => {
    setValue("classId", classId, { shouldValidate: true });
    // Auto-pick the first section of the newly selected class.
    const nextClass = classes.find((c) => c.id === classId);
    setValue("sectionId", nextClass?.sections[0]?.id || "", { shouldValidate: true });
  };

  const handleEnrollStudent = async (values: EnrollFormValues) => {
    try {
      // Single approve → enroll call: lean student + enrollment are created and
      // enrolledStudentId is linked, so this admission never repeats in lists.
      const sectionName =
        targetClass?.sections.find((s) => s.id === values.sectionId)?.name ?? values.sectionId;
      const result = await approveAdmissionApi(application.id, {
        classId: values.classId,
        section: sectionName,
      });
      setEnrollModalOpen(false);
      toast.success("Student enrolled", { description: `${application.applicantFullName} • ${result.student.admissionNo}` });
      await loadAdmission();
      router.push(`/students/${result.student.uuid}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed", {
        description: "Only principal / HR / admin can approve admissions.",
      });
    }
  };

  const handleDocFileUpload = async (docId: string, file: File | undefined) => {
    if (!file) return;
    const doc = application.documents.find((d) => d.id === docId);
    if (!doc) return;
    if (!(file.type.startsWith("image/") || file.type === "application/pdf")) {
      toast.error("Images + PDF only");
      return;
    }
    try {
      const updated = await uploadAdmissionDocumentApi(application.id, doc.name, file);
      setApplication({
        ...application,
        documents: application.documents.map((d) =>
          d.id === docId ? { ...d, submitted: updated.submitted, verified: updated.verified, fileUrl: updated.fileUrl } : d
        ),
      });
      toast.success("Document uploaded to Cloudinary");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const targetClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header Dossier Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {application.avatar && !application.avatar.includes("dicebear") ? (
              <AppImage
                src={application.avatar}
                alt={application.applicantFullName}
                className="h-16 w-16 shrink-0 rounded-2xl ring-1 ring-border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 font-extrabold text-2xl">
                {application.applicantFirstName.charAt(0)}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {application.applicationNumber}
                </span>
                <AdmissionStatusBadge status={application.status} />
                <span className="text-xs text-muted-foreground font-medium">
                  Intake: {application.academicYear}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {application.applicantFullName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                Applied for <strong className="text-foreground">{application.programApplied ? `${application.programApplied} ${application.departmentPreference ?? ""}`.trim() : application.gradeApplied}</strong> at{" "}
                <span className="text-primary font-semibold">{application.branchName}</span>
                {application.entranceExam && <span> • {application.entranceExam} {application.entranceRank ?? ""}</span>}
                {application.quotaType && <span> • Quota: {application.quotaType}</span>}
                {application.hostelRequired ? " • Hostel" : ""}
              </p>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!application.enrolledStudentId && canApprove && (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setEnrollModalOpen(true)}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve & Enroll Student</span>
              </Button>
            )}
            {application.enrolledStudentId && (
              <Badge variant="secondary" className="text-xs gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Already enrolled — hidden from new lists
              </Badge>
            )}

            <Select
              value={application.status}
              onValueChange={(val) => handleStatusChange(val as AdmissionStatus)}
            >
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New Lead</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/admissions" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid: Candidate Profile & Document Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate & Previous Schooling */}
        <div className="lg:col-span-7 space-y-6">
          {/* Candidate Personal Details */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Applicant Background & Academic Dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Date of Birth</span>
                  <span className="font-bold text-foreground text-sm">{formatDate(application.dateOfBirth)}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Gender</span>
                  <span className="font-bold text-foreground text-sm">{application.gender}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Entrance Exam</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {application.entranceTestScore ? `${application.entranceTestScore}%` : "Pending"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Previous School Attended:</span>
                  <span className="font-semibold text-foreground">{application.previousSchool || "—"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Previous Class & Percentage:</span>
                    <span className="font-semibold text-foreground font-mono">
                      {application.previousGrade || "—"} • {application.previousGpa || "—"}
                  </span>
                </div>
              </div>

              {/* Counselor Notes / Interview Remarks */}
              <div className="p-4 rounded-xl bg-secondary/60 border border-border/60 space-y-1 mt-2">
                <span className="font-bold text-foreground block">Interview Notes & Committee Remarks:</span>
                <p className="text-muted-foreground leading-relaxed">
                  {application.interviewFeedback ||
                    "Candidate performed well in quantitative entrance evaluation. Recommended for Advanced Honors section."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admission Details — every field filled during input */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Admission Details
              </CardTitle>
              <CardDescription>Exactly as filled during application input.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Grade Applied</span>
                  <span className="font-bold text-foreground text-sm">{application.gradeApplied || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Category</span>
                  <span className="font-bold text-foreground text-sm">{application.category || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Board</span>
                  <span className="font-bold text-foreground text-sm">{application.board || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Previous GPA</span>
                  <span className="font-bold text-foreground text-sm">{application.previousGpa || "—"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">RTE Quota</span>
                  <span className="font-bold text-foreground text-sm">{application.rteQuota ? "Yes" : "No"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Interview Date</span>
                  <span className="font-bold text-foreground text-sm">{application.interviewDate ? formatDate(application.interviewDate) : "—"}</span>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Aadhaar Number</span>
                <span className="font-semibold text-foreground font-mono">{application.aadhaarNumber || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Parent & Guardian Contact Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Parent & Guardian Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-muted-foreground block">Primary Guardian</span>
                  <span className="font-bold text-foreground text-sm">{application.parentName}</span>
                  <span className="text-muted-foreground block">{application.parentRelationship}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-muted-foreground block">Email & Phone</span>
                  <span className="font-semibold text-foreground block font-mono">{application.parentEmail}</span>
                  <span className="text-muted-foreground block font-mono">{application.parentPhone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {application.address}, {application.city}, {application.state} {application.postalCode}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Document Verification Checklist */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Document Verification
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {application.documents.filter((d) => d.verified).length} / {application.documents.length} Verified
                </Badge>
              </div>
              <CardDescription>
                Click checkbox to toggle verification audit status for each submitted certificate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleToggleDocVerification(doc.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    doc.verified
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                      : "bg-card border-border/70 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={doc.verified}
                      readOnly
                      className="h-4 w-4 rounded text-emerald-600 pointer-events-none"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block truncate">{doc.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {doc.required ? "Mandatory" : "Optional"} • {doc.submitted ? "Attached" : "Missing"}
                      </span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-primary hover:underline block truncate"
                        >
                          View on Cloudinary
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[10px] px-2 py-1 rounded-md border hover:bg-muted cursor-pointer">
                      Upload
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          void handleDocFileUpload(doc.id, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <Badge
                      variant={doc.verified ? "success" : "outline"}
                      className="text-[10px] py-0 px-2 shrink-0"
                    >
                      {doc.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enroll Student Modal */}
      <Dialog open={enrollModalOpen} onOpenChange={setEnrollModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>Enrollment Generator</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              Enroll {application.applicantFullName}
            </DialogTitle>
            <DialogDescription>
              Assign the candidate into an active class cohort and generate their permanent student roll number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleEnrollStudent)} className="space-y-4 mt-3 text-xs" noValidate>
            <div>
              <label className="font-medium text-foreground mb-1 block">Class / Grade Cohort</label>
              <Select value={selectedClassId} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.branchName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-xs text-destructive mt-1">{errors.classId.message}</p>}
            </div>

            <div>
              <label className="font-medium text-foreground mb-1 block">Section Assignment</label>
              <Select
                value={selectedSectionId}
                onValueChange={(val) => setValue("sectionId", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {targetClass?.sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} (Teacher: {s.classTeacherName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sectionId && <p className="text-xs text-destructive mt-1">{errors.sectionId.message}</p>}
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={isSubmitting}>
                {isSubmitting ? "Enrolling…" : "Confirm & Generate Student Dossier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
