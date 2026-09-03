"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Bug, BugActivityLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bug as BugIcon,
  User,
  Monitor,
  Globe,
  MessageSquare,
  Activity,
  Paperclip,
  Send,
} from "lucide-react";

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

export default function BugDetailPage() {
  const params = useParams();
  const bugId = params.id as string;

  const [bug, setBug] = useState<Bug | undefined>(() => mockDb.getBugById(bugId));
  const [activityLogs] = useState<BugActivityLog[]>(() => mockDb.getBugActivityLogs(bugId));
  const [activeTab, setActiveTab] = useState("details");
  const [commentText, setCommentText] = useState("");

  if (!bug) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <BugIcon className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Bug Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested bug record could not be located in the system.
        </p>
        <Button asChild variant="outline">
          <Link href="/qa/bugs">Back to Bug Tracker</Link>
        </Button>
      </div>
    );
  }

  const isCritical = bug.priority === "P1_CRITICAL" || bug.severity === "S1_BLOCKER" || bug.severity === "S2_CRITICAL";

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const session = mockDb.getSession();
    const updatedBug = mockDb.addBugComment(bug.id, {
      author: session.name,
      authorRole: session.role,
      content: commentText.trim(),
    });
    setBug(updatedBug);
    setCommentText("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className={`h-4 w-full ${isCritical ? "bg-gradient-to-r from-red-600 to-red-400" : "bg-gradient-to-r from-blue-600 to-indigo-400"}`} />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isCritical ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
                  {bug.id}
                </span>
                <Badge variant={getStatusColor(bug.status) as any} className="text-xs">
                  {bug.status.replace(/_/g, " ")}
                </Badge>
                {getPriorityBadge(bug.priority)}
                {getSeverityBadge(bug.severity)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {bug.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Reported by <strong className="text-foreground">{bug.reporter}</strong> ({bug.reporterRole})
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Assigned to <strong className="text-foreground">{bug.assignee}</strong> ({bug.assigneeRole})
                </span>
                <span className="flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5" />
                  {bug.environment}
                </span>
                {bug.browser && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {bug.browser}
                  </span>
                )}
                {bug.os && (
                  <span className="flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5" />
                    {bug.os}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/qa/bugs" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Bug List</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details" className="gap-1.5">
            <BugIcon className="h-3.5 w-3.5" />
            Details
          </TabsTrigger>
          <TabsTrigger value="reproduction" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Reproduction
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Comments & Activity
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Module", value: bug.module },
                  { label: "Status", value: bug.status.replace(/_/g, " ") },
                  { label: "Priority", value: bug.priority.replace(/_/g, " ") },
                  { label: "Severity", value: bug.severity.replace(/_/g, " ") },
                  { label: "Assignee", value: `${bug.assignee} (${bug.assigneeRole})` },
                  { label: "Reporter", value: `${bug.reporter} (${bug.reporterRole})` },
                  { label: "Environment", value: bug.environment },
                  { label: "Browser", value: bug.browser || "-" },
                  { label: "OS", value: bug.os || "-" },
                  { label: "Created", value: formatDate(bug.createdAt) },
                  { label: "Updated", value: formatDate(bug.updatedAt) },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col p-3 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>

              {bug.linkedTestCaseId && (
                <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <span className="text-xs text-muted-foreground">Linked Test Case: </span>
                  <Link
                    href="/qa/test-cases"
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {bug.linkedTestCaseTitle || bug.linkedTestCaseId}
                  </Link>
                </div>
              )}

              {bug.resolution && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolution</h4>
                  <p className="text-sm text-foreground">{bug.resolution}</p>
                  {bug.fixedBy && (
                    <p className="text-xs text-muted-foreground">Fixed by <strong className="text-foreground">{bug.fixedBy}</strong> on {formatDate(bug.fixedDate || "")}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reproduction Tab */}
        <TabsContent value="reproduction">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="pt-5 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground">Steps to Reproduce</h4>
                <ol className="space-y-2">
                  {bug.stepsToReproduce.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Expected Result</h4>
                  <p className="text-sm text-emerald-700 leading-relaxed">{bug.expectedResult}</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">Actual Result</h4>
                  <p className="text-sm text-red-700 leading-relaxed">{bug.actualResult}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4" />
                  Attachments
                </h4>
                {bug.attachments && bug.attachments.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {bug.attachments.map((att, i) => (
                      <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/60">
                        {att}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No attachments uploaded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments & Activity Tab */}
        <TabsContent value="comments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Timeline */}
            <Card className="lg:col-span-1 border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No activity recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div className="w-px flex-1 bg-border/60" />
                        </div>
                        <div className="pb-3 space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{log.action}</p>
                          {log.field && (
                            <p className="text-[11px] text-muted-foreground">
                              {log.field}: {log.oldValue} &rarr; {log.newValue}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            {log.performedBy} &middot; {formatDateTime(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="lg:col-span-2 border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Comments ({bug.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bug.comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No comments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bug.comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{comment.author}</span>
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5">{comment.authorRole}</Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{formatDateTime(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Add Comment</h4>
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type your comment..."
                    className="min-h-[80px] text-sm"
                  />
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
