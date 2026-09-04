"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { ExamSchedule, MarkEntry, ExamStatus, ResultStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  FileSpreadsheet,
  BookOpen,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusBadgeVariant: Record<ExamStatus, "default" | "success" | "warning" | "info" | "destructive"> = {
  SCHEDULED: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const resultStatusBadgeVariant: Record<ResultStatus, "default" | "success" | "warning" | "destructive"> = {
  PASS: "success",
  FAIL: "destructive",
  PENDING: "warning",
  DISQUALIFIED: "destructive",
};

export default function ExamScheduleDetailPage() {
  const params = useParams();
  const examScheduleId = params.id as string;

  const [examSchedule] = useState<ExamSchedule | undefined>(() => mockDb.getExamScheduleById(examScheduleId));
  const [markEntries] = useState<MarkEntry[]>(() => mockDb.getMarkEntries(examScheduleId));

  if (!examSchedule) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Exam Schedule Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested exam schedule record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/exams">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  const passCount = markEntries.filter((e) => e.status === "PASS").length;
  const failCount = markEntries.filter((e) => e.status === "FAIL").length;
  const avgPercentage = markEntries.length > 0
    ? markEntries.reduce((acc, e) => acc + e.percentage, 0) / markEntries.length
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-2xl">
              {examSchedule.examName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusBadgeVariant[examSchedule.status]} className="text-[10px]">
                  {examSchedule.status.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {examSchedule.examTypeName}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {examSchedule.examName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                <span className="text-primary font-semibold">{examSchedule.subjectName}</span> &middot;{" "}
                {examSchedule.className} &middot; {examSchedule.sectionName}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/exams" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Calendar className="h-3 w-3" />
              Date
            </span>
            <span className="font-bold text-foreground text-sm">{formatDate(examSchedule.examDate)}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Clock className="h-3 w-3" />
              Time
            </span>
            <span className="font-bold text-foreground text-sm">{examSchedule.startTime} - {examSchedule.endTime}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <MapPin className="h-3 w-3" />
              Room
            </span>
            <span className="font-bold text-foreground text-sm">{examSchedule.room}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Hash className="h-3 w-3" />
              Marks
            </span>
            <span className="font-bold text-foreground text-sm">
              {examSchedule.totalMarks} <span className="text-muted-foreground font-normal text-xs">/ {examSchedule.passingMarks} pass</span>
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="marks" className="gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Marks Entry</span>
            {markEntries.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
                {markEntries.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Exam Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Exam Name</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.examName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Exam Type</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.examTypeName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Subject</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.subjectName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Class</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.className}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Section</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.sectionName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Branch</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.branchName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Marks Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Total Marks</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.totalMarks}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Passing Marks</span>
                    <span className="font-bold text-foreground text-sm">{examSchedule.passingMarks}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Students Entered</span>
                    <span className="font-bold text-foreground text-sm">{markEntries.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Average Percentage</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {avgPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-emerald-600 dark:text-emerald-400 block mb-0.5 font-semibold">Passed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{passCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <span className="text-rose-600 dark:text-rose-400 block mb-0.5 font-semibold">Failed</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{failCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marks" className="space-y-4">
          {markEntries.length === 0 ? (
            <EmptyState
              title="No Marks Entered Yet"
              description="Marks entries will appear here once the teacher records student scores for this exam."
              icon={<GraduationCap className="h-7 w-7" />}
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead className="text-right tabular-nums">Marks Obtained</TableHead>
                    <TableHead className="text-right tabular-nums">Total Marks</TableHead>
                    <TableHead className="text-right tabular-nums">Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {entry.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-semibold text-foreground text-sm truncate">
                            {entry.studentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{entry.studentRoll}</TableCell>
                      <TableCell className="text-right tabular-nums font-bold text-sm">{entry.marksObtained}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs text-muted-foreground">{entry.totalMarks}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          {entry.percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-xs">
                          {entry.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={resultStatusBadgeVariant[entry.status]} className="text-[10px] py-0">
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {entry.remarks || "-"}
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
