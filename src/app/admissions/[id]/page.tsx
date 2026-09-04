"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AdmissionStatus, ClassRoom } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
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
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

const enrollSchema = z.object({
  classId: z.string().min(1, "Select a class cohort"),
  sectionId: z.string().min(1, "Select a section"),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

const ENROLL_DEFAULTS: EnrollFormValues = {
  classId: "cls-g10",
  sectionId: "sec-g10-a",
};

export default function AdmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState(() => mockDb.getAdmissionById(applicationId));
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  const classes = mockDb.getClasses();

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
    if (enrollModalOpen) reset(ENROLL_DEFAULTS);
  }, [enrollModalOpen, reset]);

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

  const handleStatusChange = (newStatus: AdmissionStatus) => {
    const updated = mockDb.updateAdmissionStatus(application.id, newStatus, application.interviewFeedback);
    if (updated) {
      setApplication(updated);
    }
  };

  const handleToggleDocVerification = (docId: string) => {
    const updatedDocs = application.documents.map((d) =>
      d.id === docId ? { ...d, verified: !d.verified } : d
    );
    const updated = mockDb.saveAdmission({
      ...application,
      documents: updatedDocs,
    });
    setApplication(updated);
  };

  const handleClassChange = (classId: string) => {
    setValue("classId", classId, { shouldValidate: true });
    // Auto-pick the first section of the newly selected class.
    const nextClass = classes.find((c) => c.id === classId);
    setValue("sectionId", nextClass?.sections[0]?.id || "", { shouldValidate: true });
  };

  const handleEnrollStudent = (values: EnrollFormValues) => {
    const newStudent = mockDb.enrollApplicantAsStudent(application.id, values.classId, values.sectionId);
    if (newStudent) {
      setEnrollModalOpen(false);
      router.push(`/students/${newStudent.id}`);
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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 font-extrabold text-2xl">
              {application.applicantFirstName.charAt(0)}
            </div>
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
                Applied for <strong className="text-foreground">{application.gradeApplied}</strong> at{" "}
                <span className="text-primary font-semibold">{application.branchName}</span>
              </p>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {application.status !== "APPROVED" && (
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
                  <span className="font-semibold text-foreground">{application.previousSchool || "St. Jude Prep"}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground">Previous Class & Percentage:</span>
                  <span className="font-semibold text-foreground font-mono">
                    {application.previousGrade || "Class 8"} • {application.previousGpa || "85%"}
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
                    </div>
                  </div>
                  <Badge
                    variant={doc.verified ? "success" : "outline"}
                    className="text-[10px] py-0 px-2 shrink-0"
                  >
                    {doc.verified ? "Verified" : "Pending"}
                  </Badge>
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
