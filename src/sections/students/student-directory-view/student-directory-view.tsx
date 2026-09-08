"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Student } from "@/types";
import { StudentCard } from "@/components/students/student-card";
import { StudentFormDialog } from "@/components/students/student-form-dialog";
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

export function StudentDirectoryView() {
  const { activeBranchId } = useERP();
  const [students, setStudents] = useState(() => mockDb.getStudents(activeBranchId));
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Debounce search so filtering doesn't run on every keystroke
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const refreshList = useCallback(() => {
    setStudents(mockDb.getStudents(activeBranchId));
  }, [activeBranchId]);

  const filteredStudents = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch =
        q === "" ||
        s.fullName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.enrollmentNumber?.toLowerCase().includes(q) ||
        s.universityPrn?.toLowerCase().includes(q) ||
        s.program?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.guardian.name.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesClass = classFilter === "ALL" || s.classId === classFilter;
      const isCollege = !!s.program;
      const matchesLevel =
        levelFilter === "ALL" ||
        (levelFilter === "COLLEGE" && isCollege) ||
        (levelFilter === "SCHOOL" && !isCollege);

      return matchesSearch && matchesStatus && matchesClass && matchesLevel;
    });
  }, [students, debouncedQuery, statusFilter, classFilter, levelFilter]);

  const {
    page,
    totalPages,
    totalItems,
    pageItems,
    setPage,
  } = usePagination(filteredStudents, 9);

  const handleEdit = useCallback((student: Student) => {
    setStudentToEdit(student);
    setDialogOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setStudentToEdit(null);
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, roll / PRN, program, dept, parent..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[125px] h-9 text-xs">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="SCHOOL">School (Nur–12)</SelectItem>
              <SelectItem value="COLLEGE">College (UG/PG)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[125px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="GRADUATED">Graduated</SelectItem>
              <SelectItem value="TRANSFERRED">Transferred</SelectItem>
            </SelectContent>
          </Select>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="Filter Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes / Programs</SelectItem>
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
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="We couldn't find any students matching your search or filters. Try adjusting your query or register a new student."
          actionLabel="Register Student"
          onAction={handleAddNew}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((student) => (
            <StudentCard key={student.id} student={student} onEdit={handleEdit} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">Roll #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class &amp; Section</TableHead>
                <TableHead>Campus</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead className="text-right tabular-nums">Attendance</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono font-bold text-xs">{s.rollNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AppImage
                        src={s.avatar}
                        alt={s.fullName}
                        className="h-8 w-8 rounded-full ring-1 ring-border"
                      />
                      <div>
                        <Link
                          href={`/students/${s.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {s.fullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">
                          Adm: {s.admissionNumber}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <div className="flex flex-col">
                      <span>{s.className} - {s.sectionName}</span>
                      {s.program && (
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {s.program} • {s.department} {s.semester ? `• Sem ${s.semester}` : ""} {s.universityPrn ? `• PRN ${s.universityPrn}` : ""}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="block">{s.branchName}</span>
                    {s.program && <Badge variant="outline" className="text-[9px] py-0 px-1 mt-0.5">{s.program}</Badge>}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="font-medium text-foreground block">{s.guardian.name}</span>
                    <span className="text-[11px] text-muted-foreground block">{s.guardian.phone}</span>
                    {s.mentorName && <span className="text-[10px] text-primary block">Mentor: {s.mentorName}</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-mono font-semibold">
                    <span className={(s.attendanceSummary?.attendanceRate ?? 0) >= 95 ? "text-emerald-600" : "text-amber-600"}>
                      {s.attendanceSummary?.attendanceRate ?? 0}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        s.feeSummary?.status === "PAID"
                          ? "success"
                          : s.feeSummary?.status === "PARTIAL"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {s.feeSummary?.status ?? "PENDING"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === "ACTIVE" ? "outline" : "secondary"}
                      className="text-[10px]"
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="iconSm" title="View 360 Profile">
                        <Link href={`/students/${s.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleEdit(s)}
                        title="Edit Student"
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

      {filteredStudents.length > 0 && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={9}
          onPageChange={setPage}
          label="students"
        />
      )}

      {/* Dialog */}
      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentToEdit={studentToEdit}
        onSuccess={refreshList}
      />
    </div>
  );
}
