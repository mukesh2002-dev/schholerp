"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { Homework, HomeworkSubmission, SubmissionStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  User,
  FileText,
  ClipboardCheck,
  Award,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const hwStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

const subStatusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  GRADED: { label: "Graded", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  LATE: { label: "Late", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  NOT_SUBMITTED: { label: "Not Submitted", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
};

export default function HomeworkDetailPage() {
  const params = useParams();
  const homeworkId = params.id as string;

  const homework = mockDb.getHomeworkById(homeworkId);
  const submissions = mockDb.getHomeworkSubmissions(homeworkId);

  const [submissionsList] = useState<HomeworkSubmission[]>(submissions);

  const submissionStats = useMemo(() => {
    const submitted = submissionsList.filter((s) => s.status === "SUBMITTED" || s.status === "GRADED").length;
    const graded = submissionsList.filter((s) => s.status === "GRADED").length;
    const late = submissionsList.filter((s) => s.status === "LATE").length;
    const notSubmitted = submissionsList.filter((s) => s.status === "NOT_SUBMITTED").length;
    const avgMarks = graded > 0
      ? Math.round(
          submissionsList
            .filter((s) => s.marksObtained !== undefined)
            .reduce((acc, s) => acc + (s.marksObtained || 0), 0) / graded
        )
      : 0;
    return { submitted, graded, late, notSubmitted, avgMarks };
  }, [submissionsList]);

  if (!homework) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Homework Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested homework assignment record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/homework">Back to Homework</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] border ${hwStatusConfig[homework.status].className}`}>
                {hwStatusConfig[homework.status].label}
              </Badge>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {homework.subjectCode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {homework.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{homework.subjectName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{homework.className} — {homework.sectionName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{homework.teacherName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/homework" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/60">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Assigned Date</span>
            <span className="font-bold text-foreground text-sm">{formatDate(homework.assignedDate)}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Due Date</span>
            <span className="font-bold text-foreground text-sm">{formatDate(homework.dueDate)}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Max Marks</span>
            <span className="font-bold text-foreground text-sm">{homework.maxMarks}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] text-muted-foreground block mb-0.5">Submissions</span>
            <span className="font-bold text-foreground text-sm">{submissionStats.submitted} / {submissionsList.length > 0 ? submissionsList.length : "—"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            Submissions
            {submissionsList.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {submissionsList.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Assignment Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {homework.description}
                  </p>
                </CardContent>
              </Card>

              {homework.attachments && homework.attachments.length > 0 && (
                <Card className="border-border/80 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {homework.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60 text-xs">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{att}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Submission Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-bold text-foreground">{submissionStats.submitted}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                    <span className="text-muted-foreground">Graded</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{submissionStats.graded}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                    <span className="text-muted-foreground">Late</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{submissionStats.late}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                    <span className="text-muted-foreground">Not Submitted</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{submissionStats.notSubmitted}</span>
                  </div>
                  {submissionStats.graded > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                      <span className="text-muted-foreground">Avg. Marks</span>
                      <span className="font-bold text-primary">{submissionStats.avgMarks} / {homework.maxMarks}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          {submissionsList.length === 0 ? (
            <Card className="border-border/80 shadow-xs">
              <CardContent className="py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground mb-4">
                  <ClipboardCheck className="h-7 w-7" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No Submissions Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Students have not submitted any work for this assignment yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right tabular-nums">Marks</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissionsList.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-muted/40">
                      <TableCell>
                        <span className="font-semibold text-foreground text-sm">{sub.studentName}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{sub.studentRoll}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(sub.submissionDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] border ${subStatusConfig[sub.status].className}`}>
                          {subStatusConfig[sub.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-bold text-foreground">
                        {sub.marksObtained !== undefined ? `${sub.marksObtained} / ${homework.maxMarks}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {sub.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
