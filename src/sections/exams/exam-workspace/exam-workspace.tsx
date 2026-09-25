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
import { Search, Calendar, Trophy, Award, BookOpen, Plus, Edit3, Trash2, Eye, Download, FileSpreadsheet, GraduationCap, Send, BarChart3, Settings2, FileBadge, ClipboardList, PenLine, FileText, AlertTriangle, Lock, History, CheckCircle2, XCircle, LayoutGrid, Save } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { fetchExams, fetchExamTypes, createExamTypeApi, updateExamTypeApi, createExamApi, updateExamApi, createExamScheduleApi, updateExamScheduleApi, deleteExamScheduleApi, fetchExamSchedules, fetchExamStudentsMatrix, saveBulkMarks, fetchExamAnalytics, fetchGradeScales, upsertGradeScaleApi, seedDefaultGradeScales, deleteGradeScaleApi, fetchResultsApi, publishExamApi, recomputeExamApi, type BackendExam, type BackendExamType, type BackendExamSchedule, type BackendGradeScale, type BackendResult, type ExamMatrix, type ExamAnalytics } from "@/lib/api/exams";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { fetchClasses, fetchSubjects } from "@/lib/api/classes";
import { fetchSections, type BackendSection } from "@/lib/api/sections";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";

// --- Helpers ---
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

// Day name for a datesheet ISO date (IST calendar day).
function dayNameOf(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
  } catch {
    return "-";
  }
}

// ── Role gating (task.md exam rules) ──
// HR (+ADMIN) manages exam types / exams / datesheet. Teachers also enter
// marks. Principal is view-only but publishes results. Backend enforces the
// same rules; this only hides actions the API would reject.
function useExamPermissions() {
  const { session } = useERP();
  const role = session?.role;
  const canManageExam = role === "ADMIN" || role === "HR_MANAGER";
  const canEnterMarks = canManageExam || role === "TEACHER";
  const canPublish = canManageExam || role === "PRINCIPAL";
  // Slot delete is principal-only (campus-scoped); ADMIN keeps override.
  const canDeleteSlot = role === "PRINCIPAL" || role === "ADMIN";
  return { role, canManageExam, canEnterMarks, canPublish, canDeleteSlot };
}

