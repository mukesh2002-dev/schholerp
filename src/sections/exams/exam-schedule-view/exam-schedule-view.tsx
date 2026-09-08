"use client";

import React, { useState, useMemo, useRef } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ExamSchedule, Result, GradeScale, ExamStatus, ResultStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Clock, MapPin, Upload, Download, Plus, Edit3, Save, FileSpreadsheet, User, Trash2, Eye, Printer, TrendingUp, Award, Trophy, LayoutGrid, List, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

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

function getGradeForPercentage(p: number, scales: GradeScale[]): GradeScale | undefined {
  return scales.find((s) => p >= s.minPercentage && p <= s.maxPercentage);
}

export function ExamScheduleView() {
  const { activeBranchId } = useERP();
  const [examSchedules, setExamSchedules] = useState(() => mockDb.getExamSchedules(activeBranchId));
  const [results, setResults] = useState(() => mockDb.getResults(activeBranchId));
  const [gradeScales] = useState(() => mockDb.getGradeScale());
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));
  const [students] = useState(() => mockDb.getStudents(activeBranchId));

  const [activeTab, setActiveTab] = useState("schedules");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Mark entry dialog state
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [markRows, setMarkRows] = useState<{ studentId: string; studentName: string; studentRoll: string; marks: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Exam state
  // Premium Results UI state
  const [resultViewMode, setResultViewMode] = useState<"table" | "cards">("table");
  const [resultExamFilter, setResultExamFilter] = useState<string>("ALL");
  const [resultStatusFilter, setResultStatusFilter] = useState<string>("ALL");
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [resultDetailOpen, setResultDetailOpen] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [examTypes] = useState(() => mockDb.getExamTypes());
  const createSchema = z.object({
    examName: z.string().min(1, "Exam name required"),
    examTypeId: z.string().min(1, "Exam type required"),
    classId: z.string().min(1, "Class required"),
    subjectId: z.string().min(1, "Subject required"),
    examDate: z.string().min(1, "Date required"),
    startTime: z.string().min(1, "Start time required"),
    endTime: z.string().min(1, "End time required"),
    room: z.string().min(1, "Room required"),
    totalMarks: z.string().min(1, "Total marks required"),
    passingMarks: z.string().min(1, "Passing marks required"),
  });
  type CreateValues = z.infer<typeof createSchema>;
  const { register: registerCreate, handleSubmit: handleCreateSubmit, setValue: setCreateValue, watch: watchCreate, reset: resetCreate, formState: { errors: createErrors } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { examName: "", examTypeId: "", classId: "", subjectId: "", examDate: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "12:00", room: "", totalMarks: "100", passingMarks: "33" },
  });

  const refresh = () => {
    setExamSchedules([...mockDb.getExamSchedules(activeBranchId)]);
    setResults([...mockDb.getResults(activeBranchId)]);
  };

  const handleCreateExam = (data: CreateValues) => {
    const cls = classes.find((c) => c.id === data.classId);
    const subj = cls?.subjects.find((s) => s.id === data.subjectId);
    const examType = examTypes.find((e) => e.id === data.examTypeId);
    if (!cls || !subj || !examType) { toast.error("Class/Subject/Type missing"); return; }
    const sec = cls.sections[0];
    mockDb.saveExamSchedule({
      examName: data.examName,
      examTypeId: examType.id,
      examTypeName: examType.name,
      classId: cls.id,
      className: cls.name,
      sectionId: sec.id,
      sectionName: sec.name,
      subjectId: subj.id,
      subjectName: subj.name,
      branchId: cls.branchId,
      branchName: cls.branchName,
      examDate: data.examDate,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room,
      status: "SCHEDULED",
      totalMarks: Number(data.totalMarks),
      passingMarks: Number(data.passingMarks),
    });
    toast.success(`Exam "${data.examName}" created`);
    setCreateDialogOpen(false);
    resetCreate();
    refresh();
  };

  const handleDeleteSchedule = (id: string) => {
    // soft delete via direct localStorage filter (mockDb has no delete)
    const all = mockDb.getExamSchedules();
    const filtered = all.filter((s) => s.id !== id);
    if (typeof window !== "undefined") localStorage.setItem("school_erp_exam_schedules_v1", JSON.stringify(filtered));
    toast.success("Exam schedule deleted");
    refresh();
  };

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
      const matchesExam = resultExamFilter === "ALL" || r.examTypeId === resultExamFilter;
      const matchesStatus = resultStatusFilter === "ALL" || r.status === resultStatusFilter;
      return matchesSearch && matchesClass && matchesExam && matchesStatus;
    });
  }, [results, searchQuery, classFilter, resultExamFilter, resultStatusFilter]);

  // Premium analytics
  const resultStats = useMemo(() => {
    if (filteredResults.length === 0) return { avg: 0, passRate: 0, topper: null as Result | null, total: 0 };
    const total = filteredResults.length;
    const avg = filteredResults.reduce((a, r) => a + r.percentage, 0) / total;
    const passCount = filteredResults.filter((r) => r.status === "PASS").length;
    const passRate = (passCount / total) * 100;
    const topper = [...filteredResults].sort((a, b) => b.percentage - a.percentage)[0];
    return { avg: Number(avg.toFixed(1)), passRate: Number(passRate.toFixed(1)), topper, total };
  }, [filteredResults]);

  const openMarkDialog = (schedule: ExamSchedule) => {
    setSelectedSchedule(schedule);
    const classStudents = students.filter((s) => s.classId === schedule.classId).slice(0, 20);
    const source = classStudents.length ? classStudents : students.slice(0, 10);
    setMarkRows(
      source.map((s) => ({
        studentId: s.id,
        studentName: s.fullName,
        studentRoll: s.rollNumber,
        marks: "",
      }))
    );
    setMarkDialogOpen(true);
  };

  const handleMarksChange = (idx: number, val: string) => {
    setMarkRows((prev) => prev.map((r, i) => (i === idx ? { ...r, marks: val } : r)));
  };

  const handleSaveMarks = () => {
    if (!selectedSchedule) return;
    let saved = 0;
    let failed = 0;
    for (const row of markRows) {
      if (row.marks === "" || row.marks === undefined) continue;
      const marksObtained = Number(row.marks);
      if (isNaN(marksObtained) || marksObtained < 0 || marksObtained > selectedSchedule.totalMarks) {
        failed++;
        continue;
      }
      const percentage = (marksObtained / selectedSchedule.totalMarks) * 100;
      const gradeScale = getGradeForPercentage(percentage, gradeScales);
      const grade = gradeScale?.grade || "E";
      const status: ResultStatus = marksObtained >= selectedSchedule.passingMarks ? "PASS" : "FAIL";
      // save mark entry
      mockDb.saveMarkEntry({
        examScheduleId: selectedSchedule.id,
        studentId: row.studentId,
        studentName: row.studentName,
        studentRoll: row.studentRoll,
        subjectId: selectedSchedule.subjectId,
        subjectName: selectedSchedule.subjectName,
        marksObtained,
        totalMarks: selectedSchedule.totalMarks,
        percentage,
        grade,
        status,
        enteredBy: "Teacher",
      });
      // also create/update Result aggregate (single subject)
      const existing = mockDb.getResults().find((r) => r.studentId === row.studentId && r.examTypeId === selectedSchedule.examTypeId);
      if (existing) {
        mockDb.saveResult({
          ...existing,
          marksObtained,
          percentage,
          overallGrade: grade,
          status,
          subjects: [{ subjectId: selectedSchedule.subjectId, subjectName: selectedSchedule.subjectName, marksObtained, totalMarks: selectedSchedule.totalMarks, percentage, grade, status }],
        });
      } else {
        mockDb.saveResult({
          studentId: row.studentId,
          studentName: row.studentName,
          studentRoll: row.studentRoll,
          classId: selectedSchedule.classId,
          className: selectedSchedule.className,
          sectionId: selectedSchedule.sectionId,
          sectionName: selectedSchedule.sectionName,
          branchId: selectedSchedule.branchId,
          branchName: selectedSchedule.branchName,
          examTypeId: selectedSchedule.examTypeId,
          examTypeName: selectedSchedule.examTypeName,
          academicYear: "2026-2027",
          totalMarks: selectedSchedule.totalMarks,
          marksObtained,
          percentage,
          overallGrade: grade,
          gpa: gradeScale?.gpa ?? 0,
          rank: 0,
          totalStudents: markRows.length,
          status,
          subjects: [{ subjectId: selectedSchedule.subjectId, subjectName: selectedSchedule.subjectName, marksObtained, totalMarks: selectedSchedule.totalMarks, percentage, grade, status }],
        });
      }
      saved++;
    }
    toast.success(`${saved} marks saved`, { description: failed ? `${failed} invalid rows skipped` : "Results published" });
    setMarkDialogOpen(false);
    refresh();
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSchedule) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      // detect header
      let startIdx = 0;
      if (lines[0]?.toLowerCase().includes("roll") || lines[0]?.toLowerCase().includes("marks")) startIdx = 1;
      const parsed: typeof markRows = [];
      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length < 2) continue;
        // flexible: col0 roll, col1 name or marks, col2 marks
        let roll = cols[0];
        let name = cols[1];
        let marksStr = cols[2] ?? cols[1];
        // if cols = roll,marks  (2 cols)
        if (cols.length === 2) {
          marksStr = cols[1];
          name = students.find((s) => s.rollNumber === roll)?.fullName ?? roll;
        }
        // if marksStr not numeric but name contains numeric, try to detect
        if (isNaN(Number(marksStr)) && !isNaN(Number(cols[1]))) {
          marksStr = cols[1];
        }
        const stu = students.find((s) => s.rollNumber === roll);
        parsed.push({
          studentId: stu?.id ?? `stu-${roll}`,
          studentName: stu?.fullName ?? name,
          studentRoll: roll,
          marks: marksStr,
        });
      }
      if (parsed.length === 0) {
        toast.error("No valid rows found in CSV/Excel. Expected: RollNo, Marks (or RollNo,Name,Marks)");
        return;
      }
      setMarkRows(parsed);
      toast.success(`CSV loaded: ${parsed.length} students`, { description: "Review and save" });
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadTemplate = () => {
    const csv = "RollNo,StudentName,MarksObtained\nSTU-1042,Aarav Sharma,85\nSTU-1043,Diya Patel,78\nSTU-0912,Arjun Nair,92\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks_template_${selectedSchedule?.subjectName ?? "subject"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const downloadAllResultsCsv = () => {
    const header = "RollNo,StudentName,Exam,Class,MarksObtained,TotalMarks,Percentage,Grade,Status\n";
    const rows = filteredResults.map((r) => `${r.studentRoll},${r.studentName},${r.examTypeName},${r.className},${r.marksObtained},${r.totalMarks},${r.percentage},${r.overallGrade},${r.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="schedules" className="text-xs px-3">Schedules ({examSchedules.length})</TabsTrigger>
            <TabsTrigger value="results" className="text-xs px-3">Results ({results.length})</TabsTrigger>
            <TabsTrigger value="entry" className="text-xs px-3 gap-1"><Edit3 className="h-3 w-3" /> Mark Entry</TabsTrigger>
            <TabsTrigger value="rubrics" className="text-xs px-3">Grade Scale</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search exams, students, roll #..." className="pl-9 h-8 text-xs" />
            </div>
            {activeTab === "results" && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={downloadAllResultsCsv}>
                <Download className="h-3.5 w-3.5" /> Export Excel
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-2 items-start sm:items-center">
            <p className="text-xs text-muted-foreground">College reference: Each exam schedule maps to class-section-subject-slot like university exam timetable.</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px] self-center">Teacher / HR can enter marks + bulk Excel upload</Badge>
              <Button size="sm" variant="gradient" className="h-7 text-xs gap-1" onClick={() => setCreateDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> Create Exam</Button>
            </div>
          </div>
          {filteredSchedules.length === 0 ? (
            <EmptyState title="No Examination Schedules Found" description="No exam timetables match your search criteria." />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Hall</TableHead>
                    <TableHead className="text-right tabular-nums">Max/Pass</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Result Entry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold">{formatDate(schedule.examDate)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{schedule.startTime}-{schedule.endTime}</span></TableCell>
                      <TableCell><span className="font-semibold text-sm block">{schedule.examName}</span><span className="text-[11px] text-muted-foreground block">{schedule.examTypeName}</span></TableCell>
                      <TableCell className="text-xs font-medium">{schedule.subjectName}</TableCell>
                      <TableCell className="text-xs">{schedule.className} - {schedule.sectionName}</TableCell>
                      <TableCell className="text-xs"><span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{schedule.room}</span></TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-mono"><strong>{schedule.totalMarks}</strong> / {schedule.passingMarks}</TableCell>
                      <TableCell><Badge variant={statusBadgeVariant[schedule.status] as any} className="text-[10px]">{schedule.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => openMarkDialog(schedule)}>
                            <Edit3 className="h-3 w-3" /> Enter Marks
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteSchedule(schedule.id)} title="Delete exam"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="entry" className="space-y-4">
          <Card className="p-4 border-border/80">
            <h3 className="font-bold text-sm flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary" /> Teacher / HR — Student-wise Result Entry</h3>
            <p className="text-xs text-muted-foreground mt-1">Select any exam schedule from “Schedules” tab → Enter Marks → fill per student OR upload Excel/CSV. Bulk upload template mirrors college ERP (RollNo, Marks).</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {examSchedules.slice(0, 4).map((es) => (
                <div key={es.id} className="p-3 rounded-lg border border-border/60 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold">{es.examName}</div>
                    <div className="text-xs text-muted-foreground">{es.className} • {es.subjectName} • {formatDate(es.examDate)}</div>
                  </div>
                  <Button size="sm" className="h-7 text-xs" onClick={() => openMarkDialog(es)}>Enter</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {/* Premium Result Analytics Ribbon — college style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-3 border-border/80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5 text-primary" /> Average %</div>
              <div className="text-xl font-extrabold">{resultStats.avg}%</div>
              <div className="text-[11px] text-muted-foreground">{resultStats.total} scorecards</div>
            </Card>
            <Card className="p-3 border-border/80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Pass Rate</div>
              <div className="text-xl font-extrabold text-emerald-600">{resultStats.passRate}%</div>
              <div className="text-[11px] text-muted-foreground">College benchmark: 85%</div>
            </Card>
            <Card className="p-3 border-border/80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-3.5 w-3.5 text-amber-600" /> Topper</div>
              <div className="text-sm font-bold truncate">{resultStats.topper ? `${resultStats.topper.studentName} (${resultStats.topper.percentage}%)` : "—"}</div>
              <div className="text-[11px] text-muted-foreground">{resultStats.topper ? `${resultStats.topper.studentRoll} • ${resultStats.topper.overallGrade}` : "No data"}</div>
            </Card>
            <Card className="p-3 border-border/80">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Award className="h-3.5 w-3.5 text-blue-600" /> Total Published</div>
              <div className="text-xl font-extrabold">{resultStats.total}</div>
              <div className="text-[11px] text-muted-foreground">Print-ready report cards</div>
            </Card>
          </div>

          {/* Filters + view toggle */}
          <div className="flex flex-col lg:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="flex flex-1 flex-wrap gap-2">
              <Select value={resultExamFilter} onValueChange={setResultExamFilter}>
                <SelectTrigger className="w-[170px] h-8 text-xs"><SelectValue placeholder="Exam Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Exams</SelectItem>
                  {examTypes.map((et) => <SelectItem key={et.id} value={et.id}>{et.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={resultStatusFilter} onValueChange={setResultStatusFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PASS">PASS</SelectItem>
                  <SelectItem value="FAIL">FAIL</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex border border-border/80 rounded-lg p-0.5 bg-muted/30">
                <Button variant={resultViewMode === "cards" ? "default" : "ghost"} size="sm" className="h-7 px-2.5 text-xs gap-1" onClick={() => setResultViewMode("cards")}><LayoutGrid className="h-3.5 w-3.5" /> Cards</Button>
                <Button variant={resultViewMode === "table" ? "default" : "ghost"} size="sm" className="h-7 px-2.5 text-xs gap-1" onClick={() => setResultViewMode("table")}><List className="h-3.5 w-3.5" /> Table</Button>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={downloadAllResultsCsv}><Download className="h-3.5 w-3.5" /> Export Excel</Button>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <EmptyState title="No Results Found" description="No student scorecards match your search criteria." />
          ) : resultViewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredResults.map((r) => (
                <Card key={r.id} className="border-border/80 hover:border-primary/30 transition-colors overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">{r.studentName} <Badge variant="outline" className="text-[10px] font-mono">{r.studentRoll}</Badge></div>
                        <div className="text-xs text-muted-foreground">{r.className} • {r.sectionName} • {r.examTypeName}</div>
                      </div>
                      <Badge variant={resultStatusBadgeVariant[r.status] as any} className="text-[10px]">{r.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-muted/40 border"><div className="text-[11px] text-muted-foreground">Total</div><div className="font-bold text-xs">{r.marksObtained}/{r.totalMarks}</div></div>
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20"><div className="text-[11px] text-muted-foreground">Percentage</div><div className="font-bold text-xs text-primary">{r.percentage}%</div></div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><div className="text-[11px] text-muted-foreground">Grade</div><div className="font-bold text-xs">{r.overallGrade} • {(r.percentage/9.5).toFixed(1)} CGPA</div></div>
                    </div>
                    {r.subjects?.length > 0 && (
                      <div className="space-y-1 pt-2 border-t">
                        {r.subjects.slice(0, 3).map((sub) => (
                          <div key={sub.subjectId} className="flex justify-between text-xs"><span className="text-muted-foreground">{sub.subjectName}</span><span className="font-mono font-medium">{sub.marksObtained}/{sub.totalMarks} • {sub.grade}</span></div>
                        ))}
                        {r.subjects.length > 3 && <div className="text-[11px] text-muted-foreground">+{r.subjects.length - 3} more subjects</div>}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => { setSelectedResult(r); setResultDetailOpen(true); }}><Eye className="h-3.5 w-3.5" /> View Card</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Roll #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right tabular-nums">Total</TableHead>
                    <TableHead className="text-right tabular-nums">%</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">CGPA</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono font-bold text-xs">{r.studentRoll}</TableCell>
                      <TableCell className="font-semibold text-sm">{r.studentName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.examTypeName}</TableCell>
                      <TableCell className="text-xs font-medium">{r.className} - {r.sectionName}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-mono"><strong>{r.marksObtained}</strong> / {r.totalMarks}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-mono font-bold text-primary">{r.percentage}%</TableCell>
                      <TableCell><Badge variant="outline" className="font-bold text-xs">{r.overallGrade}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-mono">{(r.percentage / 9.5).toFixed(1)}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs font-mono">{r.rank ? `#${r.rank}` : "—"}</TableCell>
                      <TableCell><Badge variant={resultStatusBadgeVariant[r.status] as any} className="text-[10px]">{r.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => { setSelectedResult(r); setResultDetailOpen(true); }}><Eye className="h-3 w-3" /> View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Report Card Detail Dialog — college style */}
          <Dialog open={resultDetailOpen} onOpenChange={setResultDetailOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedResult && (
                <div className="space-y-4">
                  <div className="text-center border-b pb-4">
                    <h2 className="text-lg font-extrabold">Apex Global Campus</h2>
                    <p className="text-xs text-muted-foreground">College-style Report Card — Academic Year {selectedResult.academicYear}</p>
                    <Badge variant="outline" className="mt-2">{selectedResult.examTypeName}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground text-xs">Student:</span><div className="font-bold">{selectedResult.studentName} <span className="font-mono text-xs">({selectedResult.studentRoll})</span></div></div>
                    <div><span className="text-muted-foreground text-xs">Class:</span><div className="font-medium">{selectedResult.className} • {selectedResult.sectionName}</div></div>
                    <div><span className="text-muted-foreground text-xs">Overall:</span><div className="font-bold">{selectedResult.marksObtained}/{selectedResult.totalMarks} • {selectedResult.percentage}% • {selectedResult.overallGrade}</div></div>
                    <div><span className="text-muted-foreground text-xs">CGPA / Rank:</span><div className="font-mono">{(selectedResult.percentage/9.5).toFixed(2)} CGPA • Rank {selectedResult.rank || "—"} / {selectedResult.totalStudents}</div></div>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead className="text-right">Marks</TableHead><TableHead className="text-right">%</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {selectedResult.subjects.map((sub) => (
                          <TableRow key={sub.subjectId}><TableCell className="font-medium text-sm">{sub.subjectName}</TableCell><TableCell className="text-right font-mono text-xs">{sub.marksObtained}/{sub.totalMarks}</TableCell><TableCell className="text-right font-mono text-xs">{sub.percentage.toFixed(1)}%</TableCell><TableCell><Badge variant="outline" className="text-xs">{sub.grade}</Badge></TableCell><TableCell><Badge variant={resultStatusBadgeVariant[sub.status] as any} className="text-[10px]">{sub.status}</Badge></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {selectedResult.remarks && <div className="p-3 rounded-lg bg-muted/40 border text-xs"><strong>Remarks:</strong> {selectedResult.remarks}</div>}
                  <div className="flex justify-between text-[11px] text-muted-foreground pt-4 border-t">
                    <span>Class Teacher</span><span>Principal</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print Card</Button>
                    <Button variant="gradient" size="sm" onClick={() => setResultDetailOpen(false)}>Close</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="rubrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gradeScales.map((scale) => (
              <Card key={scale.grade} className="p-4 border-border/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-primary">{scale.grade}</span>
                  <Badge variant="outline" className="text-xs font-mono">CGPA {(scale.maxPercentage / 9.5).toFixed(1)}</Badge>
                </div>
                <div className="text-xs font-mono text-muted-foreground">Range: <strong className="text-foreground">{scale.minPercentage}%</strong> to <strong className="text-foreground">{scale.maxPercentage}%</strong></div>
                <p className="text-xs text-muted-foreground leading-relaxed">{scale.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Exam Schedule</DialogTitle>
            <DialogDescription>College pattern: exam type + class/subject + date/time/hall — like university exam cell.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit(handleCreateExam)} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Exam Name *</label>
              <Input {...registerCreate("examName")} placeholder="e.g. Half-Yearly - Mathematics" className={createErrors.examName ? "border-rose-500" : ""} />
              {createErrors.examName && <p className="text-[11px] text-rose-500 mt-1">{createErrors.examName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Exam Type *</label>
                <Select value={watchCreate("examTypeId")} onValueChange={(v) => setCreateValue("examTypeId", v)}>
                  <SelectTrigger className={createErrors.examTypeId ? "border-rose-500" : ""}><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {examTypes.map((et) => <SelectItem key={et.id} value={et.id}>{et.name} ({et.category})</SelectItem>)}
                  </SelectContent>
                </Select>
                {createErrors.examTypeId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.examTypeId.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Class *</label>
                <Select value={watchCreate("classId")} onValueChange={(v) => { setCreateValue("classId", v); setCreateValue("subjectId", ""); }}>
                  <SelectTrigger className={createErrors.classId ? "border-rose-500" : ""}><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {createErrors.classId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.classId.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Subject *</label>
              <Select value={watchCreate("subjectId")} onValueChange={(v) => setCreateValue("subjectId", v)} disabled={!watchCreate("classId")}>
                <SelectTrigger className={createErrors.subjectId ? "border-rose-500" : ""}><SelectValue placeholder={watchCreate("classId") ? "Select Subject" : "Pick class first"} /></SelectTrigger>
                <SelectContent>
                  {(classes.find((c) => c.id === watchCreate("classId"))?.subjects ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                </SelectContent>
              </Select>
              {createErrors.subjectId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.subjectId.message}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Date *</label>
                <Input type="date" {...registerCreate("examDate")} className={createErrors.examDate ? "border-rose-500" : ""} />
                {createErrors.examDate && <p className="text-[11px] text-rose-500 mt-1">{createErrors.examDate.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Start</label>
                <Input type="time" {...registerCreate("startTime")} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">End</label>
                <Input type="time" {...registerCreate("endTime")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Room/Hall *</label>
                <Input {...registerCreate("room")} placeholder="Room 301" className={createErrors.room ? "border-rose-500" : ""} />
                {createErrors.room && <p className="text-[11px] text-rose-500 mt-1">{createErrors.room.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Max Marks</label>
                <Input type="number" {...registerCreate("totalMarks")} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Pass Marks</label>
                <Input type="number" {...registerCreate("passingMarks")} />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" className="gap-1"><Plus className="h-3.5 w-3.5" /> Create Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Enter Marks — {selectedSchedule?.examName}</DialogTitle>
            <DialogDescription>
              {selectedSchedule?.className} • {selectedSchedule?.subjectName} • Max {selectedSchedule?.totalMarks} • Pass {selectedSchedule?.passingMarks} — Teacher/HR can enter per student. Or upload Excel/CSV (RollNo, Marks).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 my-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={downloadTemplate}><Download className="h-3.5 w-3.5" /> Download CSV Template</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => fileInputRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload Excel/CSV</Button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleCsvUpload} />
            <span className="text-[11px] text-muted-foreground self-center">Bulk upload: Excel exported as CSV. Columns: RollNo, StudentName, MarksObtained. Example in template.</span>
          </div>

          <div className="rounded-lg border border-border/80 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-[130px]">Marks / {selectedSchedule?.totalMarks}</TableHead>
                  <TableHead className="w-[90px]">Preview</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {markRows.map((row, idx) => {
                  const v = Number(row.marks);
                  const valid = row.marks !== "" && !isNaN(v) && v >= 0 && v <= (selectedSchedule?.totalMarks ?? 100);
                  const pct = valid ? (v / (selectedSchedule?.totalMarks ?? 100)) * 100 : 0;
                  const gs = valid ? getGradeForPercentage(pct, gradeScales) : undefined;
                  return (
                    <TableRow key={row.studentId + idx}>
                      <TableCell className="font-mono text-xs font-bold">{row.studentRoll}</TableCell>
                      <TableCell className="text-xs font-medium">{row.studentName}</TableCell>
                      <TableCell>
                        <Input value={row.marks} onChange={(e) => handleMarksChange(idx, e.target.value)} placeholder="0" className={`h-8 text-xs ${row.marks !== "" && !valid ? "border-rose-500" : ""}`} type="number" min={0} max={selectedSchedule?.totalMarks} />
                      </TableCell>
                      <TableCell className="text-xs">
                        {valid ? <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px]">{gs?.grade ?? "—"}</Badge><span className="font-mono">{pct.toFixed(1)}%</span></span> : <span className="text-muted-foreground text-[11px]">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setMarkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMarks} variant="gradient" className="gap-1"><Save className="h-3.5 w-3.5" /> Save & Publish Results</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
