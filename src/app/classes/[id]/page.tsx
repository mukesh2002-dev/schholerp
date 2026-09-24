"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ClassRoom } from "@/types";
import { fetchClassByUuid, deleteClassApi } from "@/lib/api/classes";
import { fetchSections, deleteSectionApi, BackendSection } from "@/lib/api/sections";
import { fetchClassSubjects, deleteClassSubjectApi, BackendClassSubject } from "@/lib/api/classSubjects";
import { fetchChapters, createChapterApi, updateChapterApi, deleteChapterApi, BackendChapter } from "@/lib/api/chapters";
import { fetchTopics, createTopicApi, updateTopicApi, deleteTopicApi, BackendTopic } from "@/lib/api/topics";
import { SectionFormDialog } from "@/components/classes/section-form-dialog";
import { AssignSubjectDialog } from "@/components/classes/assign-subject-dialog";
import { ClassFormDialog } from "@/components/classes/class-form-dialog";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import {
  UserCheck,
  ArrowLeft,
  GraduationCap,
  DoorClosed,
  Layers,
  FileText,
  Hash,
  Users,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  School,
  Calendar,
} from "lucide-react";

export default function ClassDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const classId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";

  const [classInfo, setClassInfo] = useState<ClassRoom | null>(null);
  const [sections, setSections] = useState<BackendSection[]>([]);
  const [classSubjects, setClassSubjects] = useState<BackendClassSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sections");

  // Selected subject for expanded syllabus view
  const [expandedSubjectUuid, setExpandedSubjectUuid] = useState<string | null>(null);
  const [chapters, setChapters] = useState<BackendChapter[]>([]);
  const [topics, setTopics] = useState<BackendTopic[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  // Dialog states
  const [editClassOpen, setEditClassOpen] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<BackendSection | null>(null);
  const [assignSubjectOpen, setAssignSubjectOpen] = useState(false);
  const [newMasterSubjectOpen, setNewMasterSubjectOpen] = useState(false);

  // Chapter dialog
  const [chapterOpen, setChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<BackendChapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ subjectId: "", title: "", description: "", chapterNumber: 1, status: "ACTIVE" });

  // Topic dialog
  const [topicOpen, setTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<BackendTopic | null>(null);
  const [topicForm, setTopicForm] = useState({ chapterId: "", title: "", description: "", topicOrder: 1, estimatedClasses: 1, status: "ACTIVE" });

  const loadData = useCallback(async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const [cls, secRes, csRes] = await Promise.all([
        fetchClassByUuid(classId),
        fetchSections({ classId, limit: 100 }),
        fetchClassSubjects({ classId, limit: 100 }),
      ]);
      setClassInfo(cls);
      setSections(secRes.data || []);
      setClassSubjects(csRes.data || []);
    } catch {
      toast.error("Failed to load class information");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    loadData();

    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("sections:refresh", handleRefresh);
    window.addEventListener("class-subjects:refresh", handleRefresh);
    window.addEventListener("classes:refresh", handleRefresh);

    return () => {
      window.removeEventListener("sections:refresh", handleRefresh);
      window.removeEventListener("class-subjects:refresh", handleRefresh);
      window.removeEventListener("classes:refresh", handleRefresh);
    };
  }, [loadData]);

  // Load chapters & topics when a subject is expanded
  const loadSyllabus = useCallback(async (subjectUuid: string) => {
    try {
      setLoadingSyllabus(true);
      const [chapRes, topRes] = await Promise.all([
        fetchChapters({ subjectId: subjectUuid, limit: 100 }),
        fetchTopics({ subjectId: subjectUuid, limit: 200 }),
      ]);
      setChapters(chapRes.data || []);
      setTopics(topRes.data || []);
    } catch {
      toast.error("Failed to load subject syllabus");
    } finally {
      setLoadingSyllabus(false);
    }
  }, []);

  const handleToggleSubject = (subjectUuid: string) => {
    if (expandedSubjectUuid === subjectUuid) {
      setExpandedSubjectUuid(null);
    } else {
      setExpandedSubjectUuid(subjectUuid);
      loadSyllabus(subjectUuid);
    }
  };

  const handleDeleteClass = async () => {
    if (!classInfo) return;
    if (!confirm(`Are you sure you want to delete class "${classInfo.name}"? This action cannot be undone.`)) return;
    try {
      await deleteClassApi(classInfo.id);
      toast.success(`Class "${classInfo.name}" deleted`);
      router.push("/academics");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete class");
    }
  };

  const handleDeleteSection = async (sec: BackendSection) => {
    if (!confirm(`Are you sure you want to delete Section "${sec.name}"?`)) return;
    try {
      await deleteSectionApi(sec.uuid);
      toast.success(`Section "${sec.name}" deleted`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete section");
    }
  };

  const handleUnassignSubject = async (cs: BackendClassSubject) => {
    const subName = cs.subject?.name || "Subject";
    if (!confirm(`Unassign "${subName}" from this class?`)) return;
    try {
      await deleteClassSubjectApi(cs.uuid);
      toast.success(`Unassigned "${subName}"`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to unassign subject");
    }
  };

  // Chapter CRUD
  const handleSaveChapter = async () => {
    if (!chapterForm.title.trim()) {
      toast.error("Chapter title is required");
      return;
    }
    try {
      if (editingChapter) {
        await updateChapterApi(editingChapter.uuid, chapterForm);
        toast.success("Chapter updated");
      } else {
        await createChapterApi(chapterForm);
        toast.success("Chapter created");
      }
      setChapterOpen(false);
      setEditingChapter(null);
      if (expandedSubjectUuid) loadSyllabus(expandedSubjectUuid);
      window.dispatchEvent(new Event("chapters:refresh"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to save chapter");
    }
  };

  const handleDeleteChapter = async (chap: BackendChapter) => {
    if (!confirm(`Delete chapter "${chap.title}" and its topics?`)) return;
    try {
      await deleteChapterApi(chap.uuid);
      toast.success("Chapter deleted");
      if (expandedSubjectUuid) loadSyllabus(expandedSubjectUuid);
      window.dispatchEvent(new Event("chapters:refresh"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete chapter");
    }
  };

  // Topic CRUD
  const handleSaveTopic = async () => {
    if (!topicForm.title.trim()) {
      toast.error("Topic title is required");
      return;
    }
    try {
      if (editingTopic) {
        await updateTopicApi(editingTopic.uuid, topicForm);
        toast.success("Topic updated");
      } else {
        await createTopicApi(topicForm);
        toast.success("Topic created");
      }
      setTopicOpen(false);
      setEditingTopic(null);
      if (expandedSubjectUuid) loadSyllabus(expandedSubjectUuid);
      window.dispatchEvent(new Event("topics:refresh"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to save topic");
    }
  };

  const handleDeleteTopic = async (top: BackendTopic) => {
    if (!confirm(`Delete topic "${top.title}"?`)) return;
    try {
      await deleteTopicApi(top.uuid);
      toast.success("Topic deleted");
      if (expandedSubjectUuid) loadSyllabus(expandedSubjectUuid);
      window.dispatchEvent(new Event("topics:refresh"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete topic");
    }
  };

  if (loading && !classInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading academic class hierarchy...</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="p-6">
        <EmptyState
          title="Class Not Found"
          description="The requested academic class could not be found or has been removed."
          actionLabel="Return to Academics"
          onAction={() => router.push("/academics")}
        />
      </div>
    );
  }

  const totalCapacity = sections.reduce((acc, s) => acc + (s.capacity || 0), 0) || classInfo.capacity || 40;
  const totalStudents = sections.reduce((acc, s) => acc + (s.studentCount || 0), 0) || classInfo.totalStudents || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top navigation & breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/academics"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Academic Structure</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <School className="h-3 w-3" />
            {classInfo.branchName}
          </Badge>
          {classInfo.academicYear && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Calendar className="h-3 w-3" />
              {classInfo.academicYear}
            </Badge>
          )}
        </div>
      </div>

      {/* Main Class Header Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {classInfo.name}
                </h1>
                <Badge variant={classInfo.status === "Active" ? "default" : "outline"} className="text-xs">
                  {classInfo.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {classInfo.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                {classInfo.description || "Class and section hierarchy. Define syllabus, subjects, chapters, and learning topics."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => setAddSectionOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Section</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => setAssignSubjectOpen(true)}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Assign Subject</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => setEditClassOpen(true)}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Class</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-9 text-destructive hover:bg-destructive/10"
                onClick={handleDeleteClass}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <DoorClosed className="h-3.5 w-3.5 text-blue-500" />
                Sections
              </span>
              <p className="text-xl font-bold text-foreground">{sections.length}</p>
              <span className="text-[11px] text-muted-foreground">
                {sections.map((s) => s.name).join(", ") || "No sections"}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-purple-500" />
                Assigned Subjects
              </span>
              <p className="text-xl font-bold text-foreground">{classSubjects.length}</p>
              <span className="text-[11px] text-muted-foreground">
                Mapped to syllabus
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-emerald-500" />
                Students
              </span>
              <p className="text-xl font-bold text-foreground">{totalStudents}</p>
              <span className="text-[11px] text-muted-foreground">
                Enrolled students
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-amber-500" />
                Capacity
              </span>
              <p className="text-xl font-bold text-foreground">{totalCapacity}</p>
              <span className="text-[11px] text-muted-foreground">
                Total student quota
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Sections, Subjects & Syllabus, Overview */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md bg-muted/60">
          <TabsTrigger value="sections" className="text-xs gap-1.5">
            <DoorClosed className="h-3.5 w-3.5" />
            <span>Sections ({sections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>Subjects ({classSubjects.length})</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Overview</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. SECTIONS TAB */}
        <TabsContent value="sections" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Class Sections</h3>
              <p className="text-xs text-muted-foreground">
                Manage divisions (Section A, B, C), room assignments, and class teachers.
              </p>
            </div>
            <Button
              size="sm"
              variant="gradient"
              className="h-8 text-xs gap-1"
              onClick={() => {
                setEditingSection(null);
                setAddSectionOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Section</span>
            </Button>
          </div>

          {sections.length === 0 ? (
            <EmptyState
              title="No Sections Found"
              description="Create Section A or additional sections for this class."
              actionLabel="Add Section"
              onAction={() => {
                setEditingSection(null);
                setAddSectionOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((sec) => (
                <Card
                  key={sec.uuid}
                  className="border-border/70 hover:border-primary/40 hover:shadow-xs transition-all"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <DoorClosed className="h-4 w-4 text-blue-500" />
                          {sec.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {sec.roomNumber ? `Room: ${sec.roomNumber}` : "No room assigned"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={sec.status === "ACTIVE" ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {sec.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Class Teacher:</span>
                        <span className="font-medium text-foreground">
                          {sec.classTeacher?.name ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                              <UserCheck className="h-3.5 w-3.5 shrink-0" />
                              <span>{sec.classTeacher.name}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Unassigned</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium text-foreground">
                          {sec.studentCount ?? 0} / {sec.capacity ?? 40} students
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setEditingSection(sec);
                          setAddSectionOpen(true);
                        }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteSection(sec)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 2. SUBJECTS & SYLLABUS TAB */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Assigned Subjects & Syllabus</h3>
              <p className="text-xs text-muted-foreground">
                Class → Subject → Chapter → Topic hierarchy. Expand any subject to manage chapters and learning topics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1"
                onClick={() => setNewMasterSubjectOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Master Subject</span>
              </Button>
              <Button
                size="sm"
                variant="gradient"
                className="h-8 text-xs gap-1"
                onClick={() => setAssignSubjectOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Assign Subject</span>
              </Button>
            </div>
          </div>

          {classSubjects.length === 0 ? (
            <EmptyState
              title="No Subjects Assigned"
              description="Assign reusable master subjects (Mathematics, Science, etc.) to this class."
              actionLabel="Assign Subject"
              onAction={() => setAssignSubjectOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {classSubjects.map((cs) => {
                const subUuid = cs.subjectId || (cs.subject as any)?.uuid || (cs.subject as any)?.id;
                const isExpanded = expandedSubjectUuid === subUuid;

                return (
                  <Card
                    key={cs.uuid}
                    className="border-border/80 bg-card overflow-hidden shadow-2xs"
                  >
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => subUuid && handleToggleSubject(subUuid)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              {cs.subject?.name || "Unnamed Subject"}
                            </span>
                            {cs.subject?.code && (
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {cs.subject.code}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              {cs.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span>Teacher: {cs.teacher?.name || "Unassigned"}</span>
                            <span>•</span>
                            <span>Max Marks: {cs.maxMarks ?? 100}</span>
                            <span>•</span>
                            <span>Pass: {cs.passingMarks ?? 33}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => subUuid && handleToggleSubject(subUuid)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>{isExpanded ? "Hide Syllabus" : "View Syllabus"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => handleUnassignSubject(cs)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* EXPANDED SYLLABUS: CHAPTERS & TOPICS */}
                    {isExpanded && (
                      <div className="p-4 bg-muted/20 border-t border-border/60 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            Curriculum Chapters ({chapters.length})
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              setEditingChapter(null);
                              setChapterForm({
                                subjectId: subUuid,
                                title: "",
                                description: "",
                                chapterNumber: chapters.length + 1,
                                status: "ACTIVE",
                              });
                              setChapterOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Chapter</span>
                          </Button>
                        </div>

                        {loadingSyllabus ? (
                          <div className="py-6 text-center text-xs text-muted-foreground">
                            Loading curriculum units...
                          </div>
                        ) : chapters.length === 0 ? (
                          <div className="p-6 rounded-lg border border-dashed border-border/70 text-center">
                            <p className="text-xs text-muted-foreground">
                              No chapters defined yet for {cs.subject?.name}. Add chapters (e.g. Ch 1: Real Numbers) to structure topics.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chapters.map((chap) => {
                              const chapTopics = topics.filter((t) => t.chapterId === chap.uuid);
                              return (
                                <Card
                                  key={chap.uuid}
                                  className="border-border/70 bg-card/60 shadow-2xs"
                                >
                                  <CardHeader className="p-3 pb-2">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-xs font-bold text-foreground">
                                          Chapter {chap.chapterNumber}: {chap.title}
                                        </CardTitle>
                                        {chap.description && (
                                          <CardDescription className="text-[11px] mt-0.5">
                                            {chap.description}
                                          </CardDescription>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 text-[11px] gap-1"
                                          onClick={() => {
                                            setEditingTopic(null);
                                            setTopicForm({
                                              chapterId: chap.uuid,
                                              title: "",
                                              description: "",
                                              topicOrder: chapTopics.length + 1,
                                              estimatedClasses: 1,
                                              status: "ACTIVE",
                                            });
                                            setTopicOpen(true);
                                          }}
                                        >
                                          <Plus className="h-3 w-3" />
                                          <span>Add Topic</span>
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            setEditingChapter(chap);
                                            setChapterForm({
                                              subjectId: chap.subjectId || subUuid,
                                              title: chap.title,
                                              description: chap.description || "",
                                              chapterNumber: chap.chapterNumber,
                                              status: chap.status,
                                            });
                                            setChapterOpen(true);
                                          }}
                                        >
                                          <Edit3 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                          onClick={() => handleDeleteChapter(chap)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>

                                  {/* Topics List */}
                                  <CardContent className="p-3 pt-1">
                                    {chapTopics.length === 0 ? (
                                      <p className="text-[11px] text-muted-foreground italic">
                                        No topics added yet. Click &quot;Add Topic&quot; to define concepts.
                                      </p>
                                    ) : (
                                      <div className="space-y-1.5 pl-2 border-l-2 border-primary/30">
                                        {chapTopics.map((top) => (
                                          <div
                                            key={top.uuid}
                                            className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="font-semibold text-primary text-[11px]">
                                                {chap.chapterNumber}.{top.topicOrder}
                                              </span>
                                              <span className="text-foreground">{top.title}</span>
                                              {top.estimatedClasses && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-[9px] py-0 px-1"
                                                >
                                                  {top.estimatedClasses} classes
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-5 w-5 p-0"
                                                onClick={() => {
                                                  setEditingTopic(top);
                                                  setTopicForm({
                                                    chapterId: top.chapterId || chap.uuid,
                                                    title: top.title,
                                                    description: top.description || "",
                                                    topicOrder: top.topicOrder,
                                                    estimatedClasses: top.estimatedClasses || 1,
                                                    status: top.status,
                                                  });
                                                  setTopicOpen(true);
                                                }}
                                              >
                                                <Edit3 className="h-2.5 w-2.5" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-5 w-5 p-0 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteTopic(top)}
                                              >
                                                <Trash2 className="h-2.5 w-2.5" />
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* 3. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-bold">Class Specifications</CardTitle>
              <CardDescription>Academic and structural parameters for this grade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Class Name:</span>
                  <p className="font-semibold text-foreground text-sm">{classInfo.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Grade Level:</span>
                  <p className="font-semibold text-foreground text-sm">Grade {classInfo.gradeLevel}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-semibold text-foreground text-sm">{classInfo.category}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Campus Branch:</span>
                  <p className="font-semibold text-foreground text-sm">{classInfo.branchName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Academic Year:</span>
                  <p className="font-semibold text-foreground text-sm">{classInfo.academicYear || "Default"}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-semibold text-foreground text-sm">{classInfo.status}</p>
                </div>
              </div>

              {classInfo.description && (
                <div className="pt-4 border-t border-border/60">
                  <span className="text-xs text-muted-foreground block mb-1">Description / Curriculum Notes:</span>
                  <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg">
                    {classInfo.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <ClassFormDialog
        open={editClassOpen}
        onOpenChange={setEditClassOpen}
        editingClass={classInfo}
        onSuccess={loadData}
      />

      <SectionFormDialog
        open={addSectionOpen}
        onOpenChange={setAddSectionOpen}
        classId={classInfo.id}
        className={classInfo.name}
        editingSection={editingSection}
        onSuccess={loadData}
      />

      <AssignSubjectDialog
        open={assignSubjectOpen}
        onOpenChange={setAssignSubjectOpen}
        classId={classInfo.id}
        className={classInfo.name}
        onSuccess={loadData}
      />

      <SubjectFormDialog
        open={newMasterSubjectOpen}
        onOpenChange={setNewMasterSubjectOpen}
        initialClassId={classInfo?.id}
        classes={classInfo ? [{ id: classInfo.id, name: classInfo.name }] : []}
        onSuccess={loadData}
      />

      {/* Chapter Dialog */}
      <Dialog open={chapterOpen} onOpenChange={setChapterOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingChapter ? "Edit Chapter" : "Add Chapter"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Chapter Number *</label>
              <Input
                type="number"
                value={chapterForm.chapterNumber}
                onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: Number(e.target.value) })}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Chapter Title *</label>
              <Input
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                placeholder="e.g. Real Numbers"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
              <Textarea
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                placeholder="Curriculum overview for this unit"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChapterOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSaveChapter}>
              {editingChapter ? "Update Chapter" : "Save Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog open={topicOpen} onOpenChange={setTopicOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingTopic ? "Edit Topic" : "Add Topic"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Topic Order *</label>
                <Input
                  type="number"
                  value={topicForm.topicOrder}
                  onChange={(e) => setTopicForm({ ...topicForm, topicOrder: Number(e.target.value) })}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Est. Classes</label>
                <Input
                  type="number"
                  value={topicForm.estimatedClasses}
                  onChange={(e) => setTopicForm({ ...topicForm, estimatedClasses: Number(e.target.value) })}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Topic Title *</label>
              <Input
                value={topicForm.title}
                onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                placeholder="e.g. Euclid's Division Lemma"
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
              <Textarea
                value={topicForm.description}
                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                placeholder="Learning milestones, theorem proofs, homework focus"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTopicOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSaveTopic}>
              {editingTopic ? "Update Topic" : "Save Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
