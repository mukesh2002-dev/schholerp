"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { StatCard } from "@/components/ui/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AdmissionFunnel } from "@/components/dashboard/admission-funnel";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NoticeBoard } from "@/components/dashboard/notice-board";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  GraduationCap,
  Users,
  HardHat,
  CheckCircle2,
  DollarSign,
  UserPlus,
  Bus,
  Fingerprint,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { activeBranchId, activeBranch, branches, stats, session, setActiveBranchId } = useERP();

  const isGlobal = activeBranchId === "all";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-border/80 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Executive Dashboard
            </span>
            <Badge variant="outline" className="text-[11px] font-semibold">
              {isGlobal ? "Multi-Campus Consolidated" : `${activeBranch?.name} Context`}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {session.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {isGlobal
              ? `Real-time management overview for all 6 campus branches. Monitoring ${formatNumber(
                  stats.totalStudents
                )} students and ${formatNumber(stats.totalEmployees)} total staff.`
              : `${activeBranch?.tagline} • Led by ${activeBranch?.principalName}`}
          </p>
        </div>

        {/* Quick Context Summary Button */}
        <div className="flex items-center gap-2 z-10">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 bg-card/80">
            <Link href="/branches">
              <Building2 className="h-4 w-4 text-primary" />
              <span>Manage Branches</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Students */}
        <StatCard
          title="Enrolled Students"
          value={formatNumber(stats.totalStudents)}
          change={4.8}
          changeType="increase"
          period="vs last academic term"
          description={`${stats.occupancyRate}% overall capacity utilization`}
          icon={<GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          iconColor="bg-blue-500/10"
          badge={`${stats.occupancyRate}% full`}
        />

        {/* 2. Faculty & Teachers */}
        <StatCard
          title="Faculty & Teachers"
          value={formatNumber(stats.totalTeachers)}
          change={2.1}
          changeType="increase"
          period="1:16 Teacher-Student Ratio"
          description="Certified academic instructors"
          icon={<Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          iconColor="bg-emerald-500/10"
        />

        {/* 3. Support Staff & Workers */}
        <StatCard
          title="Staff & Support Workers"
          value={formatNumber(stats.totalStaff + stats.totalWorkers)}
          description={`${stats.totalStaff} admin + ${stats.totalWorkers} support personnel`}
          period="Active on 3 campus shifts"
          icon={<HardHat className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          iconColor="bg-amber-500/10"
        />

        {/* 4. Today's Attendance */}
        <StatCard
          title="Today's Attendance"
          value={`${stats.attendanceRate}%`}
          change={0.8}
          changeType="increase"
          period="Synced via Biometrics"
          description="Live verified check-ins"
          icon={<CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconColor="bg-purple-500/10"
        />

        {/* 5. Monthly Revenue / Fees */}
        <StatCard
          title="Monthly Fee Collection"
          value={formatCurrency(stats.monthlyRevenue)}
          change={stats.feeCollectionRate}
          changeType="increase"
          period="Collection Target MTD"
          description={`${stats.feeCollectionRate}% collection efficiency`}
          icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          iconColor="bg-emerald-500/10"
        />

        {/* 6. Pending Admissions */}
        <StatCard
          title="New Admissions"
          value={formatNumber(stats.pendingAdmissions)}
          change={12.4}
          changeType="increase"
          period="Active inquiries & forms"
          description="Applications awaiting interview"
          icon={<UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          iconColor="bg-indigo-500/10"
        />

        {/* 7. Active Bus Routes */}
        <StatCard
          title="Transport Fleet"
          value={`${stats.activeBusRoutes} Routes`}
          description="GPS fleet tracking active"
          period="99.4% on-time arrival"
          icon={<Bus className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
          iconColor="bg-sky-500/10"
        />

        {/* 8. Biometric Gateway */}
        <StatCard
          title="Biometric Devices"
          value="4 / 4 Online"
          description="ZK & Face terminals active"
          period="Last sync 2 min ago"
          icon={<Fingerprint className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          iconColor="bg-rose-500/10"
          badge="100% Health"
        />
      </div>

      {/* Quick Action Hub */}
      <QuickActions />

      {/* Charts Section: Attendance & Fee Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AttendanceChart />
        <RevenueChart />
      </div>

      {/* Funnel & Quotas */}
      <AdmissionFunnel />

      {/* Notices Board & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <NoticeBoard />
        <RecentActivity />
      </div>

      {/* Campus Snapshot Switcher Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Campus Branch Roster</h3>
            <p className="text-xs text-muted-foreground">
              Click any campus to filter dashboard metrics or manage individual school operations
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/branches">View All 6 Branches →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => setActiveBranchId(b.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden bg-card ${
                activeBranchId === b.id
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-border/80 hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1.5"
                style={{ backgroundColor: b.color || "#3b82f6" }}
              />
              <div className="pl-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-muted-foreground">{b.code}</span>
                  <Badge variant="outline" className="text-[10px] py-0">
                    {b.status}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {b.name}
                </h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{formatNumber(b.totalStudents)} Students</span>
                  <span>{b.totalTeachers} Teachers</span>
                  <span className="font-semibold text-foreground">{b.attendanceRate}% Attendance</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
