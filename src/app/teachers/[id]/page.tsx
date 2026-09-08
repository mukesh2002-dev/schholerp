"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Teacher } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TeacherFormDialog } from "@/components/teachers/teacher-form-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowLeft,
  Edit2,
  Award,
  Layers,
  CalendarDays,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState(() => mockDb.getTeacherById(teacherId));
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!teacher) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Users className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Teacher Record Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested faculty profile could not be located in the instructor roster.
        </p>
        <Button asChild variant="outline">
          <Link href="/teachers">Back to Faculty Directory</Link>
        </Button>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "ON_LEAVE":
        return "warning";
      case "PROBATION":
        return "purple";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero Faculty Profile Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={teacher.avatar}
                alt={teacher.fullName}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {teacher.employeeId}
                </span>
                <Badge variant={statusVariant(teacher.status) as any} className="text-xs">
                  {teacher.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  Joined {formatDate(teacher.joiningDate)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {teacher.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <strong className="text-foreground">{teacher.designation}</strong>
                <span>•</span>
                <span>{teacher.department}</span>
                <span>•</span>
                <span className="text-primary font-semibold">{teacher.branchName}</span>
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
              <span>Edit Faculty Record</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teachers" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span className="font-mono truncate">{teacher.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <span className="font-mono">{teacher.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{teacher.qualification}</span>
          </div>
        </div>
      </div>

      {/* Grid: Teaching Load, Leave Balance & Payroll */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Classes & Timetable Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Assigned Teaching Cohorts & Weekly Timetable Load
              </CardTitle>
              <CardDescription>
                Subject sections and classroom periods assigned for current academic term
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacher.assignedClasses.map((cls, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-border/70 bg-card space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{cls.className}</span>
                      <Badge variant="secondary" className="text-xs">
                        {cls.weeklyPeriods} Periods/wk
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Section: <strong className="text-foreground">{cls.sectionName}</strong>
                    </p>
                    <div className="text-xs font-semibold text-primary pt-1 border-t border-border/40">
                      Subject: {cls.subjectName}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subject Badges */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Certified Subject Domains
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.subjectsTaught.map((sub, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/60"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {teacher.bio && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
                  <span className="font-bold text-foreground block">Professional Biography:</span>
                  <p className="leading-relaxed">{teacher.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Attendance, Leave & Salary Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Leave Summary Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Leave Balance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">Annual Quota</span>
                  <span className="font-bold text-foreground text-base mt-0.5 block">
                    {teacher.leaveSummary.totalAllowed}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-amber-600 block">Leaves Taken</span>
                  <span className="font-bold text-amber-600 text-base mt-0.5 block">
                    {teacher.leaveSummary.used}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-600 block">Balance Days</span>
                  <span className="font-bold text-emerald-600 text-base mt-0.5 block">
                    {teacher.leaveSummary.balance}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Casual Leaves Used:</span>
                  <span className="font-semibold text-foreground">{teacher.leaveSummary.casualLeaves}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Medical Leaves Used:</span>
                  <span className="font-semibold text-foreground">{teacher.leaveSummary.medicalLeaves}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Biometric Attendance:</span>
                  <span className="font-bold text-emerald-600">{teacher.attendanceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary & Payroll Summary Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Compensation & Payroll
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Base Salary:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(teacher.salarySummary.baseSalary)} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground">Special Allowances:</span>
                  <span className="font-bold text-foreground font-mono">
                    {formatCurrency(teacher.salarySummary.allowances)} / mo
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Gross Monthly:</span>
                  <span className="font-extrabold text-emerald-600 text-sm font-mono">
                    {formatCurrency(teacher.salarySummary.grossSalary)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Faculty Documents — stored & verified (same as Students) */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Faculty Documents & Certificates
          </CardTitle>
          <CardDescription>
            Uploaded via Faculty form — stored in Documents module. PDF/JPG/PNG, verified toggle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const docs = mockDb.getDocuments().filter((d) => d.ownerId === teacher.id && d.ownerType === "TEACHER");
            if (docs.length === 0) {
              return (
                <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground">
                  No documents yet — edit faculty and upload Degree, B.Ed, Aadhaar, PAN etc. (jaise Admissions/Students me kiya). Yehi files yahan aur Documents module me dikhengi.
                </div>
              );
            }
            return docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground block truncate">{doc.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {doc.fileType} • {doc.fileSize} • {formatDate(doc.uploadDate)} • {doc.category}
                    </span>
                  </div>
                </div>
                <Badge variant={doc.verificationStatus === "VERIFIED" ? "success" : "outline"} className="text-[10px] shrink-0">
                  {doc.verificationStatus}
                </Badge>
              </div>
            ));
          })()}
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <TeacherFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        teacherToEdit={teacher}
        onSuccess={() => setTeacher(mockDb.getTeacherById(teacherId))}
      />
    </div>
  );
}
