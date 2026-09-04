"use client";

import React, { useState, useMemo } from "react";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useERP } from "@/components/providers/erp-provider";
import { formatDate } from "@/lib/utils";
import type { AuditLog } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Layers,
  X,
} from "lucide-react";

const ACTION_OPTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
  "APPROVAL",
  "PAYMENT",
  "STATUS_CHANGE",
] as const;

const MODULE_OPTIONS = [
  "ALL",
  "Students",
  "Bugs",
  "Fees",
  "Expenses",
  "Homework",
  "Auth",
  "Reports",
  "Builds",
  "Deployments",
  "Test Cases",
  "Inventory",
  "Payroll",
] as const;

function getActionBadge(action: string) {
  switch (action) {
    case "CREATE":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "UPDATE":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "DELETE":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "LOGIN":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "LOGOUT":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "EXPORT":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "APPROVAL":
      return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "PAYMENT":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-semibold">{action}</Badge>;
    case "STATUS_CHANGE":
      return <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 text-[10px] font-semibold">{action}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] font-semibold">{action}</Badge>;
  }
}

export default function AuditPage() {
  const {} = useERP();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allLogs = useMemo(() => mockDb.getAuditLogs(), []);

  const totalEvents = allLogs.length;
  const uniqueUsersList = useMemo(() => Array.from(new Set(allLogs.map((l) => l.user))), [allLogs]);
  const uniqueUsersCount = uniqueUsersList.length;
  const failedActionsCount = useMemo(() => allLogs.filter((l) => l.action === "DELETE").length, [allLogs]);
  const modulesTrackedCount = useMemo(() => new Set(allLogs.map((l) => l.module)).size, [allLogs]);

  const baseLogs = useMemo(() => {
    return mockDb.getAuditLogs(actionFilter, moduleFilter, userFilter);
  }, [actionFilter, moduleFilter, userFilter]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return baseLogs;
    return baseLogs.filter(
      (l) =>
        l.user.toLowerCase().includes(q) ||
        l.recordName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.module.toLowerCase().includes(q) ||
        l.recordId.toLowerCase().includes(q) ||
        (l.details && l.details.toLowerCase().includes(q))
    );
  }, [baseLogs, searchQuery]);

  const hasActiveFilters = searchQuery !== "" || actionFilter !== "ALL" || moduleFilter !== "ALL" || userFilter !== "ALL";

  function handleClearFilters() {
    setSearchQuery("");
    setActionFilter("ALL");
    setModuleFilter("ALL");
    setUserFilter("ALL");
    setExpandedId(null);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-primary hidden sm:block" />
              Audit Logs
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {totalEvents} total
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[11px] font-medium">
              Mock Audit Trail — Demo Data
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Activity log — every action tracked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Events</p>
                <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
                <p className="text-[11px] text-muted-foreground">All recorded actions</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Unique Users</p>
                <p className="text-2xl font-bold text-foreground">{uniqueUsersCount}</p>
                <p className="text-[11px] text-muted-foreground">Distinct actors</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Failed/Error Actions</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedActionsCount}</p>
                <p className="text-[11px] text-muted-foreground">DELETE actions</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Modules Tracked</p>
                <p className="text-2xl font-bold text-foreground">{modulesTrackedCount}</p>
                <p className="text-[11px] text-muted-foreground">Across system</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user, record, action..."
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_OPTIONS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a === "ALL" ? "All Actions" : a}
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
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              {uniqueUsersList.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClearFilters} className="h-9 gap-1.5 text-xs">
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="No activity matches your current search and filter criteria. Try adjusting filters or clearing them to see all logs."
          icon={<ShieldAlert className="h-7 w-7" />}
          actionLabel={hasActiveFilters ? "Clear filters" : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Timestamp
                    </span>
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      User
                    </span>
                  </TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>IP/Device</TableHead>
                  <TableHead className="min-w-[220px]">Before/After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const beforeAfterText = log.beforeSummary ? `${log.beforeSummary} → ${log.afterSummary}` : log.afterSummary || "-";
                  return (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className="hover:bg-muted/40 cursor-pointer transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 min-w-[130px]">
                            <span className="text-xs font-semibold text-foreground leading-none">{log.user}</span>
                            <Badge variant="outline" className="text-[10px] w-fit px-1.5 py-0 font-medium">
                              {log.userRole}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] font-medium">
                            {log.module}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-foreground truncate max-w-[160px] block" title={log.recordName}>
                            {log.recordName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col leading-tight min-w-[150px]">
                            <span className="text-xs font-mono text-foreground">{log.ipAddress}</span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={log.device}>
                              {log.device}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs text-muted-foreground truncate max-w-[220px] block"
                            title={beforeAfterText}
                          >
                            {log.beforeSummary ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="truncate max-w-[90px] inline-block">{log.beforeSummary}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="truncate max-w-[90px] inline-block font-medium text-foreground">{log.afterSummary}</span>
                              </span>
                            ) : (
                              <span className="truncate block font-medium text-foreground">{log.afterSummary || "-"}</span>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={7} className="p-0">
                            <div className="px-4 py-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Record</p>
                                  <p className="text-xs font-medium text-foreground">{log.recordName}</p>
                                  <p className="text-[11px] font-mono text-muted-foreground">{log.recordId}</p>
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Network</p>
                                  <p className="text-xs font-mono text-foreground">IP: {log.ipAddress}</p>
                                  <p className="text-xs text-muted-foreground">Device: {log.device}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Before</p>
                                  <p className="text-xs text-foreground">{log.beforeSummary || "—"}</p>
                                </div>
                                <div className="rounded-lg border border-border/60 bg-card p-3 space-y-1">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">After</p>
                                  <p className="text-xs text-foreground">{log.afterSummary || "—"}</p>
                                </div>
                              </div>
                              {log.details && (
                                <div className="rounded-lg border border-border/60 bg-card p-3">
                                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Details</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{log.details}</p>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(log.timestamp)}</span>
                                <span className="opacity-50">•</span>
                                <span>{log.module}</span>
                                <span className="opacity-50">•</span>
                                <span>{log.action}</span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
