"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  formatCurrency,
} from "@/lib/utils";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const attendanceTrendData = [
  { month: "Apr", students: 95.2, teachers: 97.8, workers: 94.1 },
  { month: "May", students: 93.8, teachers: 96.5, workers: 93.4 },
  { month: "Jun", students: 96.1, teachers: 98.2, workers: 95.7 },
  { month: "Jul", students: 91.4, teachers: 95.9, workers: 92.8 },
  { month: "Aug", students: 94.7, teachers: 97.1, workers: 94.6 },
  { month: "Sep", students: 96.8, teachers: 98.5, workers: 96.2 },
];

const feeCollectionData = [
  { month: "Apr", collected: 845000, target: 900000 },
  { month: "May", collected: 792000, target: 900000 },
  { month: "Jun", collected: 878000, target: 920000 },
  { month: "Jul", collected: 856000, target: 920000 },
  { month: "Aug", collected: 910000, target: 950000 },
  { month: "Sep", collected: 935000, target: 950000 },
];

const enrollmentByClassData = [
  { className: "Grade 1", students: 120 },
  { className: "Grade 2", students: 115 },
  { className: "Grade 3", students: 108 },
  { className: "Grade 4", students: 132 },
  { className: "Grade 5", students: 125 },
  { className: "Grade 6", students: 118 },
  { className: "Grade 7", students: 142 },
  { className: "Grade 8", students: 135 },
  { className: "Grade 9", students: 155 },
  { className: "Grade 10", students: 148 },
];

const examResultsData = [
  { className: "Grade 1", avgPercentage: 82.4 },
  { className: "Grade 2", avgPercentage: 79.1 },
  { className: "Grade 3", avgPercentage: 85.6 },
  { className: "Grade 4", avgPercentage: 78.3 },
  { className: "Grade 5", avgPercentage: 81.9 },
  { className: "Grade 6", avgPercentage: 76.8 },
  { className: "Grade 7", avgPercentage: 74.2 },
  { className: "Grade 8", avgPercentage: 72.5 },
  { className: "Grade 9", avgPercentage: 69.8 },
  { className: "Grade 10", avgPercentage: 71.3 },
];

const expenseCategoryData = [
  { name: "Salaries", value: 1450000, fill: "#3b82f6" },
  { name: "Infrastructure", value: 320000, fill: "#8b5cf6" },
  { name: "Utilities", value: 185000, fill: "#f59e0b" },
  { name: "Transport", value: 240000, fill: "#10b981" },
  { name: "Supplies", value: 155000, fill: "#ec4899" },
  { name: "Maintenance", value: 125000, fill: "#06b6d4" },
  { name: "Events", value: 95000, fill: "#f97316" },
];

const feeVsTargetData = [
  { month: "Apr", collected: 845000, target: 900000, gap: -55000 },
  { month: "May", collected: 792000, target: 900000, gap: -108000 },
  { month: "Jun", collected: 878000, target: 920000, gap: -42000 },
  { month: "Jul", collected: 856000, target: 920000, gap: -64000 },
  { month: "Aug", collected: 910000, target: 950000, gap: -40000 },
  { month: "Sep", collected: 935000, target: 950000, gap: -15000 },
];

const transportData = [
  { route: "Route A", students: 42, capacity: 50 },
  { route: "Route B", students: 38, capacity: 45 },
  { route: "Route C", students: 55, capacity: 60 },
  { route: "Route D", students: 30, capacity: 40 },
  { route: "Route E", students: 48, capacity: 55 },
  { route: "Route F", students: 25, capacity: 35 },
];

const inventoryValueData = [
  { category: "Lab Equipment", value: 850000, items: 342 },
  { category: "Classroom Supplies", value: 420000, items: 1250 },
  { category: "Sports Gear", value: 310000, items: 560 },
  { category: "Library Books", value: 280000, items: 4800 },
  { category: "IT Hardware", value: 620000, items: 185 },
  { category: "Office Furniture", value: 450000, items: 95 },
];

