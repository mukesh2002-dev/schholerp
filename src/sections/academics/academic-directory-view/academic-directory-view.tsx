"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { ClassRoom, Subject } from "@/types";
import { apiFetch } from "@/lib/api/client";
import { fetchClasses, deleteClassApi, fetchSubjects, deleteSubjectApi } from "@/lib/api/classes";
import { fetchChapters, createChapterApi, updateChapterApi, deleteChapterApi, BackendChapter } from "@/lib/api/chapters";
import { fetchTopics, createTopicApi, updateTopicApi, deleteTopicApi, BackendTopic } from "@/lib/api/topics";
import { fetchClassSubjects, deleteClassSubjectApi } from "@/lib/api/classSubjects";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { canMutateAcademics } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Layers, FileText, Hash, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { ClassFormDialog } from "@/components/classes/class-form-dialog";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { AssignSubjectDialog } from "@/components/classes/assign-subject-dialog";

// Modular Tab Components
import { ClassesTab } from "./tabs/classes-tab";
import { SubjectsTab } from "./tabs/subjects-tab";
import { ChaptersTab } from "./tabs/chapters-tab";
import { TopicsTab } from "./tabs/topics-tab";
import { MappingsTab } from "./tabs/mappings-tab";

export function AcademicDirectoryView() {
  const { activeBranchId, session } = useERP();
  const canEdit = canMutateAcademics(session.role);
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const initialTab = tabParam && ["classes", "subjects", "chapters", "topics", "mappings"].includes(tabParam)
    ? tabParam
    : "classes";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["classes", initialTab]));

  // Sync tab with URL query parameter
  useEffect(() => {
    if (tabParam && ["classes", "subjects", "chapters", "topics", "mappings"].includes(tabParam)) {
      setActiveTab(tabParam);
      setVisitedTabs((prev) => new Set([...prev, tabParam]));
    }
  }, [tabParam]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setVisitedTabs((prev) => new Set([...prev, val]));
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (val === "classes") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", val);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [chapterFilter, setChapterFilter] = useState<string>("ALL");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("ALL");

  // Dialog states
  const [classOpen, setClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [subjectOpen, setSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any | null>(null);

  const [chapterOpen, setChapterOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<BackendChapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ subjectId: "", title: "", description: "", chapterNumber: 1, status: "ACTIVE" });

  const [topicOpen, setTopicOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<BackendTopic | null>(null);
  const [topicForm, setTopicForm] = useState({ chapterId: "", title: "", description: "", topicOrder: 1, estimatedClasses: 1, status: "ACTIVE" });

  const [assignOpen, setAssignOpen] = useState(false);

  // Data fetches with Tab Lazy Loading
  const { data: academicYears } = useCampusData<any[]>({
    fetcher: async () => {
      try {
        const r = await apiFetch<{ data: any[] }>(`/academics/academic-years`);
        return Array.isArray(r?.data) ? r.data : [];
      } catch {
        return [];
      }
    },
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "academic-years",
  });

  const {
    data: classes,
    isLoading: classesLoading,
    isOffline: classesOffline,
    error: classesError,
    refresh: refreshClasses,
  } = useCampusData<ClassRoom[]>({
    fetcher: (cid: string | null) =>
      fetchClasses({
        campusId: cid,
        academicYearId: academicYearFilter !== "ALL" ? academicYearFilter : undefined,
      } as any),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: `classes-${academicYearFilter}`,
  });

  const {
    data: subjectsRaw,
    isLoading: subjectsLoading,
    isOffline: subjectsOffline,
    error: subjectsError,
    refresh: refreshSubjects,
  } = useCampusData<any[]>({
    fetcher: (cid: string | null) => {
      if (!visitedTabs.has("subjects") && !visitedTabs.has("topics") && !visitedTabs.has("chapters")) return Promise.resolve([]);
      return fetchSubjects({ campusId: cid, limit: 500 } as any).then((r: any) => (Array.isArray(r) ? r : []));
    },
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "subjects",
  });
  const subjects = subjectsRaw as unknown as (Subject & { id: string; code?: string; subjectType?: string })[];

  const {
    data: chaptersRes,
    isLoading: chaptersLoading,
    isOffline: chaptersOffline,
    error: chaptersError,
    refresh: refreshChapters,
  } = useCampusData<{ data: BackendChapter[] }>({
    fetcher: async (cid: string | null) => {
      if (!visitedTabs.has("chapters") && !visitedTabs.has("topics")) return { data: [], total: 0 };
      return await fetchChapters({
        search: search || undefined,
        classId: classFilter !== "ALL" ? classFilter : undefined,
        subjectId: subjectFilter !== "ALL" ? subjectFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        campusId: cid,
        limit: 200,
      });
    },
    campusId: activeBranchId,
    fallback: { data: [] },
    queryKeyPrefix: `chapters-${classFilter}-${subjectFilter}-${statusFilter}-${search}`,
  });

  const {
    data: topicsRes,
    isLoading: topicsLoading,
    isOffline: topicsOffline,
    error: topicsError,
    refresh: refreshTopics,
  } = useCampusData<{ data: BackendTopic[] }>({
    fetcher: async (cid: string | null) => {
      if (!visitedTabs.has("topics")) return { data: [], total: 0 };
      return await fetchTopics({
        search: search || undefined,
        classId: classFilter !== "ALL" ? classFilter : undefined,
        chapterId: chapterFilter !== "ALL" ? chapterFilter : undefined,
        subjectId: subjectFilter !== "ALL" && chapterFilter === "ALL" ? subjectFilter : undefined,
        campusId: cid,
        limit: 200,
      });
    },
    campusId: activeBranchId,
    fallback: { data: [] },
    queryKeyPrefix: `topics-${classFilter}-${chapterFilter}-${subjectFilter}-${search}`,
  });

  const { data: csRes, refresh: refreshCS } = useCampusData<{ data: any[] }>({
    fetcher: async (cid: string | null) => {
      if (!visitedTabs.has("mappings")) return { data: [], total: 0 };
      return await fetchClassSubjects({
        classId: classFilter !== "ALL" ? classFilter : undefined,
        campusId: cid,
        limit: 100,
      });
    },
    campusId: activeBranchId,
    fallback: { data: [] },
    queryKeyPrefix: `cs-${classFilter}`,
  });

  // Global listeners for instant updates
  useEffect(() => {
    const handleClassesRefresh = () => refreshClasses();
    const handleSubjectsRefresh = () => refreshSubjects();
    const handleChaptersRefresh = () => refreshChapters();
    const handleTopicsRefresh = () => refreshTopics();
    const handleCSRefresh = () => refreshCS();

    window.addEventListener("classes:refresh", handleClassesRefresh);
    window.addEventListener("subjects:refresh", handleSubjectsRefresh);
    window.addEventListener("chapters:refresh", handleChaptersRefresh);
    window.addEventListener("topics:refresh", handleTopicsRefresh);
    window.addEventListener("class-subjects:refresh", handleCSRefresh);

    return () => {
      window.removeEventListener("classes:refresh", handleClassesRefresh);
      window.removeEventListener("subjects:refresh", handleSubjectsRefresh);
      window.removeEventListener("chapters:refresh", handleChaptersRefresh);
      window.removeEventListener("topics:refresh", handleTopicsRefresh);
      window.removeEventListener("class-subjects:refresh", handleCSRefresh);
    };
  }, [refreshClasses, refreshSubjects, refreshChapters, refreshTopics, refreshCS]);

  const chapters = (chaptersRes as any)?.data ?? [];
  const topics = (topicsRes as any)?.data ?? [];
  const classSubjects = (csRes as any)?.data ?? [];

  // Filtered views
  const filteredClasses = useMemo(() => {
    const q = search.toLowerCase();
    return classes.filter((c) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.sections.some((s) => s.name.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "ALL" || (statusFilter === "ACTIVE" ? c.status === "Active" : c.status !== "Active");
      const matchClass = classFilter === "ALL" || c.id === classFilter;
      return matchSearch && matchStatus && matchClass;
    });
  }, [classes, search, statusFilter, classFilter]);

  const filteredSubjects = useMemo(() => {
    const q = search.toLowerCase();
    return subjects.filter((s: any) => {
      return !q || s.name.toLowerCase().includes(q) || String(s.code || "").toLowerCase().includes(q);
    });
  }, [subjects, search]);

  const filteredSubjectsForDropdown = useMemo(() => {
    if (classFilter === "ALL") return subjects;
    return subjects.filter((s: any) => {
      if (s.classId === classFilter) return true;
      if (s.class?.uuid === classFilter || s.class?.id === classFilter) return true;
      if (Array.isArray(s.classSubjects)) {
        return s.classSubjects.some((cs: any) => cs.classId === classFilter || cs.class?.uuid === classFilter);
      }
      return false;
    });
  }, [subjects, classFilter]);

  const handleDeleteClass = async (c: ClassRoom) => {
    if (!confirm(`Are you sure you want to delete class "${c.name}"?`)) return;
    try {
      await deleteClassApi(c.id);
      toast.success(`Class "${c.name}" deleted`);
      refreshClasses();
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete class");
    }
  };

  const handleDeleteSubject = async (s: any) => {
    if (!confirm(`Are you sure you want to delete subject "${s.name}" from Subject Master?`)) return;
    try {
      await deleteSubjectApi(s.id);
      toast.success(`Subject "${s.name}" deleted`);
      refreshSubjects();
      window.dispatchEvent(new Event("subjects:refresh"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete subject");
    }
  };

  const handleCreateChapter = async () => {
    if (!chapterForm.subjectId || !chapterForm.title.trim()) {
      toast.error("Subject and title are required");
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
      setChapterForm({ subjectId: "", title: "", description: "", chapterNumber: 1, status: "ACTIVE" });
      refreshChapters();
      window.dispatchEvent(new Event("chapters:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to save chapter");
    }
  };

  const handleDeleteChapter = async (uuid: string, title: string) => {
    if (!confirm(`Delete chapter "${title}"?`)) return;
    try {
      await deleteChapterApi(uuid);
      toast.success("Chapter deleted");
      refreshChapters();
      window.dispatchEvent(new Event("chapters:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const handleCreateTopic = async () => {
    if (!topicForm.chapterId || !topicForm.title.trim()) {
      toast.error("Chapter and title are required");
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
      setTopicForm({ chapterId: "", title: "", description: "", topicOrder: 1, estimatedClasses: 1, status: "ACTIVE" });
      refreshTopics();
      window.dispatchEvent(new Event("topics:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to save topic");
    }
  };

  const handleDeleteTopic = async (uuid: string, title: string) => {
    if (!confirm(`Delete topic "${title}"?`)) return;
    try {
      await deleteTopicApi(uuid);
      toast.success("Topic deleted");
      refreshTopics();
      window.dispatchEvent(new Event("topics:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const handleDeleteMapping = async (uuid: string) => {
    if (!confirm("Unassign this subject from class?")) return;
    try {
      await deleteClassSubjectApi(uuid);
      toast.success("Unassigned");
      refreshCS();
      window.dispatchEvent(new Event("class-subjects:refresh"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to unassign");
    }
  };

  const isOffline = classesOffline || subjectsOffline || chaptersOffline || topicsOffline;
  const isLoading = classesLoading || subjectsLoading || chaptersLoading || topicsLoading;
  const error = classesError || subjectsError || chaptersError || topicsError;

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={isOffline} error={error} isLoading={isLoading} />

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes, subjects, chapters, topics..."
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Academic Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[50vh]">
              <SelectItem value="ALL">All Years</SelectItem>
              {academicYears.map((y: any) => (
                <SelectItem key={y.uuid || y.id} value={y.uuid || y.id}>
                  {y.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent className="max-h-[50vh]">
              <SelectItem value="ALL">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent className="max-h-[50vh]">
              <SelectItem value="ALL">All Subjects</SelectItem>
              {filteredSubjectsForDropdown.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs gap-1.5"
              onClick={() => setAssignOpen(true)}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Assign</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full h-auto p-1 gap-1 bg-muted/60">
          <TabsTrigger value="classes" className="text-xs gap-1.5 py-2">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Classes ({filteredClasses.length})</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs gap-1.5 py-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Subjects ({filteredSubjects.length})</span>
          </TabsTrigger>
          <TabsTrigger value="chapters" className="text-xs gap-1.5 py-2">
            <FileText className="h-3.5 w-3.5" />
            <span>Chapters ({chapters.length})</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="text-xs gap-1.5 py-2">
            <Hash className="h-3.5 w-3.5" />
            <span>Topics ({topics.length})</span>
          </TabsTrigger>
          <TabsTrigger value="mappings" className="text-xs gap-1.5 py-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Mappings ({classSubjects.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <ClassesTab
            classes={filteredClasses}
            canEdit={canEdit}
            onAddClass={() => {
              setEditingClass(null);
              setClassOpen(true);
            }}
            onEditClass={(c) => {
              setEditingClass(c);
              setClassOpen(true);
            }}
            onDeleteClass={handleDeleteClass}
          />
        </TabsContent>

        {/* 2. Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <SubjectsTab
            subjects={filteredSubjects}
            canEdit={canEdit}
            onAddSubject={() => {
              setEditingSubject(null);
              setSubjectOpen(true);
            }}
            onEditSubject={(s) => {
              setEditingSubject(s);
              setSubjectOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
            onViewChapters={(subjectId) => {
              setSubjectFilter(subjectId);
              setVisitedTabs((prev) => new Set([...prev, "chapters"]));
              setActiveTab("chapters");
            }}
          />
        </TabsContent>

        {/* 3. Chapters Tab */}
        <TabsContent value="chapters" className="space-y-4">
          <ChaptersTab
            chapters={chapters}
            subjects={subjects}
            classes={classes}
            classFilter={classFilter}
            subjectFilter={subjectFilter}
            canEdit={canEdit}
            onAddChapter={() => {
              setEditingChapter(null);
              setChapterForm({
                subjectId: subjectFilter !== "ALL" ? subjectFilter : subjects[0]?.id || "",
                title: "",
                description: "",
                chapterNumber: chapters.length + 1,
                status: "ACTIVE",
              });
              setChapterOpen(true);
            }}
            onEditChapter={(ch) => {
              setEditingChapter(ch);
              setChapterForm({
                subjectId: (ch as any).subjectId || subjectFilter,
                title: ch.title,
                description: ch.description || "",
                chapterNumber: ch.chapterNumber,
                status: ch.status,
              });
              setChapterOpen(true);
            }}
            onDeleteChapter={handleDeleteChapter}
            onViewTopics={(chapterUuid) => {
              setChapterFilter(chapterUuid);
              setTopicForm((p) => ({ ...p, chapterId: chapterUuid }));
              setVisitedTabs((prev) => new Set([...prev, "topics"]));
              setActiveTab("topics");
            }}
            onAddTopic={(chapterUuid) => {
              setEditingTopic(null);
              setTopicForm({
                chapterId: chapterUuid,
                title: "",
                description: "",
                topicOrder: topics.length + 1,
                estimatedClasses: 1,
                status: "ACTIVE",
              });
              setTopicOpen(true);
            }}
            onEditTopic={(top) => {
              setEditingTopic(top);
              setTopicForm({
                chapterId: top.chapterId,
                title: top.title,
                description: top.description || "",
                topicOrder: top.topicOrder,
                estimatedClasses: top.estimatedClasses || 1,
                status: top.status || "ACTIVE",
              });
              setTopicOpen(true);
            }}
            onDeleteTopic={handleDeleteTopic}
          />
        </TabsContent>

        {/* 4. Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          <TopicsTab
            topics={topics}
            chapters={chapters}
            subjects={subjects}
            classes={classes}
            chapterFilter={chapterFilter}
            classFilter={classFilter}
            subjectFilter={subjectFilter}
            onChapterFilterChange={setChapterFilter}
            onClassFilterChange={setClassFilter}
            onSubjectFilterChange={setSubjectFilter}
            canEdit={canEdit}
            onAddTopic={(chapUuid?: string) => {
              setEditingTopic(null);
              setTopicForm({
                chapterId: chapUuid || (chapterFilter !== "ALL" ? chapterFilter : chapters[0]?.uuid || ""),
                title: "",
                description: "",
                topicOrder: topics.length + 1,
                estimatedClasses: 1,
                status: "ACTIVE",
              });
              setTopicOpen(true);
            }}
            onEditTopic={(top) => {
              setEditingTopic(top);
              setTopicForm({
                chapterId: top.chapterId,
                title: top.title,
                description: top.description || "",
                topicOrder: top.topicOrder,
                estimatedClasses: top.estimatedClasses || 1,
                status: top.status,
              });
              setTopicOpen(true);
            }}
            onDeleteTopic={handleDeleteTopic}
          />
        </TabsContent>

        {/* 5. Mappings Tab */}
        <TabsContent value="mappings" className="space-y-4">
          <MappingsTab
            classSubjects={classSubjects}
            canEdit={canEdit}
            onAssign={() => setAssignOpen(true)}
            onDeleteMapping={handleDeleteMapping}
          />
        </TabsContent>
      </Tabs>

      {/* Global Dialogs */}
      <ClassFormDialog
        open={classOpen}
        onOpenChange={setClassOpen}
        editingClass={editingClass}
        onSuccess={() => {
          refreshClasses();
          window.dispatchEvent(new Event("classes:refresh"));
        }}
      />

      <SubjectFormDialog
        open={subjectOpen}
        onOpenChange={setSubjectOpen}
        editingSubject={editingSubject}
        classes={classes}
        initialClassId={classFilter !== "ALL" ? classFilter : undefined}
        onSuccess={() => {
          refreshSubjects();
          window.dispatchEvent(new Event("subjects:refresh"));
        }}
      />

      {/* Chapter Dialog */}
      <Dialog
        open={chapterOpen}
        onOpenChange={(o) => {
          setChapterOpen(o);
          if (!o) setEditingChapter(null);
        }}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingChapter ? "Edit Chapter" : "Add Chapter"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Subject *</span>
              <Select
                value={chapterForm.subjectId}
                onValueChange={(v) => setChapterForm({ ...chapterForm, subjectId: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {subjects.map((s: any) => {
                    const cName = s.className || s.class?.name || (classes.find((c: any) => c.id === s.classId)?.name);
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {cName ? `(${cName})` : ""} {s.code ? `[${s.code}]` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Chapter Number *</span>
              <Input
                type="number"
                value={chapterForm.chapterNumber}
                onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: parseInt(e.target.value) || 1 })}
                className="h-9"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Chapter Title *</span>
              <Input
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                placeholder="e.g. Real Numbers"
                className="h-9"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Description</span>
              <Textarea
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                placeholder="Chapter syllabus or objectives..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChapterOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChapter}>
              {editingChapter ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topic Dialog */}
      <Dialog
        open={topicOpen}
        onOpenChange={(o) => {
          setTopicOpen(o);
          if (!o) setEditingTopic(null);
        }}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingTopic ? "Edit Topic" : "Add Topic"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Chapter *</span>
              <Select
                value={topicForm.chapterId}
                onValueChange={(v) => setTopicForm({ ...topicForm, chapterId: v })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh]">
                  {chapters.map((ch: any) => (
                    <SelectItem key={ch.uuid} value={ch.uuid}>
                      Ch.{ch.chapterNumber}: {ch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Topic Order</span>
              <Input
                type="number"
                value={topicForm.topicOrder}
                onChange={(e) => setTopicForm({ ...topicForm, topicOrder: parseInt(e.target.value) || 1 })}
                className="h-9"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Topic Title *</span>
              <Input
                value={topicForm.title}
                onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                placeholder="e.g. Euclid's Division Lemma"
                className="h-9"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Estimated Classes</span>
              <Input
                type="number"
                value={topicForm.estimatedClasses}
                onChange={(e) => setTopicForm({ ...topicForm, estimatedClasses: parseInt(e.target.value) || 1 })}
                className="h-9"
              />
            </div>
            <div>
              <span className="text-xs font-medium text-foreground block mb-1">Description</span>
              <Textarea
                value={topicForm.description}
                onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                placeholder="Topic contents..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTopic}>
              {editingTopic ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignSubjectDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        classId={classFilter !== "ALL" ? classFilter : classes[0]?.id || ""}
        className={classes.find((c) => c.id === (classFilter !== "ALL" ? classFilter : classes[0]?.id))?.name}
        onSuccess={() => {
          refreshCS();
          window.dispatchEvent(new Event("class-subjects:refresh"));
        }}
      />
    </div>
  );
}
