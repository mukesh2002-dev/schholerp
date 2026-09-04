"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  ExecutiveDashboard,
  ExecutiveDashboardSkeleton,
  QuickActionCommandHub,
  QuickActionCommandHubSkeleton,
  AttendanceRateTrendsSkeleton,
  FeeCollectionsSkeleton,
  PerformanceOverview,
  PerformanceOverviewSkeleton,
  CampusCapacityQuotas,
  CampusCapacityQuotasSkeleton,
  NoticesAndCirculars,
  NoticesAndCircularsSkeleton,
  CampusBranchRoster,
  CampusBranchRosterSkeleton,
} from "@/sections/dashboard";

// Heavy chart libraries (recharts) are code-split and client-only:
// they load after first paint instead of bloating the initial bundle.
const AttendanceRateTrends = dynamic(
  () =>
    import("@/sections/dashboard/attendance-rate-trends/attendance-rate-trends").then((m) => ({
      default: m.AttendanceRateTrends,
    })),
  { ssr: false, loading: () => <AttendanceRateTrendsSkeleton /> }
);

const FeeCollections = dynamic(
  () =>
    import("@/sections/dashboard/fee-collections/fee-collections").then((m) => ({
      default: m.FeeCollections,
    })),
  { ssr: false, loading: () => <FeeCollectionsSkeleton /> }
);

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Executive Dashboard (Welcome Banner + 8 Metric KPI Cards) */}
      <Suspense fallback={<ExecutiveDashboardSkeleton />}>
        <ExecutiveDashboard />
      </Suspense>

      {/* 2. Quick Action Command Hub */}
      <Suspense fallback={<QuickActionCommandHubSkeleton />}>
        <QuickActionCommandHub />
      </Suspense>

      {/* 3 & 4. Charts: Attendance Trends & Fee Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Suspense fallback={<AttendanceRateTrendsSkeleton />}>
          <AttendanceRateTrends />
        </Suspense>
        <Suspense fallback={<FeeCollectionsSkeleton />}>
          <FeeCollections />
        </Suspense>
      </div>

      {/* 5 & 6. Performance Overview & Campus Capacity Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<PerformanceOverviewSkeleton />}>
          <PerformanceOverview />
        </Suspense>
        <Suspense fallback={<CampusCapacityQuotasSkeleton />}>
          <CampusCapacityQuotas />
        </Suspense>
      </div>

      {/* 7. Notices, Circulars & Audit Trail */}
      <Suspense fallback={<NoticesAndCircularsSkeleton />}>
        <NoticesAndCirculars />
      </Suspense>

      {/* 8. Campus Branch Switcher Roster */}
      <Suspense fallback={<CampusBranchRosterSkeleton />}>
        <CampusBranchRoster />
      </Suspense>
    </div>
  );
}
