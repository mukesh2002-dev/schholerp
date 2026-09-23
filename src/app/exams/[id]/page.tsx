"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchExamById,
  fetchExamStudentsMatrix,
  enrollClassStudentsApi,
  saveBulkMarks,
  fetchExamAnalytics,
  recomputeExamApi,
  type ExamMatrix,
  type BackendExam,
  type BackendExamSchedule,
  type ExamAnalytics,
  type ExamMatrixRow,
} from "@/lib/api/exams";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Calendar, Clock, MapPin, GraduationCap, FileSpreadsheet, BookOpen, RefreshCw, Users, Download, AlertTriangle, Trophy, Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Draft", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
  PUBLISHED: { label: "Published", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ONGOING: { label: "Ongoing", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  COMPLETED: { label: "Completed", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  CANCELLED: { label: "Cancelled", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

const ROW_STATUS: Record<string, { label: string; cls: string }> = {
  PASS: { label: "Pass", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  FAIL: { label: "Fail", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  ABSENT: { label: "Absent", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  PENDING: { label: "Pending", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
};

const GRADE_COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#64748b", "#22d3ee"];

export default function ExamDetailPage() {
  const params = useParams();
  const examUuid = params.id as string;
  const { activeBranchId } = useERP();

  const [exam, setExam] = useState<BackendExam | null>(null);
  const [matrix, setMatrix] = useState<ExamMatrix | null>(null);
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [entrySchedule, setEntrySchedule] = useState<BackendExamSchedule | null>(null);
  const [entryDraft, setEntryDraft] = useState<Record<string, string>>({});
  const [entrySaving, setEntrySaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ex = await fetchExamById(examUuid);
      setExam(ex);
      const [m, an] = await Promise.all([
        fetchExamStudentsMatrix(examUuid).catch(() => null),
        fetchExamAnalytics(examUuid).catch(() => null),
      ]);
      setMatrix(m);
      setAnalytics(an);
    } catch (e: any) {
      if (String(e?.message || "").toLowerCase().includes("not found")) setNotFound(true);
      else toast.error(e?.message || "Failed to load exam");
    } finally {
      setLoading(false);
    }
  }, [examUuid]);

  useEffect(() => { load(); }, [load]);

  const refreshMatrix = useCallback(async () => {
    const m = await fetchExamStudentsMatrix(examUuid).catch(() => null);
    setMatrix(m);
    const an = await fetchExamAnalytics(examUuid).catch(() => null);
    setAnalytics(an);
  }, [examUuid]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await enrollClassStudentsApi(examUuid);
      toast.success(`Enrolled ${res.enrolled} students`);
      await refreshMatrix();
    } catch (e: any) {
      toast.error(e?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      const res = await recomputeExamApi(examUuid);
      toast.success(`Recomputed ${res.recomputed} results`);
      await refreshMatrix();
    } catch (e: any) {
      toast.error(e?.message || "Recompute failed");
    } finally {
      setRecomputing(false);
    }
  };

  const sections = useMemo(() => {
    if (!matrix) return [];
    return [...new Set(matrix.rows.map((r) => r.section).filter(Boolean))] as string[];
  }, [matrix]);

  const filteredRows = useMemo(() => {
    if (!matrix) return [];
    return matrix.rows.filter((r) => {
      const mSearch = !search || r.studentName.toLowerCase().includes(search.toLowerCase()) || (r.rollNo ?? "").includes(search) || r.admissionNo.toLowerCase().includes(search);
      const mSection = sectionFilter === "ALL" || (r.section ?? "") === sectionFilter;
      const mStatus = statusFilter === "ALL" || r.status === statusFilter;
      return mSearch && mSection && mStatus;
    });
  }, [matrix, search, sectionFilter, statusFilter]);

  const openEntry = (schedule: BackendExamSchedule) => {
    setEntrySchedule(schedule);
    const draft: Record<string, string> = {};
    if (matrix) {
      for (const r of matrix.rows) {
        const paper = r.papers.find((p) => p.scheduleUuid === schedule.uuid);
        draft[r.studentUuid] = paper?.obtained != null ? String(paper.obtained) : "";
      }
    }
    setEntryDraft(draft);
  };

  const handleSaveEntry = async () => {
    if (!entrySchedule) return;
    setEntrySaving(true);
    try {
      const entries = Object.entries(entryDraft)
        .filter(([, v]) => v !== "")
        .map(([studentUuid, v]) => ({ studentUuid, marksObtained: Number(v) }));
      const res = await saveBulkMarks(entrySchedule.uuid, entries);
      toast.success(`Saved ${res.saved} marks`);
      setEntrySchedule(null);
      await refreshMatrix();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setEntrySaving(false);
    }
  };

  const exportCsv = () => {
    if (!matrix) return;
    const heads = ["Roll No", "Admission No", "Student Name", "Section", ...matrix.schedules.map((s) => s.subject?.name ?? "Subject"), "Total", "Percentage", "Grade", "Status"];
    const lines = matrix.rows.map((r) => [
      r.rollNo ?? "",
      r.admissionNo,
      r.studentName,
      r.section ?? "",
      ...matrix.schedules.map((s) => r.papers.find((p) => p.scheduleUuid === s.uuid)?.obtained ?? ""),
      r.obtained,
      r.percentage,
      r.grade ?? "",
      r.status,
    ]);
    const csv = [heads, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam?.name ?? "exam"}-marks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-1/3 bg-muted rounded" />
        <div className="h-44 bg-muted rounded-2xl" />
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (notFound || !exam) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Exam Not Found</h2>
        <Button asChild variant="outline"><Link href="/exams">Back to Exams</Link></Button>
      </div>
    );
  }

  const st = STATUS[exam.status] ?? STATUS.DRAFT;
  const schedules = exam.schedules ?? matrix?.schedules ?? [];
  const chartData = analytics
    ? [
      { name: "Pass", value: (analytics.summary.appeared ?? 0) > 0 ? Math.round(((analytics.summary.passRate ?? 0) / 100) * analytics.summary.appeared) : 0 },
      { name: "Fail", value: (analytics.summary.appeared ?? 0) > 0 ? analytics.summary.appeared - Math.round(((analytics.summary.passRate ?? 0) / 100) * analytics.summary.appeared) : 0 },
    ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] ${st.cls}`}>{st.label}</Badge>
              <Badge variant="secondary" className="text-[10px]">{exam.examType?.name ?? "—"}</Badge>
              <Badge variant="outline" className="text-[10px]">{exam.examMode}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{exam.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{exam.class?.name ?? "—"} {exam.section ? `· Section ${exam.section}` : "· All Sections"}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(exam.startDate)} → {formatDate(exam.endDate)}</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{exam.academicYear}</span>
            </div>
            {exam.instructions && (
              <p className="text-xs bg-muted/40 border border-border/60 rounded-lg p-3 text-muted-foreground whitespace-pre-wrap">{exam.instructions}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleEnroll} disabled={enrolling} className="gap-1.5">
              <Users className="h-4 w-4" />{enrolling ? "Enrolling..." : "Enroll Class"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRecompute} disabled={recomputing} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />{recomputing ? "..." : "Recompute"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-1.5"><Download className="h-4 w-4" />CSV</Button>
            <Button variant="ghost" size="sm" asChild><Link href="/exams" className="gap-1.5"><ArrowLeft className="h-4 w-4" />Back</Link></Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="matrix" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" />Students &amp; Marks</TabsTrigger>
          <TabsTrigger value="datesheet" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Datesheet</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5"><Trophy className="h-3.5 w-3.5" />Analytics</TabsTrigger>
        </TabsList>

        {/* ── Matrix ── */}
        <TabsContent value="matrix" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-1 flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student / roll / admission" className="pl-9 h-9" />
              </div>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sections</SelectItem>
                  {sections.map((s) => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PASS">Pass</SelectItem>
                  <SelectItem value="FAIL">Fail</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!matrix || matrix.rows.length === 0 ? (
            <EmptyState
              title="No students enrolled yet"
              description="Click 'Enroll Class' to pull in active students of this class."
            />
          ) : filteredRows.length === 0 ? (
            <EmptyState title="No matching students" description="Try adjusting filters." />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-right">Rank</TableHead>
                    <TableHead>Roll</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Section</TableHead>
                    {matrix.schedules.map((s) => (
                      <TableHead key={s.uuid} className="min-w-[110px] text-right">
                        {s.subject?.name ?? "Subject"}
                        <span className="block text-[10px] font-normal text-muted-foreground">/ {s.totalMarks}</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((r) => (
                    <TableRow key={r.studentUuid} className="hover:bg-muted/40">
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{r.rank ?? "—"}</TableCell>
                      <TableCell className="text-xs font-mono">{r.rollNo ?? "—"}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm">{r.studentName}</div>
                        <div className="text-[11px] text-muted-foreground">{r.admissionNo}</div>
                      </TableCell>
                      <TableCell className="text-xs">{r.section ?? "—"}</TableCell>
                      {matrix.schedules.map((s) => {
                        const p = r.papers.find((x) => x.scheduleUuid === s.uuid);
                        return (
                          <TableCell key={s.uuid} className="text-right text-xs font-mono">
                            {p?.obtained != null ? p.obtained : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right text-xs font-bold">{r.obtained}/{r.total}</TableCell>
                      <TableCell className="text-right text-xs font-mono">{r.percentage.toFixed(1)}%</TableCell>
                      <TableCell>{r.grade ? <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/20">{r.grade}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[11px] ${(ROW_STATUS[r.status] ?? ROW_STATUS.PENDING).cls}`}>
                          {(ROW_STATUS[r.status] ?? ROW_STATUS.PENDING).label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Quick marks entry */}
          <Card className="border-border/70">
            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary" />Quick Marks Entry</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Pick a datesheet subject to enter marks for all students at once. Empty cells are skipped; grades &amp; results auto-recompute.</p>
              <div className="flex flex-wrap gap-2">
                {matrix?.schedules.map((s) => (
                  <Button key={s.uuid} variant="outline" size="sm" className="gap-1.5" onClick={() => openEntry(s)}>
                    <PenIcon className="h-3.5 w-3.5" />{s.subject?.name ?? "Subject"} ({s.examDate ? formatDate(s.examDate) : "—"})
                  </Button>
                ))}
                {(!matrix || matrix.schedules.length === 0) && (
                  <span className="text-xs text-muted-foreground">Add datesheet entries first (Datesheet tab).</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Datesheet ── */}
        <TabsContent value="datesheet" className="space-y-4">
          {schedules.length === 0 ? (
            <EmptyState title="No datesheet yet" description="Add subject papers from the Exams → Datesheet tab." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((s) => (
                <Card key={s.uuid} className="border-border/70">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-base font-bold text-foreground">{s.subject?.name ?? "Subject"}</div>
                        <div className="text-[11px] text-muted-foreground">{s.examName}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{s.totalMarks} marks</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(s.examDate)}</div>
                      <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{String(s.startTime).slice(0, 5)} – {String(s.endTime).slice(0, 5)}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{s.room || "—"}</div>
                      <div className="flex items-center gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" />Pass: {s.passingMarks}</div>
                    </div>
                    {s.instructions && <p className="text-[11px] bg-muted/40 border border-border/60 rounded-lg p-2.5 text-muted-foreground whitespace-pre-wrap">{s.instructions}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Analytics ── */}
        <TabsContent value="analytics" className="space-y-6">
          {!analytics ? (
            <EmptyState title="No analytics yet" description="Enter marks for at least one subject to see analytics." />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Enrolled", value: analytics.summary.enrolled, cls: "text-foreground" },
                  { label: "Appeared", value: analytics.summary.appeared, cls: "text-foreground" },
                  { label: "Absent", value: analytics.summary.absent, cls: "text-amber-600" },
                  { label: "Pass Rate", value: `${analytics.summary.passRate}%`, cls: "text-emerald-600" },
                  { label: "Class Avg", value: `${analytics.summary.averagePercentage}%`, cls: "text-primary" },
                ].map((m) => (
                  <Card key={m.label} className="p-4">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</div>
                    <div className={`text-2xl font-extrabold mt-1 ${m.cls}`}>{m.value}</div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-bold">Pass / Fail</CardTitle></CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2}>
                          {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "#10b981" : "#f43f5e"} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-bold">Grade Distribution</CardTitle></CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="grade" fontSize={11} />
                        <YAxis allowDecimals={false} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {analytics.gradeDistribution.map((_, i) => <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-bold">Subject Performance</CardTitle></CardHeader>
                  <CardContent className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.subjects}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="subject" fontSize={10} interval={0} angle={-20} textAnchor="end" height={50} />
                        <YAxis fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="average" name="Average" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="highest" name="Highest" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" />Toppers</CardTitle></CardHeader>
                  <CardContent>
                    {analytics.toppers.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No graded students yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {analytics.toppers.map((t, i) => (
                          <div key={t.studentUuid} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60">
                            <div className="flex items-center gap-2.5">
                              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                                {t.rank ?? i + 1}
                              </span>
                              <div>
                                <div className="text-sm font-semibold text-foreground">{t.studentName}</div>
                                <div className="text-[11px] text-muted-foreground">Roll {t.rollNo ?? "—"}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-foreground">{t.percentage}%</div>
                              {t.grade && <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary">{t.grade}</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-sm font-bold">Marks Distribution</CardTitle></CardHeader>
                <CardContent className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.histogram}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" fontSize={11} />
                      <YAxis allowDecimals={false} fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="count" name="Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Marks entry dialog */}
      <Dialog open={!!entrySchedule} onOpenChange={(o) => { if (!o) setEntrySchedule(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Marks — {entrySchedule?.subject?.name}</DialogTitle>
            <DialogDescription>
              {entrySchedule?.examName} · {entrySchedule ? formatDate(entrySchedule.examDate) : ""} · max {entrySchedule?.totalMarks} (pass {entrySchedule?.passingMarks})
            </DialogDescription>
          </DialogHeader>
          {entrySchedule && (
            <div className="space-y-2">
              {matrix?.rows.map((r: ExamMatrixRow) => (
                <div key={r.studentUuid} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/60">
                  <span className="text-xs font-semibold w-8 font-mono text-muted-foreground">{r.rollNo ?? "—"}</span>
                  <span className="text-sm font-medium flex-1">{r.studentName}</span>
                  <Input
                    type="number"
                    min={0}
                    max={entrySchedule.totalMarks}
                    className="w-24 h-8 text-right font-mono"
                    placeholder="-"
                    value={entryDraft[r.studentUuid] ?? ""}
                    onChange={(e) => setEntryDraft((d) => ({ ...d, [r.studentUuid]: e.target.value }))}
                  />
                  <span className="text-[11px] text-muted-foreground w-8">/{entrySchedule.totalMarks}</span>
                </div>
              ))}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEntrySchedule(null)}>Cancel</Button>
                <Button variant="gradient" disabled={entrySaving} onClick={handleSaveEntry}>
                  {entrySaving ? "Saving..." : "Save Marks"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PenIcon({ className }: { className?: string }) {
  return <FileSpreadsheet className={className} />;
}