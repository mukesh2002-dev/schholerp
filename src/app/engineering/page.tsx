"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useERP } from "@/components/providers/erp-provider";
import { formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Server,
  CheckCircle,
  AlertTriangle,
  Bug,
  ShieldAlert,
  Activity,
  Layers,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  Database,
  GitBranch,
  Beaker,
  FileText,
  BarChart3,
  ArrowUpRight,
  CircleDot,
  Timer,
  ExternalLink,
} from "lucide-react";

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
    case "DEPLOYING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">{status}</Badge>;
    case "PENDING":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">{status}</Badge>;
    case "ROLLED_BACK":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">{status}</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">{status}</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function getActionBadge(action: string) {
  switch (action) {
    case "CREATE":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">{action}</Badge>;
    case "UPDATE":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">{action}</Badge>;
    case "DELETE":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">{action}</Badge>;
    case "LOGIN":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">{action}</Badge>;
    case "LOGOUT":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">{action}</Badge>;
    case "EXPORT":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">{action}</Badge>;
    case "APPROVAL":
      return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px]">{action}</Badge>;
    case "PAYMENT":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">{action}</Badge>;
    case "STATUS_CHANGE":
      return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-[10px]">STATUS</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{action}</Badge>;
  }
}

function getHealthDot(status: string) {
  switch (status) {
    case "HEALTHY":
      return "bg-emerald-500";
    case "DEGRADED":
      return "bg-amber-500";
    case "DOWN":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function getHealthBadge(status: string) {
  switch (status) {
    case "HEALTHY":
      return <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />HEALTHY</span>;
    case "DEGRADED":
      return <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-600"><span className="h-2 w-2 rounded-full bg-amber-500" />DEGRADED</span>;
    case "DOWN":
      return <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-600"><span className="h-2 w-2 rounded-full bg-red-500" />DOWN</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gray-500"><span className="h-2 w-2 rounded-full bg-gray-400" />{status}</span>;
  }
}

export default function EngineeringDashboardPage() {
  const { activeBranchId } = useERP();
  void activeBranchId;
  void LineChart;
  void Line;
  void PieChart;
  void Pie;
  void Cell;
  void Area;
  void AreaChart;
  void Layers;
  void TrendingUp;
  void Database;

  const [dashboardData] = useState(() => mockDb.getEngineeringDashboardData());
  const [buildMetrics] = useState(() => mockDb.getBuildMetrics());
  const [moduleHealth] = useState(() => mockDb.getModuleHealth());
  const [auditLogs] = useState(() => mockDb.getAuditLogs());
  const [qaMetrics] = useState(() => mockDb.getQADashboardMetrics());

  const lastUpdated = useMemo(() => new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }), []);
  const recentDeployments = dashboardData.recentDeployments;
  const recentAuditEvents = auditLogs.slice(0, 5);
  const currentBuild = dashboardData.currentBuild;
  const prodDeployment = dashboardData.deploymentStatus.find((d) => d.environment === "PRODUCTION") || dashboardData.deploymentStatus[0];

  const allHealthy = moduleHealth.every((m) => m.status === "HEALTHY");
  const systemStatusText = allHealthy ? "All Systems Operational" : "Degraded Performance";
  const passRateColor = qaMetrics.passRate > 80 ? "text-emerald-600" : "text-amber-600";
  const passRateBg = qaMetrics.passRate > 80 ? "bg-emerald-500" : "bg-amber-500";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Rocket className="h-5 w-5" />
            </span>
            Engineering Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-2xl">Build, deployment, QA &amp; system health — live overview</p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdated}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1.5">
            <CircleDot className="h-3 w-3" />
            Mock Data — Engineering Overview
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Current Build</p>
                <p className="text-lg font-bold text-foreground mt-1 flex items-center gap-1.5">
                  #{currentBuild ? currentBuild.number : "—"}
                  {currentBuild && <span className="inline-flex items-center rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">{currentBuild.status}</span>}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {currentBuild ? currentBuild.branch : "main"}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Rocket className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Deployment Status</p>
                <p className="text-lg font-bold text-foreground mt-1 truncate">{prodDeployment ? prodDeployment.version : "—"}</p>
                <p className="mt-1">{prodDeployment ? getStatusBadge(prodDeployment.status) : <Badge variant="outline" className="text-[10px]">UNKNOWN</Badge>}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Server className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Test Pass Rate</p>
                <p className={`text-2xl font-bold mt-1 ${passRateColor}`}>{qaMetrics.passRate}%</p>
                <p className="text-[11px] text-muted-foreground mt-1">{qaMetrics.passedTests} passed / {qaMetrics.totalTestCases} total</p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${qaMetrics.passRate > 80 ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Failed Tests</p>
                <p className={`text-2xl font-bold mt-1 ${qaMetrics.failedTests > 0 ? "text-red-600" : "text-emerald-600"}`}>{qaMetrics.failedTests}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{qaMetrics.blockedTests} blocked</p>
              </div>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${qaMetrics.failedTests > 0 ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Open Bugs</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{qaMetrics.openBugs}</p>
                <p className="text-[11px] text-muted-foreground mt-1">of {qaMetrics.totalBugs} total</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                <Bug className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Critical Bugs</p>
                <p className={`text-2xl font-bold mt-1 ${qaMetrics.criticalBugs > 0 ? "text-red-600" : "text-emerald-600"}`}>{qaMetrics.criticalBugs}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Needs immediate fix</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    Recent Deployments
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Latest 5 deployments across environments</CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Link href="/deployments">View all <ArrowUpRight className="h-3 w-3" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentDeployments.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No deployments found.</p>
                </div>
              ) : (
                <div className="space-y-2" role="list" aria-label="Recent deployments">
                  {recentDeployments.map((dep, idx) => (
                    <Link key={`${dep.version}-${idx}`} href="/deployments" className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/40 transition-colors group" role="listitem">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Rocket className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-mono font-bold text-foreground">{dep.version}</p>
                          <p className="text-[11px] text-muted-foreground">{formatDate(dep.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {getEnvironmentBadge(dep.environment)}
                        {getStatusBadge(dep.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                Module Health
              </CardTitle>
              <CardDescription className="text-xs">Uptime, response time and error rate per module</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {moduleHealth.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No module health data available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                  <table className="w-full text-xs" aria-label="Module health table">
                    <thead>
                      <tr className="border-b border-border/60 text-[11px] text-muted-foreground">
                        <th scope="col" className="text-left font-semibold py-2 pr-3">Module</th>
                        <th scope="col" className="text-left font-semibold py-2 px-3">Status</th>
                        <th scope="col" className="text-right font-semibold py-2 px-3">Uptime</th>
                        <th scope="col" className="text-right font-semibold py-2 px-3">Avg Response</th>
                        <th scope="col" className="text-right font-semibold py-2 pl-3">Error Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleHealth.map((m) => (
                        <tr key={m.module} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                          <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">{m.module}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{getHealthBadge(m.status)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-foreground">{m.uptime.toFixed(2)}%</td>
                          <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{m.avgResponseMs} ms</td>
                          <td className="py-2.5 pl-3 text-right font-mono">
                            <span className={m.errorRate > 1 ? "text-amber-600 font-semibold" : m.errorRate > 2 ? "text-red-600 font-semibold" : "text-muted-foreground"}>{m.errorRate.toFixed(2)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Recent Audit Events
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Link href="/audit">View all <ArrowUpRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              <CardDescription className="text-xs">Latest 5 system audit logs</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {recentAuditEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No audit events found.</p>
                </div>
              ) : (
                <div className="space-y-3" role="list" aria-label="Recent audit events">
                  {recentAuditEvents.map((log) => (
                    <Link key={log.id} href="/audit" className="block p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/40 transition-colors" role="listitem">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-foreground truncate">{log.user}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(log.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {getActionBadge(log.action)}
                        <Badge variant="outline" className="text-[10px]">{log.module}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{log.recordName}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Build Trend
              </CardTitle>
              <CardDescription className="text-xs">Success vs failed builds (last 14 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buildMetrics.buildTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
                    <Bar dataKey="success" name="Success" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Beaker className="h-4 w-4 text-purple-600" />
                QA Summary
              </CardTitle>
              <CardDescription className="text-xs">Test execution overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Pass Rate</span>
                  <span className={`font-bold ${passRateColor}`}>{qaMetrics.passRate}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={qaMetrics.passRate} aria-valuemin={0} aria-valuemax={100} aria-label="QA pass rate">
                  <div className={`h-full rounded-full transition-all ${passRateBg}`} style={{ width: `${qaMetrics.passRate}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{qaMetrics.passedTests} passed</span>
                  <span>{qaMetrics.totalTestCases} total</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Failed</p>
                  <p className="text-xl font-bold text-red-600 mt-1">{qaMetrics.failedTests}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Blocked</p>
                  <p className="text-xl font-bold text-amber-600 mt-1">{qaMetrics.blockedTests}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Passed</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">{qaMetrics.passedTests}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                <Link href="/qa">Open QA Dashboard <ExternalLink className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`lg:col-span-1 border shadow-xs ${allHealthy ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-amber-500/20 bg-amber-500/[0.04]"}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${allHealthy ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                {allHealthy ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <h3 className={`text-sm font-bold ${allHealthy ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>System Health Overview</h3>
                <p className={`text-sm font-semibold mt-1 ${allHealthy ? "text-emerald-600" : "text-amber-600"}`}>{systemStatusText}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {allHealthy ? "All 10 modules reporting healthy status. No incidents detected." : `${moduleHealth.filter((m) => m.status !== "HEALTHY").length} module(s) reporting degraded performance. Investigate Transport & Communication.`}
                </p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {moduleHealth.filter((m) => m.status === "HEALTHY").length} Healthy
                  </span>
                  {moduleHealth.filter((m) => m.status === "DEGRADED").length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {moduleHealth.filter((m) => m.status === "DEGRADED").length} Degraded
                    </span>
                  )}
                  {moduleHealth.filter((m) => m.status === "DOWN").length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {moduleHealth.filter((m) => m.status === "DOWN").length} Down
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Links
            </CardTitle>
            <CardDescription className="text-xs">Jump to engineering workspaces</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Link href="/builds" className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/[0.04] transition-colors text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Rocket className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">Builds</span>
                <span className="text-[11px] text-muted-foreground">CI/CD History</span>
              </Link>
              <Link href="/deployments" className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/[0.04] transition-colors text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Server className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">Deployments</span>
                <span className="text-[11px] text-muted-foreground">Environments</span>
              </Link>
              <Link href="/qa" className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/[0.04] transition-colors text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Beaker className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">QA</span>
                <span className="text-[11px] text-muted-foreground">Tests & Bugs</span>
              </Link>
              <Link href="/audit" className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/[0.04] transition-colors text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FileText className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">Audit</span>
                <span className="text-[11px] text-muted-foreground">Activity Logs</span>
              </Link>
              <Link href="/reports" className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/[0.04] transition-colors text-center col-span-2 sm:col-span-1">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold text-foreground">Reports</span>
                <span className="text-[11px] text-muted-foreground">Analytics</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
