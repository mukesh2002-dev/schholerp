"use client";
import { apiFetch } from "./client";

export interface BackendChapter {
  uuid: string;
  title: string;
  description?: string | null;
  chapterNumber: number;
  status: string;
  subjectId: string;
  subject?: { uuid: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { topics?: number };
}

export async function fetchChapters(params: { subjectId?: string; search?: string; status?: string; campusId?: string | null; page?: number; limit?: number } = {}): Promise<{ data: BackendChapter[]; total: number }> {
  const q = new URLSearchParams();
  if (params.subjectId) q.set("subjectId", params.subjectId);
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const effectiveCampus = params.campusId && params.campusId !== 'all' ? params.campusId : undefined;
  const res = await apiFetch<{ data: BackendChapter[]; meta?: { total: number } }>(`/academics/chapters${qs}`, {}, { campusId: effectiveCampus });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: res.meta?.total ?? list.length };
}

export async function fetchChapterById(uuid: string): Promise<BackendChapter> {
  const res = await apiFetch<{ data: BackendChapter }>(`/academics/chapters/${uuid}`);
  return res.data;
}

export async function createChapterApi(payload: Record<string, unknown>): Promise<BackendChapter> {
  const res = await apiFetch<{ data: BackendChapter }>(`/academics/chapters`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

export async function updateChapterApi(uuid: string, payload: Record<string, unknown>): Promise<BackendChapter> {
  const res = await apiFetch<{ data: BackendChapter }>(`/academics/chapters/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function deleteChapterApi(uuid: string): Promise<void> {
  await apiFetch(`/academics/chapters/${uuid}`, { method: "DELETE" });
}
