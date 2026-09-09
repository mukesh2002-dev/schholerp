"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Exam, ExamSchedule, MarkEntry, Result, GradeScale, ExamType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Calendar, Clock, MapPin, Trophy, Award, BookOpen, Plus, Edit3, Trash2, Eye, Download, FileSpreadsheet, GraduationCap, Send, BarChart3, Settings2, FileBadge, ClipboardList, PenLine, FileText, AlertTriangle, Lock, History, CheckCircle2, XCircle, LayoutGrid, Save } from "lucide-react";
import { formatDate } from "@/lib/utils";

// ─── Helpers ───
function getGradeForPercentage(p: number, scale: GradeScale[]): string {
  const g = scale.find((s) => p >= s.minPercentage && p <= s.maxPercentage);
  return g?.grade ?? "E";
}
function statusVariant(s: string): any {
  if (s === "PUBLISHED" || s === "COMPLETED" || s === "PASS") return "success";
  if (s === "DRAFT" || s === "SCHEDULED" || s === "PENDING") return "secondary";
  if (s === "FAIL" || s === "CANCELLED") return "destructive";
  return "outline";
}

// ─── Exam Setup Schema — Section removed, ExamType must pre-exist ───
const examSchema = z.object({
  name: z.string().min(2, "Name required"),
  examTypeId: z.string().min(1, "Exam type pehle create karo — tab Exam Types me banao"),
  classId: z.string().min(1, "Class required"),
  academicYear: z.string().min(1, "Required"),
  startDate: z.string().min(1, "Required"),
  endDate: z.string().min(1, "Required"),
  instructions: z.string().optional(),
});
type ExamFormValues = z.infer<typeof examSchema>;

