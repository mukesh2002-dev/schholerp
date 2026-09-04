"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Homework, HomeworkStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Search,
  LayoutGrid,
  List,
  BookOpen,
  CalendarDays,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<HomeworkStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

export function HomeworkDirectoryView() {
  const { activeBranchId } = useERP();
  const [homeworkList, setHomeworkList] = useState(() => mockDb.getHomeworkList(activeBranchId) || []);
  const [classes] = useState(() => mockDb.getClasses(activeBranchId) || []);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const filteredList = useMemo(() => {
    return homeworkList.filter((hw) => {
      const matchesSearch =
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hw.className.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || hw.status === statusFilter;
      const matchesClass = classFilter === "ALL" || hw.classId === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [homeworkList, searchQuery, statusFilter, classFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject, teacher, class..."
              className="pl-9 h-9 text-xs"
            />
          </div>

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

        {/* View Switcher */}
        <div className="flex items-center gap-1 self-end md:self-auto border border-border/80 rounded-lg p-0.5 bg-muted/30">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>
      </div>

      {/* Main View */}
      {filteredList.length === 0 ? (
        <EmptyState
          title="No Homework Tasks Found"
          description="No assignment tasks match your search criteria. Try modifying your filters or assign a new task."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((hw) => {
            const sc = statusConfig[hw.status] || statusConfig.ACTIVE;
            const submissions = hw.submissions || [];
            const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
            return (
              <Card
                key={hw.id}
                className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {hw.subjectName}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                      {sc.label}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{hw.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {hw.description || "No specific instructions provided."}
                    </p>
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

                <div className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{submissions.length}</strong> submitted (
                    {gradedCount} graded)
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    {hw.branchName}
                  </span>
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
                <TableHead>Assignment Title</TableHead>
                <TableHead>Class &amp; Section</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((hw) => {
                const sc = statusConfig[hw.status] || statusConfig.ACTIVE;
                const submissions = hw.submissions || [];
                const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
                return (
                  <TableRow key={hw.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground text-sm block">{hw.title}</span>
                        <span className="text-[11px] text-muted-foreground block">{hw.branchName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {hw.className} - {hw.sectionName}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {hw.subjectName}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-foreground">{hw.teacherName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(hw.dueDate)}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {submissions.length} submitted ({gradedCount} graded)
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                        {sc.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
