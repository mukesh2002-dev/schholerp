"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchTeacherAssignments,
  assignTeacherClassOrSubject,
  removeTeacherAssignment,
} from "@/lib/api/teachers";
import { Teacher } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppImage } from "@/components/ui/app-image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  BookOpen,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";

interface TeacherAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onSuccess?: () => void;
}

interface ClassOption {
  uuid: string;
  name: string;
  sections?: Array<{ uuid: string; name: string }>;
}

interface SubjectOption {
  uuid: string;
  name: string;
  code?: string;
}

export function TeacherAssignDialog({
  open,
  onOpenChange,
  teacher,
  onSuccess,
}: TeacherAssignDialogProps) {
  const { activeBranchId } = useERP();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [assignmentMode, setAssignmentMode] = useState<"SUBJECT_TEACHER" | "CLASS_TEACHER">("SUBJECT_TEACHER");
  const [submitting, setSubmitting] = useState(false);

  // Assignments List
  const [assignments, setAssignments] = useState<{
    classAssignments: any[];
    subjectAssignments: any[];
  }>({ classAssignments: [], subjectAssignments: [] });
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Load Classes & Subjects
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function loadAcademicMeta() {
      setLoadingOptions(true);
      try {
        const [cRes, sRes] = await Promise.all([
          apiFetch<{ data: any[] }>("/classes", {}, { campusId: activeBranchId ?? undefined }).catch(() => ({ data: [] })),
          apiFetch<{ data: any[] }>("/subjects", {}, { campusId: activeBranchId ?? undefined }).catch(() => ({ data: [] })),
        ]);
        if (!cancelled) {
          setClasses(Array.isArray(cRes?.data) ? cRes.data : []);
          setSubjects(Array.isArray(sRes?.data) ? sRes.data : []);
        }
      } catch (err) {
        console.error("Failed to load academic options:", err);
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }
    loadAcademicMeta();
    return () => {
      cancelled = true;
    };
  }, [open, activeBranchId]);

  // Load current assignments
  const loadTeacherAssignments = useCallback(async () => {
    if (!teacher?.id) return;
    setLoadingAssignments(true);
    try {
      const data = await fetchTeacherAssignments(teacher.id);
      setAssignments(data);
    } catch {
      setAssignments({ classAssignments: [], subjectAssignments: [] });
    } finally {
      setLoadingAssignments(false);
    }
  }, [teacher?.id]);

  useEffect(() => {
    if (open && teacher?.id) {
      loadTeacherAssignments();
    }
  }, [open, teacher?.id, loadTeacherAssignments]);

  const handleAssign = async () => {
    if (!teacher?.id) return;
    if (!selectedClassId) {
      toast.error("Please select a Class");
      return;
    }
    if (assignmentMode === "SUBJECT_TEACHER" && !selectedSubjectId) {
      toast.error("Please select a Subject for this teacher");
      return;
    }

    setSubmitting(true);
    try {
      await assignTeacherClassOrSubject(teacher.id, {
        classId: selectedClassId,
        section: selectedSection === "ALL" ? null : selectedSection,
        subjectId: assignmentMode === "SUBJECT_TEACHER" ? selectedSubjectId : null,
        campusId: activeBranchId ?? undefined,
      });

      toast.success(
        assignmentMode === "CLASS_TEACHER"
          ? `Assigned as Class Teacher successfully!`
          : `Assigned Subject Teacher successfully!`
      );

      // Reset form
      setSelectedClassId("");
      setSelectedSection("ALL");
      setSelectedSubjectId("");
      await loadTeacherAssignments();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign. Assignment may already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (assignmentUuid: string, type: "class" | "subject") => {
    if (!teacher?.id) return;
    try {
      await removeTeacherAssignment(teacher.id, assignmentUuid, type);
      toast.success("Assignment removed successfully");
      await loadTeacherAssignments();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove assignment");
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <AppImage
              src={teacher.avatar}
              alt={teacher.fullName}
              className="h-11 w-11 rounded-xl ring-1 ring-border shadow-xs"
            />
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <span>{teacher.fullName}</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {teacher.employeeId}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Assign subjects, classes &amp; sections to this faculty member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Assignment Creation Form */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-tight text-foreground flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-primary" /> Assign Class &amp; Subject
              </span>
              <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
                <Button
                  type="button"
                  size="sm"
                  variant={assignmentMode === "SUBJECT_TEACHER" ? "default" : "ghost"}
                  className="h-6 text-[11px] px-2.5"
                  onClick={() => setAssignmentMode("SUBJECT_TEACHER")}
                >
                  <BookOpen className="h-3 w-3 mr-1" /> Subject Teacher
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={assignmentMode === "CLASS_TEACHER" ? "default" : "ghost"}
                  className="h-6 text-[11px] px-2.5"
                  onClick={() => setAssignmentMode("CLASS_TEACHER")}
                >
                  <ShieldCheck className="h-3 w-3 mr-1" /> Class In-Charge
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Class Selector */}
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Select Class</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.uuid} value={cls.uuid}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Selector */}
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sections (Entire Class)</SelectItem>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selector (Enabled for Subject Teacher) */}
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-medium">
                  {assignmentMode === "CLASS_TEACHER" ? "Role" : "Select Subject"}
                </label>
                {assignmentMode === "CLASS_TEACHER" ? (
                  <div className="h-9 px-3 rounded-md bg-background border border-border flex items-center text-xs text-muted-foreground">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500 mr-1.5" /> Class Mentor
                  </div>
                ) : (
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.uuid} value={sub.uuid}>
                          {sub.name} {sub.code ? `(${sub.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleAssign}
                disabled={submitting || loadingOptions}
                className="h-8 text-xs gap-1.5"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Confirm Assignment
              </Button>
            </div>
          </div>

          {/* Current Active Assignments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Current Active Allocations (
                {(assignments.classAssignments?.length || 0) + (assignments.subjectAssignments?.length || 0)}
                )
              </h4>
              {loadingAssignments && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>

            {assignments.subjectAssignments?.length === 0 && assignments.classAssignments?.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-xl bg-card">
                <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs font-medium text-foreground">No Classes Assigned Yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Use the form above to assign classes and subjects to this teacher.
                </p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-[11px]">
                      <TableHead>Type</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-12 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {/* Class Teacher Assignments */}
                    {assignments.classAssignments?.map((ca: any) => (
                      <TableRow key={ca.uuid}>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                            Class In-Charge
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{ca.class?.name || "All Classes"}</TableCell>
                        <TableCell>{ca.section || ca.class?.section || "All Sections"}</TableCell>
                        <TableCell className="text-muted-foreground">All Subjects (Mentor)</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemove(ca.uuid, "class")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Subject Teacher Assignments */}
                    {assignments.subjectAssignments?.map((sa: any) => (
                      <TableRow key={sa.uuid}>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            Subject Teacher
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{sa.class?.name || "Class"}</TableCell>
                        <TableCell>{sa.section || "All"}</TableCell>
                        <TableCell className="font-medium text-primary">
                          {sa.subject?.name || "General"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemove(sa.uuid, "subject")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
