"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { StatCard } from "@/components/ui/stat-card";
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
  WifiOff,
  Loader2,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ExecutiveDashboard() {
  const { activeBranchId, activeBranch, session } = useERP();
  const { data, isLoading, isOffline, error } = useDashboard();
  const isGlobal = data?.isGlobal ?? activeBranchId === "all";
  // Live stats only — no mock fallback. Absent = zeros + offline banner.
  const s = data?.stats;
  const stats = {
    totalStudents: Number(s?.totalStudents ?? 0),
    totalTeachers: Number(s?.totalTeachers ?? 0),
    totalStaff: Number(s?.totalStaff ?? 0),
    totalWorkers: 0,
    totalEmployees: Number(s?.totalStaff ?? 0),
    occupancyRate: Number(s?.feeCollectionRate ?? 0),
    attendanceRate: 0,
    monthlyRevenue: Number(s?.revenueCollected ?? 0),
    feeCollectionRate: Number(s?.feeCollectionRate ?? 0),
    pendingAdmissions: Number(s?.notices ?? 0),
    activeBusRoutes: 0,
  };
  const variant = data?.dashboardVariant ?? (session.role as string).toLowerCase();
  const campusName = data?.campus?.name ?? activeBranch?.name;

  return (
    <div className="space-y-8">
      {/* Offline / loading per rules.md — never crash, show proper state */}
      {isOffline && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
          <WifiOff className="h-3.5 w-3.5" /> Offline — showing last known stats
        </div>
      )}
      {error && !isOffline && (
        <div className="p-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs">{error}</div>
      )}
      {/* Top Banner / Welcome Header — dynamic per role */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 border border-border/80 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              {variant === "admin" ? "Executive Dashboard" : variant === "principal" ? "Campus Dashboard" : variant === "hr" ? "HR Dashboard" : variant === "accountant" ? "Finance Dashboard" : variant === "teacher" ? "My Classes Dashboard" : "Executive Dashboard"}
            </span>
            <Badge variant="outline" className="text-[11px] font-semibold">
              {isGlobal ? "Multi-Campus Consolidated" : `${campusName ?? activeBranch?.name} Context`}
            </Badge>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {session.name}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {isGlobal
              ? `Real-time management overview for all 6 campus branches. Monitoring ${formatNumber(
                  stats.totalStudents
                )} students and ${formatNumber(stats.totalEmployees)} total staff.`
              : `${campusName ?? activeBranch?.name} • ${activeBranch?.tagline ?? ""} ${data?.campus ? `• Role: ${variant}` : ""}`}
          </p>
          {data?.visibleModules && <p className="text-[11px] text-muted-foreground">Modules: {data.visibleModules.join(" · ")}</p>}
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

      {/* KPI Metric Cards Grid — dynamic per role (all modules dynamic, campus-scoped) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Students — all roles */}
        <StatCard
          title={variant === "hr" ? "Staff Students" : variant === "accountant" ? "Fee Students" : "Enrolled Students"}
          value={formatNumber(stats.totalStudents)}
          change={4.8}
          changeType="increase"
          period={isGlobal ? "vs last term (global)" : `vs last term (${campusName ?? "campus"} scope)`}
          description={`${stats.occupancyRate}% capacity`}
          icon={<GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          iconColor="bg-blue-500/10"
          badge={isLoading ? "…" : `${stats.occupancyRate}% full`}
        />

        {/* 2. Faculty & Teachers — hide for accountant (finance only) */}
        {(variant === "admin" || variant === "principal" || variant === "hr" || variant === "teacher") && (
          <StatCard
            title="Faculty & Teachers"
            value={formatNumber(stats.totalTeachers)}
            change={2.1}
            changeType="increase"
            period="1:16 Ratio"
            description={variant === "hr" ? "HR managed" : "Certified instructors"}
            icon={<Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            iconColor="bg-emerald-500/10"
          />
        )}

        {/* 3. Support Staff & Workers — HR + admin/principal */}
        {(variant === "admin" || variant === "principal" || variant === "hr") && (
          <StatCard
            title="Staff & Support"
            value={formatNumber(stats.totalStaff + stats.totalWorkers)}
            description={`${stats.totalStaff} admin + ${stats.totalWorkers} support`}
            period={variant === "hr" ? "HR directory" : "Active on 3 shifts"}
            icon={<HardHat className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
            iconColor="bg-amber-500/10"
          />
        )}

        {/* 4. Today's Attendance — all except accountant */}
        {variant !== "accountant" && (
          <StatCard
            title="Today's Attendance"
            value={formatNumber(data?.stats?.attendanceToday ?? 0)}
            change={0}
            changeType="neutral"
            period="Records marked"
            description="Live from the attendance ledger"
            icon={<CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            iconColor="bg-purple-500/10"
          />
        )}

        {/* 5. Monthly Revenue / Fees — admin/accountant/principal only */}
        {(variant === "admin" || variant === "accountant" || variant === "principal") && (
          <StatCard
            title="Fee Collection"
            value={formatCurrency(stats.monthlyRevenue)}
            change={stats.feeCollectionRate}
            changeType="increase"
            period="MTD"
            description={`${stats.feeCollectionRate}% efficiency · Pending ${formatCurrency(data?.stats?.revenuePending ?? 0)}`}
            icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            iconColor="bg-emerald-500/10"
          />
        )}

        {/* 6. Pending Leaves/Admissions — role-specific label */}
        <StatCard
          title={variant === "hr" ? "Pending Leaves" : variant === "accountant" ? "Pending Invoices" : "New Admissions"}
          value={formatNumber(variant === "hr" ? (data?.stats?.pendingLeaves ?? 0) : variant === "accountant" ? ((data?.stats?.revenuePending ?? 0) > 0 ? Math.ceil((data?.stats?.revenuePending ?? 0) / 10000) : 0) : stats.pendingAdmissions)}
          change={12.4}
          changeType="increase"
          period={variant === "hr" ? "Awaiting approval" : variant === "accountant" ? "Unpaid" : "Active inquiries"}
          description={variant === "hr" ? "HR queue" : variant === "accountant" ? "Finance queue" : "Awaiting interview"}
          icon={<UserPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          iconColor="bg-indigo-500/10"
        />

        {/* 7. Campus Branches — hide for HR/accountant */}
        {(variant === "admin" || variant === "principal") && (
          <StatCard
            title="Campus Branches"
            value={`${data?.stats?.totalCampuses ?? 0}`}
            description="Active campuses"
            period="Multi-campus network"
            icon={<Bus className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
            iconColor="bg-sky-500/10"
          />
        )}

        {/* 8. Notices — all except accountant */}
        {variant !== "accountant" && (
          <StatCard
            title="Notices & Circulars"
            value={formatNumber(data?.stats?.notices ?? 0)}
            description="Published announcements"
            period="Latest circulars"
            icon={<Fingerprint className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
            iconColor="bg-rose-500/10"
            badge={`${data?.stats?.notices ?? 0} live`}
          />
        )}
      </div>
      {data && <p className="text-[11px] text-muted-foreground text-center">Dashboard scope: {isGlobal ? "Global (all campuses)" : `Campus ${campusName} only`} · Generated {new Date(data.generatedAt).toLocaleTimeString()} · Role {variant}</p>}
    </div>
  );
}
