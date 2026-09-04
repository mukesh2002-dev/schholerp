"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ClassRoom } from "@/types";
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
  Search,
  BookOpen,
  Users,
  Building2,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function ClassDirectoryView() {
  const { activeBranchId } = useERP();
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
              placeholder="Search by class name, branch, class teacher..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Pre-Primary">Pre-Primary</SelectItem>
              <SelectItem value="Primary">Primary</SelectItem>
              <SelectItem value="Middle School">Middle School</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Senior Secondary">Senior Secondary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="text-xs self-end md:self-auto font-mono">
          Showing {filteredClasses.length} of {classes.length}
        </Badge>
      </div>

      {/* Main Grid View */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          title="No Academic Classes Found"
          description="We couldn't find any classes matching your filters. Try adjusting your query or add a new academic grade level."
          actionLabel="Add Academic Class"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const utilization = Math.round((cls.totalStudents / cls.capacity) * 100);
            return (
              <Card
                key={cls.id}
                className="border-border/80 hover:border-primary/50 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          Grade {cls.gradeLevel}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {cls.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {cls.name}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {cls.branchName}
                      </CardDescription>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-foreground block">
                        {cls.sections.length} Sections
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {cls.subjects.length} Subjects
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Occupancy Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Class Capacity</span>
                      <span className="font-mono text-foreground font-semibold">
                        {formatNumber(cls.totalStudents)} / {formatNumber(cls.capacity)}{" "}
                        <strong className="text-primary">({utilization}%)</strong>
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(utilization, 100)}%`,
                          backgroundColor:
                            utilization >= 90
                              ? "#ef4444"
                              : utilization >= 75
                              ? "#3b82f6"
                              : "#10b981",
                        }}
                      />
                    </div>
                  </div>

                  {/* Section Breakdown Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Active Sections &amp; Teachers
                    </span>
                    <div className="space-y-1.5">
                      {cls.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs border border-border/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground bg-card px-1.5 py-0.5 rounded border text-[11px]">
                              Sec {sec.name}
                            </span>
                            <span className="text-muted-foreground truncate max-w-[140px]">
                              {sec.classTeacherName}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-foreground font-medium">
                            {sec.studentCount} students • Rm {sec.roomNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject Tag Pill Stream */}
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                      Academic Subjects ({cls.subjects.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {cls.subjects.slice(0, 4).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {cls.subjects.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                          +{cls.subjects.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <ClassFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refreshList}
      />
    </div>
  );
}
