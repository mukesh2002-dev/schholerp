"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
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
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState(() => mockDb.getStudentById(studentId));
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
    <div className="space-y-6 animate-in fade-in duration-300">
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
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <span>{student.branchName}</span>
                <span>•</span>
                <span className="text-foreground font-semibold">{student.className}</span>
                <span>({student.sectionName})</span>
              </p>
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

      {/* 360-Degree Tabbed Dossier */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-3xl h-10 p-1 bg-muted/60">
          <TabsTrigger value="overview" className="text-xs font-semibold">
            Overview
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
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Date of Birth</span>
                    <span className="font-bold text-foreground text-sm">{formatDate(student.dateOfBirth)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Gender</span>
                    <span className="font-bold text-foreground text-sm">{student.gender}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Blood Group</span>
                    <span className="font-bold text-foreground text-sm">{student.bloodGroup}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Admission Date</span>
                    <span className="font-bold text-foreground text-sm">{formatDate(student.admissionDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/60 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {student.address}, {student.city}, {student.state}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Guardian & Emergency Details */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Guardian & Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-muted-foreground block">Primary Parent / Guardian</span>
                  <span className="font-bold text-foreground text-sm">{student.guardian.name}</span>
                  <span className="text-muted-foreground block">
                    {student.guardian.relation} • {student.guardian.occupation}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Guardian Email:</span>
                    <span className="font-semibold text-foreground font-mono">{student.guardian.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Primary Phone:</span>
                    <span className="font-semibold text-foreground font-mono">{student.guardian.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-rose-600 font-medium">Emergency Line:</span>
                    <span className="font-bold text-rose-600 font-mono">{student.guardian.emergencyContact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              {student.academicHistory.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border/70 bg-card space-y-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{rec.term}</h4>
                      <span className="text-xs text-muted-foreground">
                        Class Rank #{rec.rank} • Overall Score: {rec.percentage}%
                      </span>
                    </div>
                    <Badge variant="success" className="text-xs font-mono font-bold">
                      GPA: {rec.gpa} ({rec.grade})
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
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block">Total Billed</span>
                  <span className="text-lg font-bold text-foreground mt-1 block">
                    {formatCurrency(student.feeSummary.totalAssigned)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-600 block">Paid to Date</span>
                  <span className="text-lg font-bold text-emerald-600 mt-1 block">
                    {formatCurrency(student.feeSummary.totalPaid)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-rose-600 block">Outstanding Balance</span>
                  <span className="text-lg font-bold text-rose-600 mt-1 block">
                    {formatCurrency(student.feeSummary.totalPending)}
                  </span>
                </div>
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
      </Tabs>

      {/* Edit Student Dialog */}
      <StudentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        studentToEdit={student}
        onSuccess={() => setStudent(mockDb.getStudentById(studentId))}
      />
    </div>
  );
}
