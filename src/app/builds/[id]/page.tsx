"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Rocket,
  GitBranch,
  Clock,
  User,
  Play,
  CheckCircle,
  FileText,
  Terminal,
  FlaskConical,
  Hash,
  Timer,
  Layers,
} from "lucide-react";

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return "-";
  if (seconds === 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SUCCESS":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{status}</Badge>;
    case "FAILED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">{status}</Badge>;
    case "RUNNING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">{status}</Badge>;
    case "QUEUED":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">{status}</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-xs">{status}</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function getEnvironmentBadge(env: string) {
  switch (env) {
    case "DEVELOPMENT":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">{env}</Badge>;
    case "STAGING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">{env}</Badge>;
    case "PRODUCTION":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">{env}</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{env}</Badge>;
  }
}

function getLogLevelColor(level: string) {
  switch (level) {
    case "INFO":
      return "text-gray-300";
    case "SUCCESS":
      return "text-green-400";
    case "WARN":
      return "text-amber-400";
    case "ERROR":
      return "text-red-400";
    default:
      return "text-white";
  }
}

function getLogBadgeStyle(level: string) {
  switch (level) {
    case "INFO":
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    case "SUCCESS":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "WARN":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "ERROR":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-white/10 text-white border-white/20";
  }
}

export default function BuildDetailPage() {
  const params = useParams();
  const buildId = params.id as string;
  const [build] = useState(() => mockDb.getBuildById(buildId));
  const [activeTab, setActiveTab] = useState("overview");

  if (!build) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Rocket className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Build not found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">The requested build record could not be located in the system.</p>
        <Button asChild variant="outline">
          <Link href="/builds">Back to Builds</Link>
        </Button>
      </div>
    );
  }

  const totalTests = (build.testsPassed || 0) + (build.testsFailed || 0) + (build.testsSkipped || 0);
  const passedPercent = totalTests > 0 ? Math.round(((build.testsPassed || 0) / totalTests) * 100) : 0;
  const failedPercent = totalTests > 0 ? Math.round(((build.testsFailed || 0) / totalTests) * 100) : 0;
  const skippedPercent = totalTests > 0 ? Math.round(((build.testsSkipped || 0) / totalTests) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/builds">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Builds</span>
          </Link>
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-500" />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono font-bold text-xs px-2.5 py-1">
                  <Hash className="h-3 w-3 mr-1" />
                  Build #{build.buildNumber}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                  {build.branch}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                  {build.commitHash}
                </span>
                {getStatusBadge(build.status)}
                {getEnvironmentBadge(build.environment)}
                <Badge variant="secondary" className="text-xs gap-1">
                  <Layers className="h-3 w-3" />
                  {build.pipeline.replace(/_/g, " ")}
                </Badge>
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Mock Build — Demo Data</Badge>
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed max-w-3xl">{build.commitMessage}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Author <strong className="text-foreground">{build.commitAuthor}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Triggered by <strong className="text-foreground">{build.triggeredBy}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  Duration <strong className="text-foreground font-mono">{formatDuration(build.duration)}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Started {formatDateTime(build.startedAt)}
                </span>
                {build.completedAt && (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Completed {formatDateTime(build.completedAt)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Rocket className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="tests" className="gap-1.5">
            <FlaskConical className="h-3.5 w-3.5" />
            Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Build Number", value: `#${build.buildNumber}` },
                  { label: "Branch", value: build.branch },
                  { label: "Commit", value: build.commitHash },
                  { label: "Author", value: build.commitAuthor },
                  { label: "Environment", value: build.environment },
                  { label: "Pipeline", value: build.pipeline.replace(/_/g, " ") },
                  { label: "Triggered By", value: build.triggeredBy },
                  { label: "Started", value: formatDate(build.startedAt) },
                  { label: "Completed", value: build.completedAt ? formatDate(build.completedAt) : "-" },
                  { label: "Duration", value: formatDuration(build.duration) },
                  { label: "Tests Passed", value: String(build.testsPassed ?? 0) },
                  { label: "Tests Failed", value: String(build.testsFailed ?? 0) },
                  { label: "Tests Skipped", value: String(build.testsSkipped ?? 0) },
                  { label: "Coverage", value: build.coveragePercent ? `${build.coveragePercent}%` : "-" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 break-all">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Commit Message</span>
                <p className="text-sm font-medium text-foreground mt-1">{build.commitMessage}</p>
              </div>
              {build.artifacts && build.artifacts.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Artifacts</h4>
                  <div className="flex flex-wrap gap-2">
                    {build.artifacts.map((artifact, i) => (
                      <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/60">
                        {artifact}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Build Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl overflow-hidden border border-border/20 bg-black">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border-b border-white/10">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs font-mono text-zinc-400">build #{build.buildNumber} — logs</span>
                </div>
                <div className="p-4 space-y-2 max-h-[520px] overflow-auto font-mono text-xs">
                  {build.logs.length === 0 ? (
                    <p className="text-zinc-500">No logs available.</p>
                  ) : (
                    build.logs.map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-zinc-500 shrink-0 text-[11px]">{formatDateTime(entry.timestamp)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getLogBadgeStyle(entry.level)}`}>{entry.level}</span>
                        <span className={`${getLogLevelColor(entry.level)} break-words flex-1`}>{entry.message}</span>
                        {entry.step && (
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10 text-[10px] shrink-0">{entry.step}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-border/70">
                <CardContent className="p-4 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Passed</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{build.testsPassed ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">{passedPercent}% of total</p>
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardContent className="p-4 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Failed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{build.testsFailed ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">{failedPercent}% of total</p>
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardContent className="p-4 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Skipped</p>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{build.testsSkipped ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">{skippedPercent}% of total</p>
                </CardContent>
              </Card>
              <Card className="border-border/70">
                <CardContent className="p-4 text-center">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Coverage</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{build.coveragePercent ? `${build.coveragePercent}%` : "-"}</p>
                  <p className="text-[11px] text-muted-foreground">Code coverage</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Test Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-6 w-full overflow-hidden rounded-full border border-border/60">
                  <div className="bg-emerald-500 transition-all" style={{ width: `${passedPercent}%` }} title={`Passed ${passedPercent}%`} />
                  <div className="bg-red-500 transition-all" style={{ width: `${failedPercent}%` }} title={`Failed ${failedPercent}%`} />
                  <div className="bg-gray-300 dark:bg-zinc-600 transition-all" style={{ width: `${skippedPercent}%` }} title={`Skipped ${skippedPercent}%`} />
                </div>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                    Passed {build.testsPassed ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-red-500" />
                    Failed {build.testsFailed ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-gray-300 dark:bg-zinc-600" />
                    Skipped {build.testsSkipped ?? 0}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Passed</p>
                    <p className="text-lg font-bold text-emerald-600">{build.testsPassed ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-xs font-bold text-red-700 dark:text-red-400">Failed</p>
                    <p className="text-lg font-bold text-red-600">{build.testsFailed ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-500/10 border border-gray-500/20 text-center">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-400">Skipped</p>
                    <p className="text-lg font-bold text-gray-600">{build.testsSkipped ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
