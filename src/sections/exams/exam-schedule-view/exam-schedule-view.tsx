"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ExamSchedule, Result, GradeScale, ExamStatus, ResultStatus } from "@/types";
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
  Calendar,
  Clock,
  MapPin,
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

export function ExamScheduleView() {
  const { activeBranchId } = useERP();
  const [examSchedules] = useState(() => mockDb.getExamSchedules(activeBranchId));
  const [results] = useState(() => mockDb.getResults(activeBranchId));
  const [gradeScales] = useState(() => mockDb.getGradeScale());
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));

  const [activeTab, setActiveTab] = useState("schedules");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredSchedules = useMemo(() => {
    return examSchedules.filter((ex) => {
      const matchesSearch =
        ex.examName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.examTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.className?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || ex.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [examSchedules, searchQuery, statusFilter]);

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchesSearch =
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentRoll.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.examTypeName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = classFilter === "ALL" || r.classId === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [results, searchQuery, classFilter]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="h-9">
            <TabsTrigger value="schedules" className="text-xs px-3">
              Examination Schedules ({examSchedules.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs px-3">
              Published Results ({results.length})
            </TabsTrigger>
            <TabsTrigger value="rubrics" className="text-xs px-3">
              Grade Scale Rubric
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exams, students, roll #..."
                className="pl-9 h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Schedules */}
        <TabsContent value="schedules" className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <EmptyState
              title="No Examination Schedules Found"
              description="No exam timetables match your search criteria."
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead>Time Window</TableHead>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class &amp; Section</TableHead>
                    <TableHead>Hall / Room</TableHead>
                    <TableHead>Marks (Max/Pass)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold text-foreground">
                        {formatDate(schedule.examDate)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm text-foreground block">{schedule.examName}</span>
                        <span className="text-[11px] text-muted-foreground block">{schedule.examTypeName}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {schedule.subjectName}
                      </TableCell>
                      <TableCell className="text-xs">
                        {schedule.className} - {schedule.sectionName}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {schedule.room}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <strong className="text-foreground">{schedule.totalMarks}</strong> / {schedule.passingMarks}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusBadgeVariant[schedule.status] as any}
                          className="text-[10px]"
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Results */}
        <TabsContent value="results">
          {filteredResults.length === 0 ? (
            <EmptyState
              title="No Results Found"
              description="No student scorecards match your search criteria."
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Roll #</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Exam Series</TableHead>
                    <TableHead>Class &amp; Section</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono font-bold text-xs">{r.studentRoll}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">
                        {r.studentName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.examTypeName}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {r.className} - {r.sectionName}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <strong className="text-foreground">{r.marksObtained}</strong> / {r.totalMarks}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-primary">
                        {r.percentage}%
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-xs">
                          {r.overallGrade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold" title="CBSE CGPA = percentage ÷ 9.5">{(r.percentage / 9.5).toFixed(1)}</TableCell>
                      <TableCell className="text-xs font-mono">
                        {r.rank ? `#${r.rank}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={resultStatusBadgeVariant[r.status] as any}
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Rubric */}
        <TabsContent value="rubrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gradeScales.map((scale) => (
              <Card key={scale.grade} className="p-4 border-border/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-primary">{scale.grade}</span>
                  <Badge variant="outline" className="text-xs font-mono">
                    CGPA {(scale.maxPercentage / 9.5).toFixed(1)}
                  </Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Range: <strong className="text-foreground">{scale.minPercentage}%</strong> to{" "}
                  <strong className="text-foreground">{scale.maxPercentage}%</strong>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{scale.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