const scheduleSchema = z.object({
  examId: z.string().min(1, "Exam required"),
  subjectId: z.string().min(1, "Subject required"),
  examDate: z.string().min(1, "Required"),
  startTime: z.string().min(1, "Required"),
  endTime: z.string().min(1, "Required"),
  room: z.string().min(1, "Required"),
  totalMarks: z.string().min(1, "Required"),
  passingMarks: z.string().min(1, "Required"),
});
type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function ExamWorkspace() {
  const { activeBranchId } = useERP();
  const [activeTab, setActiveTab] = useState("exams");

  // Sync tab with ?tab= query for sidebar highlights
  useEffect(() => {
    const sync = () => {
      const p = new URLSearchParams(window.location.search);
      const t = p.get("tab");
      const map: Record<string, string> = {
        exams: "exams",
        timetable: "timetable",
        marks: "marks",
        "exam-types": "exam-types",
        results: "results",
        cards: "cards",
        publish: "results",
        analytics: "analytics",
        grading: "grading",
        assessment: "assessment",
      };
      if (t && map[t]) setActiveTab(map[t]);
    };
    sync();
    const onPop = () => sync();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    const reverse: Record<string, string> = {
      exams: "exams",
      timetable: "timetable",
      marks: "marks",
      "exam-types": "exam-types",
      results: "results",
      cards: "cards",
      analytics: "analytics",
      grading: "grading",
      assessment: "assessment",
    };
    const q = reverse[v] ?? v;
    const url = `/exams?tab=${q}`;
    window.history.pushState({}, "", url);
    // trigger sidebar sync manually
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <div className="flex flex-col gap-3 p-2 rounded-xl bg-card border border-border/70 overflow-x-auto">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="exams" className="gap-1.5 text-xs"><ClipboardList className="h-3.5 w-3.5" />Exam Setup</TabsTrigger>
          <TabsTrigger value="timetable" className="gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" />Datesheet</TabsTrigger>
          <TabsTrigger value="marks" className="gap-1.5 text-xs"><PenLine className="h-3.5 w-3.5" />Marks Entry</TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5 text-xs"><GraduationCap className="h-3.5 w-3.5" />Results</TabsTrigger>
          <TabsTrigger value="cards" className="gap-1.5 text-xs"><FileBadge className="h-3.5 w-3.5" />Report Cards</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Analytics</TabsTrigger>
          <TabsTrigger value="grading" className="gap-1.5 text-xs"><Award className="h-3.5 w-3.5" />Grading</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="exams"><ExamsTab branchId={activeBranchId} /></TabsContent>
      <TabsContent value="timetable"><ScheduleTab branchId={activeBranchId} /></TabsContent>
      <TabsContent value="marks"><MarksTab branchId={activeBranchId} /></TabsContent>
      <TabsContent value="exam-types"><ExamTypesTab /></TabsContent>
      <TabsContent value="results"><ResultsTab branchId={activeBranchId} /></TabsContent>
      <TabsContent value="cards"><ReportCardsTab branchId={activeBranchId} /></TabsContent>
      <TabsContent value="analytics"><AnalyticsTab branchId={activeBranchId} /></TabsContent>
      <TabsContent value="grading"><GradingTab /></TabsContent>
      <TabsContent value="assessment"><AssessmentTab /></TabsContent>
    </Tabs>
  );
}

// ════════════════════ Exams Tab ════════════════════
function ExamsTab({ branchId }: { branchId: string }) {
  const [exams, setExams] = useState(() => mockDb.getExams(branchId));
  const [classes] = useState(() => mockDb.getClasses(branchId));
  const [examTypes, setExamTypes] = useState<ExamType[]>(() => mockDb.getExamTypes());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => setExams([...mockDb.getExams(branchId)]), [branchId]);
  const refreshTypes = useCallback(() => setExamTypes([...mockDb.getExamTypes()]), []);
  useEffect(() => {
    const h = () => { setEditing(null); setOpen(true); };
    window.addEventListener("exams:new", h);
    const t = () => refreshTypes();
    window.addEventListener("exam-types:updated", t);
    return () => { window.removeEventListener("exams:new", h); window.removeEventListener("exam-types:updated", t); };
  }, [refreshTypes]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: { name: "", examTypeId: "", classId: "", academicYear: "2026-2027", startDate: "", endDate: "", instructions: "" },
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, examTypeId: editing.examTypeId, classId: editing.classId, academicYear: editing.academicYear, startDate: editing.startDate, endDate: editing.endDate, instructions: editing.instructions ?? "" });
    } else {
      reset({ name: "", examTypeId: "", classId: "", academicYear: "2026-2027", startDate: "", endDate: "", instructions: "" });
    }
  }, [editing, open, reset]);

  const onSubmit = async (v: ExamFormValues) => {
    try {
      if (examTypes.length === 0) { toast.error("Pehle Exam Type banao", { description: "Exam Types tab me ja ke type create karo, tab Create Exam me ayega" }); return; }
      const branch = mockDb.getBranches().find((b) => b.id === (branchId === "all" ? "br-apex-01" : branchId)) ?? mockDb.getBranches()[0];
      const cls = classes.find((c) => c.id === v.classId);
      const et = examTypes.find((e) => e.id === v.examTypeId);
      // concurrent edit check
      if (editing) {
        const fresh = mockDb.getExamById(editing.id);
        if (fresh && fresh.updatedAt !== editing.updatedAt) {
          toast.error("Concurrent edit detected", { description: "This exam was modified by another user. Please reload." });
          return;
        }
      }
      mockDb.saveExam({
        id: editing?.id,
        name: v.name,
        examTypeId: v.examTypeId,
        examTypeName: et?.name ?? v.name,
        category: (et?.category as any) ?? "CUSTOM",
        examMode: (et?.defaultMode as any) ?? "BOTH",
        academicYear: v.academicYear,
        classId: v.classId,
        className: cls?.name ?? v.classId,
        sectionId: editing?.sectionId ?? cls?.sections[0]?.id ?? "",
        sectionName: editing?.sectionName ?? cls?.sections[0]?.name ?? "All Sections",
        branchId: branch.id,
        branchName: branch.name,
        startDate: v.startDate,
        endDate: v.endDate,
        status: editing?.status ?? "DRAFT",
        instructions: v.instructions,
        createdBy: "Admin",
        createdAt: editing?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);
      toast.success(editing ? "Exam updated" : "Exam created");
      setOpen(false); setEditing(null); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = exams.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.className.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams, class..." className="pl-9 h-9" />
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />Create Exam</Button>
      </div>

      {filtered.length === 0 ? <EmptyState title="No Exams" description="Create your first exam setup." /> : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Class</TableHead><TableHead>Year</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((ex) => (
                <TableRow key={ex.id} className="hover:bg-muted/30">
                  <TableCell><div className="font-semibold text-sm">{ex.name}</div><div className="text-xs text-muted-foreground">{ex.examTypeName} • {ex.examMode}</div></TableCell>
                  <TableCell className="text-xs">{ex.className}</TableCell>
                  <TableCell className="text-xs">{ex.academicYear}</TableCell>
                  <TableCell className="text-xs font-mono">{formatDate(ex.startDate)} → {formatDate(ex.endDate)}</TableCell>
                  <TableCell><Badge variant={statusVariant(ex.status)} className="text-[11px]">{ex.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(ex); setOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                      {ex.status === "DRAFT" && <Button variant="ghost" size="icon" className="h-8 w-8" title="Publish Notice" onClick={() => { mockDb.publishExamNotice(ex.id, "Admin", ex.instructions); toast.success("Exam notice published, students notified"); refresh(); }}><Send className="h-4 w-4 text-emerald-600" /></Button>}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm("Delete exam? Schedules will remain but linked examId will be orphaned.")) { mockDb.deleteExam(ex.id); toast.success("Deleted"); refresh(); } }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Exam" : "Create Exam"}</DialogTitle><DialogDescription>Exam setup: name, dates, class snapshot. Exam Type pehle se bana hua hona chahiye.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Name *</label><Input {...register("name")} placeholder="Half Yearly Exam" />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
              <div><label className="text-sm font-medium">Academic Year</label><Input {...register("academicYear")} placeholder="2026-2027" />{errors.academicYear && <p className="text-xs text-destructive mt-1">{errors.academicYear.message}</p>}</div>
              <div><label className="text-sm font-medium flex items-center gap-1">Exam Type *{examTypes.length === 0 && <span className="text-[11px] text-amber-600">(pehle banao)</span>}</label>
                <Select value={watch("examTypeId")} onValueChange={(v) => setValue("examTypeId", v)}>
                  <SelectTrigger><SelectValue placeholder={examTypes.length ? "Select type" : "No type — pehle Exam Types me banao"} /></SelectTrigger>
                  <SelectContent>
                    {examTypes.length ? examTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.maxMarks} marks)</SelectItem>) : <div className="p-3 text-xs text-muted-foreground text-center">Koi Exam Type nahi — Exam Types tab me Create karo</div>}
                  </SelectContent>
                </Select>{errors.examTypeId && <p className="text-xs text-destructive mt-1">{errors.examTypeId.message}</p>}
                {examTypes.length === 0 && <button type="button" onClick={() => { setOpen(false); window.history.pushState({}, "", "/exams?tab=exam-types"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="text-xs text-primary underline mt-1">+ Exam Types me banao</button>}
              </div>
              <div><label className="text-sm font-medium">Class *</label>
                <Select value={watch("classId")} onValueChange={(v) => setValue("classId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>{errors.classId && <p className="text-xs text-destructive mt-1">{errors.classId.message}</p>}
              </div>
              <div><label className="text-sm font-medium">Start Date</label><Input type="date" {...register("startDate")} />{errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>}</div>
              <div><label className="text-sm font-medium">End Date</label><Input type="date" {...register("endDate")} />{errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}</div>
            </div>
            <div><label className="text-sm font-medium">Instructions</label><Textarea {...register("instructions")} placeholder="Bring admit card, reporting 8:30 AM..." rows={2} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting || (!editing && examTypes.length === 0)}>{editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ════════════════════ Schedule Tab ════════════════════
function ScheduleTab({ branchId }: { branchId: string }) {
  const [schedules, setSchedules] = useState(() => mockDb.getExamSchedules(branchId));
  const [exams] = useState(() => mockDb.getExams(branchId));
  const [classes] = useState(() => mockDb.getClasses(branchId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSchedule | null>(null);
  const [reschedule, setReschedule] = useState<ExamSchedule | null>(null);
  // bulk datesheet — timetable jaisa
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkExamId, setBulkExamId] = useState("");
  const [bulkRows, setBulkRows] = useState<Record<string, { date: string; start: string; end: string; room: string }>>({});

  const refresh = useCallback(() => setSchedules([...mockDb.getExamSchedules(branchId)]), [branchId]);
  const { register, handleSubmit, setValue, watch, reset } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { examId: "", subjectId: "", examDate: "", startTime: "09:00", endTime: "12:00", room: "", totalMarks: "100", passingMarks: "33" },
  });
  const selectedExamId = watch("examId");
  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const subjects = useMemo(() => {
    const cls = classes.find((c) => c.id === selectedExam?.classId);
    return cls?.subjects ?? [];
  }, [classes, selectedExam]);

  useEffect(() => {
    if (editing) reset({ examId: editing.examId ?? "", subjectId: editing.subjectId, examDate: editing.examDate, startTime: editing.startTime, endTime: editing.endTime, room: editing.room, totalMarks: String(editing.totalMarks), passingMarks: String(editing.passingMarks) });
    else reset({ examId: "", subjectId: "", examDate: "", startTime: "09:00", endTime: "12:00", room: "", totalMarks: "100", passingMarks: "33" });
  }, [editing, open, reset]);

  const onSubmit = (v: ScheduleFormValues) => {
    try {
      const ex = exams.find((e) => e.id === v.examId);
      if (!ex) { toast.error("Select exam"); return; }
      const subj = subjects.find((s) => s.id === v.subjectId) ?? { name: v.subjectId, code: v.subjectId };
      const branch = mockDb.getBranches().find((b) => b.id === ex.branchId) ?? mockDb.getBranches()[0];
      mockDb.saveExamSchedule({
        id: editing?.id,
        examId: ex.id,
        examName: ex.name,
        examTypeId: ex.examTypeId,
        examTypeName: ex.examTypeName,
        classId: ex.classId,
        className: ex.className,
        sectionId: ex.sectionId,
        sectionName: ex.sectionName,
        subjectId: v.subjectId,
        subjectName: (subj as any).name,
        branchId: branch.id,
        branchName: branch.name,
        academicYear: ex.academicYear,
        examDate: v.examDate,
        startTime: v.startTime,
        endTime: v.endTime,
        room: v.room,
        status: editing?.status ?? "SCHEDULED",
        publicationStatus: editing?.publicationStatus ?? "DRAFT",
        isPublished: editing?.isPublished ?? false,
        totalMarks: Number(v.totalMarks),
        passingMarks: Number(v.passingMarks),
      } as any);
      toast.success(editing ? "Schedule updated" : "Schedule created");
      setOpen(false); setEditing(null); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = schedules.filter((s) => {
    const mSearch = !search || s.subjectName.toLowerCase().includes(search.toLowerCase()) || s.examName.toLowerCase().includes(search.toLowerCase()) || s.className.toLowerCase().includes(search.toLowerCase());
    const mStatus = statusFilter === "ALL" || s.status === statusFilter;
    return mSearch && mStatus;
  });

  const bulkExam = exams.find((e) => e.id === bulkExamId);
  const bulkSubjects = useMemo(() => {
    const c = classes.find((x) => x.id === bulkExam?.classId);
    return c?.subjects ?? [];
  }, [classes, bulkExam]);
  const openBulk = () => {
    if (!exams.length) return toast.error("Pehle Exam banao");
    const ex = exams[0];
    setBulkExamId(ex.id);
    const cls = classes.find((x) => x.id === ex.classId);
    const subs = cls?.subjects ?? [];
    const init: Record<string, any> = {};
    subs.forEach((s, i) => {
      const d = new Date(ex.startDate); d.setDate(d.getDate() + i);
      init[s.id] = { date: d.toISOString().split("T")[0], start: "09:00", end: "12:00", room: cls?.sections[0]?.roomNumber || "Room 301" };
    });
    setBulkRows(init); setBulkOpen(true);
  };
  const saveBulk = () => {
    if (!bulkExam) return;
    let n = 0;
    for (const sub of bulkSubjects) {
      const r = bulkRows[sub.id]; if (!r?.date) continue;
      try {
        mockDb.saveExamSchedule({
          examId: bulkExam.id, examName: bulkExam.name, examTypeId: bulkExam.examTypeId, examTypeName: bulkExam.examTypeName,
          classId: bulkExam.classId, className: bulkExam.className, sectionId: bulkExam.sectionId, sectionName: bulkExam.sectionName,
          subjectId: sub.id, subjectName: sub.name, branchId: bulkExam.branchId, branchName: bulkExam.branchName,
          academicYear: bulkExam.academicYear, examDate: r.date, startTime: r.start, endTime: r.end, room: r.room || "Room 301",
          status: "SCHEDULED", publicationStatus: "DRAFT", isPublished: false, totalMarks: 100, passingMarks: 33,
        } as any); n++;
      } catch (e: any) { toast.error(`${sub.name}: ${e.message}`); }
    }
    toast.success(`Datesheet created — ${n} subjects (timetable jaisa)`); setBulkOpen(false); refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject, exam..." className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="SCHEDULED">Scheduled</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openBulk} className="gap-1.5"><LayoutGrid className="h-4 w-4" /> Create Full Datesheet</Button>
          {exams.length > 0 && <Button variant="outline" onClick={() => { try { mockDb.publishTimetable(exams[0].id); toast.success("Timetable published"); refresh(); } catch (e: any) { toast.error(e.message); } }} className="gap-2"><Send className="h-4 w-4" />Publish</Button>}
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />Add Slot</Button>
        </div>
      </div>
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Exam</TableHead><TableHead>Subject</TableHead><TableHead>Class</TableHead><TableHead>Room</TableHead><TableHead>Marks</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id} className="hover:bg-muted/30">
                <TableCell className="text-xs font-mono">{formatDate(s.examDate)}</TableCell>
                <TableCell className="text-xs font-mono flex items-center gap-1"><Clock className="h-3 w-3" />{s.startTime}-{s.endTime}</TableCell>
                <TableCell className="text-xs font-medium">{s.examName}<div className="text-[11px] text-muted-foreground">{s.examTypeName}</div></TableCell>
                <TableCell className="text-xs">{s.subjectName}</TableCell>
                <TableCell className="text-xs">{s.className} • {s.sectionName}</TableCell>
                <TableCell className="text-xs"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.room}</span></TableCell>
                <TableCell className="text-xs font-mono">{s.totalMarks}/{s.passingMarks}</TableCell>
                <TableCell><Badge variant={statusVariant(s.status)} className="text-[11px]">{s.status}</Badge>{s.isPublished && <Badge variant="outline" className="ml-1 text-[10px]">Published</Badge>}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(s); setOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Reschedule" onClick={() => setReschedule(s)}><Calendar className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {filtered.length === 0 && <EmptyState title="No schedules" description="Add subject-wise datesheet." />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Slot" : "Add Datesheet Slot"}</DialogTitle><DialogDescription>Subject-wise date, time, max marks. Overlap validation enforced.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div><label className="text-sm font-medium">Exam *</label>
              <Select value={watch("examId")} onValueChange={(v) => setValue("examId", v)}>
                <SelectTrigger><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} — {e.className} {e.sectionName} ({e.academicYear})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Subject *</label>
              <Select value={watch("subjectId")} onValueChange={(v) => setValue("subjectId", v)}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.length > 0 ? subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>) : <SelectItem value="custom">Custom Subject — type manually</SelectItem>}
                  {subjects.length === 0 && <SelectItem value="sub-temp">Enter subject ID below</SelectItem>}
                </SelectContent>
              </Select>
              {subjects.length === 0 && <Input {...register("subjectId")} placeholder="Subject ID e.g. sub-101" className="mt-2" />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Date *</label><Input type="date" {...register("examDate")} /></div>
              <div><label className="text-sm font-medium">Room *</label><Input {...register("room")} placeholder="Room 301" /></div>
              <div><label className="text-sm font-medium">Start *</label><Input type="time" {...register("startTime")} /></div>
              <div><label className="text-sm font-medium">End *</label><Input type="time" {...register("endTime")} /></div>
              <div><label className="text-sm font-medium">Max Marks *</label><Input type="number" {...register("totalMarks")} /></div>
              <div><label className="text-sm font-medium">Pass Marks *</label><Input type="number" {...register("passingMarks")} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {reschedule && <RescheduleDialog schedule={reschedule} onClose={() => { setReschedule(null); refresh(); }} />}

      {/* Bulk Datesheet — timetable style (static, API-ready) */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-2xl max-h-[78vh] flex flex-col p-0 gap-0 overflow-hidden sm:max-w-[640px]">
          <DialogHeader className="px-5 pt-4 pb-3 border-b shrink-0 bg-background">
            <DialogTitle className="flex items-center gap-2 text-sm"><LayoutGrid className="h-4 w-4 text-primary" /> Create Full Datesheet — Timetable jaisa</DialogTitle>
            <DialogDescription className="text-xs">Exam select karo, har subject ka date/time/room ek sath bharo — static data, API pe asani se shift hoga</DialogDescription>
          </DialogHeader>
          <div className="px-5 py-3 border-b bg-muted/20 shrink-0">
            <label className="text-xs font-medium">Exam *</label>
            <Select value={bulkExamId} onValueChange={(v) => {
              setBulkExamId(v);
              const ex = exams.find((e) => e.id === v);
              const cls = classes.find((c) => c.id === ex?.classId);
              const subs = cls?.subjects ?? [];
              const init: any = {};
              subs.forEach((s, i) => {
                const d = new Date(ex!.startDate); d.setDate(d.getDate() + i);
                init[s.id] = { date: d.toISOString().split("T")[0], start: "09:00", end: "12:00", room: cls?.sections[0]?.roomNumber || "Room 301" };
              });
              setBulkRows(init);
            }}>
              <SelectTrigger className="h-9 mt-1"><SelectValue placeholder="Select exam" /></SelectTrigger>
              <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} — {e.className} ({e.academicYear})</SelectItem>)}</SelectContent>
            </Select>
            {bulkExam && <p className="text-[11px] text-muted-foreground mt-1">{bulkExam.className} • {bulkSubjects.length} subjects • {formatDate(bulkExam.startDate)}–{formatDate(bulkExam.endDate)}</p>}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 space-y-2.5 bg-muted/10">
            {!bulkExam ? <p className="text-sm text-muted-foreground text-center py-8">Exam select karo</p> :
              bulkSubjects.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Is class me koi subject nahi</p> :
                bulkSubjects.map((sub) => (
                  <div key={sub.id} className="rounded-xl border bg-card p-3 flex flex-col sm:flex-row gap-2.5 items-start sm:items-end">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{sub.name} <span className="text-xs font-normal text-muted-foreground">({sub.code})</span></div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        <div><label className="text-[10px] font-semibold text-muted-foreground">DATE</label><Input type="date" value={bulkRows[sub.id]?.date || ""} onChange={(e) => setBulkRows((p) => ({ ...p, [sub.id]: { ...p[sub.id], date: e.target.value } }))} className="h-8 text-xs" /></div>
                        <div><label className="text-[10px] font-semibold text-muted-foreground">START</label><Input type="time" value={bulkRows[sub.id]?.start || "09:00"} onChange={(e) => setBulkRows((p) => ({ ...p, [sub.id]: { ...p[sub.id], start: e.target.value } }))} className="h-8 text-xs" /></div>
                        <div><label className="text-[10px] font-semibold text-muted-foreground">END</label><Input type="time" value={bulkRows[sub.id]?.end || "12:00"} onChange={(e) => setBulkRows((p) => ({ ...p, [sub.id]: { ...p[sub.id], end: e.target.value } }))} className="h-8 text-xs" /></div>
                        <div><label className="text-[10px] font-semibold text-muted-foreground">ROOM</label><Input value={bulkRows[sub.id]?.room || ""} onChange={(e) => setBulkRows((p) => ({ ...p, [sub.id]: { ...p[sub.id], room: e.target.value } }))} placeholder="Room" className="h-8 text-xs" /></div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 h-6">100 marks</Badge>
                  </div>
                ))}
          </div>
          <DialogFooter className="px-5 py-3 border-t bg-card shrink-0"><Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button><Button variant="gradient" onClick={saveBulk} disabled={!bulkExam || bulkSubjects.length === 0}><Save className="h-3.5 w-3.5" /> Create Datesheet</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RescheduleDialog({ schedule, onClose }: { schedule: ExamSchedule; onClose: () => void }) {
  const [date, setDate] = useState(schedule.examDate);
  const [start, setStart] = useState(schedule.startTime);
  const [end, setEnd] = useState(schedule.endTime);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={!!schedule} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Reschedule — {schedule.subjectName}</DialogTitle><DialogDescription>Previous: {schedule.examDate} {schedule.startTime}-{schedule.endTime}. Reason is mandatory for audit trail.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div><label className="text-sm font-medium">New Date</label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Start</label><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></div><div><label className="text-sm font-medium">End</label><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></div></div>
          <div><label className="text-sm font-medium">Reason *</label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="E.g. Clash with school event..." rows={3} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => { try { mockDb.rescheduleExam(schedule.id, date, start, end, reason); toast.success("Rescheduled"); onClose(); } catch (e: any) { toast.error(e.message); } }} disabled={!reason.trim()}>Confirm Reschedule</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ════════════════════ Marks Entry Tab ════════════════════
function MarksTab({ branchId }: { branchId: string }) {
  const [exams, setExams] = useState(() => mockDb.getExams(branchId));
  const [schedules, setSchedules] = useState(() => mockDb.getExamSchedules(branchId));
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);
  const [entries, setEntries] = useState<MarkEntry[]>([]);
  const [bulk, setBulk] = useState<Record<string, { marks: string; isAbsent: boolean; remarks: string }>>({});
  const scale = mockDb.getGradeScale();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [showHistory, setShowHistory] = useState<MarkEntry | null>(null);

  const students = useMemo(() => {
    if (!selectedSchedule) return [];
    return mockDb.getStudents(branchId).filter((s) => s.classId === selectedSchedule.classId && s.sectionId === selectedSchedule.sectionId);
  }, [selectedSchedule, branchId]);

  useEffect(() => { if (selectedSchedule) { const es = mockDb.getMarkEntries(selectedSchedule.id); setEntries(es); const b: Record<string, { marks: string; isAbsent: boolean; remarks: string }> = {}; students.forEach((stu) => { const ex = es.find((e) => e.studentId === stu.id); b[stu.id] = { marks: ex && !ex.isAbsent ? String(ex.marksObtained) : "", isAbsent: !!ex?.isAbsent, remarks: ex?.remarks ?? "" }; }); setBulk(b); } }, [selectedSchedule, students]);

  const handleSave = () => {
    if (!selectedSchedule) return;
    let success = 0; let errors: string[] = [];
    students.forEach((stu) => {
      const row = bulk[stu.id];
      if (!row) return;
      const isAbsent = row.isAbsent;
      const marksStr = row.marks.trim();
      // partial data: allow empty as not yet marked, but warn before processing elsewhere
      if (!isAbsent && marksStr === "") return; // skip empty
      const marksNum = isAbsent ? 0 : Number(marksStr);
      if (!isAbsent && (isNaN(marksNum) || marksNum < 0 || marksNum > selectedSchedule.totalMarks)) { errors.push(`${stu.fullName}: marks exceed max ${selectedSchedule.totalMarks}`); return; }
      const pct = isAbsent ? 0 : (marksNum / selectedSchedule.totalMarks) * 100;
      const grade = isAbsent ? "E" : getGradeForPercentage(pct, scale);
      const status: any = isAbsent ? "FAIL" : (marksNum >= selectedSchedule.passingMarks ? "PASS" : "FAIL");
      try {
        const existing = entries.find((e) => e.studentId === stu.id);
        mockDb.saveMarkEntry({
          id: existing?.id,
          examScheduleId: selectedSchedule.id,
          studentId: stu.id,
          studentName: stu.fullName,
          studentRoll: stu.rollNumber,
          subjectId: selectedSchedule.subjectId,
          subjectName: selectedSchedule.subjectName,
          marksObtained: marksNum,
          totalMarks: selectedSchedule.totalMarks,
          percentage: Number(pct.toFixed(2)),
          grade,
          status,
          remarks: row.remarks,
          enteredBy: "Teacher",
          enteredAt: new Date().toISOString(),
          isAbsent,
          workflowStatus: existing?.workflowStatus ?? "DRAFT",
        } as any);
        success++;
      } catch (e: any) { errors.push(`${stu.fullName}: ${e.message}`); }
    });
    if (errors.length) toast.error(errors[0]);
    else toast.success(`Saved ${success} entries. AB cases excluded from average as per spec.`);
    setEntries([...mockDb.getMarkEntries(selectedSchedule.id)]);
  };

  const handleBulkAB = (val: boolean) => {
    const nb: any = {};
    students.forEach((stu) => { nb[stu.id] = { ...bulk[stu.id], isAbsent: val, marks: val ? "" : bulk[stu.id]?.marks ?? "" }; });
    setBulk(nb);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
          <SelectTrigger className="w-full sm:w-96"><SelectValue placeholder="Select subject schedule (Class • Subject • Date)" /></SelectTrigger>
          <SelectContent>{schedules.map((s) => <SelectItem key={s.id} value={s.id}>{s.className} • {s.subjectName} • {s.examName} • {formatDate(s.examDate)} ({s.totalMarks} marks)</SelectItem>)}</SelectContent>
        </Select>
        <Badge variant="outline" className="h-10 px-3 shrink-0">{students.length} students</Badge>
      </div>

      {!selectedSchedule ? <EmptyState title="Select a schedule" description="Choose subject-wise exam slot to enter marks. Bulk Excel-style grid with Tab navigation." /> : (
        <>
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>AB (Absent) is stored separately from 0 — AB does NOT skew average. Max {selectedSchedule.totalMarks}, Pass {selectedSchedule.passingMarks}. Locked marks show <Lock className="h-3 w-3 inline" /> and need audit trail to edit.</span>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Roll</TableHead><TableHead>Student</TableHead><TableHead className="w-32">Marks (max {selectedSchedule.totalMarks})</TableHead><TableHead className="w-20 text-center">AB</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead><TableHead>Workflow</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map((stu, idx) => {
                  const row = bulk[stu.id] ?? { marks: "", isAbsent: false, remarks: "" };
                  const pct = row.isAbsent ? 0 : (Number(row.marks) / selectedSchedule.totalMarks) * 100 || 0;
                  const grade = row.isAbsent ? "E" : (row.marks !== "" ? getGradeForPercentage(pct, scale) : "-");
                  const existing = entries.find((e) => e.studentId === stu.id);
                  const isLocked = existing?.workflowStatus === "LOCKED";
                  return (
                    <TableRow key={stu.id} className={row.isAbsent ? "bg-amber-500/5" : "hover:bg-muted/30"}>
                      <TableCell className="font-mono text-xs">{stu.rollNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{stu.fullName}</TableCell>
                      <TableCell>
                        <Input
                          ref={(el) => { if (el) inputRefs.current.set(stu.id, el); }}
                          value={row.marks}
                          disabled={row.isAbsent || isLocked}
                          onChange={(e) => setBulk((p) => ({ ...p, [stu.id]: { ...row, marks: e.target.value } }))}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); const next = students[idx + 1]; if (next) inputRefs.current.get(next.id)?.focus(); } }}
                          placeholder={row.isAbsent ? "AB" : "0"}
                          className="h-8 text-sm"
                          type="number"
                          min={0} max={selectedSchedule.totalMarks}
                        />
                      </TableCell>
                      <TableCell className="text-center"><input type="checkbox" checked={row.isAbsent} disabled={isLocked} onChange={(e) => setBulk((p) => ({ ...p, [stu.id]: { ...row, isAbsent: (e.target as HTMLInputElement).checked, marks: (e.target as HTMLInputElement).checked ? "" : row.marks } }))} className="h-4 w-4 rounded border" /></TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{grade}</Badge></TableCell>
                      <TableCell>{row.isAbsent ? <Badge variant="destructive" className="text-[11px]">AB — FAIL</Badge> : row.marks !== "" ? <Badge variant={Number(row.marks) >= selectedSchedule.passingMarks ? "success" : "destructive"} className="text-[11px]">{Number(row.marks) >= selectedSchedule.passingMarks ? "PASS" : "FAIL"}</Badge> : <Badge variant="secondary" className="text-[11px]">Not marked</Badge>}</TableCell>
                      <TableCell><Input value={row.remarks} disabled={isLocked} onChange={(e) => setBulk((p) => ({ ...p, [stu.id]: { ...row, remarks: e.target.value } }))} placeholder="Remark" className="h-8 text-xs" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant={isLocked ? "destructive" : (existing?.workflowStatus === "VERIFIED" ? "success" : "secondary")} className="text-[10px]">{existing?.workflowStatus ?? "NEW"}</Badge>
                          {existing?.history && existing.history.length > 0 && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHistory(existing)}><History className="h-3 w-3" /></Button>}
                          {isLocked && <Lock className="h-3 w-3 text-destructive" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {students.filter((s) => { const r = bulk[s.id]; return r && (r.isAbsent || r.marks.trim() !== ""); }).length}/{students.length} marked • {students.filter((s) => bulk[s.id]?.isAbsent).length} AB (excluded from average) • Use Tab to move Excel-style
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleBulkAB(false)}>Clear AB</Button>
              <Button variant="outline" onClick={() => { const csv = students.map((stu) => `${stu.rollNumber},${stu.fullName},${bulk[stu.id]?.isAbsent ? "AB" : bulk[stu.id]?.marks ?? ""}`).join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${selectedSchedule.subjectName}_marks.csv`; a.click(); toast.success("Excel CSV exported"); }}>Export CSV</Button>
              <Button onClick={handleSave} className="gap-2"><ClipboardList className="h-4 w-4" />Save All</Button>
              <Button variant="secondary" onClick={() => { entries.forEach((e) => { if (e.workflowStatus === "DRAFT") mockDb.updateMarkWorkflow(e.id, "SUBMITTED", "Teacher"); }); toast.success("Submitted for verification"); setEntries([...mockDb.getMarkEntries(selectedSchedule.id)]); }}>Submit</Button>
              <Button variant="default" onClick={() => { entries.forEach((e) => { if (e.workflowStatus === "SUBMITTED") mockDb.updateMarkWorkflow(e.id, "VERIFIED", "Admin"); }); toast.success("Verified"); setEntries([...mockDb.getMarkEntries(selectedSchedule.id)]); }}>Verify (Admin)</Button>
            </div>
          </div>

          <Dialog open={!!showHistory} onOpenChange={(o) => !o && setShowHistory(null)}>
            <DialogContent><DialogHeader><DialogTitle>Audit Trail — Correction History</DialogTitle><DialogDescription>Locked marks require reason; history preserved for re-evaluation.</DialogDescription></DialogHeader>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(showHistory?.history ?? []).map((h, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/40 border text-xs">
                    <div className="flex justify-between"><span>{h.marksObtained} → {h.grade} ({h.status})</span><span className="text-muted-foreground">{new Date(h.correctedAt).toLocaleString()}</span></div>
                    <div className="text-muted-foreground">By {h.correctedBy} {h.reason ? `— ${h.reason}` : ""}</div>
                  </div>
                ))}
                {(!showHistory?.history || showHistory.history.length === 0) && <p className="text-sm text-muted-foreground">No corrections yet.</p>}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// ════════════════════ Exam Types Tab — pehle yaha create karo, tab Create Exam me ayega ════════════════════
const examTypeSchema = z.object({
  name: z.string().min(2, "Name required"),
  category: z.string().min(1, "Category"),
  description: z.string().min(3, "Description"),
  maxMarks: z.string().min(1, "Max marks"),
  passingMarks: z.string().min(1, "Pass marks"),
  weightage: z.string().min(1, "Weightage"),
  defaultMode: z.string().min(1, "Mode"),
});
type ExamTypeForm = z.infer<typeof examTypeSchema>;

function ExamTypesTab() {
  const [types, setTypes] = useState(() => mockDb.getExamTypes());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExamType | null>(null);
  const refresh = useCallback(() => setTypes([...mockDb.getExamTypes()]), []);
  useEffect(() => {
    const h = () => refresh();
    window.addEventListener("exam-types:updated", h);
    return () => window.removeEventListener("exam-types:updated", h);
  }, [refresh]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ExamTypeForm>({
    resolver: zodResolver(examTypeSchema),
    defaultValues: { name: "", category: "CUSTOM", description: "", maxMarks: "100", passingMarks: "33", weightage: "10", defaultMode: "BOTH" },
  });
  useEffect(() => {
    if (editing) reset({ name: editing.name, category: editing.category, description: editing.description, maxMarks: String(editing.maxMarks), passingMarks: String(editing.passingMarks), weightage: String(editing.weightage), defaultMode: editing.defaultMode ?? "BOTH" });
    else reset({ name: "", category: "CUSTOM", description: "", maxMarks: "100", passingMarks: "33", weightage: "10", defaultMode: "BOTH" });
  }, [editing, open, reset]);

  const onSubmit = (v: ExamTypeForm) => {
    const max = Number(v.maxMarks), pass = Number(v.passingMarks), wt = Number(v.weightage);
    if (pass > max) return toast.error("Passing marks max se zyada nahi");
    mockDb.saveExamType({ id: editing?.id, name: v.name as any, category: v.category as any, description: v.description, maxMarks: max, passingMarks: pass, weightage: wt, branchId: "all", defaultMode: v.defaultMode as any });
    toast.success(editing ? "Exam Type updated" : "Exam Type created — ab Create Exam me dikhega"); setOpen(false); setEditing(null); refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">Pehle yaha Exam Type banao — fir <b>Create Exam</b> ke dropdown me option aayega</p>
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Exam Type</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((t) => (
          <Card key={t.id} className="p-4 border-border/80 hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0"><div className="font-bold text-sm truncate">{t.name}</div><div className="text-xs text-muted-foreground line-clamp-2">{t.description}</div></div>
              <Badge variant="outline" className="text-[11px] shrink-0">{t.category}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div className="p-2 rounded bg-muted/40 text-center"><div className="font-bold">{t.maxMarks}</div><div className="text-muted-foreground text-[11px]">Max</div></div>
              <div className="p-2 rounded bg-muted/40 text-center"><div className="font-bold">{t.passingMarks}</div><div className="text-muted-foreground text-[11px]">Pass</div></div>
              <div className="p-2 rounded bg-muted/40 text-center"><div className="font-bold">{t.weightage}%</div><div className="text-muted-foreground text-[11px]">Weight</div></div>
            </div>
            <div className="flex gap-1.5 mt-3">
              <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => { setEditing(t); setOpen(true); }}><Edit3 className="h-3 w-3" /> Edit</Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 text-destructive" onClick={() => { if (confirm(`Delete ${t.name}?`)) { mockDb.deleteExamType(t.id); toast.success("Deleted"); refresh(); } }}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </Card>
        ))}
      </div>
      {types.length === 0 && <EmptyState title="No Exam Types" description="Create pehla Exam Type — fir Create Exam me use kar payoge" />}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Exam Type" : "Create Exam Type"}</DialogTitle><DialogDescription>Yaha banane ke baad Create Exam ke dropdown me option aayega</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div><label className="text-sm font-medium">Name *</label><Input {...register("name")} placeholder="e.g. Half Yearly, Unit Test, Pre-Board" />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Category *</label>
                <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="WEEKLY_TEST">Weekly Test</SelectItem><SelectItem value="MONTHLY_TEST">Monthly Test</SelectItem><SelectItem value="UNIT_TEST">Unit Test</SelectItem><SelectItem value="MIDTERM">Midterm</SelectItem><SelectItem value="FINAL">Final</SelectItem><SelectItem value="ANNUAL">Annual</SelectItem><SelectItem value="CUSTOM">Custom</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Mode *</label>
                <Select value={watch("defaultMode")} onValueChange={(v) => setValue("defaultMode", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="BOTH">Both</SelectItem><SelectItem value="SUBJECTIVE">Subjective</SelectItem><SelectItem value="OBJECTIVE">Objective</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium">Description</label><Textarea {...register("description")} placeholder="e.g. Half-yearly 100 marks comprehensive" rows={2} />{errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}</div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-sm font-medium">Max Marks</label><Input type="number" {...register("maxMarks")} />{errors.maxMarks && <p className="text-xs text-destructive mt-1">{errors.maxMarks.message}</p>}</div>
              <div><label className="text-sm font-medium">Pass Marks</label><Input type="number" {...register("passingMarks")} />{errors.passingMarks && <p className="text-xs text-destructive mt-1">{errors.passingMarks.message}</p>}</div>
              <div><label className="text-sm font-medium">Weightage %</label><Input type="number" {...register("weightage")} />{errors.weightage && <p className="text-xs text-destructive mt-1">{errors.weightage.message}</p>}</div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ════════════════════ Results Tab ════════════════════
function ResultsTab({ branchId }: { branchId: string }) {
  const [results, setResults] = useState(() => mockDb.getResults(branchId));
  const [exams] = useState(() => mockDb.getExams(branchId));
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const refresh = useCallback(() => setResults([...mockDb.getResults(branchId)]), [branchId]);

  const filtered = results.filter((r) => !selectedExamId || r.examId === selectedExamId).filter((r) => !search || r.studentName.toLowerCase().includes(search.toLowerCase()) || r.studentRoll.toLowerCase().includes(search.toLowerCase()));

  const handleGenerate = () => {
    if (!selectedExamId) { toast.error("Select exam"); return; }
    const exam = exams.find((e) => e.id === selectedExamId);
    if (!exam) return;
    // validate all students marked: check every student in class has marks for every schedule
    const schedules = mockDb.getExamSchedules(undefined, selectedExamId).filter((s) => s.classId === exam.classId && s.sectionId === exam.sectionId);
    const students = mockDb.getStudents(branchId).filter((s) => s.classId === exam.classId && s.sectionId === exam.sectionId);
    const totalExpected = students.length * schedules.length;
    const totalEntered = schedules.flatMap((es) => mockDb.getMarkEntries(es.id)).length;
    if (totalEntered < totalExpected) {
      if (!confirm(`Partial data: ${totalEntered}/${totalExpected} marks entered. Processing with incomplete data will produce wrong ranks. Continue?`)) return;
    }
    try {
      const gen = mockDb.generateResultsForExam(selectedExamId, exam.classId, exam.sectionId);
      // fix rank ties: competition ranking 1,1,3
      // patch: recalc ranks with tie handling
      gen.sort((a, b) => b.percentage - a.percentage);
      let rank = 1; let sameCount = 0; let prevPct: number | null = null;
      gen.forEach((r, idx) => {
        if (prevPct !== null && r.percentage === prevPct) sameCount++; else { rank = idx + 1; sameCount = 0; }
        r.rank = rank;
        mockDb.saveResult(r as any);
        prevPct = r.percentage;
      });
      toast.success(`Generated ${gen.length} results with tie-aware ranking (competition 1,1,3)`);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePublish = () => {
    if (!selectedExamId) return;
    try { const c = mockDb.publishResults(selectedExamId, "Admin"); toast.success(`Published ${c} results`); refresh(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select exam" /></SelectTrigger>
            <SelectContent>{exams.map((e) => <SelectItem key={e.id} value={e.id}>{e.name} — {e.className} {e.sectionName}</SelectItem>)}</SelectContent>
          </Select>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="pl-9 h-9" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} className="gap-2"><Trophy className="h-4 w-4" />Generate</Button>
          <Button onClick={handlePublish} className="gap-2"><Send className="h-4 w-4" />Publish</Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
        Formula: Total = sum marks, Percentage = (obtained / max) × 100, Grade = scale, Rank = competition ranking (ties share rank, next rank skips — 1,1,3), Pass = all subjects ≥ passing marks. Optional subjects excluded if totalMarks overridden.
      </div>

      {filtered.length === 0 ? <EmptyState title="No results" description="Generate results after marks entry." /> : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Roll</TableHead><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">%</TableHead><TableHead>Grade</TableHead><TableHead>CGPA</TableHead><TableHead>Status</TableHead><TableHead>Publish</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-xs">#{r.rank}{filtered.filter((x) => x.percentage === r.percentage).length > 1 && <span className="text-muted-foreground font-normal ml-1">(tie)</span>}</TableCell>
                  <TableCell className="font-mono text-xs">{r.studentRoll}</TableCell>
                  <TableCell className="text-sm font-medium">{r.studentName}</TableCell>
                  <TableCell className="text-xs">{r.className} • {r.sectionName}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{r.marksObtained} / {r.totalMarks}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-primary">{r.percentage.toFixed(2)}%</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.overallGrade}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.gpa.toFixed(1)}</TableCell>
                  <TableCell><Badge variant={r.status === "PASS" ? "success" : "destructive"} className="text-[11px]">{r.status}</Badge></TableCell>
                  <TableCell>{r.isPublished ? <Badge variant="success" className="text-[11px]"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge> : <Badge variant="secondary" className="text-[11px]">Draft</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ════════════════════ Report Cards Tab ════════════════════
function ReportCardsTab({ branchId }: { branchId: string }) {
  const [results, setResults] = useState(() => mockDb.getResults(branchId).filter((r) => r.isPublished));
  const [selected, setSelected] = useState<Result | null>(null);
  const [template, setTemplate] = useState<"SENIOR" | "PRIMARY">("SENIOR");
  const [bulkProgress, setBulkProgress] = useState<number | null>(null);

  const handleBulkPdf = () => {
    if (results.length === 0) { toast.error("No report cards to generate"); return; }
    setBulkProgress(0);
    const interval = setInterval(() => {
      setBulkProgress((p) => {
        if (p === null) return 0;
        const next = p + 20;
        if (next >= 100) { clearInterval(interval); setTimeout(() => { setBulkProgress(null); toast.success(`Bulk PDF: ${results.length} report cards generated (background job simulated, template: ${template})`); }, 500); return 100; }
        return next;
      });
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Select value={template} onValueChange={(v) => setTemplate(v as any)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="SENIOR">Senior Template (marks+grade)</SelectItem><SelectItem value="PRIMARY">Primary Template (grade only)</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" onClick={handleBulkPdf} disabled={bulkProgress !== null} className="gap-2"><Download className="h-4 w-4" />Bulk PDF {bulkProgress !== null && `(${bulkProgress}%)`}</Button>
        </div>
        <Badge variant="secondary" className="h-9 px-3">{results.length} published cards — historical preservation: old cards keep original class snapshot</Badge>
      </div>
      {bulkProgress !== null && <div className="w-full h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${bulkProgress}%` }} /></div>}

      {results.length === 0 ? <EmptyState title="No report cards" description="Publish results first." icon={<FileBadge className="h-7 w-7" />} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <Card key={r.id} className="border-border/80 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><div className="font-bold text-sm">{r.studentName}</div><div className="text-xs text-muted-foreground">{r.studentRoll} • {r.className} {r.sectionName}</div></div>
                  <Badge variant={r.status === "PASS" ? "success" : "destructive"} className="text-[11px]">{r.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-muted/40"><div className="font-bold">{r.marksObtained}/{r.totalMarks}</div><div className="text-muted-foreground">Total</div></div>
                  <div className="p-2 rounded bg-primary/10"><div className="font-bold text-primary">{r.percentage.toFixed(1)}%</div><div className="text-muted-foreground">Percentage</div></div>
                  <div className="p-2 rounded bg-muted/40"><div className="font-bold">{r.overallGrade}</div><div className="text-muted-foreground">Grade</div></div>
                </div>
                <div className="text-xs">Rank <span className="font-bold">#{r.rank}</span> of {r.totalStudents} • GPA {r.gpa.toFixed(1)}</div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setSelected(r)}><Eye className="h-4 w-4" />View / Print</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-extrabold">Apex School — Report Card</h2>
                <p className="text-xs text-muted-foreground">{selected.academicYear} • {selected.examTypeName} • {selected.examId}</p>
                <p className="text-xs mt-2"><span className="font-semibold">{selected.studentName}</span> • {selected.studentRoll} • {selected.className} {selected.sectionName}</p>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead className="text-right">Marks</TableHead><TableHead className="text-right">%</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selected.subjects.map((s) => (
                    <TableRow key={s.subjectId}>
                      <TableCell className="text-sm">{s.subjectName}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{s.marksObtained}/{s.totalMarks}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{s.percentage.toFixed(1)}%</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{template === "PRIMARY" ? s.grade : `${s.grade} (${s.percentage.toFixed(0)}%)`}</Badge></TableCell>
                      <TableCell><Badge variant={s.status === "PASS" ? "success" : "destructive"} className="text-[10px]">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40 font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{selected.marksObtained}/{selected.totalMarks}</TableCell><TableCell className="text-right">{selected.percentage.toFixed(2)}%</TableCell><TableCell>{selected.overallGrade}</TableCell><TableCell>{selected.status}</TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded bg-muted/40"><div className="text-muted-foreground">Rank</div><div className="font-bold text-lg">#{selected.rank} / {selected.totalStudents}</div><div className="text-muted-foreground">Tie handling: competition ranking 1,1,3</div></div>
                <div className="p-3 rounded bg-muted/40"><div className="text-muted-foreground">Remarks</div><div className="font-medium">{selected.remarks ?? "—"}</div><div className="text-muted-foreground mt-2">CGPA: {selected.gpa.toFixed(2)} (CBSE: % / 9.5)</div></div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground pt-4 border-t">
                <span>Class Teacher Signature</span><span>Principal Signature</span><span>Generated: {new Date(selected.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { toast.success("Print triggered (browser print)"); window.print(); }} className="gap-2"><FileText className="h-4 w-4" />Print</Button>
                <Button onClick={() => toast.success("PDF downloaded (simulated)")} className="gap-2"><Download className="h-4 w-4" />Download PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ════════════════════ Analytics Tab ════════════════════
function AnalyticsTab({ branchId }: { branchId: string }) {
  const results = mockDb.getResults(branchId);
  const avg = results.length ? (results.reduce((a, r) => a + r.percentage, 0) / results.length).toFixed(1) : "0";
  const pass = results.filter((r) => r.status === "PASS").length;
  const fail = results.length - pass;
  const passRate = results.length ? Math.round((pass / results.length) * 100) : 0;

  // subject-wise avg from subjects array
  const subjMap = new Map<string, { total: number; count: number; pass: number; fail: number }>();
  results.forEach((r) => r.subjects.forEach((s) => {
    const cur = subjMap.get(s.subjectName) ?? { total: 0, count: 0, pass: 0, fail: 0 };
    cur.total += s.percentage; cur.count++; if (s.status === "PASS") cur.pass++; else cur.fail++;
    subjMap.set(s.subjectName, cur);
  }));

  // class-wise
  const classMap = new Map<string, { avg: number; count: number }>();
  results.forEach((r) => {
    const k = r.className;
    const cur = classMap.get(k) ?? { avg: 0, count: 0 };
    cur.avg += r.percentage; cur.count++;
    classMap.set(k, cur);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Class Average</div><div className="text-2xl font-bold">{avg}%</div><div className="text-xs text-muted-foreground">{results.length} results</div></Card>
        <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Pass Rate</div><div className="text-2xl font-bold text-emerald-600">{passRate}%</div><div className="text-xs">{pass} pass / {fail} fail</div></Card>
        <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Topper</div><div className="text-lg font-bold">{results.sort((a, b) => b.percentage - a.percentage)[0]?.studentName ?? "—"}</div><div className="text-xs text-muted-foreground">{results[0]?.percentage.toFixed(1) ?? 0}%</div></Card>
        <Card className="p-4 border-amber-500/20 bg-amber-500/5"><div className="text-[11px] text-amber-700 uppercase">Weighted Consolidation</div><div className="text-xs mt-1">Mid-term 30% + Final 70% example. Configure in Assessment Settings.</div></Card>
      </div>

      <Card className="p-4">
        <CardTitle className="text-sm mb-3">Subject-wise Performance</CardTitle>
        <div className="space-y-3">
          {Array.from(subjMap.entries()).map(([name, v]) => {
            const avgP = (v.total / v.count).toFixed(1);
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="w-32 text-sm font-medium truncate">{name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${avgP}%` }} /></div>
                <span className="w-14 text-xs font-mono text-right">{avgP}%</span>
                <span className="w-20 text-xs text-muted-foreground">{v.pass}P / {v.fail}F</span>
              </div>
            );
          })}
          {subjMap.size === 0 && <p className="text-sm text-muted-foreground">No subject data yet.</p>}
        </div>
      </Card>

      <Card className="p-4">
        <CardTitle className="text-sm mb-3">Pass / Fail Distribution</CardTitle>
        <div className="flex gap-4">
          <div className="flex-1 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-2xl font-bold text-emerald-600">{pass}</div><div className="text-xs text-muted-foreground">Pass</div>
            <div className="w-full h-1 bg-emerald-500 mt-2 rounded-full" style={{ width: `${passRate}%`, maxWidth: "100%" }} />
          </div>
          <div className="flex-1 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <div className="text-2xl font-bold text-rose-600">{fail}</div><div className="text-xs text-muted-foreground">Fail</div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider">Class-wise Average</h4>
          {Array.from(classMap.entries()).map(([cls, v]) => (
            <div key={cls} className="flex justify-between text-xs"><span>{cls}</span><span className="font-mono font-bold">{(v.avg / v.count).toFixed(1)}% ({v.count} students)</span></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════ Grading Tab ════════════════════
function GradingTab() {
  const [scales, setScales] = useState(() => mockDb.getGradeScale());
  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
        Per-subject passing marks are set in Datesheet (totalMarks/passingMarks). Different subjects (e.g. practicals) can have different criteria. Grade scale applies to percentage overall or per-subject.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scales.map((s) => (
          <Card key={s.grade} className="p-4">
            <div className="flex justify-between"><span className="text-2xl font-extrabold text-primary">{s.grade}</span><Badge variant="outline" className="text-xs font-mono">GPA {s.gpa}</Badge></div>
            <div className="text-xs font-mono text-muted-foreground mt-2">{s.minPercentage}% — {s.maxPercentage}%</div>
            <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
            <div className="mt-2 h-1 rounded-full" style={{ background: s.color === "emerald" ? "#10b981" : s.color === "blue" ? "#3b82f6" : s.color === "amber" ? "#f59e0b" : "#f43f5e" }} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssessmentTab() {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4" />Assessment Settings</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Rank Tie Handling</div><div className="text-xs text-muted-foreground mt-1">Competition ranking: 1,1,3 (standard). Dense alternative 1,1,2 configurable. Current: competition.</div></div>
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Optional Subjects</div><div className="text-xs text-muted-foreground mt-1">Mark subject as optional in timetable; excluded from total/percentage — shown separately on card.</div></div>
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Historical Preservation</div><div className="text-xs text-muted-foreground mt-1">Promotion does not mutate old results — class snapshot stored at generation. Subject mapping changes don’t retroactively alter past exams.</div></div>
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Marks Correction</div><div className="text-xs text-muted-foreground mt-1">After LOCKED, correction requires reason + history entry; triggers recalculation and report card versioning.</div></div>
        </div>
      </Card>
    </div>
  );
}
