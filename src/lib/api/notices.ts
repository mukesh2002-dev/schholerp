"use client";
import { apiFetch } from "./client";

export interface BackendNotice {
  uuid: string;
  title: string;
  content: string;
  priority?: string | null;
  targetRoles?: string[];
  branchId?: string | null;
  branchName?: string | null;
  author?: string | null;
  publishedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  category: string;
  author: string;
  date: string;
  branchId: string;
  branchName: string;
}

export function mapBackendNotice(n: BackendNotice): Notice {
  const p = String(n.priority ?? "normal").toUpperCase();
  return {
    id: n.uuid,
    title: n.title,
    content: n.content,
    priority: (p === "URGENT" || p === "HIGH" || p === "LOW" ? p : "NORMAL") as Notice["priority"],
    category: "Circular",
    author: n.author ?? "Administration",
    date: n.publishedAt ?? new Date().toISOString(),
    branchId: n.branchId ?? "all",
    branchName: n.branchName ?? "All Campuses",
  };
}

export async function fetchNotices(params: { campusId?: string | null } = {}): Promise<Notice[]> {
  try {
    const res = await apiFetch<{ data: BackendNotice[] }>(`/notices`, {}, { campusId: params.campusId ?? undefined });
    if (Array.isArray(res.data)) return res.data.map(mapBackendNotice);
  } catch {}
  return [];
}

export async function createNoticeApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Notice> {
  const res = await apiFetch<{ data: BackendNotice }>(
    `/admin/broadcast`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return mapBackendNotice(res.data);
}