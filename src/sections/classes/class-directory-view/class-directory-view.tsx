"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ClassRoom, Section, Subject } from "@/types";
import { ClassFormDialog } from "@/components/classes/class-form-dialog";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";
import { TopicManagerDialog } from "@/components/subjects/topic-manager-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Users, Building2, Edit3, Trash2, Plus, Layers, BookMarked, GraduationCap } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

export function ClassDirectoryView() {
  const { activeBranchId } = useERP();
  const [classes, setClasses] = useState(() => mockDb.getClasses(activeBranchId));
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  // subject
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectClassId, setSubjectClassId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<(Subject & { classId: string }) | null>(null);
  const [topicSubject, setTopicSubject] = useState<(Subject & { classId: string; className: string }) | null>(null);

  // section
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionClassId, setSectionClassId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [secName, setSecName] = useState("");
  const [secRoom, setSecRoom] = useState("");
  const [secTeacherId, setSecTeacherId] = useState("");

  const teachers = mockDb.getTeachers(activeBranchId);

  const refreshList = () => {
    setClasses(mockDb.getClasses(activeBranchId));
  };

  React.useEffect(() => {
    const h = () => refreshList();
    window.addEventListener("classes:refresh", h);
    window.addEventListener("subjects:refresh", h);
    return () => {
      window.removeEventListener("classes:refresh", h);
      window.removeEventListener("subjects:refresh", h);
    };
  }, [activeBranchId]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sections.some((s) => s.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.subjects.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [classes, searchQuery, categoryFilter]);

  const handleEditClass = (cls: ClassRoom) => {
    setEditingClass(cls);
    setDialogOpen(true);
  };
  const handleDeleteClass = (id: string) => {
    if (!confirm("Delete this class? All sections & subjects will be removed.")) return;
    const ok = mockDb.deleteClass(id);
    if (ok) {
      toast.success("Class deleted");
      refreshList();
    }
  };

  // section handlers
  const openAddSection = (classId: string) => {
    setSectionClassId(classId);
    setEditingSection(null);
    setSecName("");
    setSecRoom("");
    setSecTeacherId(teachers[0]?.id || "");
    setSectionDialogOpen(true);
  };
  const openEditSection = (classId: string, sec: Section) => {
    setSectionClassId(classId);
    setEditingSection(sec);
    setSecName(sec.name);
    setSecRoom(sec.roomNumber);
    setSecTeacherId(sec.classTeacherId);
    setSectionDialogOpen(true);
  };
  const handleSaveSection = () => {
    if (!sectionClassId) return;
    if (!secName.trim() || !secRoom.trim()) { toast.error("Section name & room required"); return; }
    const teacher = teachers.find((t) => t.id === secTeacherId);
    const payload: Section = {
      id: editingSection?.id || `sec-${Date.now().toString(36)}`,
      name: secName.trim(),
      roomNumber: secRoom.trim(),
      classTeacherId: teacher?.id || secTeacherId,
      classTeacherName: teacher?.fullName || "Assigned Teacher",
      classTeacherAvatar: teacher?.avatar,
      studentCount: editingSection?.studentCount ?? 0,
      capacity: editingSection?.capacity ?? 40,
    };
    mockDb.updateSection(sectionClassId, payload);
    toast.success(editingSection ? "Section updated" : "Section added");
    setSectionDialogOpen(false);
    refreshList();
  };
  const handleDeleteSection = (classId: string, sectionId: string) => {
    if (!confirm("Delete this section?")) return;
    const ok = mockDb.deleteSection(classId, sectionId);
    if (ok) { toast.success("Section deleted"); refreshList(); }
  };

  // subject handlers
  const openAddSubject = (classId: string) => {
    setSubjectClassId(classId);
    setEditingSubject(null);
    setSubjectDialogOpen(true);
  };
  const openEditSubject = (classId: string, sub: Subject) => {
    setSubjectClassId(classId);
    setEditingSubject({ ...sub, classId } as any);
    setSubjectDialogOpen(true);
  };
  const handleDeleteSubject = (classId: string, subjectId: string) => {
    if (!confirm("Delete subject? Topics also removed.")) return;
    const ok = mockDb.deleteSubject(classId, subjectId);
    if (ok) { toast.success("Subject deleted"); refreshList(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/60 shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by class, branch, teacher, subject..." className="pl-9 h-9 text-xs" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Kindergarten">Kindergarten</SelectItem>
              <SelectItem value="Primary">Primary (1-5)</SelectItem>
              <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
              <SelectItem value="High School">High School (9-10)</SelectItem>
              <SelectItem value="Senior Secondary">Senior Secondary (11-12)</SelectItem>
              <SelectItem value="UG">UG</SelectItem>
              <SelectItem value="PG">PG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="text-xs self-end md:self-auto font-mono">Showing {filteredClasses.length} of {classes.length}</Badge>
      </div>

      {filteredClasses.length === 0 ? (
        <EmptyState title="No Academic Classes Found" description="We couldn't find any classes matching your filters. Try adjusting your query or add a new academic grade level." actionLabel="Add Academic Class" onAction={() => { setEditingClass(null); setDialogOpen(true); }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const utilization = Math.round((cls.totalStudents / cls.capacity) * 100);
            return (
              <Card key={cls.id} className="border-border/70 hover:border-primary/30 hover:shadow-lg transition-all flex flex-col group/card overflow-hidden">
                <CardHeader className="pb-3 space-y-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-muted-foreground">Grade {cls.gradeLevel}</span>
                        <Badge variant="outline" className="text-[10px]">{cls.category}</Badge>
                        {cls.program && <Badge variant="secondary" className="text-[10px]">{cls.program}</Badge>}
                      </div>
                      <CardTitle className="text-base font-bold text-foreground truncate">{cls.name}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5"><Building2 className="h-3 w-3 text-muted-foreground" />{cls.branchName}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-mono font-bold text-foreground block">{cls.sections.length} Sections</span>
                        <span className="text-[10px] text-muted-foreground block">{cls.subjects.length} Subjects</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditClass(cls)} title="Edit class"><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteClass(cls.id)} title="Delete class"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Class Capacity</span>
                      <span className="font-mono text-foreground font-semibold">{formatNumber(cls.totalStudents)} / {formatNumber(cls.capacity)} <strong className="text-primary">({utilization}%)</strong></span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(utilization, 100)}%`, backgroundColor: utilization >= 90 ? "#ef4444" : utilization >= 75 ? "#3b82f6" : "#10b981" }} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Sections & Teachers</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1 px-1.5" onClick={() => openAddSection(cls.id)}><Plus className="h-3 w-3" /> Add</Button>
                    </div>
                    <div className="space-y-1.5">
                      {cls.sections.map((sec) => (
                        <div key={sec.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs border border-border/50 group/sec hover:bg-muted/60 transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-foreground bg-card px-1.5 py-0.5 rounded border text-[11px] shrink-0">Sec {sec.name.replace("Section ", "")}</span>
                            <span className="text-muted-foreground truncate max-w-[110px]">{sec.classTeacherName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono text-[11px] text-foreground font-medium hidden lg:inline">{sec.studentCount} • Rm {sec.roomNumber}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/sec:opacity-100" onClick={() => openEditSection(cls.id, sec)} title="Edit section"><Edit3 className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/sec:opacity-100 text-destructive" onClick={() => handleDeleteSection(cls.id, sec.id)} title="Delete section"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                      {cls.sections.length === 0 && <p className="text-xs text-muted-foreground italic">No sections — add one</p>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1"><Layers className="h-3 w-3" /> Academic Subjects ({cls.subjects.length})</span>
                      <Button variant="ghost" size="sm" className="h-6 text-[11px] gap-1 px-1.5" onClick={() => openAddSubject(cls.id)}><Plus className="h-3 w-3" /> Add</Button>
                    </div>
                    {cls.subjects.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No subjects — add subject with teacher & topics</p>
                    ) : (
                      <div className="space-y-1.5">
                        {cls.subjects.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-primary/[0.04] border border-primary/10 hover:bg-primary/[0.07] transition-colors group/sub">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                                {sub.name} <span className="text-[10px] font-mono text-muted-foreground">{sub.code}</span>
                                {sub.topics && sub.topics.length > 0 && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 gap-1"><BookMarked className="h-3 w-3" />{sub.topics.length}</Badge>}
                              </div>
                              <div className="text-[11px] text-muted-foreground truncate">{sub.teacherName} • {sub.weeklyPeriods} p/w{sub.credits ? ` • ${sub.credits} cr` : ""}</div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTopicSubject({ ...sub, classId: cls.id, className: cls.name } as any)} title="Manage topics"><BookMarked className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSubject(cls.id, sub)} title="Edit subject"><Edit3 className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteSubject(cls.id, sub.id)} title="Delete subject"><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0 group-hover/sub:hidden">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-card border text-muted-foreground">{sub.weeklyPeriods}p</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1 mt-1" onClick={() => openAddSubject(cls.id)}><Plus className="h-3 w-3" /> Add Subject to {cls.name}</Button>
                  </div>

                  {/* Quick link to subjects page */}
                  <div className="flex gap-1.5 pt-2">
                    <Button variant="secondary" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => window.location.href = "/subjects"}><Layers className="h-3 w-3" /> Manage in Subjects</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleEditClass(cls)}><Edit3 className="h-3 w-3" /> Edit Class</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ClassFormDialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingClass(null); }} editingClass={editingClass} onSuccess={refreshList} />
      <SubjectFormDialog open={subjectDialogOpen} onOpenChange={(o) => { setSubjectDialogOpen(o); if (!o) { setEditingSubject(null); setSubjectClassId(null); } }} initialClassId={subjectClassId || undefined} editingSubject={editingSubject as any} onSuccess={refreshList} />
      {topicSubject && <TopicManagerDialog open={!!topicSubject} onOpenChange={(o) => !o && setTopicSubject(null)} classId={topicSubject.classId} className={topicSubject.className} subject={topicSubject as any} onSuccess={refreshList} />}

      {/* Section dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> {editingSection ? "Edit Section" : "Add Section"}</DialogTitle>
            <DialogDescription className="text-xs">Section name, room & class teacher — editable.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium mb-1 block">Section Name *</label><Input value={secName} onChange={(e) => setSecName(e.target.value)} placeholder="Section A / Div A" className="h-8 text-sm" /></div>
            <div><label className="text-xs font-medium mb-1 block">Room Number *</label><Input value={secRoom} onChange={(e) => setSecRoom(e.target.value)} placeholder="Room 301" className="h-8 text-sm" /></div>
            <div>
              <label className="text-xs font-medium mb-1 block">Class Teacher *</label>
              <Select value={secTeacherId} onValueChange={setSecTeacherId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>{teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.fullName} — {t.department}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handleSaveSection}>{editingSection ? "Update" : "Add"} Section</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
