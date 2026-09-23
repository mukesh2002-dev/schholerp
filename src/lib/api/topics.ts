"use client";
import { apiFetch } from "./client";

export interface BackendTopic {
  uuid: string;
  title: string;
  description?: string | null;
  topicOrder: number;
  estimatedClasses?: number | null;
  status: string;
  chapterId: string;
  chapter?: { uuid: string; title: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchTopics(params: { chapterId?: string; subjectId?: string; search?: string; status?: string; campusId?: string | null; page?: number; limit?: number } = {}): Promise<{ data: BackendTopic[]; total: number }> {
  const q = new URLSearchParams();
  if (params.chapterId) q.set("chapterId", params.chapterId);
  if (params.subjectId) q.set("subjectId", params.subjectId);
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const effectiveCampus = params.campusId && params.campusId !== 'all' ? params.campusId : undefined;
  const res = await apiFetch<{ data: BackendTopic[]; meta?: { total: number } }>(`/academics/topics${qs}`, {}, { campusId: effectiveCampus });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: res.meta?.total ?? list.length };
}

export async function createTopicApi(payload: Record<string, unknown>): Promise<BackendTopic> {
  const res = await apiFetch<{ data: BackendTopic }>(`/academics/topics`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

export async function updateTopicApi(uuid: string, payload: Record<string, unknown>): Promise<BackendTopic> {
  const res = await apiFetch<{ data: BackendTopic }>(`/academics/topics/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function deleteTopicApi(uuid: string): Promise<void> {
  await apiFetch(`/academics/topics/${uuid}`, { method: "DELETE" });
}
