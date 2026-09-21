"use client";
import { apiFetch } from "./client";

export interface BackendUser { uuid: string; email: string; name: string; role?: string; campus?: { uuid: string; name: string } | null; isActive?: boolean }

export async function fetchStaffDirectory(params: { campusId?: string | null; role?: string; search?: string; page?: number; limit?: number } = {}): Promise<{ data: BackendUser[]; total: number }> {
  const q = new URLSearchParams();
  if (params.role) q.set("role", params.role);
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendUser[]; meta?: { total: number } }>(`/users${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}
