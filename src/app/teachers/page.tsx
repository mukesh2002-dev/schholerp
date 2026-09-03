"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Teacher, TeacherStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { TeacherFormDialog } from "@/components/teachers/teacher-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Users,
  Plus,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Edit2,
  Building2,
  Award,
} from "lucide-react";

export default function TeachersPage() {
  const { activeBranchId } = useERP();
  const [teachers, setTeachers] = useState(() => mockDb.getTeachers(activeBranchId));

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  const refreshList = () => {
    setTeachers(mockDb.getTeachers(activeBranchId));
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subjectsTaught.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment = departmentFilter === "ALL" || t.department === departmentFilter;
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [teachers, searchQuery, departmentFilter, statusFilter]);

  const handleEdit = (teacher: Teacher) => {
    setTeacherToEdit(teacher);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setTeacherToEdit(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Faculty & Teacher Management
            </h1>
            <Badge variant="outline" className="text-xs">
              {teachers.length} Active Instructors
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Faculty credentials, department allocations, teaching assignments, and attendance records.
          </p>
        </div>

        <Button onClick={handleAddNew} variant="gradient" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Faculty Member</span>
        </Button>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty name, ID, subject..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              <SelectItem value="Mathematics & Computing">Mathematics & Computing</SelectItem>
              <SelectItem value="Science & Technology">Science & Technology</SelectItem>
              <SelectItem value="Computer Science & AI">Computer Science & AI</SelectItem>
              <SelectItem value="Early Childhood (Toddler & Primary)">Early Childhood</SelectItem>
              <SelectItem value="International Baccalaureate (IB)">IB Diploma</SelectItem>
              <SelectItem value="Visual Arts & Digital Design">Visual Arts</SelectItem>
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
              <SelectItem value="PROBATION">Probation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Switcher */}
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

      {/* Main Teachers Content */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          title="No Faculty Members Found"
          description="We couldn't find any teachers matching your search and filter criteria."
          actionLabel="Add Faculty Member"
          onAction={handleAddNew}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Employee ID</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Department & Title</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Subjects Taught</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono font-bold text-xs">{t.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={t.avatar}
                        alt={t.fullName}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
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
                  <TableCell className="text-xs">
                    <span className="font-bold text-foreground block">{t.department}</span>
                    <span className="text-muted-foreground">{t.designation}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.branchName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.subjectsTaught.join(", ")}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600 text-xs">{t.attendanceRate}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === "ACTIVE"
                          ? "success"
                          : t.status === "ON_LEAVE"
                          ? "warning"
                          : "purple"
                      }
                      className="text-[10px]"
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="iconSm" asChild title="View Profile">
                        <Link href={`/teachers/${t.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="iconSm" onClick={() => handleEdit(t)} title="Edit Faculty">
                        <Edit2 className="h-4 w-4 text-amber-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      {/* Add / Edit Teacher Dialog */}
      <TeacherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacherToEdit={teacherToEdit}
        onSuccess={refreshList}
      />
    </div>
  );
}
