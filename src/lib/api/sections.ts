"use client";
import { apiFetch } from "./client";

export interface BackendSection {
  uuid: string;
  name: string;
  roomNumber?: string | null;
  capacity?: number | null;
  status: string;
  classId?: string;
  classTeacherId?: string | null;
  classTeacher?: { uuid: string; name: string } | null;
  class?: { uuid: string; name: string } | null;
  studentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchSections(
  params: {
    classId?: string;
    campusId?: string | null;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ data: BackendSection[]; total: number }> {
  const q = new URLSearchParams();
  if (params.classId) q.set("classId", params.classId);
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendSection[]; meta?: { total: number } }>(
    `/academics/sections${qs}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: res.meta?.total ?? list.length };
}

export async function fetchSectionByUuid(uuid: string): Promise<BackendSection> {
  const res = await apiFetch<{ data: BackendSection }>(`/academics/sections/${uuid}`);
  return res.data;
}

export async function createSectionApi(payload: Record<string, unknown>): Promise<BackendSection> {
  const res = await apiFetch<{ data: BackendSection }>(`/academics/sections`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateSectionApi(
  uuid: string,
  payload: Record<string, unknown>
): Promise<BackendSection> {
  const res = await apiFetch<{ data: BackendSection }>(`/academics/sections/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteSectionApi(uuid: string): Promise<void> {
  await apiFetch(`/academics/sections/${uuid}`, { method: "DELETE" });
}
