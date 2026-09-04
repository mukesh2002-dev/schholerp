"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Teacher } from "@/types";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { TeacherFormDialog } from "@/components/teachers/teacher-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AppImage } from "@/components/ui/app-image";
import { ListPagination } from "@/components/ui/list-pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
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
  ExternalLink,
  Edit2,
} from "lucide-react";

export function TeacherDirectoryView() {
  const { activeBranchId } = useERP();
  const [teachers, setTeachers] = useState(() => mockDb.getTeachers(activeBranchId));

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  // Debounce search so filtering doesn't run on every keystroke
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const refreshList = useCallback(() => {
    setTeachers(mockDb.getTeachers(activeBranchId));
  }, [activeBranchId]);

  const filteredTeachers = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return teachers.filter((t) => {
      const matchesSearch =
        q === "" ||
        t.fullName.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.subjectsTaught.some((sub) => sub.toLowerCase().includes(q));

      const matchesDepartment = departmentFilter === "ALL" || t.department === departmentFilter;
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [teachers, debouncedQuery, departmentFilter, statusFilter]);

  const {
    page,
    totalPages,
    totalItems,
    pageItems,
    setPage,
  } = usePagination(filteredTeachers, 9);

  const handleEdit = useCallback((teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setDialogOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setTeacherToEdit(null);
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by teacher name, emp ID, department, subject..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              <SelectItem value="Science & STEM">Science &amp; STEM</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Languages & Literature">Languages &amp; Literature</SelectItem>
              <SelectItem value="Humanities & Social">Humanities &amp; Social</SelectItem>
              <SelectItem value="Physical Education">Physical Education</SelectItem>
              <SelectItem value="Arts & Music">Arts &amp; Music</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="RESIGNED">Resigned</SelectItem>
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
      {filteredTeachers.length === 0 ? (
        <EmptyState
          title="No Faculty Members Found"
          description="We couldn't find any teachers matching your criteria. Try clearing search filters or add a new faculty member."
          actionLabel="Add Faculty Member"
          onAction={handleAddNew}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Emp ID</TableHead>
                <TableHead>Instructor Name</TableHead>
                <TableHead>Department &amp; Role</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Teaching Subjects</TableHead>
                <TableHead className="text-right tabular-nums">Weekly Workload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-bold text-xs">{t.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AppImage
                        src={t.avatar}
                        alt={t.fullName}
                        className="h-8 w-8 rounded-full ring-1 ring-border"
                      />
                      <div>
                        <Link
                          href={`/teachers/${t.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {t.fullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">{t.qualification}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-foreground block">{t.department}</span>
                    <span className="text-[11px] text-muted-foreground block">{t.designation}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.branchName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {t.subjectsTaught.map((sub, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-mono font-semibold">
                    {t.assignedClasses?.reduce((acc, c) => acc + (c.weeklyPeriods || 0), 0) || 0} hrs / week
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "ACTIVE"
                          ? "success"
                          : t.status === "ON_LEAVE"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="iconSm" title="View Profile">
                        <Link href={`/teachers/${t.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleEdit(t)}
                        title="Edit Teacher"
                      >
                        <Edit2 className="h-4 w-4 text-amber-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredTeachers.length > 0 && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={9}
          onPageChange={setPage}
          label="faculty members"
        />
      )}

      {/* Dialog */}
      <TeacherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacherToEdit={teacherToEdit}
        onSuccess={refreshList}
      />
    </div>
  );
}
