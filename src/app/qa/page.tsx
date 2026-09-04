"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { formatDate } from "@/lib/utils";
import { TestSuite, TestPlan, TestRun, Bug, TestCase } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  ClipboardList,
  CheckCircle,
  Bug as BugIcon,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#a855f7",
];

const suiteStatusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
  ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
};

const planStatusColor: Record<string, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
  ARCHIVED: "bg-gray-100 text-gray-600 border-gray-200",
};

const priorityColor: Record<string, string> = {
  P1_CRITICAL: "bg-red-100 text-red-700 border-red-200",
  P2_HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  P3_MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  P4_LOW: "bg-green-100 text-green-700 border-green-200",
};

const bugStatusColor: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700 border-red-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  FIXED: "bg-green-100 text-green-700 border-green-200",
  REOPENED: "bg-orange-100 text-orange-700 border-orange-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  REJECTED: "bg-gray-100 text-gray-600 border-gray-200",
  RETEST: "bg-purple-100 text-purple-700 border-purple-200",
};

const severityColor: Record<string, string> = {
  S1_BLOCKER: "bg-red-100 text-red-700 border-red-200",
  S2_CRITICAL: "bg-red-100 text-red-700 border-red-200",
  S3_MAJOR: "bg-orange-100 text-orange-700 border-orange-200",
  S4_MINOR: "bg-amber-100 text-amber-700 border-amber-200",
  S5_TRIVIAL: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function QADashboardPage() {
  const { activeBranchId } = useERP();
  const [activeTab, setActiveTab] = useState("overview");

  const metrics = mockDb.getQADashboardMetrics();
  const testSuites = mockDb.getTestSuites();
  const testPlans = mockDb.getTestPlans();
  const testRuns = mockDb.getTestRuns();
  const bugs = mockDb.getBugs();

  const topBugs = useMemo(() => bugs.slice(0, 10), [bugs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              QA & Bug Tracker
            </h1>
            <Badge variant="outline" className="text-xs">
              {metrics.totalTestCases} Test Cases
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Test case management, bug tracking & quality assurance metrics
          </p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Total Test Cases</p>
                <p className="text-xl font-bold text-foreground">{metrics.totalTestCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Pass Rate</p>
                <p className="text-xl font-bold text-green-600">{metrics.passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                <BugIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Open Bugs</p>
                <p className="text-xl font-bold text-orange-600">{metrics.openBugs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Critical Bugs</p>
                <p className="text-xl font-bold text-red-600">{metrics.criticalBugs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="plans">Test Plans</TabsTrigger>
          <TabsTrigger value="bugs">Recent Bugs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-foreground text-sm mb-4">Execution Trend</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.executionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Line type="monotone" dataKey="passed" stroke="#10b981" strokeWidth={2} dot={false} name="Passed" />
                      <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} dot={false} name="Failed" />
                      <Line type="monotone" dataKey="blocked" stroke="#f59e0b" strokeWidth={2} dot={false} name="Blocked" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-foreground text-sm mb-4">Bugs by Module</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.bugsByModule}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="module"
                      >
                        {metrics.bugsByModule.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suites" className="space-y-3">
          {testSuites.length === 0 ? (
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No test suites found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {testSuites.map((suite) => (
                <Card key={suite.id} className="border-border/80 shadow-xs hover:shadow-md transition-all">
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground text-sm">{suite.name}</h3>
                      <span className={`shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${suiteStatusColor[suite.status] || ""}`}>
                        {suite.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {suite.module}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Pass Rate</span>
                        <span className="font-medium text-foreground">{suite.passRate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-green-500 transition-all"
                          style={{ width: `${suite.passRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="text-green-600 font-medium">{suite.passedCount} passed</span>
                      <span className="text-red-600 font-medium">{suite.failedCount} failed</span>
                      <span className="text-amber-600 font-medium">{suite.blockedCount} blocked</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                      <span>By {suite.createdBy}</span>
                      <span>{formatDate(suite.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-3">
          {testPlans.length === 0 ? (
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No test plans found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {testPlans.map((plan) => {
                const progress = plan.totalCases > 0 ? Math.round((plan.executedCases / plan.totalCases) * 100) : 0;
                return (
                  <Card key={plan.id} className="border-border/80 shadow-xs hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground text-sm">{plan.name}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{plan.description}</p>
                        </div>
                        <span className={`shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${planStatusColor[plan.status] || ""}`}>
                          {plan.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {plan.modules.map((mod) => (
                          <span key={mod} className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                            {mod}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">
                            Progress: {plan.executedCases}/{plan.totalCases} executed
                          </span>
                          <span className="font-medium text-foreground">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">
                          Pass Rate: <span className="font-medium text-green-600">{plan.passRate}%</span>
                        </span>
                        <span className="inline-flex items-center rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                          {plan.environment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <span>{formatDate(plan.startDate)}{plan.endDate ? ` - ${formatDate(plan.endDate)}` : ""}</span>
                        <span>By {plan.createdBy}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bugs" className="space-y-3">
          {topBugs.length === 0 ? (
            <Card className="border-border/80 shadow-xs">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No bugs reported.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topBugs.map((bug) => (
                    <TableRow key={bug.id} className="hover:bg-muted/40">
                      <TableCell>
                        <span className={`font-mono text-xs font-bold ${bug.priority === "P1_CRITICAL" ? "text-red-600" : "text-foreground"}`}>
                          {bug.id}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        <span className="text-xs font-medium text-foreground truncate block">{bug.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                          {bug.module}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${priorityColor[bug.priority] || ""}`}>
                          {bug.priority.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${severityColor[bug.severity] || ""}`}>
                          {bug.severity.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${bugStatusColor[bug.status] || ""}`}>
                          {bug.status.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] text-muted-foreground">{bug.assignee}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-[11px] text-muted-foreground">{formatDate(bug.createdAt)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
