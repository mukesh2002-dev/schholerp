"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useERP } from "@/components/providers/erp-provider";
import { formatDate } from "@/lib/utils";
import { Deployment, BuildMetrics } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Server,
  CheckCircle,
  RotateCcw,
  Globe,
  Search,
  Clock,
  GitBranch,
  History,
  BarChart3,
  CalendarDays,
  Hash,
} from "lucide-react";

function getEnvironmentBadge(env: string) {
  switch (env) {
    case "DEVELOPMENT":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">DEVELOPMENT</Badge>;
    case "STAGING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">STAGING</Badge>;
    case "PRODUCTION":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">PRODUCTION</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{env}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">SUCCESS</Badge>;
    case "FAILED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">FAILED</Badge>;
    case "ROLLED_BACK":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">ROLLED_BACK</Badge>;
    case "DEPLOYING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">DEPLOYING</Badge>;
    case "PENDING":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">PENDING</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">CANCELLED</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-500";
    case "FAILED":
      return "bg-red-500";
    case "ROLLED_BACK":
      return "bg-orange-500";
    case "DEPLOYING":
      return "bg-blue-500";
    case "PENDING":
      return "bg-amber-500";
    case "CANCELLED":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function DeploymentsPage() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  void activeBranchId;
  const [deployments] = useState<Deployment[]>(() => mockDb.getDeployments());
  const [metrics] = useState<BuildMetrics>(() => mockDb.getBuildMetrics());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [envFilter, setEnvFilter] = useState("ALL");

  const totalDeployments = deployments.length;
  const successfulCount = deployments.filter((d) => d.status === "SUCCESS").length;
  const rolledBackCount = deployments.filter((d) => d.status === "ROLLED_BACK").length;

  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchesSearch =
        String(d.deploymentNumber).includes(searchQuery) ||
        d.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(d.buildNumber).includes(searchQuery) ||
        d.deployedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.environment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      const matchesEnv = envFilter === "ALL" || d.environment === envFilter;
      return matchesSearch && matchesStatus && matchesEnv;
    });
  }, [deployments, searchQuery, statusFilter, envFilter]);

  const sortedTimeline = useMemo(() => {
    return [...deployments].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [deployments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Deployments</h1>
            <Badge variant="outline" className="text-xs">
              {totalDeployments}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Deployment history and environment monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Deployments</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalDeployments}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">All environments</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Server className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Successful</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{successfulCount}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Deployed successfully</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Rolled Back</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{rolledBackCount}</p>
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">Requires attention</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Environments</p>
                <p className="text-2xl font-bold text-foreground mt-1">3</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Dev / Staging / Prod</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Globe className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            Deployment History
          </TabsTrigger>
          <TabsTrigger value="environment" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            By Environment
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by deploy #, version, branch, deployed by..."
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="ROLLED_BACK">ROLLED_BACK</SelectItem>
                  <SelectItem value="DEPLOYING">DEPLOYING</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
              <Select value={envFilter} onValueChange={setEnvFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="All Environments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Environments</SelectItem>
                  <SelectItem value="DEVELOPMENT">DEVELOPMENT</SelectItem>
                  <SelectItem value="STAGING">STAGING</SelectItem>
                  <SelectItem value="PRODUCTION">PRODUCTION</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredDeployments.length === 0 ? (
            <Card className="border-border/80">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No deployments found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right tabular-nums">Deploy #</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right tabular-nums">Build #</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deployed By</TableHead>
                    <TableHead className="text-right tabular-nums">Duration</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeployments.map((dep) => (
                    <TableRow
                      key={dep.id}
                      className="hover:bg-muted/40 cursor-pointer"
                      onClick={() => router.push(`/deployments/${dep.id}`)}
                    >
                      <TableCell className="font-mono font-bold text-xs text-foreground text-right tabular-nums">#{dep.deploymentNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {dep.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground text-right tabular-nums">#{dep.buildNumber}</TableCell>
                      <TableCell>{getEnvironmentBadge(dep.environment)}</TableCell>
                      <TableCell>{getStatusBadge(dep.status)}</TableCell>
                      <TableCell className="text-xs text-foreground">{dep.deployedBy}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground text-right tabular-nums">{formatDuration(dep.duration)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(dep.startedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Deployments by Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.deploymentsByEnv}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="environment" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="count" name="Deployments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="successRate" name="Success Rate %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {metrics.deploymentsByEnv.map((item) => (
                  <div key={item.environment} className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{item.environment}</p>
                    <p className="text-lg font-bold text-foreground mt-1">{item.count} deployments</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{item.successRate}% success rate</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Deployment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-0">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border/60" />
                {sortedTimeline.map((dep) => (
                  <div key={dep.id} className="relative flex gap-4 pb-6 last:pb-0 pl-6">
                    <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background shadow ${getStatusDot(dep.status)}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">#{dep.deploymentNumber}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {dep.version}
                        </Badge>
                        {getEnvironmentBadge(dep.environment)}
                        {getStatusBadge(dep.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {dep.branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {dep.commitHash}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(dep.startedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(dep.duration)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Deployed by {dep.deployedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
