"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ClassRoom } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClassFormDialog } from "@/components/classes/class-form-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Users,
  Building2,
  CalendarDays,
  Search,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function ClassesPage() {
  const { activeBranchId, branches } = useERP();
  const [classes, setClasses] = useState(() => mockDb.getClasses(activeBranchId));
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const refreshList = () => {
    setClasses(mockDb.getClasses(activeBranchId));
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sections.some((s) => s.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "ALL" || c.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [classes, searchQuery, categoryFilter]);

  const totalClassesCount = classes.length;
  const totalSectionsCount = classes.reduce((acc, c) => acc + c.sections.length, 0);
  const totalStudentsEnrolled = classes.reduce((acc, c) => acc + c.totalStudents, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Classes & Academic Sections
            </h1>
            <Badge variant="outline" className="text-xs">
              {totalClassesCount} Grade Levels
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Curriculum mapping, section cohorts, classroom assignments, and class teachers across campuses.
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add Academic Class</span>
        </Button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Grade Levels
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{totalClassesCount}</span>
          <span className="text-[11px] text-muted-foreground">K through 12</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Sections
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">{totalSectionsCount}</span>
          <span className="text-[11px] text-primary font-medium">Cohort streams</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Classroom Capacity
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {formatNumber(totalStudentsEnrolled)} Enrolled
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">92% fill rate</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Student-Teacher Ratio
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">1 : 16</span>
          <span className="text-[11px] text-muted-foreground">Academic average</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search class, section, teacher..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[170px] h-9 text-xs">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="Kindergarten">Kindergarten</SelectItem>
            <SelectItem value="Primary">Primary (1-5)</SelectItem>
            <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
            <SelectItem value="High School">High School (9-10)</SelectItem>
            <SelectItem value="Senior Secondary">Senior Secondary (11-12)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Class Cards Grid */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          title="No Academic Classes Found"
          description="We couldn't find any class records matching your current filter criteria."
          actionLabel="Create Class"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {filteredClasses.map((cls) => {
            const occupancy = Math.round((cls.totalStudents / cls.capacity) * 100);

            return (
              <Card key={cls.id} className="border-border/80 shadow-xs overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">{cls.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {cls.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{cls.branchName}</span>
                        <span>•</span>
                        <span>{cls.description}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-muted-foreground block">Capacity Quota</span>
                        <span className="font-bold text-foreground">
                          {cls.totalStudents} / {cls.capacity} ({occupancy}%)
                        </span>
                      </div>
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                        <Link href={`/students?class=${cls.id}`}>View Class Roster →</Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Sections Cohorts Grid */}
                  <div>
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                      Section Cohorts & Class Teachers
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cls.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{sec.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {sec.roomNumber}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-xs">
                            <Users className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] text-muted-foreground block">Class Teacher:</span>
                              <strong className="text-foreground text-xs truncate block">{sec.classTeacherName}</strong>
                            </div>
                            <span className="text-xs font-bold text-primary font-mono">
                              {sec.studentCount} / {sec.capacity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subjects & Curriculum Mapping */}
                  <div className="pt-2 border-t border-border/60">
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                      Subjects & Period Allocation
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {cls.subjects.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/70 border border-border/50 text-xs"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground block">{sub.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {sub.code} • {sub.teacherName} ({sub.weeklyPeriods} periods/wk)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Class Dialog */}
      <ClassFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
