"use client";

// Centralised query keys — avoids typo-driven cache misses and enables
// single-point invalidation (e.g. after bulk config update).
export const qk = {
  adminConfig: () => ["admin-config"] as const,
  adminPhases: () => ["admin-phases"] as const,
  adminFeatures: () => ["admin-features"] as const,
  dashboard: (campusId?: string | null) => ["dashboard", campusId ?? "global"] as const,
  branches: () => ["branches"] as const,
  campusData: (key: string, campusId: string | null) => ["campus-data", key, campusId ?? "all"] as const,
} as const;
