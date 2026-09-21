"use client";

import { apiFetch } from "./client";

// ── Dynamic admin-only config (phase-by-phase) ──
// Backend: GET/PUT /admin/config, /admin/phases, /admin/features
// Stored in `settings` table, Redis cached 60s. ADMIN-only via RBAC.

export interface AdminPhase {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AdminFeature {
  key: string;
  name: string;
  phase: number;
  enabled: boolean;
}

export interface AdminConfig {
  phases: AdminPhase[];
  features: AdminFeature[];
}

export async function fetchAdminConfig(): Promise<AdminConfig> {
  const res = await apiFetch<{ data: AdminConfig }>("/admin/config");
  return res.data;
}

export async function fetchAdminPhases(): Promise<AdminPhase[]> {
  const res = await apiFetch<{ data: AdminPhase[] }>("/admin/phases");
  return res.data;
}

export async function updateAdminPhase(phaseId: number, enabled: boolean): Promise<AdminPhase> {
  const res = await apiFetch<{ data: AdminPhase }>(`/admin/phases/${phaseId}`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
  return res.data;
}

export async function fetchAdminFeatures(): Promise<AdminFeature[]> {
  const res = await apiFetch<{ data: AdminFeature[] }>("/admin/features");
  return res.data;
}

export async function updateAdminFeature(key: string, enabled: boolean): Promise<AdminFeature> {
  const res = await apiFetch<{ data: AdminFeature }>(`/admin/features/${key}`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
  return res.data;
}

export async function updateAdminConfigBulk(payload: {
  phases?: Record<string, boolean>;
  features?: Record<string, boolean>;
}): Promise<AdminConfig> {
  const res = await apiFetch<{ data: AdminConfig }>("/admin/config", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}
