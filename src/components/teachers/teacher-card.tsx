"use client";

import React from "react";
import Link from "next/link";
import { Teacher } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  ExternalLink,
  Edit2,
  Building2,
  Award,
  Layers,
  GraduationCap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppImage } from "@/components/ui/app-image";

interface TeacherCardProps {
  teacher: Teacher;
  onEdit: (teacher: Teacher) => void;
  onAssign?: (teacher: Teacher) => void;
}

function statusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "ON_LEAVE":
      return "warning";
    case "PROBATION":
      return "purple";
    default:
      return "secondary";
  }
}

export const TeacherCard = React.memo(function TeacherCard({ teacher, onEdit, onAssign }: TeacherCardProps) {
  const hasAssignments = teacher.assignedClasses && teacher.assignedClasses.length > 0;
  const subjectsLabel = teacher.subjectsTaught?.length ? teacher.subjectsTaught.join(", ") : "—";
  // Dedupe classes by class + section so every assigned class-section shows fully (no "+more")
  const classSectionList: { key: string; label: string }[] = [];
  const seen = new Set<string>();
  (teacher.assignedClasses ?? []).forEach((c) => {
    const sec = (c.sectionName || "").trim();
    const key = `${c.className}||${sec}`;
    if (seen.has(key)) return;
    seen.add(key);
    classSectionList.push({
      key,
      label: sec ? `${c.className} — Sec ${sec}` : c.className,
    });
  });

  return (
    <Card className="group relative overflow-hidden border-border/80 hover:border-primary/50 transition-all duration-200 hover:shadow-lg bg-card">
      <CardContent className="p-5 space-y-4">
        {/* Header: Avatar, Name, Designation & Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <AppImage
                src={teacher.avatar}
                alt={teacher.fullName}
                className="h-12 w-12 rounded-xl ring-1 ring-border shadow-2xs object-cover"
              />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-muted-foreground">{teacher.employeeId}</span>
                <Badge variant={statusVariant(teacher.status) as any} className="text-[9px] py-0 px-1">
                  {teacher.status}
                </Badge>
              </div>
              <Link
                href={`/teachers/${teacher.id}`}
                className="text-base font-bold text-foreground hover:text-primary transition-colors block truncate"
              >
                {teacher.fullName}
              </Link>
              <span className="text-xs text-muted-foreground block truncate">{teacher.designation}</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{teacher.branchName}</span>
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/teachers/${teacher.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>View Profile</span>
                </Link>
              </DropdownMenuItem>
              {onAssign && (
                <DropdownMenuItem onClick={() => onAssign(teacher)} className="flex items-center gap-2 cursor-pointer">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Assign Classes</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(teacher)} className="flex items-center gap-2 cursor-pointer">
                <Edit2 className="h-4 w-4 text-amber-500" />
                <span>Edit Details</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Subject & Class-Section Pill */}
        <div className="space-y-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
          <div className="flex items-start gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="font-semibold text-foreground break-words">{subjectsLabel}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            {classSectionList.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {classSectionList.map((c) => (
                  <span
                    key={c.key}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[11px]">No class assigned</span>
            )}
          </div>
        </div>

        {/* Assigned Classes Quick Summary */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-border/50">
          <div className="p-1.5 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Assigned Load</span>
            <span className="font-bold text-foreground">
              {teacher.assignedClasses.length} {teacher.assignedClasses.length === 1 ? "Section" : "Sections"}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Attendance Rate</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{teacher.attendanceRate > 0 ? `${teacher.attendanceRate}%` : "--"}</span>
          </div>
        </div>

        {/* Actions: Assign Classes & Profile Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {onAssign && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onAssign(teacher)}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Assign</span>
            </Button>
          )}
          <Button
            asChild
            variant="default"
            size="sm"
            className={`text-xs h-8 ${!onAssign ? "col-span-2" : ""}`}
          >
            <Link href={`/teachers/${teacher.id}`}>View Profile</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
