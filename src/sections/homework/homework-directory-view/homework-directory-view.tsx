"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
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
import { Search, LayoutGrid, List, BookOpen, CalendarDays, User, Edit3, Trash2, FileText, Beaker } from "lucide-react";
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

const editSchema = z.object({
  title: z.string().min(1, "Required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Required"),
  maxMarks: z.string().optional(),
  homeworkType: z.enum(["CW", "HW", "ASSIGNMENT", "PROJECT"]),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
});

type EditValues = z.infer<typeof editSchema>;

export function HomeworkDirectoryView() {
  const { activeBranchId } = useERP();
  const [homeworkList, setHomeworkList] = useState(() => mockDb.getHomeworkList(activeBranchId) || []);
  const [classes] = useState(() => mockDb.getClasses(activeBranchId) || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: "", description: "", dueDate: "", maxMarks: "100", homeworkType: "HW", status: "ACTIVE" },
  });

  const refresh = useCallback(() => {
    setHomeworkList([...mockDb.getHomeworkList(activeBranchId)]);
  }, [activeBranchId]);

  React.useEffect(() => {
    const h = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("homework-updated", h);
      return () => window.removeEventListener("homework-updated", h);
    }
  }, [refresh]);

  const filteredList = useMemo(() => {
    return homeworkList.filter((hw) => {
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.className.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || hw.status === statusFilter;
      const matchesClass = classFilter === "ALL" || hw.classId === classFilter;
      const matchesType = typeFilter === "ALL" || (hw.homeworkType || "HW") === typeFilter;
      return matchesSearch && matchesStatus && matchesClass && matchesType;
    });
  }, [homeworkList, searchQuery, statusFilter, classFilter, typeFilter]);

  const openEdit = (hw: Homework) => {
    setEditing(hw);
    reset({
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split("T")[0] : "",
      maxMarks: String(hw.maxMarks),
      homeworkType: (hw.homeworkType || "HW") as any,
      status: hw.status,
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (data: EditValues) => {
    if (!editing) return;
    mockDb.saveHomework({
      ...editing,
      title: data.title,
      description: data.description || "",
      dueDate: new Date(data.dueDate).toISOString(),
      maxMarks: Number(data.maxMarks) || 0,
      homeworkType: data.homeworkType as HomeworkType,
      status: data.status as HomeworkStatus,
    });
    toast.success("Updated successfully");
    setEditOpen(false);
    refresh();
  };

  const handleDelete = (hw: Homework) => {
    // simple delete via filtering and saving to localStorage directly (since mockDb has no delete, we filter)
    const all = mockDb.getHomeworkList();
    const filtered = all.filter((h) => h.id !== hw.id);
    if (typeof window !== "undefined") localStorage.setItem("school_erp_homework_v1", JSON.stringify(filtered));
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 max-w-sm min-w-[180px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by title, subject, teacher, class..." className="pl-9 h-9 text-xs" />
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
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
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

      {filteredList.length === 0 ? (
        <EmptyState title="No Homework Tasks Found" description="No assignment tasks match your search criteria. Try modifying your filters or assign a new task." />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((hw) => {
            const sc = statusConfig[hw.status] || statusConfig.ACTIVE;
            const tc = typeConfig[(hw.homeworkType as HomeworkType) || "HW"] || typeConfig.HW;
            const submissions = mockDb.getHomeworkSubmissions(hw.id);
            const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
            return (
              <Card key={hw.id} className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between group">
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant={tc.variant as any} className="text-[10px] gap-1">
                        {tc.label}
                      </Badge>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{hw.subjectName}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                      {sc.label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{hw.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hw.description || "No specific instructions provided."}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{hw.className} (Sec {hw.sectionName})</span>
                      </span>
                      <span className="font-semibold text-foreground">{hw.maxMarks} Marks</span>
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
                    <strong className="text-foreground">{submissions.length}</strong> submitted ({gradedCount} graded)
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(hw)}>
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hw)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
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
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right tabular-nums">Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((hw) => {
                const sc = statusConfig[hw.status] || statusConfig.ACTIVE;
                const tc = typeConfig[(hw.homeworkType as HomeworkType) || "HW"] || typeConfig.HW;
                const submissions = mockDb.getHomeworkSubmissions(hw.id);
                const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
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
                    <TableCell className="text-xs"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">{hw.subjectName}</span></TableCell>
                    <TableCell className="text-xs text-foreground">{hw.teacherName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(hw.dueDate)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono">{submissions.length} submitted ({gradedCount} graded)</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${sc.className}`}>{sc.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(hw)}><Edit3 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hw)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Due Date</label>
                <Input type="date" {...register("dueDate")} className={errors.dueDate ? "border-rose-500" : ""} />
                {errors.dueDate && <p className="text-[11px] text-rose-500 mt-1">{errors.dueDate.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Max Marks</label>
                <Input type="number" {...register("maxMarks")} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Description</label>
              <Textarea {...register("description")} rows={3} />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
