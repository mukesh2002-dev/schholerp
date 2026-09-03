"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AdmissionApplication, AdmissionStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
import { AdmissionFormDialog } from "@/components/admissions/admission-form-dialog";
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
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  GraduationCap,
  Sparkles,
  TrendingUp,
  FileCheck2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function AdmissionsPage() {
  const { activeBranchId } = useERP();
  const [admissions, setAdmissions] = useState(() => mockDb.getAdmissions(activeBranchId));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const refreshList = () => {
    setAdmissions(mockDb.getAdmissions(activeBranchId));
  };

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const matchesSearch =
        a.applicantFullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.parentEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchesGrade = gradeFilter === "ALL" || a.gradeApplied === gradeFilter;

      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [admissions, searchQuery, statusFilter, gradeFilter]);

  // KPIs
  const totalCount = admissions.length;
  const newCount = admissions.filter((a) => a.status === "NEW").length;
  const reviewCount = admissions.filter((a) => a.status === "UNDER_REVIEW").length;
  const interviewCount = admissions.filter((a) => a.status === "INTERVIEW_SCHEDULED").length;
  const approvedCount = admissions.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Admissions & Enrollment Pipeline
            </h1>
            <Badge variant="outline" className="text-xs">
              {admissions.length} Applications
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review applicant dossiers, entrance exams, interview schedules, and document checklists.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" />
          <span>New Application</span>
        </Button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Inquiries
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{totalCount}</span>
          <span className="text-[11px] text-muted-foreground">2026-27 Intake</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            New Leads
          </span>
          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1 block">{newCount}</span>
          <span className="text-[11px] text-sky-600 font-medium">Awaiting initial review</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Under Review
          </span>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 block">{reviewCount}</span>
          <span className="text-[11px] text-purple-600 font-medium">Academic assessment</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Interviews
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">{interviewCount}</span>
          <span className="text-[11px] text-amber-600 font-medium">Scheduled with heads</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Approved & Enrolled
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{approvedCount}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Seat secured</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, app #, parent..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New Leads</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="Grade Applied" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Grades</SelectItem>
              <SelectItem value="Grade 7">Grade 7</SelectItem>
              <SelectItem value="Grade 9">Grade 9</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
              <SelectItem value="Montessori Primary">Montessori Primary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Table */}
      {filteredAdmissions.length === 0 ? (
        <EmptyState
          title="No Admission Applications Found"
          description="No candidate applications matched your current search and status filters."
          actionLabel="Register Application"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Application #</TableHead>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Grade & Campus</TableHead>
                <TableHead>Parent / Contact</TableHead>
                <TableHead>Test Score</TableHead>
                <TableHead>Docs Verified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmissions.map((app) => {
                const verifiedDocsCount = app.documents.filter((d) => d.verified).length;
                const totalDocsCount = app.documents.length;

                return (
                  <TableRow key={app.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{app.applicationNumber}</TableCell>
                    <TableCell>
                      <div>
                        <Link
                          href={`/admissions/${app.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {app.applicantFullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">
                          Submitted {formatDate(app.submissionDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-foreground block">{app.gradeApplied}</span>
                        <span className="text-muted-foreground truncate max-w-[150px] block">{app.branchName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <span className="font-medium text-foreground block">{app.parentName}</span>
                        <span className="text-muted-foreground font-mono text-[11px]">{app.parentPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.entranceTestScore ? (
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          {app.entranceTestScore}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground">
                        {verifiedDocsCount} / {totalDocsCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AdmissionStatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
                        <Link href={`/admissions/${app.id}`}>
                          <span>Dossier</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

      {/* New Application Dialog */}
      <AdmissionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
