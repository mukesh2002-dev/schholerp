"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Homework, HomeworkStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ClipboardList,
  LayoutGrid,
  List,
  BookOpen,
  CalendarDays,
  User,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<HomeworkStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

export default function HomeworkPage() {
  const { activeBranchId } = useERP();
  const [homeworkList, setHomeworkList] = useState(() => mockDb.getHomeworkList(activeBranchId));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectName: "",
    subjectCode: "",
    className: "",
    sectionName: "",
    teacherName: "",
    dueDate: "",
    maxMarks: 50,
  });

  const refreshList = () => {
    setHomeworkList(mockDb.getHomeworkList(activeBranchId));
  };

  const classes = useMemo(() => {
    const unique = new Set(homeworkList.map((h) => h.className));
    return Array.from(unique);
  }, [homeworkList]);

  const subjects = useMemo(() => {
    const unique = new Set(homeworkList.map((h) => h.subjectName));
    return Array.from(unique);
  }, [homeworkList]);

  const filteredHomework = useMemo(() => {
    return homeworkList.filter((hw) => {
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || hw.status === statusFilter;
      const matchesClass = classFilter === "ALL" || hw.className === classFilter;
      const matchesSubject = subjectFilter === "ALL" || hw.subjectName === subjectFilter;
      return matchesSearch && matchesStatus && matchesClass && matchesSubject;
    });
  }, [homeworkList, searchQuery, statusFilter, classFilter, subjectFilter]);

  const handleCreate = () => {
    mockDb.saveHomework({
      title: formData.title,
      description: formData.description,
      subjectId: "sub-new",
      subjectName: formData.subjectName,
      subjectCode: formData.subjectCode,
      classId: "cls-new",
      className: formData.className,
      sectionId: "sec-new",
      sectionName: formData.sectionName,
      branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId,
      branchName: "Apex Global Campus",
      teacherId: "tch-new",
      teacherName: formData.teacherName,
      assignedDate: new Date().toISOString().split("T")[0],
      dueDate: formData.dueDate,
      maxMarks: formData.maxMarks,
      status: "ACTIVE",
    });
    setDialogOpen(false);
    setFormData({ title: "", description: "", subjectName: "", subjectCode: "", className: "", sectionName: "", teacherName: "", dueDate: "", maxMarks: 50 });
    refreshList();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Homework Assignments
            </h1>
            <Badge variant="outline" className="text-xs">
              {homeworkList.length} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage homework tasks, track student submissions, and grade assignments.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homework title, subject, teacher..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredHomework.length === 0 ? (
        <EmptyState
          title="No Homework Assignments Found"
          description="No assignments matched your current filters. Create a new homework assignment to get started."
          actionLabel="Create Assignment"
          onAction={() => setDialogOpen(true)}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHomework.map((hw) => (
            <Link key={hw.id} href={`/homework/${hw.id}`}>
              <Card className="border-border/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2">
                      {hw.title}
                    </h3>
                    <Badge variant="outline" className={`shrink-0 text-[10px] border ${statusConfig[hw.status].className}`}>
                      {statusConfig[hw.status].label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span className="font-medium">{hw.subjectName}</span>
                    <span className="text-border">•</span>
                    <span>{hw.className} ({hw.sectionName})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>{hw.teacherName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Due: <span className="font-semibold text-foreground">{formatDate(hw.dueDate)}</span></span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">{hw.maxMarks}</span> marks
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHomework.map((hw) => (
                <TableRow key={hw.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/homework/${hw.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                    >
                      {hw.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground">{hw.subjectName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {hw.className} ({hw.sectionName})
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{hw.teacherName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(hw.assignedDate)}</TableCell>
                  <TableCell className="text-xs font-semibold text-foreground">{formatDate(hw.dueDate)}</TableCell>
                  <TableCell className="text-xs font-bold text-foreground">{hw.maxMarks}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] border ${statusConfig[hw.status].className}`}>
                      {statusConfig[hw.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Homework Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Create New Homework</DialogTitle>
            <DialogDescription>
              Fill in the details below to assign a new homework task to students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3 text-xs">
            <div>
              <label className="font-medium text-foreground mb-1 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Quadratic Equations Problem Set"
                className="h-9"
              />
            </div>

            <div>
              <label className="font-medium text-foreground mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the assignment tasks, expectations, and instructions..."
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs shadow-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground mb-1 block">Subject Name</label>
                <Input
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="h-9"
                />
              </div>
              <div>
                <label className="font-medium text-foreground mb-1 block">Subject Code</label>
                <Input
                  value={formData.subjectCode}
                  onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                  placeholder="e.g. MATH-10"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground mb-1 block">Class</label>
                <Input
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="e.g. Grade 10"
                  className="h-9"
                />
              </div>
              <div>
                <label className="font-medium text-foreground mb-1 block">Section</label>
                <Input
                  value={formData.sectionName}
                  onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                  placeholder="e.g. Section A"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground mb-1 block">Teacher Name</label>
                <Input
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="e.g. Dr. Sarah Lin"
                  className="h-9"
                />
              </div>
              <div>
                <label className="font-medium text-foreground mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-foreground mb-1 block">Max Marks</label>
              <Input
                type="number"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                className="h-9 w-32"
                min={1}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleCreate}
              disabled={!formData.title || !formData.subjectName || !formData.className}
            >
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
