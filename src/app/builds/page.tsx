"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useERP } from "@/components/providers/erp-provider";
import { formatDate } from "@/lib/utils";
import { Build, BuildMetrics } from "@/types";
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
import {
  Rocket,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  GitBranch,
  Activity,
  Layers,
  Plug,
} from "lucide-react";

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return "-";
  if (seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getEnvironmentBadge(env: string) {
  switch (env) {
    case "DEVELOPMENT":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">{env}</Badge>;
    case "STAGING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">{env}</Badge>;
    case "PRODUCTION":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">{env}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{env}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">{status}</Badge>;
    case "FAILED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">{status}</Badge>;
    case "RUNNING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">{status}</Badge>;
    case "QUEUED":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">{status}</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">{status}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function getIntegrationStatusBadge(status: string) {
  switch (status) {
    case "CONNECTED":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">{status}</Badge>;
    case "DISCONNECTED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">{status}</Badge>;
    case "ERROR":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">{status}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "0.75rem",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

export default function BuildsPage() {
  const router = useRouter();
  const {} = useERP();
  const [builds] = useState<Build[]>(() => mockDb.getBuilds());
  const [metrics] = useState<BuildMetrics>(() => mockDb.getBuildMetrics());
  const [integrations] = useState(() => mockDb.getCICDIntegrations());

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [envFilter, setEnvFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("recent");

  const branches = useMemo(() => {
    const unique = Array.from(new Set(builds.map((b) => b.branch)));
    return ["ALL", ...unique];
  }, [builds]);

  const filteredBuilds = useMemo(() => {
    return builds.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        b.commitHash.toLowerCase().includes(q) ||
        b.commitMessage.toLowerCase().includes(q) ||
        b.commitAuthor.toLowerCase().includes(q) ||
        b.branch.toLowerCase().includes(q) ||
        String(b.buildNumber).includes(q) ||
        b.triggeredBy.toLowerCase().includes(q);
      const matchesBranch = branchFilter === "ALL" || b.branch === branchFilter;
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchesEnv = envFilter === "ALL" || b.environment === envFilter;
      return matchesSearch && matchesBranch && matchesStatus && matchesEnv;
    });
  }, [builds, searchQuery, branchFilter, statusFilter, envFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Builds</h1>
            <Badge variant="outline" className="text-xs">
              {metrics.totalBuilds} total
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">CI/CD build history and pipeline monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Builds</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalBuilds}</p>
                <p className="text-[11px] text-muted-foreground">All time</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Rocket className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Success Rate</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.successRate}%</p>
                <p className="text-[11px] text-emerald-600 font-medium">{metrics.successfulBuilds} successful</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg Build Time</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatDuration(metrics.avgBuildTime)}</p>
                <p className="text-[11px] text-muted-foreground">minutes:seconds</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Failed Builds</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{metrics.failedBuilds}</p>
                <p className="text-[11px] text-red-600 font-medium">Needs attention</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Recent Builds
          </TabsTrigger>
          <TabsTrigger value="trend" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            Build Trend
          </TabsTrigger>
          <TabsTrigger value="branch" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            By Branch
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-1.5">
            <Plug className="h-3.5 w-3.5" />
            CI/CD Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search builds, branch, commit, author..."
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b === "ALL" ? "All Branches" : b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="RUNNING">RUNNING</SelectItem>
                  <SelectItem value="QUEUED">QUEUED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
              <Select value={envFilter} onValueChange={setEnvFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Envs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Envs</SelectItem>
                  <SelectItem value="DEVELOPMENT">DEVELOPMENT</SelectItem>
                  <SelectItem value="STAGING">STAGING</SelectItem>
                  <SelectItem value="PRODUCTION">PRODUCTION</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Build #</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuilds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">
                      No builds found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBuilds.map((build) => (
                    <TableRow
                      key={build.id}
                      className="hover:bg-muted/40 cursor-pointer"
                      onClick={() => router.push(`/builds/${build.id}`)}
                    >
                      <TableCell className="font-mono font-bold text-xs text-primary">#{build.buildNumber}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        <span className="inline-flex items-center gap-1">
                          <GitBranch className="h-3 w-3 text-muted-foreground" />
                          {build.branch}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px] block">
                          {build.commitHash}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{build.commitAuthor}</TableCell>
                      <TableCell>{getEnvironmentBadge(build.environment)}</TableCell>
                      <TableCell>{getStatusBadge(build.status)}</TableCell>
                      <TableCell className="text-xs font-mono text-foreground">{formatDuration(build.duration)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{build.triggeredBy}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(build.startedAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="trend">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">Build Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.buildTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
                    <Bar dataKey="success" name="Success" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branch">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">Builds By Branch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.buildsByBranch} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="branch"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: any, name: any) => [value, name === "count" ? "Builds" : "Success Rate"]} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 12, fontSize: 12 }} />
                    <Bar dataKey="count" name="Builds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {metrics.buildsByBranch.map((b) => (
                  <div key={b.branch} className="p-3 rounded-lg bg-muted/40 border border-border/60 text-center">
                    <p className="text-[11px] font-semibold text-muted-foreground truncate">{b.branch}</p>
                    <p className="text-lg font-bold text-foreground">{b.count}</p>
                    <p className="text-[11px] text-emerald-600 font-medium">{b.successRate}% success</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="border-border/80 shadow-xs hover:shadow-sm transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Plug className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground">{integration.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{integration.platform.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    {getIntegrationStatusBadge(integration.status)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{integration.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block text-[11px]">Last Sync</span>
                      <span className="font-medium text-foreground">{integration.lastSync ? formatDate(integration.lastSync) : "-"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block text-[11px]">Pipelines</span>
                      <span className="font-medium text-foreground">{integration.pipelineCount ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-bold text-foreground">{integration.projectCount ?? 0}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
