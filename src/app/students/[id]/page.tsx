"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { fetchStudentById } from "@/lib/api/students";
import { fetchInvoices, BackendInvoice } from "@/lib/api/fees";
import { Student } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StudentFormDialog } from "@/components/students/student-form-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  DollarSign,
  ArrowLeft,
  Edit2,
  Award,
  ShieldCheck,
  BookOpen,
  Bus,
  Route as RouteIcon,
  Banknote,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadStudent = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const data = await fetchStudentById(studentId);
      setStudent(data);
    } catch {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  // Live fee invoices for this student (backend filters /fees/invoices?studentId=)
  const [invoices, setInvoices] = useState<BackendInvoice[]>([]);
  useEffect(() => {
    if (!student?.id) return;
    void fetchInvoices({ studentId: student.id }).then((list) => setInvoices(Array.isArray(list) ? list : []));
  }, [student?.id]);

  const feeTotals = useMemo(() => {
    const billed = invoices.reduce((a, i) => a + Number(i.amount ?? 0), 0);
    const paid = invoices.reduce((a, i) => a + Number(i.paidAmount ?? 0), 0);
    return { billed, paid, pending: billed - paid };
  }, [invoices]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Student Record Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested student record could not be found in the school roster.
        </p>
        <Button asChild variant="outline">
          <Link href="/students">Back to Student Directory</Link>
        </Button>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "GRADUATED":
        return "purple";
      case "TRANSFERRED":
        return "warning";
      case "SUSPENDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Student Profile Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.fullName}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border shadow-xs">
                {student.bloodGroup}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {student.rollNumber}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Admission #{student.admissionNumber}
                </span>
                <Badge variant={statusVariant(student.status) as any} className="text-xs">
                  {student.status}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {student.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <span>{student.branchName}</span>
                <span>•</span>
                <span className="text-foreground font-semibold">{student.className}</span>
                <span>({student.sectionName})</span>
                {(student as any).program && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-[11px]">{(student as any).program} {(student as any).department ?? ""}</Badge>
                    {(student as any).semester && <span>Sem {(student as any).semester}</span>}
                    {(student as any).universityPrn && <span className="font-mono text-[11px]">PRN {(student as any).universityPrn}</span>}
                  </>
                )}
              </p>
              {(student as any).program && (
                <p className="text-[11px] text-muted-foreground">
                  Year {(student as any).yearOfStudy ?? "-"} • {(student as any).university ?? ""} • {(student as any).admissionType ?? ""} {(student as any).hostelRequired ? "• Hostel" : "• Day Scholar"} {(student as any).scholarshipType && (student as any).scholarshipType !== "None" ? `• ${ (student as any).scholarshipType} Scholarship` : ""} {(student as any).mentorName ? `• Mentor: ${(student as any).mentorName}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-1.5"
            >
              <Edit2 className="h-4 w-4 text-amber-500" />
              <span>Edit Student</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/students" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 360-Degree Tabbed Dossier — per rules.md §3, student dossier must surface full admission 8-section data */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-7 w-full max-w-5xl h-10 p-1 bg-muted/60">
          <TabsTrigger value="overview" className="text-xs font-semibold">
            Overview
          </TabsTrigger>
          <TabsTrigger value="admission" className="text-xs font-semibold">
            Admission Dossier
          </TabsTrigger>
          <TabsTrigger value="academic" className="text-xs font-semibold">
            Academic History
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs font-semibold">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="fees" className="text-xs font-semibold">
            Fee Ledger
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-semibold">
            Documents
          </TabsTrigger>
          <TabsTrigger value="transport" className="text-xs font-semibold gap-1">
            <Bus className="h-3 w-3" /> Transport
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview — per request: 1.Student Details, 2.Parents Details, 3.Contact & Address */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {(() => {
            const a: any = (student as any).admissionApplication || {};
            const hasAdmission = !!a.uuid;
            return (
          <div className="space-y-6">
            {/* 1. Student Details */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />1. Student Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Full Name</span><span className="font-bold">{student.fullName}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">DOB / Gender</span><span className="font-bold">{formatDate(student.dateOfBirth)} • {student.gender}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Blood Group</span><span className="font-bold">{(a.bloodGroup || student.bloodGroup) || "—"}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Nationality</span><span className="font-bold">{a.nationality || "—"}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Religion / Category</span><span className="font-bold">{(a.religion || (student as any).religion) || "—"} / {(a.category || (student as any).category) || "—"}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Mother Tongue</span><span className="font-bold">{(a.motherTongue || (student as any).motherTongue) || "—"}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Aadhaar</span><span className="font-mono font-bold">{(a.aadhaarNumber || (student as any).aadhaarNumber) || "—"}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Class / Academic Year</span><span className="font-bold">{student.className} • {a.academicYear || "—"}</span></div>
                  <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Admission Date</span><span className="font-bold">{formatDate(student.admissionDate)}</span></div>
                </div>
                {!hasAdmission && <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">Legacy student — admission-time extended fields not available. Data shown from student master only.</p>}
              </CardContent>
            </Card>

            {/* 2. Parents Details */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />2. Parents Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                {hasAdmission ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-blue-50/50 border space-y-1"><span className="text-muted-foreground block">Father</span><span className="font-bold block">{a.fatherName || "—"}</span><span className="block">{[a.fatherQualification, a.fatherOccupation].filter(Boolean).join(" • ") || "—"}</span><span className="block font-mono">{[a.fatherMobile, a.fatherEmail].filter(Boolean).join(" • ") || "—"}</span><span className="block text-muted-foreground">{[a.fatherOrganization, a.fatherAnnualIncome].filter(Boolean).join(" • ")}</span></div>
                      <div className="p-3 rounded-xl bg-pink-50/50 border space-y-1"><span className="text-muted-foreground block">Mother</span><span className="font-bold block">{a.motherName || "—"}</span><span className="block">{[a.motherQualification, a.motherOccupation].filter(Boolean).join(" • ") || "—"}</span><span className="block font-mono">{[a.motherMobile, a.motherEmail].filter(Boolean).join(" • ") || "—"}</span><span className="block text-muted-foreground">{[a.motherOrganization, a.motherAnnualIncome].filter(Boolean).join(" • ")}</span></div>
                    </div>
                    {a.guardianName && <div className="p-3 rounded-xl bg-amber-50 border"><span className="text-muted-foreground block">Guardian (if any)</span><span className="font-bold">{a.guardianName} ({a.guardianRelation || ""})</span> <span className="font-mono ml-2">{[a.guardianContact, a.guardianEmail].filter(Boolean).join(" • ")}</span></div>}
                    <div className="p-3 rounded-xl bg-muted/30 border space-y-1"><span className="text-muted-foreground block">Primary Guardian (legacy)</span><span className="font-bold">{student.guardian.name} ({student.guardian.relation})</span><span className="block font-mono">{[student.guardian.email, student.guardian.phone].filter(Boolean).join(" • ") || "—"}</span><span className="block text-muted-foreground">{student.guardian.occupation || "—"}</span></div>
                  </>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/30 border space-y-1"><span className="text-muted-foreground block">Primary Guardian</span><span className="font-bold text-sm">{student.guardian.name}</span><span className="text-muted-foreground block">{student.guardian.relation} • {student.guardian.occupation || "—"}</span><span className="block font-mono">{[student.guardian.email, student.guardian.phone].filter(Boolean).join(" • ")}</span><span className="text-rose-600 font-medium block">Emergency: {student.guardian.emergencyContact || "—"}</span></div>
                )}
              </CardContent>
            </Card>

            {/* 3. Contact & Address */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />3. Contact & Address</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                {hasAdmission ? (
                  <>
                    <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Present Address</span><span className="font-medium">{[a.presentHouseNo, a.presentStreet, a.presentArea, a.city || a.presentDistrict, a.state, a.postalCode].filter(Boolean).join(", ") || student.address || "—"}</span></div>
                    <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Permanent Address {a.permanentSameAsPresent ? "(Same as Present)" : ""}</span><span className="font-medium">{a.permanentSameAsPresent ? "Same as Present" : [a.permanentHouseNo, a.permanentStreet, a.permanentArea, a.permanentCity, a.permanentDistrict, a.permanentState, a.permanentPostalCode].filter(Boolean).join(", ") || "—"}</span></div>
                    <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Emergency Contact</span><span className="font-bold">{a.emergencyContactName || student.guardian.emergencyContact || "—"} • {a.emergencyContactPhone || ""} {a.emergencyContactRelation ? `(${a.emergencyContactRelation})` : ""}</span></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-card border"><span className="text-muted-foreground block">Guardian Email</span><span className="font-mono font-semibold">{student.guardian.email || a.parentEmail || "—"}</span></div>
                      <div className="p-3 rounded-xl bg-card border"><span className="text-muted-foreground block">Primary Phone</span><span className="font-mono font-semibold">{student.guardian.phone || a.parentPhone || "—"}</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-card border text-muted-foreground"><MapPin className="h-4 w-4 text-primary shrink-0" /><span>{[student.address, student.city, student.state].filter(Boolean).join(", ") || "—"}</span></div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-card border"><span className="text-muted-foreground">Guardian Email:</span><span className="font-semibold font-mono">{student.guardian.email || "—"}</span></div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-card border"><span className="text-muted-foreground">Primary Phone:</span><span className="font-semibold font-mono">{student.guardian.phone || "—"}</span></div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20"><span className="text-rose-600 font-medium">Emergency Line:</span><span className="font-bold text-rose-600 font-mono">{student.guardian.emergencyContact || "—"}</span></div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
            );
          })()}
          {/* Admission source link when available */}
          {(student as any).admissionApplication && (
            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-900">Source: Admission dossier { (student as any).admissionApplication.applicationNumber || ""} ({ (student as any).admissionApplication.status || ""})</span>
                <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link href={`/admissions/${(student as any).admissionApplication.uuid}`}>Open Admission Dossier</Link></Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NEW Tab: Full Admission Dossier (8 sections) - per rules.md all admission-time data must be visible */}
        <TabsContent value="admission" className="space-y-6 mt-4">
          {!(student as any).admissionApplication ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"><FileText className="h-6 w-6 text-muted-foreground" /></div>
              <h3 className="font-semibold text-sm">No Admission Dossier Linked</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">This student was not created via admissions (legacy/seeded). Full 8-section data is only available for students enrolled through <em>Admissions → Approve & Enroll</em>.</p>
            </Card>
          ) : (
            (() => {
              const a: any = (student as any).admissionApplication;
              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />1. Student Details</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Full Name</span><span className="font-bold">{a.firstName} {a.middleName || ""} {a.lastName || ""}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">DOB / Gender</span><span className="font-bold">{formatDate(a.dob)} • {a.gender}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Blood Group</span><span className="font-bold">{a.bloodGroup || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Nationality</span><span className="font-bold">{a.nationality || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Religion / Category</span><span className="font-bold">{a.religion || "—"} / {a.category || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Mother Tongue</span><span className="font-bold">{a.motherTongue || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Aadhaar</span><span className="font-mono font-bold">{a.aadhaarNumber || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Grade / Year</span><span className="font-bold">{a.gradeApplied} • {a.academicYear}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">RTE Quota</span><span className="font-bold">{a.rteQuota ? "Yes" : "No"}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />2. Parents Details</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-blue-50/50 border space-y-1"><span className="text-muted-foreground block">Father</span><span className="font-bold block">{a.fatherName || "—"}</span><span className="block">{a.fatherQualification || ""} {a.fatherOccupation || ""}</span><span className="block font-mono">{a.fatherMobile || ""} {a.fatherEmail || ""}</span><span className="block">{a.fatherOrganization || ""} {a.fatherAnnualIncome || ""}</span></div>
                          <div className="p-3 rounded-xl bg-pink-50/50 border space-y-1"><span className="text-muted-foreground block">Mother</span><span className="font-bold block">{a.motherName || "—"}</span><span className="block">{a.motherQualification || ""} {a.motherOccupation || ""}</span><span className="block font-mono">{a.motherMobile || ""} {a.motherEmail || ""}</span><span className="block">{a.motherOrganization || ""} {a.motherAnnualIncome || ""}</span></div>
                        </div>
                        {a.guardianName && <div className="p-3 rounded-xl bg-amber-50 border"><span className="text-muted-foreground block">Guardian</span><span className="font-bold">{a.guardianName} ({a.guardianRelation || ""})</span> <span className="font-mono">{a.guardianContact || ""} {a.guardianEmail || ""}</span></div>}
                        <div className="p-3 rounded-xl bg-muted/30 border space-y-1"><span className="text-muted-foreground block">Legacy Primary Guardian</span><span className="font-bold">{a.parentName} ({a.parentRelationship})</span><span className="block font-mono">{a.parentEmail} • {a.parentPhone}</span></div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />3. Contact & Address</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Present Address</span><span className="font-medium">{[a.presentHouseNo, a.presentStreet, a.presentArea, a.city, a.presentDistrict, a.state, a.postalCode].filter(Boolean).join(", ") || a.address || "—"}</span></div>
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Permanent Address {a.permanentSameAsPresent ? "(Same as Present)" : ""}</span><span className="font-medium">{a.permanentSameAsPresent ? "Same as Present" : [a.permanentHouseNo, a.permanentStreet, a.permanentArea, a.permanentCity, a.permanentDistrict, a.permanentState, a.permanentPostalCode].filter(Boolean).join(", ") || "—"}</span></div>
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Emergency Contact</span><span className="font-bold">{a.emergencyContactName || "—"} • {a.emergencyContactPhone || ""} {a.emergencyContactRelation ? `(${a.emergencyContactRelation})` : ""}</span></div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />4. Previous Academic</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Previous School</span><span className="font-bold">{a.previousSchool || "—"} {a.previousSchoolLocation ? `(${a.previousSchoolLocation})` : ""}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Board</span><span className="font-bold">{a.board || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Last Class Attended/Passed</span><span className="font-bold">{a.lastClassAttended || "—"} / {a.lastClassPassed || "—"}</span></div>
                          <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Percentage / Medium</span><span className="font-bold">{a.percentageGrade || "—"} • {a.mediumOfInstruction || "—"}</span></div>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Reason for Leaving</span><span>{a.reasonForLeaving || "—"}</span></div>
                      </CardContent>
                    </Card>
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />5. School Services</CardTitle></CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Transport Required</span><span className="font-bold">{a.transportRequired ? `Yes — ${a.busStop || ""} ${a.pickupRoute ? `(${a.pickupRoute})` : ""}` : "No"}</span></div>
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Sibling</span><span className="font-bold">{a.siblingName ? `${a.siblingName} (${a.siblingClass || ""} ${a.siblingAdmissionNo || ""}) ${a.siblingCategory || ""}` : "—"}</span></div>
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Health</span><span>{a.allergies ? `Allergies: ${a.allergies}` : "Allergies: —"} • {a.chronicIllness ? `Chronic: ${a.chronicIllness}` : ""} {a.specialNeeds ? `• Special Needs: ${a.specialNeedsDetails || "Yes"}` : ""}</span></div>
                        <div className="p-3 rounded-xl bg-muted/40 border"><span className="text-muted-foreground block">Declaration</span><span>{a.declarationAccepted ? `Accepted at ${a.declarationPlace || ""} on ${formatDate(a.declarationDate || "")}` : "—"} {a.signatureUrl ? "• Signature uploaded" : ""}</span>{a.signatureUrl && <a href={a.signatureUrl} target="_blank" rel="noreferrer" className="text-primary underline block">View Signature</a>}</div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-5 space-y-6">
                    <Card className="border-border/80 shadow-xs">
                      <CardHeader><CardTitle className="text-base font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Documents (from Admission)</CardTitle><CardDescription className="text-xs">Verified status from admission dossier</CardDescription></CardHeader>
                      <CardContent className="space-y-3">
                        {(a.documents || []).length === 0 ? <p className="text-xs text-muted-foreground">No documents attached at admission time.</p> : a.documents.map((doc: any) => (
                          <div key={doc.uuid || doc.id} className={`flex items-center justify-between p-3 rounded-xl border ${doc.verified ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card border-border/70"}`}>
                            <div className="min-w-0"><span className="text-xs font-semibold block truncate">{doc.name}</span><span className="text-[10px] text-muted-foreground">{doc.submitted ? "Attached" : "Missing"} • {doc.verified ? "Verified" : "Pending"}</span>{doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline block truncate">View on Cloudinary</a>}</div>
                            <Badge variant={doc.verified ? "success" as any : "outline"} className="text-[10px]">{doc.verified ? "Verified" : "Pending"}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    {a.avatar && <Card className="border-border/80"><CardContent className="p-4 flex items-center gap-3"><img src={a.avatar} alt="avatar" className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" /><div><p className="text-xs font-semibold">Admission Photo</p><p className="text-[11px] text-muted-foreground">Cloudinary</p><a href={a.avatar} target="_blank" rel="noreferrer" className="text-xs text-primary underline">View</a></div></CardContent></Card>}
                  </div>
                </div>
              );
            })()
          )}
        </TabsContent>

        {/* Tab 2: Academic History */}
        <TabsContent value="academic" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Report Cards & Historical GPA Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.academicHistory.length === 0 ? (
                <div className="p-8 text-center space-y-2 border border-dashed rounded-xl">
                  <p className="text-sm font-semibold text-foreground">No academic history yet</p>
                  <p className="text-xs text-muted-foreground">No class completed — percentage/GPA will appear after exams are conducted and results published.</p>
                </div>
              ) : student.academicHistory.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border/70 bg-card space-y-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{rec.term}</h4>
                      <span className="text-xs text-muted-foreground">
                        {rec.percentage > 0 ? <>Class Rank #{rec.rank} • Overall Score: {rec.percentage}%</> : <>No score yet</>}
                      </span>
                    </div>
                    <Badge variant={rec.percentage > 0 ? "success" : "outline"} className="text-xs font-mono font-bold">
                      {rec.percentage > 0 ? `GPA: ${rec.gpa} (${rec.grade})` : "—"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                    {rec.remarks}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Attendance Breakdown */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Attendance Summary & Biometric Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-600 block">Present Days</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {student.attendanceSummary.presentDays}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[11px] text-rose-600 block">Absent Days</span>
                  <span className="text-xl font-bold text-rose-600">{student.attendanceSummary.absentDays}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] text-amber-600 block">Late Check-ins</span>
                  <span className="text-xl font-bold text-amber-600">{student.attendanceSummary.lateDays}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[11px] text-blue-600 block">Attendance Rate</span>
                  <span className="text-xl font-bold text-blue-600">
                    {student.attendanceSummary.attendanceRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Fee Ledger */}
        <TabsContent value="fees" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Tuition & Fee Status
              </CardTitle>
              <CardDescription className="text-xs">Live invoices from the Fee Collection module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block">Total Billed</span>
                  <span className="text-lg font-bold text-foreground mt-1 block">
                    {formatCurrency(feeTotals.billed)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-600 block">Paid to Date</span>
                  <span className="text-lg font-bold text-emerald-600 mt-1 block">
                    {formatCurrency(feeTotals.paid)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-rose-600 block">Outstanding Balance</span>
                  <span className="text-lg font-bold text-rose-600 mt-1 block">
                    {formatCurrency(feeTotals.pending)}
                  </span>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                  No fee invoices found for this student yet.
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-4 gap-2 p-2 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                    <span>Invoice</span><span className="text-right">Amount</span><span className="text-right">Paid</span><span className="text-right">Status</span>
                  </div>
                  {invoices.map((inv) => (
                    <div key={inv.uuid} className={`grid grid-cols-4 gap-2 p-2 text-xs border-t`}>
                      <span className="font-mono">{inv.invoiceNumber}</span>
                      <span className="text-right font-mono">{formatCurrency(Number(inv.amount))}</span>
                      <span className="text-right font-mono text-emerald-600">{formatCurrency(Number(inv.paidAmount ?? 0))}</span>
                      <span className="text-right">
                        <Badge variant={inv.status === "paid" ? "success" : inv.status === "partial" ? "warning" : "secondary"} className="text-[10px]">
                          {inv.status}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link href={`/fees/${student.id}`}>Open Fee Detail</Link></Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Documents */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Submitted Certificates & Transcripts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{doc.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Uploaded {formatDate(doc.uploadedAt)} • {doc.size}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Transport — per-student assignments come from the Transport module API */}
        <TabsContent value="transport" className="space-y-4 mt-4">
          <Card className="border-dashed p-8 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"><Bus className="h-6 w-6 text-muted-foreground" /></div>
            <h3 className="font-semibold text-sm">No Transport Assigned</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              This student has no transport assignment recorded on the backend yet. Manage routes, stops and assignments from the Transport module.
            </p>
            <Button asChild size="sm" variant="outline" className="h-8 text-xs"><Link href="/transport">Go to Transport Module</Link></Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <StudentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        studentToEdit={student}
        onSuccess={() => void loadStudent()}
      />
    </div>
  );
}
