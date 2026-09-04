"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AdmissionApplication } from "@/types";
import { AdmissionStatusBadge } from "@/components/admissions/admission-status-badge";
import { AdmissionFormDialog } from "@/components/admissions/admission-form-dialog";
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
  Search,
  ExternalLink,
  GraduationCap,
  Sparkles,
  FileCheck2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function AdmissionsPipelineView() {
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
              placeholder="Search applicant, app #, parent, email..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Pipeline Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New Lead</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="INTERVIEW_SCHEDULED">Interview</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="ENROLLED">Enrolled</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="Grade Applied" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Grades</SelectItem>
              <SelectItem value="Grade 1">Grade 1</SelectItem>
              <SelectItem value="Grade 5">Grade 5</SelectItem>
              <SelectItem value="Grade 9">Grade 9</SelectItem>
              <SelectItem value="Grade 10">Grade 10</SelectItem>
              <SelectItem value="Grade 11">Grade 11</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="text-xs self-end md:self-auto font-mono">
          Showing {filteredAdmissions.length} of {admissions.length}
        </Badge>
      </div>

      {/* Main Table View */}
      {filteredAdmissions.length === 0 ? (
        <EmptyState
          title="No Admissions Found"
          description="We couldn't find any student applications matching your filters. Try clearing your filters or create a new application dossier."
          actionLabel="Submit New Application"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Application #</TableHead>
                <TableHead>Applicant &amp; Campus</TableHead>
                <TableHead>Grade &amp; Academic Track</TableHead>
                <TableHead>Guardian Contact</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead>Document Check</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmissions.map((a) => {
                const verifiedDocs = a.documents.filter((d) => d.verified).length;
                const totalDocs = a.documents.length;
                return (
                  <TableRow key={a.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {a.applicationNumber}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Link
                          href={`/admissions/${a.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm block"
                        >
                          {a.applicantFullName}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">
                          {a.branchName} • Born {formatDate(a.dateOfBirth)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">
                        {a.gradeApplied}
                      </Badge>
                      {a.entranceTestScore !== undefined && (
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          Score: <strong className="text-foreground">{a.entranceTestScore}%</strong>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="font-medium text-foreground block">{a.parentName}</span>
                        <span className="text-[11px] text-muted-foreground block">{a.parentEmail}</span>
                        <span className="text-[11px] text-muted-foreground block">{a.parentPhone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(a.submissionDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <FileCheck2
                          className={`h-3.5 w-3.5 ${
                            verifiedDocs === totalDocs ? "text-emerald-500" : "text-amber-500"
                          }`}
                        />
                        <span className="font-mono text-[11px]">
                          {verifiedDocs}/{totalDocs} Verified
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AdmissionStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
                        <Link href={`/admissions/${a.id}`}>
                          <span>Review Dossier</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <AdmissionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
