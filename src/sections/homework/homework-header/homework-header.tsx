"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { createHomeworkApi, fetchHomework } from "@/lib/api/homework";
import { fetchClasses, fetchSubjects } from "@/lib/api/classes";
import { fetchTeachers } from "@/lib/api/teachers";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassRoom, HomeworkStatus, HomeworkType } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const homeworkSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "Class is required"),
  section: z.string().optional(),
  teacherUuid: z.string().optional(),
  subjectUuid: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  homeworkType: z.enum(["CW", "HW", "ASSIGNMENT", "PROJECT"]),
});

type HomeworkFormValues = z.infer<typeof homeworkSchema>;

const todayISO = () => new Date().toISOString().split("T")[0];

export function HomeworkHeader({ onHomeworkAdded }: { onHomeworkAdded?: () => void }) {
  const { activeBranchId, session } = useERP();
  const canWrite = session?.role === "ADMIN" || session?.role === "HR_MANAGER";
  const campusId = activeBranchId === "all" ? null : activeBranchId;

  const [taskCount, setTaskCount] = useState(0);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [teachers, setTeachers] = useState<{ id: string; fullName: string; designation?: string }[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teacherUuid, setTeacherUuid] = useState("");

  const [subjects, setSubjects] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectUuid, setSubjectUuid] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachPreview, setAttachPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      section: "",
      teacherUuid: "",
      subjectUuid: "",
      dueDate: "",
      homeworkType: "HW",
    },
  });

  const homeworkType = watch("homeworkType");

  const selectedClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId);
  }, [classes, selectedClassId]);

  // Available sections for the chosen class
  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    if (Array.isArray(selectedClass.sections) && selectedClass.sections.length > 0) {
      const uniqueNames = new Set<string>();
      const list: { id: string; name: string }[] = [];
      for (const s of selectedClass.sections) {
        const cleanName = s.name.replace(/^Section\s*/i, "").trim();
        if (cleanName && !uniqueNames.has(cleanName)) {
          uniqueNames.add(cleanName);
          list.push({ id: s.id || cleanName, name: cleanName });
        }
      }
      if (list.length > 0) return list;
    }
    // Fallback standard sections if none in DB
    return [
      { id: "A", name: "A" },
      { id: "B", name: "B" },
      { id: "C", name: "C" },
    ];
  }, [selectedClass]);

  const refreshCount = useCallback(async () => {
    try {
      const { total } = await fetchHomework({ campusId, limit: 1 });
      setTaskCount(total);
    } catch {
      // count is best-effort; directory view shows its own errors
    }
  }, [campusId]);

  useEffect(() => {
    refreshCount();
    const h = () => refreshCount();
    if (typeof window !== "undefined") {
      window.addEventListener("homework-updated", h);
      return () => window.removeEventListener("homework-updated", h);
    }
  }, [refreshCount]);

  // Load classes, teachers, and subjects when the dialog opens
  useEffect(() => {
    if (!dialogOpen) return;
    setClassesLoading(true);
    fetchClasses({ campusId, limit: 100 })
      .then((cls) => {
        if (Array.isArray(cls)) {
          setClasses(cls);
        }
      })
      .catch(() => toast.error("Failed to load classes"))
      .finally(() => setClassesLoading(false));

    setTeachersLoading(true);
    fetchTeachers({ campusId, limit: 100 })
      .then((res) => {
        if (Array.isArray(res?.data)) {
          setTeachers(res.data.map((t) => ({ id: t.id, fullName: t.fullName, designation: t.designation })));
        }
      })
      .catch(() => {})
      .finally(() => setTeachersLoading(false));

    setSubjectsLoading(true);
    fetchSubjects({ campusId, limit: 100 })
      .then((subs) => {
        if (Array.isArray(subs)) {
          setSubjects(subs.map((s) => ({ id: s.id, name: s.name, code: s.code })));
        }
      })
      .catch(() => {})
      .finally(() => setSubjectsLoading(false));
  }, [dialogOpen, campusId]);

  const handleAttach = (f: File | null) => {
    setAttachFile(f);
    setAttachPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return f && f.type.startsWith("image/") ? URL.createObjectURL(f) : null;
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setAttachFile(null);
    setSelectedClassId("");
    setSelectedSection("");
    setTeacherUuid("");
    setSubjectUuid("");
    setAttachPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    reset();
  };

  const handleCreateHomework = async (data: HomeworkFormValues) => {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }
    const targetTeacher = teacherUuid && teacherUuid !== "self" ? teacherUuid : undefined;
    try {
      await createHomeworkApi(
        {
          title: data.title,
          description: data.description || "",
          campusUuid: campusId ?? undefined,
          classUuid: selectedClass.id,
          section: selectedSection || undefined,
          teacherUuid: targetTeacher,
          subjectUuid: subjectUuid || undefined,
          dueDate: new Date(data.dueDate).toISOString(),
          maxMarks: 100,
          homeworkType: data.homeworkType as HomeworkType,
          priority: "MEDIUM",
          status: "ACTIVE" as HomeworkStatus,
        },
        attachFile ? [attachFile] : [],
        campusId
      );
      toast.success(`${data.homeworkType} created successfully`, { description: data.title });
      closeDialog();
      refreshCount();
      if (onHomeworkAdded) onHomeworkAdded();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("homework-updated"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to create homework");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Homework &amp; Assignments
              </h1>
              <Badge variant="outline" className="text-xs">
                {taskCount} Tasks
              </Badge>
              <span className="hidden sm:inline-flex gap-1">
                <Badge variant="info" className="text-[10px]">CW</Badge>
                <Badge variant="secondary" className="text-[10px]">HW</Badge>
                <Badge variant="purple" className="text-[10px]">Assignment</Badge>
                <Badge variant="warning" className="text-[10px]">Project</Badge>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              CW / HW / Assignment / Project — create, edit, track submissions &amp; grading.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id="create-homework-btn"
              aria-label="Create homework"
              variant="gradient"
              onClick={() => setDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create Homework / Task</DialogTitle>
            <DialogDescription>
              Pick a class, section, subject, and assigning teacher for this task.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateHomework)} className="space-y-4 mt-2">
            <div>
              <label htmlFor="homework-title" className="text-xs font-medium text-foreground mb-1 block">Task Title</label>
              <Input id="homework-title" aria-label="Task title" {...register("title")} placeholder="e.g. Chapter 4 Trigonometry Problem Set" className={errors.title ? "border-rose-500" : ""} />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="homework-type" className="text-xs font-medium text-foreground mb-1 block">Type</label>
              <Select value={homeworkType} onValueChange={(val) => setValue("homeworkType", val as any)}>
                <SelectTrigger id="homework-type" aria-label="Homework type" className={errors.homeworkType ? "border-rose-500" : ""}>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CW">CW — Class Work</SelectItem>
                  <SelectItem value="HW">HW — Home Work</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  <SelectItem value="PROJECT">Project</SelectItem>
                </SelectContent>
              </Select>
              {errors.homeworkType && <p className="text-[11px] text-rose-500 mt-1">{errors.homeworkType.message}</p>}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assign to</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="homework-class" className="text-xs font-medium text-foreground mb-1 block">Class</label>
                  <Select
                    value={selectedClassId}
                    onValueChange={(val) => {
                      setSelectedClassId(val);
                      setValue("classId", val);
                      setSelectedSection("");
                      setValue("section", "");
                    }}
                  >
                    <SelectTrigger id="homework-class" aria-label="Class" className={errors.classId ? "border-rose-500" : ""}>
                      <SelectValue placeholder={classesLoading ? "Loading classes..." : "Select Class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classId && <p className="text-[11px] text-rose-500 mt-1">{errors.classId.message}</p>}
                </div>
                <div>
                  <label htmlFor="homework-section" className="text-xs font-medium text-foreground mb-1 block">Section</label>
                  <Select
                    value={selectedSection}
                    onValueChange={(val) => {
                      setSelectedSection(val);
                      setValue("section", val);
                    }}
                    disabled={!selectedClass}
                  >
                    <SelectTrigger id="homework-section" aria-label="Section">
                      <SelectValue placeholder={!selectedClass ? "Pick class first" : "Select Section"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((sec) => (
                        <SelectItem key={sec.name} value={sec.name}>
                          Section {sec.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="homework-teacher" className="text-xs font-medium text-foreground mb-1 block">Assigning Teacher</label>
                  <Select
                    value={teacherUuid}
                    onValueChange={(val) => {
                      setTeacherUuid(val);
                      setValue("teacherUuid", val);
                    }}
                  >
                    <SelectTrigger id="homework-teacher" aria-label="Assigning Teacher">
                      <SelectValue placeholder={teachersLoading ? "Loading teachers..." : "Self (Current User)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self (Current User)</SelectItem>
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.fullName} {t.designation ? `(${t.designation})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="homework-subject" className="text-xs font-medium text-foreground mb-1 block">Subject (Optional)</label>
                  <Select
                    value={subjectUuid}
                    onValueChange={(val) => {
                      setSubjectUuid(val);
                      setValue("subjectUuid", val);
                    }}
                  >
                    <SelectTrigger id="homework-subject" aria-label="Subject">
                      <SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select Subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} {s.code ? `(${s.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedClass && (
                <p className="text-[11px] text-muted-foreground">
                  Assigning to <strong className="text-foreground">{selectedClass.name}{selectedSection ? ` (Sec ${selectedSection})` : ""}</strong>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="homework-due-date" className="text-xs font-medium text-foreground mb-1 block">Due Date</label>
                <Input id="homework-due-date" aria-label="Due date" type="date" min={todayISO()} {...register("dueDate")} className={errors.dueDate ? "border-rose-500" : ""} />
                {errors.dueDate && <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate.message}</p>}
              </div>

              <div>
                <label htmlFor="homework-attachment" className="text-xs font-medium text-foreground mb-1 block">Attachment (optional)</label>
                <label htmlFor="homework-attachment" className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-xs text-muted-foreground cursor-pointer hover:border-primary/50">
                  {attachFile ? <Paperclip className="h-3.5 w-3.5 text-primary" /> : <Paperclip className="h-3.5 w-3.5" />}
                  <span className="truncate">{attachFile ? attachFile.name : "Image or PDF, max 10MB"}</span>
                  <input
                    id="homework-attachment"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleAttach(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {attachPreview && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border border-border/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={attachPreview} alt="attachment preview" className="h-14 w-14 rounded-md object-cover border border-border/60" />
                <div className="text-[11px] text-muted-foreground">
                  <p className="font-medium text-foreground truncate max-w-[220px]">{attachFile?.name}</p>
                  <button type="button" className="text-rose-500 hover:underline" onClick={() => handleAttach(null)}>Remove</button>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="homework-instructions" className="text-xs font-medium text-foreground mb-1 block">Instructions</label>
              <Textarea id="homework-instructions" aria-label="Instructions" {...register("description")} placeholder="Problem numbers, page references, submission notes..." rows={3} />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant="gradient">
                {isSubmitting ? "Publishing..." : "Publish Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
