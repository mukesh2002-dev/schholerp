"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ExamSchedule, Result, GradeScale, ExamStatus, ResultStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileSpreadsheet,
  Calendar,
  Clock,
  MapPin,
  GraduationCap,
  Trophy,
  Award,
  BookOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusBadgeVariant: Record<ExamStatus, "default" | "success" | "warning" | "info" | "destructive" | "purple"> = {
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

export default function ExamsPage() {
  const { activeBranchId } = useERP();
  const [examSchedules, setExamSchedules] = useState(() => mockDb.getExamSchedules(activeBranchId));
  const [results, setResults] = useState(() => mockDb.getResults(activeBranchId));
  const [gradeScale] = useState(() => mockDb.getGradeScale());
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const refreshList = () => {
    setExamSchedules(mockDb.getExamSchedules(activeBranchId));
    setResults(mockDb.getResults(activeBranchId));
  };

  const uniqueClasses = useMemo(() => {
    const classSet = new Set(examSchedules.map((s) => s.className));
    return Array.from(classSet);
  }, [examSchedules]);

  const filteredSchedules = useMemo(() => {
    return examSchedules.filter((s) => {
      const matchesSearch =
        s.examName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === "ALL" || s.className === classFilter;
      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [examSchedules, searchQuery, classFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Exams & Results
            </h1>
            <Badge variant="outline" className="text-xs">
              {examSchedules.length} Exams
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage exam schedules, enter marks, and view student results and grade scales.
          </p>
        </div>
      </div>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="schedules" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Exam Schedules</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="grade-scale" className="gap-1.5">
            <Award className="h-3.5 w-3.5" />
            <span>Grade Scale</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exam name, subject, class..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <EmptyState
              title="No Exam Schedules Found"
              description="No exam schedules matched your current search and filter criteria."
              icon={<FileSpreadsheet className="h-7 w-7" />}
            />
          ) : (
            <div className="grid gap-3">
              {filteredSchedules.map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-sm">
                            {exam.examName.charAt(0)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                                {exam.examName}
                              </h3>
                              <Badge variant={statusBadgeVariant[exam.status]} className="text-[10px] py-0">
                                {exam.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {exam.subjectName}
                              </span>
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {exam.className} &middot; {exam.sectionName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div className="hidden sm:flex flex-col items-end gap-0.5">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(exam.examDate)}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {exam.startTime} - {exam.endTime}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {exam.room}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground text-sm block">{exam.totalMarks}</span>
                            <span className="text-[10px] text-muted-foreground">Total Marks</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? (
            <EmptyState
              title="No Results Available"
              description="Results will appear here once exams are graded and published."
              icon={<Trophy className="h-7 w-7" />}
            />
          ) : (
            <div className="grid gap-3">
              {results.map((result) => (
                <Card key={result.id} className="border-border/80 shadow-xs">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-sm">
                          {result.studentName.charAt(0)}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground text-sm truncate">
                              {result.studentName}
                            </h3>
                            <Badge variant={resultStatusBadgeVariant[result.status]} className="text-[10px] py-0">
                              {result.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span>{result.className} &middot; {result.sectionName}</span>
                            <span>{result.examTypeName}</span>
                            <span>Rank {result.rank} of {result.totalStudents}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-foreground text-sm block">{result.percentage.toFixed(1)}%</span>
                          <span className="text-[10px] text-muted-foreground">Percentage</span>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="font-bold text-sm px-3 py-1">
                            {result.overallGrade}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">Grade</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-foreground text-sm block">{result.gpa.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">GPA</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="grade-scale" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade</TableHead>
                  <TableHead>Percentage Range</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeScale.map((gs) => (
                  <TableRow key={gs.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-bold text-sm"
                        style={{ borderColor: `var(--${gs.color}-500, var(--primary))`, color: `var(--${gs.color}-600, var(--primary))` }}
                      >
                        {gs.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {gs.minPercentage}% - {gs.maxPercentage}%
                    </TableCell>
                    <TableCell className="font-bold text-sm">{gs.gpa.toFixed(1)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{gs.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
