"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Subject } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { canMutateAcademics } from "@/lib/auth/roles";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { TopicManagerDialog } from "@/components/subjects/topic-manager-dialog";
import { Search, BookOpen, Layers, BookMarked, Edit3, Trash2, Users, Plus, GraduationCap, Lock } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { fetchSubjects, deleteSubjectApi, fetchClasses } from "@/lib/api/classes";
import { useCampusData } from "@/lib/hooks/use-campus-data";

type LiveSubject = Subject & { classId: string; className: string; branchId: string; branchName: string };

export function SubjectDirectoryView() {
  const { activeBranchId, session } = useERP();
  const canEdit = canMutateAcademics(session.role);
  const fallback: LiveSubject[] = [];

  const { data: subjects, isLoading, isOffline, error, refresh } = useCampusData<LiveSubject[]>({
    fetcher: (cid) => fetchSubjects({ campusId: cid }),
    campusId: activeBranchId,
    fallback,
    queryKeyPrefix: "subjects",
  });
  const { data: classes } = useCampusData({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as any[],
    queryKeyPrefix: "classes",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<(Subject & { classId: string; branchId: string; branchName: string; className: string }) | null>(null);
  const [topicSubject, setTopicSubject] = useState<(Subject & { classId: string; className: string }) | null>(null);

  React.useEffect(() => {
    const h = () => void refresh();
    window.addEventListener("subjects:refresh", h);
    window.addEventListener("classes:refresh", h);
    return () => {
      window.removeEventListener("subjects:refresh", h);
      window.removeEventListener("classes:refresh", h);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.teacherName.toLowerCase().includes(q) || s.className.toLowerCase().includes(q);
      const matchesClass = classFilter === "ALL" || s.classId === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [subjects, searchQuery, classFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const s of filtered) {
      const k = `${s.classId}|${s.className}|${s.branchId}`;
      const arr = map.get(k) || [];
      arr.push(s);
      map.set(k, arr);
    }
    return Array.from(map.entries()).map(([k, arr]) => {
      const [classId, className, branchId] = k.split("|");
      const cls = classes.find((c: any) => c.id === classId);
      return { classId, className, branchName: cls?.branchName || arr[0]?.branchName || "", subjects: arr, cls };
    });
  }, [filtered, classes]);

  const handleDelete = async (classId: string, subjectId: string, name: string) => {
    if (!confirm(`Delete subject "${name}"? Blocked if used in timetable/exams/homework.`)) return;
    try {
      await deleteSubjectApi(subjectId);
      toast.success(`Subject "${name}" deleted`);
      void refresh();
      window.dispatchEvent(new Event("subjects:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    }
  };

  const openAddForClass = (classId: string) => {
    setEditingSubject(null);
    setClassFilter(classId);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={isOffline} error={error} isLoading={isLoading} />
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/60 shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search subject, code, teacher, class..." className="pl-9 h-9 text-xs" />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.subjects?.length ?? 0})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Badge variant="outline" className="text-xs font-mono">Showing {filtered.length} of {subjects.length}</Badge>
          {canEdit && (
            <Button size="sm" variant="gradient" className="h-9 gap-1" onClick={() => { setEditingSubject(null); setDialogOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Subject</Button>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 border border-border/50 rounded-lg px-3 py-2">
          <Lock className="h-3.5 w-3.5" /> Read-only — only Admin or Principal can add, edit or delete subjects.
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No Subjects Found" description="Add subjects class-wise. Each subject can have chapter-wise topics." actionLabel="Add Subject" onAction={() => canEdit && setDialogOpen(true)} />
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <div key={g.classId} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><GraduationCap className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">{g.className} <Badge variant="outline" className="text-[11px]">{g.branchName}</Badge> <Badge className="text-[11px]">{g.subjects.length} subjects</Badge></div>
                  <div className="text-xs text-muted-foreground">{g.cls?.sections?.length ?? 0} section(s) • {g.cls?.totalStudents ?? 0} students</div>
                </div>
                {canEdit && (
                  <Button variant="outline" size="sm" className="ml-auto h-7 text-xs gap-1" onClick={() => openAddForClass(g.classId)}><Plus className="h-3 w-3" /> Add for {g.className}</Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {g.subjects.map((sub) => (
                  <Card key={sub.id} className="border-border/70 hover:border-primary/40 hover:shadow-md transition-all flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <CardTitle className="text-[13px] font-bold flex items-center gap-2 truncate">
                            <BookOpen className="h-3.5 w-3.5 text-violet-600 shrink-0" /> {sub.name}
                            <Badge variant="outline" className="text-[10px] font-mono">{sub.code}</Badge>
                          </CardTitle>
                          <CardDescription className="text-xs flex items-center gap-1.5 truncate">
                            <Users className="h-3 w-3" /> {sub.teacherName} • {sub.weeklyPeriods} periods/wk {sub.credits ? `• ${sub.credits} cr` : ""}
                          </CardDescription>
                          {sub.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{sub.description}</p>}
                        </div>
                        <Badge variant="secondary" className="text-[11px] shrink-0">{sub.topics?.length || 0} topics</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-1.5">
                        {(sub.topics || []).slice(0, 3).map((t) => (
                          <span key={t.id} className="text-[11px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200/50 flex items-center gap-1">
                            <BookMarked className="h-3 w-3" /> {t.title}
                          </span>
                        ))}
                        {(sub.topics || []).length > 3 && <span className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{(sub.topics || []).length - 3} more</span>}
                        {(!sub.topics || sub.topics.length === 0) && <span className="text-[11px] text-muted-foreground italic">No topics — add chapter-wise</span>}
                      </div>
                      <div className="flex gap-1.5 pt-2 mt-auto">
                        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => setTopicSubject(sub as any)}><Layers className="h-3 w-3" /> Topics</Button>
                        {canEdit && (
                          <>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingSubject(sub as any); setDialogOpen(true); }} title="Edit subject"><Edit3 className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(g.classId, sub.id, sub.name)} title="Delete subject"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <SubjectFormDialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingSubject(null); }} editingSubject={editingSubject} initialClassId={classFilter !== "ALL" ? classFilter : undefined} onSuccess={() => void refresh()} />
      {topicSubject && (
        <TopicManagerDialog open={!!topicSubject} onOpenChange={(o) => !o && setTopicSubject(null)} classId={topicSubject.classId} className={topicSubject.className} subject={topicSubject as any} onSuccess={() => void refresh()} />
      )}
    </div>
  );
}