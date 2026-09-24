"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { fetchTeachers } from "@/lib/api/teachers";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { Teacher } from "@/types";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { TeacherFormDialog } from "@/components/teachers/teacher-form-dialog";
import { TeacherAssignDialog } from "@/components/teachers/teacher-assign-dialog";
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
  Layers,
  GraduationCap,
} from "lucide-react";

export function TeacherDirectoryView() {
  const { activeBranchId } = useERP();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  // Assign Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [teacherToAssign, setTeacherToAssign] = useState<Teacher | null>(null);

  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const {
    data: teachers,
    isLoading: teachersLoading,
    isOffline: teachersOffline,
    error: teachersError,
    refresh: refreshTeachers,
  } = useCampusData<Teacher[]>({
    fetcher: (cid) => fetchTeachers({ campusId: cid, search: debouncedQuery, department: departmentFilter }).then((r) => r.data),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: `teachers-${debouncedQuery}-${departmentFilter}`,
  });

  const refreshList = useCallback(() => {
    void refreshTeachers();
  }, [refreshTeachers]);

  const filteredTeachers = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return (teachers || []).filter((t) => {
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

  const handleAssign = useCallback((teacher: Teacher) => {
    setTeacherToAssign(teacher);
    setAssignDialogOpen(true);
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.department) set.add(t.department);
    });
    return Array.from(set).sort();
  }, [teachers]);

  return (
    <div className="space-y-6">
      {teachersOffline && (
        <SectionOfflineBanner isOffline={teachersOffline} error={teachersError ? String(teachersError) : null} isLoading={teachersLoading} />
      )}

      {/* Control Bar: Search, Filters, View Mode */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-2xs">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search faculty by name, ID, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_LEAVE">On Leave</SelectItem>
              <SelectItem value="PROBATION">Probation</SelectItem>
              <SelectItem value="RESIGNED">Resigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border border-border p-0.5 rounded-lg bg-muted/40 self-end md:self-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Directory Grid / Table */}
      {teachersLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-border/60 bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <EmptyState
          title="No Faculty Members Found"
          description="Try adjusting your search query or department filters."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pageItems.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={handleEdit}
              onAssign={handleAssign}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead>Instructor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects Taught</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {pageItems.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AppImage
                        src={t.avatar}
                        alt={t.fullName}
                        className="h-9 w-9 rounded-lg ring-1 ring-border object-cover"
                      />
                      <div>
                        <Link
                          href={`/teachers/${t.id}`}
                          className="font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {t.fullName}
                        </Link>
                        <p className="text-[11px] text-muted-foreground font-mono">{t.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{t.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.subjectsTaught.slice(0, 2).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      {t.subjectsTaught.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">+{t.subjectsTaught.length - 2}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">
                      {t.assignedClasses.length} {t.assignedClasses.length === 1 ? "Section" : "Sections"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => handleAssign(t)}
                      >
                        <Layers className="h-3 w-3" />
                        <span>Assign</span>
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="h-7 text-[11px]">
                        <Link href={`/teachers/${t.id}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] text-amber-500"
                        onClick={() => handleEdit(t)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          pageSize={9}
          onPageChange={setPage}
          totalItems={totalItems}
        />
      )}

      {/* Teacher Form Edit / Add Dialog */}
      <TeacherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacherToEdit={teacherToEdit}
        onSuccess={refreshList}
      />

      {/* Teacher Class & Subject Assign Dialog */}
      <TeacherAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        teacher={teacherToAssign}
        onSuccess={refreshList}
      />
    </div>
  );
}
