"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchHomework, updateHomeworkApi, deleteHomeworkApi } from "@/lib/api/homework";
import { fetchClasses } from "@/lib/api/classes";
import { Homework, HomeworkStatus, HomeworkType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, LayoutGrid, List, BookOpen, CalendarDays, User, Edit3, Trash2, Paperclip, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const statusConfig: Record<HomeworkStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

const typeConfig: Record<HomeworkType, { label: string; variant: "info" | "secondary" | "purple" | "warning"; icon: string }> = {
  CW: { label: "CW", variant: "info", icon: "Class Work" },
  HW: { label: "HW", variant: "secondary", icon: "Home Work" },
  ASSIGNMENT: { label: "Assignment", variant: "purple", icon: "Assignment" },
  PROJECT: { label: "Project", variant: "warning", icon: "Project" },
};

const priorityConfig: Record<string, string> = {
  LOW: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  HIGH: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const editSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Required"),
  homeworkType: z.enum(["CW", "HW", "ASSIGNMENT", "PROJECT"]),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

type EditValues = z.infer<typeof editSchema>;

type HomeworkWithCount = Homework & { submissionsCount?: number };

export function HomeworkDirectoryView() {
  const { activeBranchId, session } = useERP();
  const canWrite = session?.role === "ADMIN" || session?.role === "HR_MANAGER";

  const [homeworkList, setHomeworkList] = useState<HomeworkWithCount[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<HomeworkWithCount | null>(null);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const campusId = activeBranchId === "all" ? null : activeBranchId;

  // Debounce search input before hitting the API.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hw, cls] = await Promise.all([
        fetchHomework({
          campusId,
          search: debouncedSearch || undefined,
          status: statusFilter === "ALL" ? undefined : statusFilter,
          type: typeFilter === "ALL" ? undefined : typeFilter,
          limit: 100,
        }),
        fetchClasses({ campusId, limit: 100 }).catch(() => []),
      ]);
      setHomeworkList(hw.items);
      // Group section-rows by class name so "Class 10" appears once.
      setClassNames([...new Set(cls.map((c) => c.name))].sort());
    } catch (e: any) {
      setError(e?.message || "Failed to load homework. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [campusId, debouncedSearch, statusFilter, classFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when header creates a task.
  useEffect(() => {
    const h = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener("homework-updated", h);
      return () => window.removeEventListener("homework-updated", h);
    }
  }, [load]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: "", description: "", dueDate: "", homeworkType: "HW", status: "ACTIVE", priority: "MEDIUM" },
  });

  const filteredList = useMemo(
    () => (classFilter === "ALL" ? homeworkList : homeworkList.filter((hw) => hw.className === classFilter)),
    [homeworkList, classFilter]
  );

  const openEdit = (hw: HomeworkWithCount) => {
    setEditing(hw);
    setAttachFile(null);
    reset({
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split("T")[0] : "",
      homeworkType: (hw.homeworkType || "HW") as any,
      status: hw.status,
      priority: ((hw.priority as string) === "URGENT" ? "HIGH" : hw.priority || "MEDIUM") as any,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (data: EditValues) => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateHomeworkApi(
        editing.id,
        {
          title: data.title,
          description: data.description || "",
          dueDate: new Date(data.dueDate).toISOString(),
          homeworkType: data.homeworkType as HomeworkType,
          status: data.status as HomeworkStatus,
          priority: data.priority as any,
        },
        attachFile ? [attachFile] : []
      );
      toast.success("Updated successfully");
      setEditOpen(false);
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (hw: HomeworkWithCount) => {
    if (typeof window !== "undefined" && !window.confirm(`Archive "${hw.title}"? It will be hidden from active lists.`)) return;
    try {
      await deleteHomeworkApi(hw.id);
      toast.success("Archived");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-sm min-w-[180px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, teacher, class..." className="pl-9 h-9 text-xs" />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="CW">CW — Class Work</SelectItem>
              <SelectItem value="HW">HW — Home Work</SelectItem>
              <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
              <SelectItem value="PROJECT">Project</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="Class Cohort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {classNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 self-end lg:self-auto border border-border/80 rounded-lg p-0.5 bg-muted/30">
          <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-7 px-2.5 text-xs gap-1">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </Button>
          <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="h-7 px-2.5 text-xs gap-1">
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={load}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-5 space-y-3 animate-pulse">
              <div className="h-4 w-2/3 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState title="No Homework Tasks Found" description="No assignment tasks match your search criteria. Try modifying your filters or assign a new task." />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((hw) => {
            const sc = statusConfig[hw.status] || statusConfig.ACTIVE;
            const tc = typeConfig[(hw.homeworkType as HomeworkType) || "HW"] || typeConfig.HW;
            const submitted = hw.submissionsCount ?? 0;
            return (
              <Card key={hw.id} className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between group">
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant={tc.variant as any} className="text-[10px] gap-1">
                        {tc.label}
                      </Badge>
                      {hw.priority && (
                        <Badge variant="outline" className={`text-[10px] ${priorityConfig[hw.priority] ?? ""}`}>
                          {hw.priority}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                      {sc.label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{hw.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hw.description || "No specific instructions provided."}</p>
                  </div>

                  {hw.attachments && hw.attachments.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {hw.attachments.slice(0, 3).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block h-12 w-12 rounded-md overflow-hidden border border-border/60 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`attachment ${i + 1}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                      {hw.attachments.length > 3 && (
                        <span className="text-[11px] text-muted-foreground self-center">+{hw.attachments.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{hw.className} (Sec {hw.sectionName})</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{hw.teacherName}</span>
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Due {formatDate(hw.dueDate)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/20 border-t border-border/50 flex items-center justify-between text-xs gap-2">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{submitted}</strong> submitted
                  </span>
                  {canWrite && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(hw)}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hw)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Assignment Title</TableHead>
                <TableHead>Class &amp; Section</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right tabular-nums">Submissions</TableHead>
                <TableHead>Status</TableHead>
                {canWrite && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((hw) => {
                const sc = statusConfig[hw.status] || statusConfig.ACTIVE;
                const tc = typeConfig[(hw.homeworkType as HomeworkType) || "HW"] || typeConfig.HW;
                const submitted = hw.submissionsCount ?? 0;
                return (
                  <TableRow key={hw.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell><Badge variant={tc.variant as any} className="text-[10px]">{tc.label}</Badge></TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground text-sm block">{hw.title}</span>
                        <span className="text-[11px] text-muted-foreground block">{hw.branchName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{hw.className} - {hw.sectionName}</TableCell>
                    <TableCell className="text-xs text-foreground">{hw.teacherName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(hw.dueDate)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono">{submitted} submitted</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${sc.className}`}>{sc.label}</Badge></TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(hw)}><Edit3 className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hw)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task — {editing?.homeworkType || "HW"}</DialogTitle>
            <DialogDescription>Update CW/HW/Assignment/Project details. Changes reflect immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Title</label>
              <Input {...register("title")} className={errors.title ? "border-rose-500" : ""} />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Type</label>
                <Select value={watch("homeworkType")} onValueChange={(v) => setValue("homeworkType", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CW">CW</SelectItem>
                    <SelectItem value="HW">HW</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                    <SelectItem value="PROJECT">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Status</label>
                <Select value={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Due Date</label>
              <Input type="date" {...register("dueDate")} className={errors.dueDate ? "border-rose-500" : ""} />
              {errors.dueDate && <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Priority</label>
              <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Description</label>
              <Textarea {...register("description")} rows={3} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Add attachment (image/PDF, appended)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="text-xs"
                onChange={(e) => setAttachFile(e.target.files?.[0] ?? null)}
              />
              {attachFile && <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Paperclip className="h-3 w-3" />{attachFile.name}</p>}
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
