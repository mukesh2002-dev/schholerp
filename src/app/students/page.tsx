"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Student, StudentStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StudentCard } from "@/components/students/student-card";
import { StudentFormDialog } from "@/components/students/student-form-dialog";
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
  GraduationCap,
  Plus,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Edit2,
  Users,
  Building2,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function StudentsPage() {
  const { activeBranchId } = useERP();
  const [students, setStudents] = useState(() => mockDb.getStudents(activeBranchId));
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const refreshList = () => {
    setStudents(mockDb.getStudents(activeBranchId));
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.guardian.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesClass = classFilter === "ALL" || s.classId === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [students, searchQuery, statusFilter, classFilter]);

  const handleEdit = (student: Student) => {
    setStudentToEdit(student);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setStudentToEdit(null);
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
              Student Directory & Roster
            </h1>
            <Badge variant="outline" className="text-xs">
              {students.length} Enrolled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage student records, class & section assignments, guardian contacts, and attendance profiles.
          </p>
        </div>

        <Button onClick={handleAddNew} variant="gradient" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Register New Student</span>
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
              placeholder="Search name, roll #, admission #, guardian..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Classes" />
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="GRADUATED">Graduated</SelectItem>
              <SelectItem value="TRANSFERRED">Transferred</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
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

      {/* Main Student Directory Content */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="No student profiles matched your search and filter criteria."
          actionLabel="Register New Student"
          onAction={handleAddNew}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Roll #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class & Section</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono font-bold text-xs">{s.rollNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar}
                        alt={s.fullName}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
                      />
                      <div>
                        <Link
                          href={`/students/${s.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {s.fullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">{s.gender} • Blood: {s.bloodGroup}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-bold text-foreground block">{s.className}</span>
                    <span className="text-muted-foreground">{s.sectionName}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.branchName}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground block">{s.guardian.name}</span>
                    <span className="text-muted-foreground font-mono text-[11px]">{s.guardian.phone}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600 text-xs">{s.attendanceSummary.attendanceRate}%</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.feeSummary.status === "PAID"
                          ? "success"
                          : s.feeSummary.status === "PARTIAL"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {s.feeSummary.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="iconSm" asChild title="View 360° Profile">
                        <Link href={`/students/${s.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="iconSm" onClick={() => handleEdit(s)} title="Edit Student">
                        <Edit2 className="h-4 w-4 text-amber-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      {/* Add / Edit Student Dialog */}
      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentToEdit={studentToEdit}
        onSuccess={refreshList}
      />
    </div>
  );
}
