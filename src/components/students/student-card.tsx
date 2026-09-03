"use client";

import React from "react";
import Link from "next/link";
import { Student } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  ExternalLink,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
}

export function StudentCard({ student, onEdit }: StudentCardProps) {
  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "GRADUATED":
        return "purple";
      case "TRANSFERRED":
        return "warning";
      case "SUSPENDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const feeBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success" className="text-[9px] py-0 px-1.5">Fees Cleared</Badge>;
      case "PARTIAL":
        return <Badge variant="warning" className="text-[9px] py-0 px-1.5">Partial Fee</Badge>;
      case "PENDING":
        return <Badge variant="destructive" className="text-[9px] py-0 px-1.5">Fee Due</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px] py-0 px-1.5">{status}</Badge>;
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/80 hover:border-primary/40 transition-all duration-200 hover:shadow-md bg-card">
      <CardContent className="p-5 space-y-3.5">
        {/* Header: Avatar, Name, Badges & Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={student.avatar}
                alt={student.fullName}
                className="h-12 w-12 rounded-xl object-cover ring-1 ring-border shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-bold px-1 rounded bg-secondary text-secondary-foreground border border-border">
                {student.bloodGroup}
              </span>
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-muted-foreground">{student.rollNumber}</span>
                <Badge variant={statusVariant(student.status) as any} className="text-[9px] py-0 px-1">
                  {student.status}
                </Badge>
              </div>
              <Link
                href={`/students/${student.id}`}
                className="text-base font-bold text-foreground hover:text-primary transition-colors block truncate"
              >
                {student.fullName}
              </Link>
              <span className="text-xs text-muted-foreground block truncate">
                {student.className} • {student.sectionName}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/students/${student.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>360° Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(student)} className="flex items-center gap-2 cursor-pointer">
                <Edit2 className="h-4 w-4 text-amber-500" />
                <span>Edit Record</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Campus & Guardian Info */}
        <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] font-medium text-foreground truncate">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              {student.branchName}
            </span>
            {feeBadge(student.feeSummary.status)}
          </div>
          <div className="text-[11px] truncate pt-0.5">
            Guardian: <strong className="text-foreground">{student.guardian.name}</strong> ({student.guardian.phone})
          </div>
        </div>

        {/* Key Metrics Ribbon: Attendance & GPA */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Attendance</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {student.attendanceSummary.attendanceRate}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Latest Term GPA</span>
            <span className="font-bold text-foreground">
              {student.academicHistory[0]?.gpa ? `${student.academicHistory[0].gpa} / 4.0` : "A"}
            </span>
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-1">
          <Button asChild variant="outline" size="sm" className="w-full text-xs h-8">
            <Link href={`/students/${student.id}`}>View Full Dossier →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