// --- Exam Setup Schema - Section removed, ExamType must pre-exist ---
const examSchema = z.object({
  name: z.string().min(2, "Name required"),
  examTypeId: z.string().min(1, "Exam type pehle create karo - tab Exam Types me banao"),
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
  room: z.string().optional(),
  totalMarks: z.string().min(1, "Required"),
  passingMarks: z.string().min(1, "Required"),
  instructions: z.string().optional(),
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
          <TabsTrigger value="exam-types" className="gap-1.5 text-xs"><FileBadge className="h-3.5 w-3.5" />Exam Types</TabsTrigger>
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

// ------------------------------ Exams Tab ------------------------------
type DisplayExam = {
  uuid: string;
  id: string;
  name: string;
  examTypeName: string;
  category: string;
  examMode: string;
  academicYear: string;
  className: string;
  startDate: string;
  endDate: string;
  status: string;
  instructions?: string;
  examTypeUuid?: string;
  classUuid?: string;
};

function mapExam(b: BackendExam): DisplayExam {
  return {
    uuid: b.uuid,
    id: b.uuid,
    name: b.name,
    examTypeName: b.examType?.name ?? "-",
    category: b.category,
    examMode: b.examMode,
    academicYear: b.academicYear,
    className: b.class?.name ?? "-",
    startDate: b.startDate,
    endDate: b.endDate,
    status: b.status,
    instructions: b.instructions ?? undefined,
    examTypeUuid: b.examType?.uuid ?? undefined,
    classUuid: b.class?.uuid ?? undefined,
  };
}

function ExamsTab({ branchId }: { branchId: string }) {
  const campusId = branchId === "all" ? null : branchId;
  const { canManageExam } = useExamPermissions();
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examsOffline, setExamsOffline] = useState(false);
  const [examsError, setExamsError] = useState<string | null>(null);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [examTypes, setExamTypes] = useState<BackendExamType[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DisplayExam | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadTypes = useCallback(async () => {
    try {
      const types = await fetchExamTypes({ campusId });
      setExamTypes(types);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load exam types");
    }
  }, [campusId]);

  const refresh = useCallback(async () => {
    setExamsLoading(true);
    try {
      const { items } = await fetchExams({
        campusId,
        examTypeUuid: typeFilter !== "ALL" ? typeFilter : undefined,
        limit: 100,
      });
      setExams(items.map(mapExam));
      setExamsOffline(false);
      setExamsError(null);
    } catch (e: any) {
      setExamsOffline(true);
      setExamsError(e?.message || "Failed to load exams");
    } finally {
      setExamsLoading(false);
    }
  }, [campusId, typeFilter]);

  useEffect(() => { refresh(); loadTypes(); }, [refresh, loadTypes]);

  useEffect(() => {
    fetchClasses({ campusId, limit: 100 })
      .then((cls) => setClasses(cls.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => setClasses([]));
  }, [campusId]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: { name: "", examTypeId: "", classId: "", academicYear: "2026-2027", startDate: "", endDate: "", instructions: "" },
  });

  useEffect(() => {
    if (editing) {
      reset({ name: editing.name, examTypeId: "", classId: "", academicYear: editing.academicYear, startDate: editing.startDate, endDate: editing.endDate, instructions: editing.instructions ?? "" });
    } else {
      reset({ name: "", examTypeId: "", classId: "", academicYear: "2026-2027", startDate: "", endDate: "", instructions: "" });
    }
  }, [editing, open, reset]);

  const onSubmit = async (v: ExamFormValues) => {
    try {
      if (examTypes.length === 0) { toast.error("Create an Exam Type first (Exam Types tab)"); return; }
      const et = examTypes.find((e) => e.uuid === v.examTypeId);
      if (editing) {
        await updateExamApi(editing.uuid, {
          name: v.name,
          startDate: v.startDate,
          endDate: v.endDate,
          instructions: v.instructions,
          status: editing.status,
        });
        toast.success("Exam updated");
      } else {
        await createExamApi({
          name: v.name,
          examTypeUuid: v.examTypeId,
          category: et?.category ?? "CUSTOM",
          examMode: et?.defaultMode ?? "WRITTEN",
          academicYear: v.academicYear,
          classUuid: v.classId,
          campusUuid: campusId ?? undefined,
          startDate: v.startDate,
          endDate: v.endDate,
          instructions: v.instructions,
          status: "DRAFT",
        }, campusId);
        toast.success("Exam created");
      }
      setOpen(false); setEditing(null); await refresh(); await loadTypes();
    } catch (e: any) { toast.error(e?.message || "Save failed"); }
  };

  const filtered = exams.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.className.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={examsOffline} error={examsError} isLoading={examsLoading} />
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams, class..." className="pl-9 h-9" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Exam type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {examTypes.map((t) => <SelectItem key={t.uuid} value={t.uuid}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {canManageExam && <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2"><Plus className="h-4 w-4" />Create Exam</Button>}
      </div>

      {examsLoading ? (
        <div className="rounded-xl border border-border/80 bg-card p-6 space-y-3 animate-pulse">
          <div className="h-4 w-1/2 bg-muted rounded" /><div className="h-4 w-2/3 bg-muted rounded" /><div className="h-4 w-1/3 bg-muted rounded" />
        </div>
      ) : filtered.length === 0 ? <EmptyState title="No Exams" description="Create your first exam setup." /> : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Class</TableHead><TableHead>Year</TableHead><TableHead>Dates</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((ex) => (
                <TableRow key={ex.id} className="hover:bg-muted/30">
                  <TableCell><div className="font-semibold text-sm">{ex.name}</div><div className="text-xs text-muted-foreground">{ex.examTypeName} | {ex.examMode}</div></TableCell>
                  <TableCell className="text-xs">{ex.className}</TableCell>
                  <TableCell className="text-xs">{ex.academicYear}</TableCell>
                  <TableCell className="text-xs font-mono">{formatDate(ex.startDate)} -' {formatDate(ex.endDate)}</TableCell>
                  <TableCell><Badge variant={statusVariant(ex.status)} className="text-[11px]">{ex.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Open detail" onClick={() => { window.location.href = `/exams/${ex.uuid}`; }}><Eye className="h-4 w-4" /></Button>
                      {canManageExam && <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit exam" onClick={() => { setEditing(ex); setOpen(true); }}><Edit3 className="h-4 w-4" /></Button>}
                      {canManageExam && ex.status === "DRAFT" && <Button variant="ghost" size="icon" className="h-8 w-8" title="Publish" onClick={async () => { try { await updateExamApi(ex.uuid, { status: "PUBLISHED" }); toast.success("Exam published"); await refresh(); } catch (e: any) { toast.error(e?.message); } }}><Send className="h-4 w-4 text-emerald-600" /></Button>}
                      {canManageExam && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Cancel exam" onClick={async () => { if (confirm("Cancel this exam?")) { try { await updateExamApi(ex.uuid, { status: "CANCELLED" }); toast.success("Exam cancelled"); await refresh(); } catch (e: any) { toast.error(e?.message); } } }}><Trash2 className="h-4 w-4" /></Button>}
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
          <DialogHeader><DialogTitle>{editing ? "Edit Exam" : "Create Exam"}</DialogTitle><DialogDescription>Exam setup: name, dates, class snapshot. Instructions &amp; syllabus previewed on the detail page.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Name *</label><Input {...register("name")} placeholder="Half Yearly Exam" />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}</div>
              <div><label className="text-sm font-medium">Academic Year</label><Input {...register("academicYear")} placeholder="2026-2027" />{errors.academicYear && <p className="text-xs text-destructive mt-1">{errors.academicYear.message}</p>}</div>
              {!editing && (
                <>
                  <div><label className="text-sm font-medium flex items-center gap-1">Exam Type *{examTypes.length === 0 && <span className="text-[11px] text-amber-600">(create first)</span>}</label>
                    <Select value={watch("examTypeId")} onValueChange={(v) => setValue("examTypeId", v)}>
                      <SelectTrigger><SelectValue placeholder={examTypes.length ? "Select type" : "No type - create in Exam Types"} /></SelectTrigger>
                      <SelectContent>
                        {examTypes.length ? examTypes.map((t) => <SelectItem key={t.uuid} value={t.uuid}>{t.name} ({t.maxMarks} marks)</SelectItem>) : <div className="p-3 text-xs text-muted-foreground text-center">No exam types - create one in Exam Types tab</div>}
                      </SelectContent>
                    </Select>{errors.examTypeId && <p className="text-xs text-destructive mt-1">{errors.examTypeId.message}</p>}
                  </div>
                  <div><label className="text-sm font-medium">Class *</label>
                    <Select value={watch("classId")} onValueChange={(v) => setValue("classId", v)}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>{errors.classId && <p className="text-xs text-destructive mt-1">{errors.classId.message}</p>}
                  </div>
                </>
              )}
              <div><label className="text-sm font-medium">Start Date</label><Input type="date" {...register("startDate")} />{errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>}</div>
              <div><label className="text-sm font-medium">End Date</label><Input type="date" {...register("endDate")} />{errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}</div>
            </div>
            <div><label className="text-sm font-medium">Instructions / Syllabus</label><Textarea {...register("instructions")} placeholder="Syllabus: Ch 1-5, reporting 8:30 AM, bring admit card..." rows={3} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting || (!editing && examTypes.length === 0)}>{editing ? "Update" : "Create"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------ Schedule Tab ------------------------------
function ScheduleTab({ branchId }: { branchId: string }) {
  const campusId = branchId === "all" ? null : branchId;
  // NOTE: Delete stays visible for every role on purpose - backend RBAC
  // rejects non-principals ("Only the campus principal...") via toast.
  const { canManageExam } = useExamPermissions();
  const [schedules, setSchedules] = useState<BackendExamSchedule[]>([]);
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  // Exam-first flow: pick the exam, its datesheet opens, create slots inside it.
  const [examFilter, setExamFilter] = useState("");
  // One modal for view / edit / create - exam is the foreign key, shown readonly.
  const [modal, setModal] = useState<{ mode: "create" | "edit" | "view"; schedule?: BackendExamSchedule } | null>(null);

  const selectedExam = exams.find((e) => e.uuid === examFilter) ?? null;

  // 1. Load exams first.
  useEffect(() => {
    setExamsLoading(true);
    fetchExams({ campusId, limit: 100 })
      .then(({ items }) => {
        const list = items.map(mapExam);
        setExams(list);
        setExamFilter((prev) => prev || list[0]?.uuid || "");
      })
      .catch((e: any) => toast.error(e?.message || "Failed to load exams"))
      .finally(() => setExamsLoading(false));
  }, [campusId]);

  // 2. Datesheet of the picked exam.
  const refresh = useCallback(async () => {
    if (!examFilter) { setSchedules([]); return; }
    setLoading(true);
    try {
      setSchedules(await fetchExamSchedules({ campusId, examUuid: examFilter, limit: 200 }));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load datesheet");
    } finally {
      setLoading(false);
    }
  }, [campusId, examFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  // Subjects of the picked exam's class (create/edit dropdown).
  useEffect(() => {
    if (!selectedExam?.classUuid) { setSubjects([]); return; }
    fetchSubjects({ campusId, classId: selectedExam.classUuid, limit: 100 })
      .then((s) => setSubjects(s.map((x) => ({ id: x.uuid, name: x.name, code: x.code }))))
      .catch(() => setSubjects([]));
  }, [selectedExam?.classUuid, campusId]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { examId: "", subjectId: "", examDate: "", startTime: "09:00", endTime: "12:00", room: "", totalMarks: "100", passingMarks: "33", instructions: "" },
  });

  useEffect(() => {
    if (!modal) return;
    if (modal.mode !== "create" && modal.schedule) {
      const s = modal.schedule;
      reset({
        examId: s.exam?.uuid ?? examFilter,
        subjectId: s.subject?.uuid ?? "",
        examDate: String(s.examDate).slice(0, 10),
        startTime: String(s.startTime).slice(0, 5),
        endTime: String(s.endTime).slice(0, 5),
        room: s.room ?? "",
        totalMarks: String(s.totalMarks),
        passingMarks: String(s.passingMarks),
        instructions: s.instructions ?? "",
      });
    } else {
      reset({ examId: examFilter, subjectId: "", examDate: "", startTime: "09:00", endTime: "12:00", room: "", totalMarks: "100", passingMarks: "33", instructions: "" });
    }
  }, [modal, examFilter, reset]);

  const handleDeleteSlot = async (s: BackendExamSchedule) => {
    if (!confirm(`Permanently delete slot "${s.subject?.name ?? "slot"}" on ${formatDate(s.examDate)}? The slot and all its entered marks will be removed from the database and results recalculated.`)) return;
    try {
      const res = await deleteExamScheduleApi(s.uuid);
      toast.success(`Slot deleted (${res.removedMarks} marks removed)`);
      setModal(null);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const onSubmit = async (v: ScheduleFormValues) => {
    try {
      if (modal?.mode === "edit" && modal.schedule) {
        await updateExamScheduleApi(modal.schedule.uuid, {
          examDate: v.examDate,
          startTime: v.startTime,
          endTime: v.endTime,
          room: v.room || null,
          instructions: v.instructions || null,
          totalMarks: Number(v.totalMarks),
          passingMarks: Number(v.passingMarks),
          status: modal.schedule.status,
        });
        toast.success("Slot updated");
      } else {
        const ex = selectedExam;
        if (!ex) { toast.error("Pick an exam first"); return; }
        if (!ex.examTypeUuid || !ex.classUuid) { toast.error("This exam is missing type/class - fix it in Exam Setup"); return; }
        await createExamScheduleApi({
          examUuid: ex.uuid,
          examName: ex.name,
          examTypeUuid: ex.examTypeUuid,
          classUuid: ex.classUuid,
          subjectUuid: v.subjectId,
          campusUuid: campusId ?? undefined,
          academicYear: ex.academicYear,
          examDate: v.examDate,
          startTime: v.startTime,
          endTime: v.endTime,
          room: v.room || undefined,
          instructions: v.instructions || undefined,
          totalMarks: Number(v.totalMarks),
          passingMarks: Number(v.passingMarks),
          status: "SCHEDULED",
        }, campusId);
        toast.success("Slot created");
      }
      setModal(null); await refresh();
    } catch (e: any) { toast.error(e?.message || "Save failed"); }
  };

  const filtered = schedules.filter((s) => {
    const mSearch = !search || (s.subject?.name ?? "").toLowerCase().includes(search.toLowerCase()) || (s.instructions ?? "").toLowerCase().includes(search.toLowerCase());
    const mStatus = statusFilter === "ALL" || s.status === statusFilter;
    return mSearch && mStatus;
  });

  const isView = modal?.mode === "view";
  const modalExamName = modal?.mode === "create"
    ? selectedExam ? `${selectedExam.name} - ${selectedExam.className}` : "-"
    : modal?.schedule ? modal.schedule.examName : "-";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1 flex-wrap items-end">
          <div className="w-full sm:w-72">
            <label className="text-xs font-semibold text-muted-foreground">1 | Pick exam</label>
            <Select value={examFilter} onValueChange={(v) => { setExamFilter(v); setSearch(""); }}>
              <SelectTrigger className="h-9"><SelectValue placeholder={examsLoading ? "Loading exams..." : "Select exam"} /></SelectTrigger>
              <SelectContent>{exams.map((e) => <SelectItem key={e.uuid} value={e.uuid}>{e.name} - {e.className} ({e.academicYear})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subject, remark..." className="pl-9 h-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="SCHEDULED">Scheduled</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem></SelectContent>
          </Select>
        </div>
        {canManageExam && (
          <Button disabled={!selectedExam} onClick={() => setModal({ mode: "create" })} className="gap-2" title={selectedExam ? `Add slot to ${selectedExam.name}` : "Pick an exam first"}>
            <Plus className="h-4 w-4" />Add Slot
          </Button>
        )}
      </div>
      {loading ? (
        <div className="rounded-xl border border-border/80 bg-card p-6 animate-pulse space-y-3">
          <div className="h-4 w-1/2 bg-muted rounded" /><div className="h-4 w-2/3 bg-muted rounded" /><div className="h-4 w-1/3 bg-muted rounded" />
        </div>
      ) : !selectedExam ? (
        <EmptyState title="Pick an exam" description="Select an exam above to see its datesheet and add slots." />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Day</TableHead><TableHead>Subject</TableHead><TableHead>Remark</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.uuid} className="hover:bg-muted/30">
                  <TableCell>
                    <button
                      type="button"
                      title="View slot"
                      onClick={() => setModal({ mode: "view", schedule: s })}
                      className="flex items-center gap-1.5 text-xs font-mono text-primary hover:underline"
                    >
                      <Calendar className="h-3.5 w-3.5" />{formatDate(s.examDate)}
                    </button>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{dayNameOf(s.examDate)}</TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold">{s.subject?.name ?? "-"}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{String(s.startTime).slice(0, 5)}-{String(s.endTime).slice(0, 5)}{s.room ? ` | ${s.room}` : ""}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate" title={s.instructions ?? ""}>{s.instructions || "-"}</TableCell>
                  <TableCell><Badge variant={statusVariant(s.status)} className="text-[11px]">{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setModal({ mode: "view", schedule: s })}><Eye className="h-4 w-4" /></Button>
                      {canManageExam && <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit slot" onClick={() => setModal({ mode: "edit", schedule: s })}><Edit3 className="h-4 w-4" /></Button>}
                      {s.status !== "CANCELLED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Delete slot (principal only)"
                          onClick={() => handleDeleteSlot(s)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {!loading && selectedExam && filtered.length === 0 && <EmptyState title="No slots yet" description={`No datesheet for ${selectedExam.name} - click Add Slot.`} />}

      <Dialog open={!!modal} onOpenChange={(o) => { if (!o) setModal(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{modal?.mode === "view" ? "Slot Detail" : modal?.mode === "edit" ? "Edit Slot" : "Add Datesheet Slot"}</DialogTitle>
            <DialogDescription>Exam (fixed) | <b>{modalExamName}</b></DialogDescription>
          </DialogHeader>
          {modal && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div><label className="text-sm font-medium">Subject *</label>
                <Select value={watch("subjectId")} onValueChange={(v) => setValue("subjectId", v)} disabled={isView || modal.mode === "edit"}>
                  <SelectTrigger><SelectValue placeholder={subjects.length ? "Select subject" : "No subjects for this class"} /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Date *</label><Input type="date" disabled={isView} {...register("examDate")} />
                  {!isView && watch("examDate") && <p className="text-[11px] text-muted-foreground mt-1">{dayNameOf(watch("examDate"))}</p>}
                </div>
                <div><label className="text-sm font-medium">Room <span className="text-muted-foreground font-normal">(optional)</span></label><Input disabled={isView} {...register("room")} placeholder="R101" /></div>
                <div><label className="text-sm font-medium">Start</label><Input type="time" disabled={isView} {...register("startTime")} /></div>
                <div><label className="text-sm font-medium">End</label><Input type="time" disabled={isView} {...register("endTime")} /></div>
                <div><label className="text-sm font-medium">Max Marks</label><Input type="number" disabled={isView} {...register("totalMarks")} /></div>
                <div><label className="text-sm font-medium">Pass Marks</label><Input type="number" disabled={isView} {...register("passingMarks")} /></div>
              </div>
              <div><label className="text-sm font-medium">Remark (optional)</label><Textarea disabled={isView} {...register("instructions")} rows={2} placeholder="Syllabus: Ch 1-5, bring admit card..." /></div>
              <DialogFooter>
                {isView ? (
                  <>
                    {modal.schedule && modal.schedule.status !== "CANCELLED" && (
                      <Button type="button" variant="destructive" onClick={() => handleDeleteSlot(modal.schedule!)}>Delete</Button>
                    )}
                    <Button type="button" variant="outline" onClick={() => setModal(null)}>Close</Button>
                    {canManageExam && modal.schedule && <Button type="button" onClick={() => setModal({ mode: "edit", schedule: modal.schedule })}>Edit</Button>}
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                    <Button type="submit">{modal.mode === "edit" ? "Update" : "Add"}</Button>
                  </>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
// ------------------------------ Marks Entry Tab ------------------------------
function MarksTab({ branchId }: { branchId: string }) {
  const campusId = branchId === "all" ? null : branchId;
  const { canEnterMarks } = useExamPermissions();
  // Cascade: exam (search) -> class (auto) -> section -> subject slot -> students.
  // Everything is campus-scoped: only this campus's exams/classes/sections/students.
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [examSearch, setExamSearch] = useState("");
  const [selectedExamUuid, setSelectedExamUuid] = useState("");
  const [sections, setSections] = useState<BackendSection[]>([]);
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [schedules, setSchedules] = useState<BackendExamSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [matrix, setMatrix] = useState<ExamMatrix | null>(null);
  const [matrixError, setMatrixError] = useState<string | null>(null);
  const [scales, setScales] = useState<BackendGradeScale[]>([]);
  const [bulk, setBulk] = useState<Record<string, { marks: string; isAbsent: boolean; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const filteredExams = exams.filter((e) =>
    !examSearch.trim() ||
    e.name.toLowerCase().includes(examSearch.trim().toLowerCase()) ||
    e.className.toLowerCase().includes(examSearch.trim().toLowerCase())
  );
  const selectedExam = exams.find((e) => e.uuid === selectedExamUuid) ?? null;
  const selectedSchedule = schedules.find((s) => s.uuid === selectedScheduleId) ?? null;

  // 1. Campus exams for the cascade.
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchExams({ campusId, limit: 100 }),
      fetchGradeScales(campusId).catch(() => []),
    ])
      .then(([{ items }, sc]) => {
        const list = items.map(mapExam);
        setExams(list);
        setSelectedExamUuid((prev) => prev || list[0]?.uuid || "");
        setScales(sc);
      })
      .catch((e: any) => toast.error(e?.message || "Failed to load exams"))
      .finally(() => setLoading(false));
  }, [campusId]);

  // 2. Class auto-selects from exam -> load its sections + its subject slots.
  useEffect(() => {
    setSectionFilter("ALL");
    setSelectedScheduleId("");
    setMatrix(null);
    setBulk({});
    if (!selectedExam) { setSections([]); setSchedules([]); return; }
    fetchSections({ campusId, classId: selectedExam.classUuid, limit: 100 })
      .then(({ data }) => setSections(data))
      .catch(() => setSections([]));
    fetchExamSchedules({ campusId, examUuid: selectedExam.uuid, limit: 200 })
      .then((sched) => {
        setSchedules(sched);
        if (sched.length > 0) setSelectedScheduleId(sched[0].uuid);
      })
      .catch((e: any) => {
        setSchedules([]);
        toast.error(e?.message || "Failed to load datesheet");
      });
  }, [selectedExamUuid]);

  // 3. Students of this campus exam (+ section) load automatically.
  const loadMatrix = useCallback(async () => {
    if (!selectedExam || !selectedSchedule) { setMatrix(null); setBulk({}); return; }
    setMatrixLoading(true);
    setMatrixError(null);
    try {
      const m = await fetchExamStudentsMatrix(selectedExam.uuid, {
        section: sectionFilter !== "ALL" ? sectionFilter : undefined,
      });
      setMatrix(m);
      const b: Record<string, { marks: string; isAbsent: boolean; remarks: string }> = {};
      for (const r of m.rows) {
        const paper = r.papers.find((p) => p.scheduleUuid === selectedSchedule.uuid);
        b[r.studentUuid] = {
          marks: paper?.obtained != null ? String(paper.obtained) : "",
          isAbsent: paper?.status === "ABSENT",
          remarks: "",
        };
      }
      setBulk(b);
    } catch (e: any) {
      setMatrixError(e?.message || "Failed to load students");
      setMatrix(null);
    } finally {
      setMatrixLoading(false);
    }
  }, [selectedExamUuid, selectedScheduleId, sectionFilter]);

  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  const students = matrix?.rows ?? [];

  const gradeFor = (marksStr: string, isAbsent: boolean) => {
    if (isAbsent || !selectedSchedule) return isAbsent ? "AB" : "-";
    if (marksStr.trim() === "") return "-";
    const pct = (Number(marksStr) / selectedSchedule.totalMarks) * 100;
    const hit = scales.find((s) => pct >= Number(s.minPercent) && pct <= Number(s.maxPercent));
    return hit?.grade ?? "-";
  };

  const handleSave = async () => {
    if (!selectedSchedule) return;
    // Build one entry per student row — each row keeps its own marks value.
    const byName = new Map(students.map((s) => [s.studentUuid, s.studentName]));
    const entries = students
      .map((stu) => {
        const row = bulk[stu.studentUuid];
        if (!row || (!row.isAbsent && row.marks.trim() === "")) return null;
        const marksNum = row.isAbsent ? 0 : Number(row.marks);
        if (!row.isAbsent && (Number.isNaN(marksNum) || marksNum < 0 || marksNum > selectedSchedule.totalMarks)) {
          toast.error(`${stu.studentName}: marks must be 0-${selectedSchedule.totalMarks}`);
          return "invalid" as const;
        }
        return { studentUuid: stu.studentUuid, marksObtained: marksNum, isAbsent: row.isAbsent, remarks: row.remarks || undefined };
      })
      .filter(Boolean) as { studentUuid: string; marksObtained: number; isAbsent: boolean; remarks?: string }[];
    if (entries.includes("invalid" as any)) return;
    if (entries.length === 0) { toast.error("Nothing to save - enter marks or tick AB"); return; }
    if (typeof console !== "undefined") {
      console.table(entries.map((e) => ({ student: byName.get(e.studentUuid) ?? e.studentUuid, marks: e.marksObtained, absent: e.isAbsent })));
    }
    setSaving(true);
    try {
      const res = await saveBulkMarks(selectedSchedule.uuid, entries);
      if (res.skipped.length > 0) {
        toast.warning(`Saved ${res.saved}, skipped ${res.skipped.length}: ${res.skipped.slice(0, 3).map((s) => `${byName.get(s.studentUuid ?? "") ?? s.studentUuid ?? "?"} (${s.reason})`).join("; ")}${res.skipped.length > 3 ? "..." : ""}`);
      } else {
        toast.success(`Saved ${res.saved} entries - results auto-recomputed`);
      }
      await loadMatrix();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAB = (val: boolean) => {
    const nb: Record<string, { marks: string; isAbsent: boolean; remarks: string }> = {};
    students.forEach((stu) => { nb[stu.studentUuid] = { ...bulk[stu.studentUuid], isAbsent: val, marks: val ? "" : bulk[stu.studentUuid]?.marks ?? "" }; });
    setBulk(nb);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">1 - Search exam</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={examSearch} onChange={(e) => setExamSearch(e.target.value)} placeholder="Type exam or class..." className="pl-9 h-9" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">2 - Exam (class auto-selects)</label>
          <Select value={selectedExamUuid} onValueChange={(v) => setSelectedExamUuid(v)}>
            <SelectTrigger className="h-9"><SelectValue placeholder={loading ? "Loading exams..." : "Select exam"} /></SelectTrigger>
            <SelectContent>
              {filteredExams.map((e) => <SelectItem key={e.uuid} value={e.uuid}>{e.name} - {e.className}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">3 - Section{selectedExam ? ` of ${selectedExam.className}` : ""}</label>
          <Select value={sectionFilter} onValueChange={setSectionFilter} disabled={!selectedExam}>
            <SelectTrigger className="h-9"><SelectValue placeholder="All sections" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All sections</SelectItem>
              {sections.map((s) => <SelectItem key={s.uuid} value={s.name}>{s.name}{s.roomNumber ? ` (${s.roomNumber})` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">4 - Subject slot</label>
          <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId} disabled={!selectedExam}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {schedules.map((s) => (
                <SelectItem key={s.uuid} value={s.uuid}>
                  {s.subject?.name ?? "-"} - {formatDate(s.examDate)} ({s.totalMarks} marks)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedExam && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary">Class: {selectedExam.className}</Badge>
          <Badge variant="outline">{selectedExam.examTypeName}</Badge>
          <Badge variant="outline" className="h-7 px-3">{students.length} students{sectionFilter !== "ALL" ? ` - Section ${sectionFilter}` : ""}</Badge>
        </div>
      )}

      {matrixError && (
        <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{matrixError}</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={loadMatrix}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border/80 bg-card p-6 animate-pulse space-y-3">
          <div className="h-4 w-1/2 bg-muted rounded" /><div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      ) : !selectedExam ? (
        <EmptyState title="Search and pick an exam" description="Type to search your campus exams, then its class auto-selects for section-wise marks entry." />
      ) : !selectedSchedule ? (
        <EmptyState title="No subject slots" description={`No datesheet slots for ${selectedExam.name} yet - add them in the Datesheet tab first.`} />
      ) : matrixLoading ? (
        <div className="rounded-xl border border-border/80 bg-card p-6 animate-pulse space-y-3">
          <div className="h-4 w-1/2 bg-muted rounded" /><div className="h-4 w-2/3 bg-muted rounded" /><div className="h-4 w-1/3 bg-muted rounded" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>AB (Absent) is stored separately from 0 - AB does NOT skew average. Max {selectedSchedule.totalMarks}, Pass {selectedSchedule.passingMarks}. Use Tab to move Excel-style.{!canEnterMarks && " Read-only view (principal)."}</span>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Roll</TableHead><TableHead>Student</TableHead><TableHead className="w-32">Marks (max {selectedSchedule.totalMarks})</TableHead><TableHead className="w-20 text-center">AB</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map((stu, idx) => {
                  const row = bulk[stu.studentUuid] ?? { marks: "", isAbsent: false, remarks: "" };
                  const grade = gradeFor(row.marks, row.isAbsent);
                  return (
                    <TableRow key={stu.studentUuid} className={row.isAbsent ? "bg-amber-500/5" : "hover:bg-muted/30"}>
                      <TableCell className="font-mono text-xs">{stu.rollNo ?? "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{stu.studentName}</div>
                        <div className="text-[11px] text-muted-foreground">{stu.admissionNo}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          ref={(el) => { if (el) inputRefs.current.set(stu.studentUuid, el); }}
                          name={`marks-${stu.studentUuid}`}
                          autoComplete="off"
                          value={row.marks}
                          disabled={row.isAbsent || !canEnterMarks}
                          onChange={(e) => setBulk((p) => ({ ...p, [stu.studentUuid]: { ...row, marks: e.target.value } }))}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); const next = students[idx + 1]; if (next) inputRefs.current.get(next.studentUuid)?.focus(); } }}
                          placeholder={row.isAbsent ? "AB" : "0"}
                          className="h-8 text-sm"
                          type="number"
                          min={0} max={selectedSchedule.totalMarks}
                        />
                      </TableCell>
                      <TableCell className="text-center"><input type="checkbox" disabled={!canEnterMarks} checked={row.isAbsent} onChange={(e) => setBulk((p) => ({ ...p, [stu.studentUuid]: { ...row, isAbsent: (e.target as HTMLInputElement).checked, marks: (e.target as HTMLInputElement).checked ? "" : row.marks } }))} className="h-4 w-4 rounded border" /></TableCell>
                      <TableCell><Badge variant="outline" className="font-mono text-xs">{grade}</Badge></TableCell>
                      <TableCell>{row.isAbsent ? <Badge variant="destructive" className="text-[11px]">AB - FAIL</Badge> : row.marks !== "" ? <Badge variant={Number(row.marks) >= selectedSchedule.passingMarks ? "success" : "destructive"} className="text-[11px]">{Number(row.marks) >= selectedSchedule.passingMarks ? "PASS" : "FAIL"}</Badge> : <Badge variant="secondary" className="text-[11px]">Not marked</Badge>}</TableCell>
                      <TableCell><Input value={row.remarks} disabled={!canEnterMarks} onChange={(e) => setBulk((p) => ({ ...p, [stu.studentUuid]: { ...row, remarks: e.target.value } }))} placeholder="Remark" className="h-8 text-xs" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {students.filter((s) => { const r = bulk[s.studentUuid]; return r && (r.isAbsent || r.marks.trim() !== ""); }).length}/{students.length} marked | {students.filter((s) => bulk[s.studentUuid]?.isAbsent).length} AB (excluded from average)
            </div>
            <div className="flex gap-2">
              {canEnterMarks && <Button variant="outline" onClick={() => handleBulkAB(false)}>Clear AB</Button>}
              <Button variant="outline" onClick={() => { const csv = students.map((stu) => `${stu.rollNo ?? ""},${stu.studentName},${bulk[stu.studentUuid]?.isAbsent ? "AB" : bulk[stu.studentUuid]?.marks ?? ""}`).join("\n"); const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${selectedSchedule.subject?.name ?? "subject"}_marks.csv`; a.click(); toast.success("Excel CSV exported"); }}>Export CSV</Button>
              {canEnterMarks && <Button onClick={handleSave} disabled={saving} className="gap-2"><ClipboardList className="h-4 w-4" />{saving ? "Saving..." : "Save All"}</Button>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


// ------------------------------ Exam Types Tab - pehle yaha create karo, tab Create Exam me ayega ------------------------------
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
  const { activeBranchId } = useERP();
  const campusId = activeBranchId === "all" ? null : activeBranchId;
  const { canManageExam } = useExamPermissions();
  const [types, setTypes] = useState<BackendExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [typesOffline, setTypesOffline] = useState(false);
  const [typesError, setTypesError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendExamType | null>(null);

  // Debounce search before hitting the API.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTypes(await fetchExamTypes({ campusId, search: debouncedSearch || undefined }));
      setTypesOffline(false);
      setTypesError(null);
    } catch (e: any) {
      setTypesOffline(true);
      setTypesError(e?.message || "Failed to load exam types");
    } finally {
      setLoading(false);
    }
  }, [campusId, debouncedSearch]);
  useEffect(() => { refresh(); }, [refresh]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ExamTypeForm>({
    resolver: zodResolver(examTypeSchema),
    defaultValues: { name: "", category: "CUSTOM", description: "", maxMarks: "100", passingMarks: "33", weightage: "10", defaultMode: "BOTH" },
  });
  useEffect(() => {
    if (editing) reset({ name: editing.name, category: editing.category, description: editing.description ?? "", maxMarks: String(editing.maxMarks), passingMarks: String(editing.passingMarks), weightage: String(editing.weightage), defaultMode: editing.defaultMode ?? "BOTH" });
    else reset({ name: "", category: "CUSTOM", description: "", maxMarks: "100", passingMarks: "33", weightage: "10", defaultMode: "BOTH" });
  }, [editing, open, reset]);

  const onSubmit = async (v: ExamTypeForm) => {
    const max = Number(v.maxMarks), pass = Number(v.passingMarks), wt = Number(v.weightage);
    if (pass > max) return toast.error("Passing marks cannot exceed max marks");
    try {
      if (editing) {
        await updateExamTypeApi(editing.uuid, { name: v.name, category: v.category, description: v.description, maxMarks: max, passingMarks: pass, weightage: wt, defaultMode: v.defaultMode });
        toast.success("Exam Type updated");
      } else {
        await createExamTypeApi({ name: v.name, category: v.category, description: v.description, maxMarks: max, passingMarks: pass, weightage: wt, defaultMode: v.defaultMode, campusUuid: campusId ?? undefined }, campusId);
        toast.success("Exam Type created - it now appears in Create Exam");
      }
      setOpen(false); setEditing(null); await refresh();
    } catch (e: any) { toast.error(e?.message || "Save failed"); }
  };

  const remove = async (t: BackendExamType) => {
    if (!confirm(`Deactivate "${t.name}"?`)) return;
    try { await updateExamTypeApi(t.uuid, { isActive: false }); toast.success("Deactivated"); await refresh(); } catch (e: any) { toast.error(e?.message || "Failed"); }
  };

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={typesOffline} error={typesError} isLoading={loading} />
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1 items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exam types..." className="pl-9 h-9" />
          </div>
          <p className="text-xs text-muted-foreground hidden md:block">Types power the <b>Create Exam</b> dropdown and schedules.</p>
        </div>
        {canManageExam && <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Exam Type</Button>}
      </div>
      {!loading && typesError && types.length === 0 && (
        <EmptyState
          title={typesOffline ? "You're offline" : "Couldn't load exam types"}
          description={typesError ?? "Check your connection and retry."}
          actionLabel="Retry"
          onAction={refresh}
        />
      )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Card key={i} className="p-4 animate-pulse"><div className="h-5 w-1/2 bg-muted rounded" /><div className="h-3 w-2/3 bg-muted rounded mt-2" /></Card>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((t) => (
            <Card key={t.uuid} className="p-4 border-border/80 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0"><div className="font-bold text-sm truncate">{t.name}</div><div className="text-xs text-muted-foreground line-clamp-2">{t.description}</div></div>
                <Badge variant="outline" className="text-[11px] shrink-0">{t.category}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div className="p-2 rounded bg-muted/40 text-center"><div className="font-bold">{t.maxMarks}</div><div className="text-muted-foreground text-[11px]">Max</div></div>
                <div className="p-2 rounded bg-muted/40 text-center"><div className="font-bold">{t.passingMarks}</div><div className="text-muted-foreground text-[11px]">Pass</div></div>
                <div className="p-2 rounded bg-muted/40 text-center"><div className="font-bold">{t.weightage}%</div><div className="text-muted-foreground text-[11px]">Weight</div></div>
              </div>
              {canManageExam && (
                <div className="flex gap-1.5 mt-3">
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => { setEditing(t); setOpen(true); }}><Edit3 className="h-3 w-3" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 text-destructive" title="Deactivate" onClick={() => remove(t)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      {!loading && types.length === 0 && !typesError && (
        <EmptyState
          title={debouncedSearch ? "No matching exam types" : "No Exam Types"}
          description={debouncedSearch ? "Try a different search." : canManageExam ? "Create one - then use it in Create Exam." : "No exam types yet."}
        />
      )}

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

// ------------------------------ Results Tab ------------------------------
function ResultsTab({ branchId }: { branchId: string }) {
  const campusId = branchId === "all" ? null : branchId;
  const { canManageExam, canPublish } = useExamPermissions();
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [results, setResults] = useState<BackendResult[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const loadExams = useCallback(async () => {
    try {
      const { items } = await fetchExams({ campusId, limit: 100 });
      setExams(items.map(mapExam));
      setSelectedExamId((prev) => prev || items[0]?.uuid || "");
    } catch (e: any) {
      toast.error(e?.message || "Failed to load exams");
    }
  }, [campusId]);

  const loadResults = useCallback(async (examUuid: string) => {
    if (!examUuid) { setResults([]); return; }
    setLoading(true);
    try {
      const { items } = await fetchResultsApi({ examUuid, limit: 500 });
      setResults(items);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);
  useEffect(() => { loadResults(selectedExamId); }, [selectedExamId, loadResults]);

  const filtered = results.filter((r) => {
    if (!search) return true;
    const name = `${r.student?.firstName ?? ""} ${r.student?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleGenerate = async () => {
    if (!selectedExamId) { toast.error("Select exam"); return; }
    if (results.length > 0 && !confirm(`Regenerate ${results.length} results? Ranks and grades will be recalculated.`)) return;
    setWorking(true);
    try {
      const res = await recomputeExamApi(selectedExamId);
      toast.success(`Generated ${res.recomputed} results (competition ranking 1,1,3)`);
      await loadResults(selectedExamId);
    } catch (e: any) {
      toast.error(e?.message || "Generate failed");
    } finally {
      setWorking(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedExamId) return;
    if (!confirm("Publish results? Students/parents will see them on report cards.")) return;
    setWorking(true);
    try {
      const res = await publishExamApi(selectedExamId);
      toast.success(`Published ${res.published} results`);
      await loadResults(selectedExamId);
    } catch (e: any) {
      toast.error(e?.message || "Publish failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select exam" /></SelectTrigger>
            <SelectContent>{exams.map((e) => <SelectItem key={e.uuid} value={e.uuid}>{e.name} - {e.className}</SelectItem>)}</SelectContent>
          </Select>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="pl-9 h-9" />
          </div>
        </div>
        <div className="flex gap-2">
          {canManageExam && <Button variant="outline" onClick={handleGenerate} disabled={working || !selectedExamId} className="gap-2"><Trophy className="h-4 w-4" />Generate</Button>}
          {canPublish && <Button onClick={handlePublish} disabled={working || !selectedExamId} className="gap-2"><Send className="h-4 w-4" />Publish</Button>}
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
        Formula: Total = sum of papers, Percentage = (obtained / max) - 100, Grade = grading table, Rank = competition ranking (ties share rank, next rank skips - 1,1,3), Pass = every paper - passing marks. Generate recalculates from mark entries; Publish freezes results for report cards.
      </div>

      {loading ? (
        <div className="rounded-xl border border-border/80 bg-card p-6 animate-pulse space-y-3">
          <div className="h-4 w-1/2 bg-muted rounded" /><div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      ) : filtered.length === 0 ? <EmptyState title="No results" description="Enter marks, then click Generate." /> : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">%</TableHead><TableHead>Grade</TableHead><TableHead>CGPA</TableHead><TableHead>Status</TableHead><TableHead>Publish</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.uuid} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-xs">#{r.rank ?? "-"}{filtered.filter((x) => x.percentage === r.percentage).length > 1 && <span className="text-muted-foreground font-normal ml-1">(tie)</span>}</TableCell>
                  <TableCell className="text-sm font-medium">{r.student?.firstName ?? ""} {r.student?.lastName ?? ""}</TableCell>
                  <TableCell className="text-xs">{r.class?.name ?? "-"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{Number(r.marksObtained)} / {r.totalMarks}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-primary">{Number(r.percentage).toFixed(2)}%</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.grade ?? "-"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.gradePoint != null ? Number(r.gradePoint).toFixed(1) : "-"}</TableCell>
                  <TableCell><Badge variant={r.status === "PASS" ? "success" : "destructive"} className="text-[11px]">{r.status}</Badge></TableCell>
                  <TableCell>{r.publishedAt ? <Badge variant="success" className="text-[11px]"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge> : <Badge variant="secondary" className="text-[11px]">Draft</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ------------------------------ Report Cards Tab ------------------------------
// ------------------------------ Report Cards Tab ------------------------------
function ReportCardsTab({ branchId }: { branchId: string }) {
  const campusId = branchId === "all" ? null : branchId;
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [results, setResults] = useState<BackendResult[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selected, setSelected] = useState<BackendResult | null>(null);
  const [template, setTemplate] = useState<"SENIOR" | "PRIMARY">("SENIOR");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams({ campusId, limit: 100 })
      .then(({ items }) => {
        setExams(items.map(mapExam));
        setSelectedExamId((prev) => prev || items[0]?.uuid || "");
      })
      .catch(() => setExams([]));
  }, [campusId]);

  const load = useCallback(async (examUuid: string) => {
    if (!examUuid) { setResults([]); return; }
    setLoading(true);
    try {
      const { items } = await fetchResultsApi({ examUuid, published: true, limit: 500 });
      setResults(items);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load report cards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(selectedExamId); }, [selectedExamId, load]);

  const exportCsv = () => {
    if (results.length === 0) { toast.error("No report cards to export"); return; }
    const heads = ["Student", "Total", "Percentage", "Grade", "Rank", "Status"];
    const lines = results.map((r) => [
      `${r.student?.firstName ?? ""} ${r.student?.lastName ?? ""}`.trim(),
      `${Number(r.marksObtained)}/${r.totalMarks}`,
      Number(r.percentage).toFixed(2),
      r.grade ?? "",
      r.rank ?? "",
      r.status,
    ]);
    const csv = [heads, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-cards.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${results.length} cards`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Select exam" /></SelectTrigger>
            <SelectContent>{exams.map((e) => <SelectItem key={e.uuid} value={e.uuid}>{e.name} - {e.className}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={template} onValueChange={(v) => setTemplate(v as any)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="SENIOR">Senior Template (marks+grade)</SelectItem><SelectItem value="PRIMARY">Primary Template (grade only)</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCsv} className="gap-2"><Download className="h-4 w-4" />Export CSV</Button>
        </div>
        <Badge variant="secondary" className="h-9 px-3">{results.length} published cards</Badge>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Card key={i} className="p-4 animate-pulse"><div className="h-5 w-1/2 bg-muted rounded" /><div className="h-3 w-2/3 bg-muted rounded mt-2" /></Card>)}
        </div>
      ) : results.length === 0 ? <EmptyState title="No report cards" description="Publish results first (Results tab)." icon={<FileBadge className="h-7 w-7" />} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <Card key={r.uuid} className="border-border/80 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div><div className="font-bold text-sm">{r.student?.firstName} {r.student?.lastName}</div><div className="text-xs text-muted-foreground">{r.class?.name ?? "-"}</div></div>
                  <Badge variant={r.status === "PASS" ? "success" : "destructive"} className="text-[11px]">{r.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-muted/40"><div className="font-bold">{Number(r.marksObtained)}/{r.totalMarks}</div><div className="text-muted-foreground">Total</div></div>
                  <div className="p-2 rounded bg-primary/10"><div className="font-bold text-primary">{Number(r.percentage).toFixed(1)}%</div><div className="text-muted-foreground">Percentage</div></div>
                  <div className="p-2 rounded bg-muted/40"><div className="font-bold">{r.grade ?? "-"}</div><div className="text-muted-foreground">Grade</div></div>
                </div>
                <div className="text-xs">Rank <span className="font-bold">#{r.rank ?? "-"}</span> | GPA {r.gradePoint != null ? Number(r.gradePoint).toFixed(1) : "-"}</div>
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
                <h2 className="text-xl font-extrabold">Report Card</h2>
                <p className="text-xs text-muted-foreground">{selected.academicYear} | {selected.exam?.name} | {selected.examType?.name}</p>
                <p className="text-xs mt-2"><span className="font-semibold">{selected.student?.firstName} {selected.student?.lastName}</span> | {selected.class?.name ?? "-"}</p>
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead className="text-right">Marks</TableHead><TableHead className="text-right">%</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(selected.subjectWise ?? []).map((s) => {
                    const pct = s.total > 0 ? (Number(s.obtained) / s.total) * 100 : 0;
                    return (
                      <TableRow key={s.scheduleUuid}>
                        <TableCell className="text-sm">{s.subject ?? "-"}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{Number(s.obtained)}/{s.total}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{template === "PRIMARY" ? "-" : `${pct.toFixed(1)}%`}</TableCell>
                        <TableCell><Badge variant={s.status === "PASS" ? "success" : s.status === "ABSENT" ? "warning" : "destructive"} className="text-[10px]">{s.status}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-muted/40 font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{Number(selected.marksObtained)}/{selected.totalMarks}</TableCell><TableCell className="text-right">{Number(selected.percentage).toFixed(2)}%</TableCell><TableCell>{selected.status}</TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded bg-muted/40"><div className="text-muted-foreground">Rank</div><div className="font-bold text-lg">#{selected.rank ?? "-"}</div><div className="text-muted-foreground">Grade {selected.grade ?? "-"} | GPA {selected.gradePoint != null ? Number(selected.gradePoint).toFixed(1) : "-"}</div></div>
                <div className="p-3 rounded bg-muted/40"><div className="text-muted-foreground">Remarks</div><div className="font-medium">{selected.remarks ?? "-"}</div></div>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground pt-4 border-t">
                <span>Class Teacher Signature</span><span>Principal Signature</span><span>Published: {selected.publishedAt ? formatDate(selected.publishedAt) : "-"}</span>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => window.print()} className="gap-2"><FileText className="h-4 w-4" />Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ------------------------------ Analytics Tab ------------------------------
// ------------------------------ Analytics Tab ------------------------------
function AnalyticsTab({ branchId }: { branchId: string }) {
  const campusId = branchId === "all" ? null : branchId;
  const [exams, setExams] = useState<DisplayExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams({ campusId, limit: 100 })
      .then(({ items }) => {
        setExams(items.map(mapExam));
        setSelectedExamId((prev) => prev || items[0]?.uuid || "");
      })
      .catch(() => setExams([]));
  }, [campusId]);

  useEffect(() => {
    if (!selectedExamId) { setAnalytics(null); setLoading(false); return; }
    setLoading(true);
    fetchExamAnalytics(selectedExamId)
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [selectedExamId]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="w-72"><SelectValue placeholder="Select exam" /></SelectTrigger>
          <SelectContent>{exams.map((e) => <SelectItem key={e.uuid} value={e.uuid}>{e.name} - {e.className}</SelectItem>)}</SelectContent>
        </Select>
        {selectedExamId && (
          <Button variant="outline" size="sm" onClick={() => { window.location.href = `/exams/${selectedExamId}`; }} className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />Open Detail
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Card key={i} className="p-4 animate-pulse"><div className="h-6 w-16 bg-muted rounded" /></Card>)}
        </div>
      ) : !analytics ? (
        <EmptyState title="No analytics" description="Select an exam with entered marks." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Enrolled</div><div className="text-2xl font-bold">{analytics.summary.enrolled}</div></Card>
            <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Appeared</div><div className="text-2xl font-bold">{analytics.summary.appeared}</div></Card>
            <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Absent</div><div className="text-2xl font-bold text-amber-600">{analytics.summary.absent}</div></Card>
            <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Pass Rate</div><div className="text-2xl font-bold text-emerald-600">{analytics.summary.passRate}%</div></Card>
            <Card className="p-4"><div className="text-[11px] text-muted-foreground uppercase">Class Avg</div><div className="text-2xl font-bold text-primary">{analytics.summary.averagePercentage}%</div></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <CardTitle className="text-sm mb-3">Grade Distribution</CardTitle>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="grade" fontSize={11} />
                    <YAxis allowDecimals={false} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-4">
              <CardTitle className="text-sm mb-3">Subject Performance (avg)</CardTitle>
              <div className="space-y-3">
                {analytics.subjects.map((s) => (
                  <div key={s.scheduleUuid} className="flex items-center gap-3">
                    <span className="w-32 text-sm font-medium truncate">{s.subject ?? "-"}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (s.average / (s.totalMarks || 100)) * 100)}%` }} /></div>
                    <span className="w-14 text-xs font-mono text-right">{s.average}</span>
                    <span className="w-20 text-xs text-muted-foreground">{s.passRate}% pass</span>
                  </div>
                ))}
                {analytics.subjects.length === 0 && <p className="text-sm text-muted-foreground">No subject data yet.</p>}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <CardTitle className="text-sm mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" />Toppers</CardTitle>
            {analytics.toppers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No graded students yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {analytics.toppers.map((t) => (
                  <div key={t.studentUuid} className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center">
                    <div className="text-lg font-extrabold text-primary">#{t.rank ?? "-"}</div>
                    <div className="text-sm font-semibold truncate">{t.studentName}</div>
                    <div className="text-xs text-muted-foreground">{t.percentage}% {t.grade ? `| ${t.grade}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}


// ------------------------------ Grading Tab ------------------------------
function GradingTab() {
  const { activeBranchId } = useERP();
  const campusId = activeBranchId === "all" ? null : activeBranchId;
  const [scales, setScales] = useState<BackendGradeScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendGradeScale | null>(null);
  const [form, setForm] = useState({ grade: "", minPercent: "", maxPercent: "", gradePoint: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setScales(await fetchGradeScales(campusId));
    } catch (e: any) {
      toast.error(e?.message || "Failed to load grading table");
    } finally {
      setLoading(false);
    }
  }, [campusId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ grade: "", minPercent: "", maxPercent: "", gradePoint: "", description: "" }); setOpen(true); };
  const openEdit = (s: BackendGradeScale) => {
    setEditing(s);
    setForm({ grade: s.grade, minPercent: String(s.minPercent), maxPercent: String(s.maxPercent), gradePoint: String(s.gradePoint), description: s.description ?? "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.grade || form.minPercent === "" || form.maxPercent === "" || form.gradePoint === "") { toast.error("Grade, min %, max %, GPA required"); return; }
    try {
      await upsertGradeScaleApi({
        grade: form.grade.toUpperCase(),
        minPercent: Number(form.minPercent),
        maxPercent: Number(form.maxPercent),
        gradePoint: Number(form.gradePoint),
        description: form.description || undefined,
      });
      toast.success(editing ? "Grade updated" : "Grade created");
      setOpen(false); await load();
    } catch (e: any) { toast.error(e?.message || "Save failed"); }
  };

  const remove = async (s: BackendGradeScale) => {
    if (!confirm(`Delete grade ${s.grade}?`)) return;
    try { await deleteGradeScaleApi(s.uuid); toast.success("Deleted"); await load(); } catch (e: any) { toast.error(e?.message); }
  };

  const seed = async () => {
    try { const r = await seedDefaultGradeScales(campusId); toast.success(`Seeded ${r.length} standard grades`); await load(); } catch (e: any) { toast.error(e?.message || "Seed failed"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex-1">
          Grade scale applies to overall percentage. Passing marks per subject are set in Datesheet. Auto-grade is computed from these intervals.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={seed} className="gap-1.5"><Settings2 className="h-4 w-4" />Seed Default</Button>
          <Button onClick={openAdd} className="gap-1.5"><Plus className="h-4 w-4" />Add Grade</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Card key={i} className="p-4 animate-pulse"><div className="h-8 w-12 bg-muted rounded" /><div className="h-3 w-24 bg-muted rounded mt-2" /></Card>)}
        </div>
      ) : scales.length === 0 ? (
        <EmptyState title="No grading table" description="Click 'Seed Default' for the standard 8-tier CBSE scale, or add grades manually." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scales.map((s) => (
            <Card key={s.uuid} className="p-4 border-border/70">
              <div className="flex justify-between items-start">
                <span className="text-2xl font-extrabold text-primary">{s.grade}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(s)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(s)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="text-xs font-mono text-muted-foreground mt-2">{s.minPercent}% - {s.maxPercent}%</div>
              <Badge variant="outline" className="text-[10px] mt-1">GPA {s.gradePoint}</Badge>
              <div className="text-xs text-muted-foreground mt-1">{s.description}</div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Grade" : "Add Grade"}</DialogTitle><DialogDescription>Percentage interval with GPA. 91-100 = A1 (10), 81-90 = A2 (9)...</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Grade *</label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="A1" /></div>
              <div><label className="text-sm font-medium">GPA *</label><Input type="number" step="0.1" value={form.gradePoint} onChange={(e) => setForm({ ...form, gradePoint: e.target.value })} placeholder="10" /></div>
              <div><label className="text-sm font-medium">Min % *</label><Input type="number" step="0.01" value={form.minPercent} onChange={(e) => setForm({ ...form, minPercent: e.target.value })} placeholder="91" /></div>
              <div><label className="text-sm font-medium">Max % *</label><Input type="number" step="0.01" value={form.maxPercent} onChange={(e) => setForm({ ...form, maxPercent: e.target.value })} placeholder="100" /></div>
            </div>
            <div><label className="text-sm font-medium">Description</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Outstanding" /></div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? "Update" : "Add"}</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
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
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Optional Subjects</div><div className="text-xs text-muted-foreground mt-1">Mark subject as optional in timetable; excluded from total/percentage - shown separately on card.</div></div>
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Historical Preservation</div><div className="text-xs text-muted-foreground mt-1">Promotion does not mutate old results - class snapshot stored at generation. Subject mapping changes don-t retroactively alter past exams.</div></div>
          <div className="p-4 rounded-xl bg-muted/40 border"><div className="font-semibold">Marks Correction</div><div className="text-xs text-muted-foreground mt-1">After LOCKED, correction requires reason + history entry; triggers recalculation and report card versioning.</div></div>
        </div>
      </Card>
    </div>
  );
}
