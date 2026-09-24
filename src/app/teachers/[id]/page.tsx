"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchTeacherById,
  fetchTeacherAssignments,
  removeTeacherAssignment,
} from "@/lib/api/teachers";
import { Teacher } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TeacherFormDialog } from "@/components/teachers/teacher-form-dialog";
import { TeacherAssignDialog } from "@/components/teachers/teacher-assign-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowLeft,
  Edit2,
  Award,
  Layers,
  CalendarDays,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const [assignments, setAssignments] = useState<{
    classAssignments: any[];
    subjectAssignments: any[];
  }>({ classAssignments: [], subjectAssignments: [] });
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!teacherId) return;
    try {
      const { fetchStaffAttendance } = await import("@/lib/api/staff");
      const [t, a, att] = await Promise.all([
        fetchTeacherById(teacherId),
        fetchTeacherAssignments(teacherId).catch(() => ({ classAssignments: [], subjectAssignments: [] })),
        fetchStaffAttendance(teacherId).catch(() => []),
      ]);
      setTeacher(t);
      setAssignments(a);
      setAttendanceRecords(att || []);
      if (Array.isArray(att) && att.length > 0) {
        const presents = att.filter((x: any) => x.status === "present" || x.status === "late").length;
        setAttendanceRate(Math.round((presents / att.length) * 100));
      } else {
        setAttendanceRate(null);
      }
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveAssignment = async (uuid: string, type: "class" | "subject") => {
    try {
      await removeTeacherAssignment(teacherId, uuid, type);
      toast.success("Assignment removed successfully");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove assignment");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading faculty profile &amp; workload...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Teacher not found</p>
          <Button asChild variant="outline" className="mt-4 text-xs">
            <Link href="/teachers">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Faculty Directory
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const totalAllocations = (assignments.classAssignments?.length || 0) + (assignments.subjectAssignments?.length || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumbs />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => setAssignDialogOpen(true)}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Assign Subject / Class</span>
          </Button>
          <Button
            size="sm"
            variant="default"
            className="text-xs gap-1"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Profile Header Banner */}
      <Card className="overflow-hidden border-border bg-card shadow-xs">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20" />
        <CardContent className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={teacher.avatar}
                alt={teacher.fullName}
                className="h-20 w-20 rounded-2xl ring-4 ring-card bg-card object-cover shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {teacher.fullName}
                  </h1>
                  <Badge variant="outline" className="font-mono text-xs">
                    {teacher.employeeId}
                  </Badge>
                  <Badge variant={teacher.status === "ACTIVE" ? "success" : "secondary"} className="text-xs">
                    {teacher.status}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span>{teacher.designation}</span>
                  <span className="text-muted-foreground/50 font-bold">&bull;</span>
                  <span>{teacher.department}</span>
                  <span className="text-muted-foreground/50 font-bold">&bull;</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-primary" /> {teacher.branchName}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button asChild size="sm" variant="ghost" className="text-xs gap-1 text-muted-foreground">
                <Link href={`/staff/${teacher.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>View in HR &amp; Payroll</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="academic" className="space-y-6">
        <TabsList className="grid grid-cols-3 sm:w-[420px]">
          <TabsTrigger value="academic" className="text-xs gap-1">
            <Layers className="h-3.5 w-3.5" /> Academic Allocations
          </TabsTrigger>
          <TabsTrigger value="timetable" className="text-xs gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs gap-1">
            <FileText className="h-3.5 w-3.5" /> Dossier Info
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Academic Allocations */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Assigned Classes &amp; Subjects</CardTitle>
                <CardDescription className="text-xs">
                  Active teaching curriculum assigned to {teacher.fullName} ({totalAllocations} active)
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="text-xs gap-1"
                onClick={() => setAssignDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Assign Class/Subject
              </Button>
            </CardHeader>
            <CardContent>
              {totalAllocations === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-xl">
                  <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium">No Classes or Subjects Allocated</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assign a class or subject to start scheduling timetable periods.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 text-xs gap-1"
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Assign Now
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/40">
                      <TableHead>Type</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="w-16 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {assignments.classAssignments?.map((ca: any) => (
                      <TableRow key={ca.uuid}>
                        <TableCell>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                            Class In-Charge
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{ca.class?.name || "All Classes"}</TableCell>
                        <TableCell>{ca.section || ca.class?.section || "All Sections"}</TableCell>
                        <TableCell className="text-muted-foreground">Class Mentorship</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveAssignment(ca.uuid, "class")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {assignments.subjectAssignments?.map((sa: any) => (
                      <TableRow key={sa.uuid}>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            Subject Teacher
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{sa.class?.name}</TableCell>
                        <TableCell>{sa.section || "All"}</TableCell>
                        <TableCell className="font-bold text-primary">{sa.subject?.name}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveAssignment(sa.uuid, "subject")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Timetable Schedule */}
        <TabsContent value="timetable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Weekly Routine &amp; Workload</CardTitle>
              <CardDescription className="text-xs">
                Weekly schedule generated according to assigned subjects and periods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-muted/40 border">
                  <span className="text-[10px] text-muted-foreground block">Weekly Periods</span>
                  <span className="text-lg font-bold text-foreground">
                    {Math.max(12, totalAllocations * 5)} Periods
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border">
                  <span className="text-[10px] text-muted-foreground block">Teaching Sections</span>
                  <span className="text-lg font-bold text-foreground">{totalAllocations}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border">
                  <span className="text-[10px] text-muted-foreground block">Attendance Rate</span>
                  <span className="text-lg font-bold text-emerald-600">{attendanceRate !== null ? `${attendanceRate}%` : "-- (No records)"}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border">
                  <span className="text-[10px] text-muted-foreground block">Leaves Balance</span>
                  <span className="text-lg font-bold text-primary">{teacher.leaveSummary.balance} Days</span>
                </div>
              </div>

              <div className="p-6 text-center border border-dashed rounded-xl bg-muted/20">
                <CalendarDays className="h-8 w-8 mx-auto text-primary/60 mb-2" />
                <p className="text-xs font-semibold">Master Timetable Integrated</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  View and edit detailed slot allocations in the Timetable module.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3 text-xs">
                  <Link href="/timetable">Open Master Timetable</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Dossier Information */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Contact &amp; Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{teacher.email || "Not set"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{teacher.phone || "Not set"}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium">{formatDate(teacher.joiningDate)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{teacher.experienceYears} Years</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Academic Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Highest Degree:</span>
                  <span className="font-medium">{teacher.qualification}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{teacher.department}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Designation:</span>
                  <span className="font-medium">{teacher.designation}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TeacherFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        teacherToEdit={teacher}
        onSuccess={loadData}
      />

      <TeacherAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        teacher={teacher}
        onSuccess={loadData}
      />
    </div>
  );
}
