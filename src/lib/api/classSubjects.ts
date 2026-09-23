"use client";
import { apiFetch } from "./client";

export interface BackendClassSubject {
  uuid: string;
  classId: string;
  subjectId: string;
  academicYearId?: string | null;
  teacherId?: string | null;
  maxMarks?: number | null;
  passingMarks?: number | null;
  status: string;
  class?: { uuid: string; name: string; section?: string | null } | null;
  subject?: { uuid: string; name: string; code?: string | null } | null;
  academicYear?: { uuid: string; name: string } | null;
  teacher?: { uuid: string; name: string } | null;
}

export async function fetchClassSubjects(params: { classId?: string; subjectId?: string; academicYearId?: string; campusId?: string | null; page?: number; limit?: number } = {}): Promise<{ data: BackendClassSubject[]; total: number }> {
  const q = new URLSearchParams();
  if (params.classId) q.set("classId", params.classId);
  if (params.subjectId) q.set("subjectId", params.subjectId);
  if (params.academicYearId) q.set("academicYearId", params.academicYearId);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const effectiveCampus = params.campusId && params.campusId !== 'all' ? params.campusId : undefined;
  const res = await apiFetch<{ data: BackendClassSubject[]; meta?: { total: number } }>(`/academics/class-subjects${qs}`, {}, { campusId: effectiveCampus });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: res.meta?.total ?? list.length };
}

export async function createClassSubjectApi(payload: Record<string, unknown>): Promise<BackendClassSubject> {
  const res = await apiFetch<{ data: BackendClassSubject }>(`/academics/class-subjects`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

export async function updateClassSubjectApi(uuid: string, payload: Record<string, unknown>): Promise<BackendClassSubject> {
  const res = await apiFetch<{ data: BackendClassSubject }>(`/academics/class-subjects/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function deleteClassSubjectApi(uuid: string): Promise<void> {
  await apiFetch(`/academics/class-subjects/${uuid}`, { method: "DELETE" });
}
