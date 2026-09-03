"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  GitCommit,
  GitBranch,
  User,
  Clock,
  Hash,
  Package,
  Server,
  RotateCcw,
  CalendarDays,
  Timer,
  FileText,
  Activity,
  Globe,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">SUCCESS</Badge>;
    case "FAILED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">FAILED</Badge>;
    case "ROLLED_BACK":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">ROLLED_BACK</Badge>;
    case "DEPLOYING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">DEPLOYING</Badge>;
    case "PENDING":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">PENDING</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-xs">CANCELLED</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function getTimelineDot(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500";
    case "DEPLOYING":
      return "bg-blue-500";
    case "SUCCESS":
      return "bg-emerald-500";
    case "FAILED":
      return "bg-red-500";
    case "ROLLED_BACK":
      return "bg-orange-500";
    case "CANCELLED":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

function getTimelineBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">PENDING</Badge>;
    case "DEPLOYING":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">DEPLOYING</Badge>;
    case "SUCCESS":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">SUCCESS</Badge>;
    case "FAILED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px]">FAILED</Badge>;
    case "ROLLED_BACK":
      return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">ROLLED_BACK</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 text-[10px]">CANCELLED</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function DeploymentDetailPage() {
  const params = useParams();
  const deploymentId = params.id as string;
  const deployment = mockDb.getDeploymentById(deploymentId);
  const [activeTab, setActiveTab] = useState("overview");

  if (!deployment) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Server className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Deployment Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">The requested deployment could not be found.</p>
        <Button asChild variant="outline">
          <Link href="/deployments">Back to Deployments</Link>
        </Button>
      </div>
    );
  }

  const handleRollback = () => {
    toast.info("Rollback — mock deployment", { description: "Rollback requires production integration. This is demo data." });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/deployments">
            <ArrowLeft className="h-4 w-4" />
            Back to Deployments
          </Link>
        </Button>
      </div>

      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600" />
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Deploy #{deployment.deploymentNumber}
                </h1>
                <Badge variant="outline" className="text-xs font-mono">
                  {deployment.version}
                </Badge>
                {getEnvironmentBadge(deployment.environment)}
                {getStatusBadge(deployment.status)}
                <Badge variant="secondary" className="text-[10px]">
                  Demo Deployment — Mock Data
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <GitCommit className="h-3.5 w-3.5" />
                  {deployment.commitHash}
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3.5 w-3.5" />
                  {deployment.branch}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {deployment.deployedBy}
                  <span className="text-muted-foreground">({deployment.deployedByRole})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {formatDuration(deployment.duration)}
                </span>
                <Link href={`/deployments/${deployment.id}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Hash className="h-3.5 w-3.5" />
                  Build #{deployment.buildNumber}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleRollback} className="gap-1.5">
                <RotateCcw className="h-4 w-4" />
                Rollback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Deployment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Deployment Number", value: `#${deployment.deploymentNumber}` },
                  { label: "Version", value: deployment.version },
                  { label: "Build Number", value: `#${deployment.buildNumber}` },
                  { label: "Environment", value: deployment.environment },
                  { label: "Status", value: deployment.status },
                  { label: "Commit", value: deployment.commitHash },
                  { label: "Branch", value: deployment.branch },
                  { label: "Deployed By", value: deployment.deployedBy },
                  { label: "Role", value: deployment.deployedByRole },
                  { label: "Started", value: formatDate(deployment.startedAt) },
                  { label: "Completed", value: deployment.completedAt ? formatDate(deployment.completedAt) : "-" },
                  { label: "Duration", value: formatDuration(deployment.duration) },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Release Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{deployment.releaseNotes}</p>
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
              <div className="relative">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border/60" />
                <div className="space-y-0">
                  {deployment.timeline.map((entry) => (
                    <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0 pl-6">
                      <div className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background shadow ${getTimelineDot(entry.status)}`} />
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTimelineBadge(entry.status)}
                          <span className="text-sm font-medium text-foreground">{entry.message}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(entry.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.performedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Deployed Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deployment.services.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No services listed for this deployment.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deployment.services.map((service) => (
                    <Card key={service} className="border-border/60 bg-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0" />
                          <span className="text-sm font-semibold text-foreground">{service}</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      </CardContent>
                      {deployment.healthCheckUrl && (
                        <div className="px-4 pb-3">
                          <a
                            href={deployment.healthCheckUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 font-mono"
                          >
                            <Globe className="h-3 w-3" />
                            {deployment.healthCheckUrl}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
