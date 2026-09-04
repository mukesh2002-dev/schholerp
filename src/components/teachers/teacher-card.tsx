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

export const TeacherCard = React.memo(function TeacherCard({ teacher, onEdit }: TeacherCardProps) {

  return (
    <Card className="group relative overflow-hidden border-border/80 hover:border-primary/40 transition-all duration-200 hover:shadow-md bg-card">
      <CardContent className="p-5 space-y-4">
        {/* Header: Avatar, Name, Designation & Action Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <AppImage
                src={teacher.avatar}
                alt={teacher.fullName}
                className="h-12 w-12 rounded-xl ring-1 ring-border shadow-2xs"
              />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
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
                <Link href={`/teachers/${teacher.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>View Dossier</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(teacher)} className="flex items-center gap-2 cursor-pointer">
                <Edit2 className="h-4 w-4 text-amber-500" />
                <span>Edit Faculty</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Department & Campus Pill */}
        <div className="space-y-1 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground truncate">{teacher.department}</span>
            <span className="text-[10px] text-muted-foreground">{teacher.experienceYears}y exp</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate pt-0.5">
            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{teacher.branchName}</span>
          </div>
        </div>

        {/* Subjects Taught Chips */}
        <div className="flex flex-wrap gap-1">
          {teacher.subjectsTaught.slice(0, 2).map((sub) => (
            <span
              key={sub}
              className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium truncate max-w-[140px]"
            >
              {sub}
            </span>
          ))}
          {teacher.subjectsTaught.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground bg-muted">
              +{teacher.subjectsTaught.length - 2} more
            </span>
          )}
        </div>

        {/* Attendance & Class Load */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 border-t border-border/50">
          <div className="p-1.5 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Attendance</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{teacher.attendanceRate}%</span>
          </div>
          <div className="p-1.5 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Assigned Classes</span>
            <span className="font-bold text-foreground">{teacher.assignedClasses.length} Sections</span>
          </div>
        </div>

        {/* View Profile Action */}
        <div className="pt-1">
          <Button asChild variant="outline" size="sm" className="w-full text-xs h-8">
            <Link href={`/teachers/${teacher.id}`}>Faculty Profile →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
