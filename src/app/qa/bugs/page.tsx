"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatDate } from "@/lib/utils";
import { Bug } from "@/types";
import { toast } from "sonner";
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
import { Plus, Search } from "lucide-react";

const STATUS_OPTIONS = ["ALL", "OPEN", "IN_PROGRESS", "FIXED", "RETEST", "REOPENED", "CLOSED", "REJECTED"] as const;
const PRIORITY_OPTIONS = ["ALL", "P1_CRITICAL", "P2_HIGH", "P3_MEDIUM", "P4_LOW"] as const;
const MODULE_OPTIONS = [
  "ALL",
  "Students",
  "Fees",
  "Exams",
  "Communication",
  "Payroll",
  "Documents",
  "Timetable",
  "Transport",
  "Expenses",
  "Attendance",
  "Inventory",
  "Dashboard",
] as const;

function getStatusColor(status: string) {
  switch (status) {
    case "OPEN": return "destructive";
    case "IN_PROGRESS": return "info";
    case "FIXED": return "success";
    case "RETEST": return "purple";
    case "REOPENED": return "warning";
    case "CLOSED": return "secondary";
    case "REJECTED": return "secondary";
    default: return "outline";
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "P1_CRITICAL":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">{priority}</Badge>;
    case "P2_HIGH":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">{priority}</Badge>;
    case "P3_MEDIUM":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">{priority}</Badge>;
    case "P4_LOW":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">{priority}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{priority}</Badge>;
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "S1_BLOCKER":
    case "S2_CRITICAL":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">{severity}</Badge>;
    case "S3_MAJOR":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">{severity}</Badge>;
    case "S4_MINOR":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">{severity}</Badge>;
    case "S5_TRIVIAL":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">{severity}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{severity}</Badge>;
  }
}

export default function BugsPage() {
  const router = useRouter();
  const [allBugs] = useState<Bug[]>(() => mockDb.getBugs());

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");

  const filteredBugs = useMemo(() => {
    return allBugs.filter((bug) => {
      const matchesSearch =
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.reporter.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || bug.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || bug.priority === priorityFilter;
      const matchesModule = moduleFilter === "ALL" || bug.module === moduleFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesModule;
    });
  }, [allBugs, searchQuery, statusFilter, priorityFilter, moduleFilter]);

  const totalCount = allBugs.length;
  const openCount = allBugs.filter((b) => b.status === "OPEN").length;
  const inProgressCount = allBugs.filter((b) => b.status === "IN_PROGRESS").length;
  const fixedCount = allBugs.filter((b) => b.status === "FIXED").length;
  const reopenedCount = allBugs.filter((b) => b.status === "REOPENED").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Bug Tracker
            </h1>
            <Badge variant="outline" className="text-xs">
              {totalCount} Bugs
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track, manage and resolve bugs across modules
          </p>
        </div>

        <Button
          variant="gradient"
          className="gap-2 shrink-0"
          onClick={() => toast.info("Report Bug — demo placeholder", { description: "Bug creation form coming soon." })}
        >
          <Plus className="h-4 w-4" />
          <span>Report Bug</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Bugs", value: totalCount, color: "text-foreground" },
          { label: "Open", value: openCount, color: "text-red-600" },
          { label: "In Progress", value: inProgressCount, color: "text-blue-600" },
          { label: "Fixed", value: fixedCount, color: "text-emerald-600" },
          { label: "Reopened", value: reopenedCount, color: "text-orange-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-card border border-border/70"
          >
            <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bugs by ID, title, module, assignee..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p === "ALL" ? "All Priorities" : p.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              {MODULE_OPTIONS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === "ALL" ? "All Modules" : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bugs Table */}
      {filteredBugs.length === 0 ? (
        <EmptyState
          title="No Bugs Found"
          description="No bugs matched your search and filter criteria."
          actionLabel="Report Bug"
          onAction={() => toast.info("Report Bug — demo placeholder", { description: "Bug creation form coming soon." })}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBugs.map((bug) => (
                <TableRow
                  key={bug.id}
                  className="hover:bg-muted/40 cursor-pointer"
                  onClick={() => router.push(`/qa/bugs/${bug.id}`)}
                >
                  <TableCell className="font-mono font-bold text-xs text-red-600">{bug.id}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground text-sm line-clamp-1">
                      {bug.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{bug.module}</TableCell>
                  <TableCell>{getPriorityBadge(bug.priority)}</TableCell>
                  <TableCell>{getSeverityBadge(bug.severity)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(bug.status) as any} className="text-[10px]">
                      {bug.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{bug.assignee}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{bug.reporter}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(bug.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
