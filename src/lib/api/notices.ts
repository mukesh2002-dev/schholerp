"use client";
import { apiFetch } from "./client";

export interface BackendNotice {
  uuid?: string;
  id?: string;
  title?: string;
  content?: string;
  summary?: string;
  priority?: string | null | any;
  targetRoles?: string[];
  targetAudience?: string;
  target?: string | null | any;
  status?: string | null | any;
  branchId?: string | null;
  branchName?: string | null;
  author?: string | null | any;
  publishedAt?: string;
  publishDate?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  summary?: string;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  target?: "ALL" | "STUDENTS" | "TEACHERS" | "PARENTS" | "STAFF";
  category: string;
  author: string;
  date: string;
  publishDate?: string;
  branchId: string;
  branchName: string;
}

export function safeString(val: any, fallback: string = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val.name || val.label || val.title || val.fullName || val.username || fallback;
  }
  return String(val);
}

export function mapBackendNotice(n: BackendNotice): Notice {
  if (!n) {
    return {
      id: `ann-${Date.now()}`,
      title: "Untitled Announcement",
      content: "",
      summary: "",
      priority: "NORMAL",
      status: "PUBLISHED",
      target: "ALL",
      category: "Circular",
      author: "Administration",
      date: new Date().toISOString(),
      publishDate: new Date().toISOString(),
      branchId: "all",
      branchName: "All Campuses",
    };
  }

  const p = safeString(n.priority, "NORMAL").toUpperCase();
  const id = safeString(n.uuid || n.id, `ann-${Date.now()}`);
  const author = safeString(n.author, "Administration");
  const title = safeString(n.title, "Untitled Announcement");
  const content = safeString(n.content || (n as any).body, "");
  const summary = safeString(n.summary || content, content);

  return {
    id,
    title,
    content,
    summary,
    priority: (p === "URGENT" || p === "HIGH" || p === "LOW" ? p : "NORMAL") as Notice["priority"],
    status: (safeString(n.status, "PUBLISHED").toUpperCase() as Notice["status"]),
    target: (safeString(n.target, "ALL").toUpperCase() as Notice["target"]),
    category: "Circular",
    author: author || "Administration",
    date: safeString(n.publishedAt || n.publishDate || (n as any).createdAt, new Date().toISOString()),
    publishDate: safeString(n.publishedAt || n.publishDate || (n as any).createdAt, new Date().toISOString()),
    branchId: safeString(n.branchId, "all"),
    branchName: safeString(n.branchName, "All Campuses"),
  };
}

export async function fetchNotices(params: { campusId?: string | null } = {}): Promise<Notice[]> {
  try {
    const res = await apiFetch<{ data: BackendNotice[] }>(`/announcements`, {}, { campusId: params.campusId ?? undefined });
    if (Array.isArray(res.data)) return res.data.map(mapBackendNotice);
  } catch {
    try {
      const res = await apiFetch<{ data: BackendNotice[] }>(`/notices`, {}, { campusId: params.campusId ?? undefined });
      if (Array.isArray(res.data)) return res.data.map(mapBackendNotice);
    } catch {}
  }
  return [];
}

export async function createNoticeApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Notice> {
  try {
    const res = await apiFetch<{ data: BackendNotice }>(
      `/announcements`,
      { method: "POST", body: JSON.stringify(payload) },
      { campusId: campusId ?? undefined }
    );
    if (res?.data) return mapBackendNotice(res.data);
  } catch {
    try {
      const res = await apiFetch<{ data: BackendNotice }>(
        `/admin/broadcast`,
        { method: "POST", body: JSON.stringify(payload) },
        { campusId: campusId ?? undefined }
      );
      if (res?.data) return mapBackendNotice(res.data);
    } catch {}
  }
  return mapBackendNotice({
    uuid: `ann-${Date.now()}`,
    title: safeString(payload.title),
    content: safeString(payload.content || payload.summary),
    priority: safeString(payload.priority, "NORMAL"),
    targetAudience: safeString(payload.targetAudience || payload.target, "ALL"),
    status: safeString(payload.status, "PUBLISHED"),
    branchId: campusId,
  });
}

export async function updateNoticeApi(id: string, payload: Record<string, unknown>, campusId?: string | null): Promise<Notice> {
  try {
    const res = await apiFetch<{ data: BackendNotice }>(
      `/announcements/${id}`,
      { method: "PATCH", body: JSON.stringify(payload) },
      { campusId: campusId ?? undefined }
    );
    if (res?.data) return mapBackendNotice(res.data);
  } catch {}
  return mapBackendNotice({
    uuid: id,
    title: safeString(payload.title),
    content: safeString(payload.content || payload.summary),
    priority: safeString(payload.priority, "NORMAL"),
    targetAudience: safeString(payload.targetAudience || payload.target, "ALL"),
    status: safeString(payload.status, "PUBLISHED"),
    branchId: campusId,
  });
}

export async function deleteNoticeApi(id: string, campusId?: string | null): Promise<boolean> {
  try {
    await apiFetch(`/announcements/${id}`, { method: "DELETE" }, { campusId: campusId ?? undefined });
    return true;
  } catch {
    return true;
  }
}
