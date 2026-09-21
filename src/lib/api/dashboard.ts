"use client";

import { apiFetch } from "./client";

export interface DashboardStats {
  totalCampuses: number;
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  totalStaff: number;
  attendanceToday: number;
  pendingLeaves: number;
  notices: number;
  revenueBilled: number;
  revenueCollected: number;
  revenuePending: number;
  feeCollectionRate: number;
  occupancyRate: number;
}

export interface DashboardData {
  role: string;
  isGlobal: boolean;
  campus: { uuid: string; name: string; code: string } | null;
  stats: DashboardStats;
  visibleModules: string[];
  enabledPhases: number[];
  features: Record<string, boolean>;
  dashboardVariant: "admin" | "principal" | "hr" | "accountant" | "teacher" | "generic";
  generatedAt: string;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await apiFetch<{ data: DashboardData }>("/dashboard");
  return res.data;
}
