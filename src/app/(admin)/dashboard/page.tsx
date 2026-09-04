"use client";

import React, { Suspense } from "react";
import {
  ExecutiveDashboard,
  ExecutiveDashboardSkeleton,
  QuickActionCommandHub,
  QuickActionCommandHubSkeleton,
  AttendanceRateTrends,
  AttendanceRateTrendsSkeleton,
  FeeCollections,
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

export default function AdminDashboardPage() {
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
