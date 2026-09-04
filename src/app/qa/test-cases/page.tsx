"use client";

import React, { useState, useMemo } from "react";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useERP } from "@/components/providers/erp-provider";
import { formatDate } from "@/lib/utils";
import { TestStatus, TestPriority, TestSeverity } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Tag,
} from "lucide-react";

const MODULES = [
  "ALL",
  "Students",
  "Attendance",
  "Fees",
  "Transport",
  "Exams",
  "Payroll",
  "Auth",
  "Communication",
  "Navigation",
  "Performance",
];

const STATUSES: TestStatus[] = ["DRAFT", "READY", "PASSED", "FAILED", "BLOCKED", "SKIPPED"];
const PRIORITIES: TestPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const statusColor: Record<TestStatus, string> = {
  PASSED: "bg-emerald-500",
  FAILED: "bg-red-500",
  BLOCKED: "bg-amber-500",
  READY: "bg-blue-500",
  DRAFT: "bg-gray-400",
  SKIPPED: "bg-gray-400",
};

const statusBadgeVariant: Record<TestStatus, "default" | "success" | "warning" | "destructive" | "info" | "purple"> = {
  PASSED: "success",
  FAILED: "destructive",
  BLOCKED: "warning",
  READY: "info",
  DRAFT: "default",
  SKIPPED: "default",
};

const priorityVariant: Record<TestPriority, "default" | "success" | "warning" | "destructive" | "info" | "purple"> = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MEDIUM: "info",
  LOW: "success",
};

const severityVariant: Record<TestSeverity, "default" | "success" | "warning" | "destructive" | "info" | "purple"> = {
  BLOCKER: "destructive",
  CRITICAL: "destructive",
  MAJOR: "warning",
  MINOR: "info",
  TRIVIAL: "default",
};

export default function TestCasesPage() {
  const { activeBranchId } = useERP();
  const [allTestCases] = useState(() => mockDb.getTestCases());
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const uniqueAssignees = Array.from(new Set(allTestCases.map((tc) => tc.assignee)));

  const filteredTestCases = useMemo(() => {
    let cases = mockDb.getTestCases(
      moduleFilter,
      statusFilter,
      assigneeFilter !== "ALL" ? assigneeFilter : undefined
    );

    if (priorityFilter !== "ALL") {
      cases = cases.filter((c) => c.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cases = cases.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.module.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.assignee.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return cases;
  }, [searchQuery, moduleFilter, statusFilter, priorityFilter, assigneeFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Test Cases
            </h1>
            <Badge variant="outline" className="text-xs">
              {filteredTestCases.length} Total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage and track all test cases across modules
          </p>
        </div>

        <Button
          onClick={() => toast.info("Add Test Case — demo placeholder", { description: "Test case creation form coming soon." })}
          variant="gradient"
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Test Case</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test cases..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === "ALL" ? "All Modules" : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Assignees</SelectItem>
              {uniqueAssignees.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTestCases.length === 0 ? (
        <EmptyState
          title="No Test Cases Found"
          description="No test cases matched your current search and filter criteria."
          icon={<ClipboardCheck className="h-7 w-7" />}
        />
      ) : (
        <div className="grid gap-3">
          {filteredTestCases.map((tc) => {
            const isExpanded = expandedId === tc.id;
            return (
              <Card
                key={tc.id}
                className="border-border/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                onClick={() => toggleExpand(tc.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-1.5 shrink-0 rounded-full ${statusColor[tc.status]}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                              {tc.title}
                            </h3>
                            <Badge variant={statusBadgeVariant[tc.status]} className="text-[10px] py-0">
                              {tc.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {tc.module}
                            </Badge>
                            <Badge variant={priorityVariant[tc.priority]} className="text-[10px] py-0">
                              {tc.priority}
                            </Badge>
                            <Badge variant={severityVariant[tc.severity]} className="text-[10px] py-0">
                              {tc.severity}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              {tc.steps.length} steps
                            </span>
                          </div>

                          {tc.tags && tc.tags.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              {tc.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{tc.assignee}</span>
                          </div>
                          {tc.lastRunDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(tc.lastRunDate)}</span>
                            </div>
                          )}
                          <div className="text-muted-foreground">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div
                          className="mt-4 pt-4 border-t border-border/60 space-y-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Steps
                            </h4>
                            <ol className="list-decimal list-inside space-y-1">
                              {tc.steps.map((step, idx) => (
                                <li key={idx} className="text-xs text-foreground/80">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              Expected Result
                            </h4>
                            <p className="text-xs text-foreground/80">{tc.expectedResult}</p>
                          </div>

                          {tc.actualResult && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                Actual Result
                              </h4>
                              <p className="text-xs text-foreground/80">{tc.actualResult}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
