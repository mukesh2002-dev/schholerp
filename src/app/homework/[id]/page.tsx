"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchHomeworkDetail,
  fetchSubmissionsApi,
  gradeSubmissionApi,
  type BackendHomeworkSubmission,
} from "@/lib/api/homework";
import type { Homework } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

const hwStatusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

const subStatusConfig: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Submitted", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  GRADED: { label: "Graded", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  LATE: { label: "Late", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  RETURNED: { label: "Returned", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
};

export default function HomeworkDetailPage() {
  const params = useParams();
  const homeworkId = params.id as string;
  const { session } = useERP();
  const canGrade =
    session?.role === "ADMIN" || session?.role === "HR_MANAGER" || session?.role === "TEACHER";

  const [homework, setHomework] = useState<(Homework & { submissionsCount?: number }) | null>(null);
  const [submissions, setSubmissions] = useState<BackendHomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gradingUuid, setGradingUuid] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradeSaving, setGradeSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hw, subs] = await Promise.all([
        fetchHomeworkDetail(homeworkId),
        fetchSubmissionsApi(homeworkId, { limit: 100 }).catch(() => ({ items: [], total: 0 })),
      ]);
      setHomework(hw);
      setSubmissions(subs.items);
    } catch (e: any) {
      if (String(e?.message || "").toLowerCase().includes("not found")) setNotFound(true);
      else toast.error(e?.message || "Failed to load homework");
    } finally {
      setLoading(false);
    }
  }, [homeworkId]);

  useEffect(() => {
    load();
  }, [load]);

  const submissionStats = useMemo(() => {
    const submitted = submissions.filter((s) => s.status === "SUBMITTED" || s.status === "GRADED").length;
    const graded = submissions.filter((s) => s.status === "GRADED").length;
    const late = submissions.filter((s) => s.status === "LATE").length;
    const marks = submissions
      .map((s) => Number(s.marksGiven))
      .filter((n) => !Number.isNaN(n));
    const avgMarks = marks.length > 0 ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
    return { submitted, graded, late, avgMarks };
  }, [submissions]);

  const openGrade = (sub: BackendHomeworkSubmission) => {
    setGradingUuid(sub.uuid);
    setGradeMarks(sub.marksGiven ?? "");
    setGradeFeedback(sub.feedback ?? "");
  };

  const handleGrade = async () => {
    if (!gradingUuid) return;
    setGradeSaving(true);
    try {
      await gradeSubmissionApi(gradingUuid, {
        marksGiven: gradeMarks === "" ? null : Number(gradeMarks),
        feedback: gradeFeedback || undefined,
      });
      toast.success("Graded");
      setGradingUuid(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Grading failed");
    } finally {
      setGradeSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (notFound || !homework) {
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
              <Badge variant="outline" className={`text-[10px] border ${(hwStatusConfig[homework.status] ?? hwStatusConfig.ACTIVE).className}`}>
                {(hwStatusConfig[homework.status] ?? hwStatusConfig.ACTIVE).label}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">{homework.homeworkType}</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {homework.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
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
            <span className="font-bold text-foreground text-sm">{submissions.length}</span>
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
            {submissions.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {submissions.length}
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
                    {homework.description || "No specific instructions provided."}
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
                  <CardContent className="flex gap-3 flex-wrap">
                    {homework.attachments.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block h-24 w-24 rounded-lg overflow-hidden border border-border/60 bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`attachment ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
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
          {submissions.length === 0 ? (
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
                    {canGrade && <TableHead className="text-right">Grade</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.uuid} className="hover:bg-muted/40">
                      <TableCell>
                        <span className="font-semibold text-foreground text-sm">{sub.student?.name ?? "—"}</span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{sub.student?.rollNo ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(sub.submittedAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] border ${(subStatusConfig[sub.status] ?? subStatusConfig.SUBMITTED).className}`}>
                          {(subStatusConfig[sub.status] ?? subStatusConfig.SUBMITTED).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-bold text-foreground">
                        {sub.marksGiven != null ? `${sub.marksGiven} / ${homework.maxMarks}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {sub.remarks || sub.feedback || "—"}
                      </TableCell>
                      {canGrade && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openGrade(sub)}>
                            Grade
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {gradingUuid && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Grade submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Marks (max {homework.maxMarks})</label>
                    <Input type="number" value={gradeMarks} onChange={(e) => setGradeMarks(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Feedback</label>
                  <Textarea rows={3} value={gradeFeedback} onChange={(e) => setGradeFeedback(e.target.value)} placeholder="Feedback for the student..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setGradingUuid(null)}>Cancel</Button>
                  <Button size="sm" variant="gradient" disabled={gradeSaving} onClick={handleGrade}>
                    {gradeSaving ? "Saving..." : "Save Grade"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