const payrollDistributionData = [
  { category: "Teachers", total: 1450000, count: 48 },
  { category: "Staff", total: 680000, count: 32 },
  { category: "Workers", total: 320000, count: 24 },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "0.75rem",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

export default function ReportsPage() {
  const { activeBranchId, stats } = useERP();
  const monthlyExpenses = mockDb.getMonthlyExpenseSummary();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Institution-wide performance metrics, academic insights, and operational analytics.
          </p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          Academic Year 2026-27
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              change={4.2}
              changeType="increase"
              period="vs last year"
              icon={<GraduationCap className="h-5 w-5" />}
              iconColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Total Teachers"
              value={stats.totalTeachers.toLocaleString()}
              change={2.1}
              changeType="increase"
              period="vs last year"
              icon={<Users className="h-5 w-5" />}
              iconColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              change={1.8}
              changeType="increase"
              period="this month"
              icon={<CalendarCheck className="h-5 w-5" />}
              iconColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <StatCard
              title="Fee Collection Rate"
              value={`${stats.feeCollectionRate}%`}
              change={-1.2}
              changeType="decrease"
              period="this quarter"
              icon={<IndianRupee className="h-5 w-5" />}
              iconColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Attendance Trends
                    </CardTitle>
                    <CardDescription>Monthly attendance rates (Apr - Sep)</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Improving
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        domain={[88, 100]}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(value: any) => [`${value}%`]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        name="Students"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="teachers"
                        name="Teachers"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="workers"
                        name="Workers"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Fee Collections
                    </CardTitle>
                    <CardDescription>Collected vs target billing amounts</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    {formatCurrency(feeCollectionData.reduce((a, d) => a + d.collected, 0))}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feeCollectionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="collected" name="Collected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Student Enrollment by Class
                </CardTitle>
                <CardDescription>Distribution of enrolled students across all grade levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentByClassData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="className"
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
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [`${val} students`, "Enrolled"]}
                      />
                      <Bar
                        dataKey="students"
                        name="Students"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Exam Results Comparison
                </CardTitle>
                <CardDescription>Average percentage scored by class in latest examinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examResultsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="className"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        domain={[60, 90]}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [`${val}%`, "Avg Percentage"]}
                      />
                      <Bar
                        dataKey="avgPercentage"
                        name="Avg %"
                        fill="#06b6d4"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Monthly Expenses
                </CardTitle>
                <CardDescription>Total approved expense amounts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyExpenses} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(val) => `${(val / 100000).toFixed(1)}L`}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [formatCurrency(Number(val)), "Total"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Expenses"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorExpense)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Expense Distribution
                </CardTitle>
                <CardDescription>Breakdown by expense category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {expenseCategoryData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Fee Collection vs Target
                    </CardTitle>
                    <CardDescription>Monthly collection performance against billing targets</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    93.9% Achievement
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={feeVsTargetData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="collected"
                        name="Collected"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        name="Target"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Transport Utilization
                </CardTitle>
                <CardDescription>Students transported vs vehicle capacity per route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transportData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="route"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [`${val}`, ""]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                      />
                      <Bar dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="capacity" name="Capacity" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Inventory Value by Category
                </CardTitle>
                <CardDescription>Total asset value across inventory divisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryValueData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="category"
                      >
                        {inventoryValueData.map((_, index) => (
                          <Cell
                            key={`inv-${index}`}
                            fill={["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ec4899"][index]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [formatCurrency(Number(val)), "Value"]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-foreground">
                  Payroll Distribution
                </CardTitle>
                <CardDescription>Monthly salary disbursal across employee categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={payrollDistributionData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="category"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={11}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(val) => `${(val / 100000).toFixed(1)}L`}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        formatter={(val: any) => [formatCurrency(Number(val)), "Monthly Payroll"]}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                      />
                      <Bar
                        dataKey="total"
                        name="Payroll"
                        radius={[4, 4, 0, 0]}
                      >
                        {payrollDistributionData.map((_, index) => (
                          <Cell key={`payroll-${index}`} fill={["#3b82f6", "#8b5cf6", "#10b981"][index]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
