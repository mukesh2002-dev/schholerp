"use client";
import { apiFetch } from "./client";
import type { Homework, HomeworkStatus, HomeworkType } from "@/types";

/** Raw homework row as returned by the backend (`GET /homework`). */
export interface BackendHomework {
  uuid: string;
  title: string;
  description: string | null;
  homeworkType: HomeworkType;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  maxMarks: number;
  dueDate: string;
  status: HomeworkStatus;
  section: string | null;
  attachments: string[];
  class: { uuid: string; name: string; section: string | null } | null;
  assignedBy: { uuid: string; name: string } | null;
  campus: { uuid: string; name: string } | null;
  submissionsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendHomeworkSubmission {
  uuid: string;
  status: string;
  remarks: string | null;
  fileUrl: string | null;
  grade: string | null;
  marksGiven: string | null;
  feedback: string | null;
  submittedAt: string;
  student: { uuid: string; name: string; admissionNo: string; rollNo: string | null } | null;
  homeworkUuid?: string;
  createdAt: string;
  updatedAt: string;
}

/** Map the backend row onto the shared frontend `Homework` type. */
export function mapBackendHomework(h: BackendHomework): Homework & { submissionsCount: number } {
  const sectionName = h.section ?? h.class?.section ?? "";
  return {
    id: h.uuid,
    title: h.title,
    description: h.description ?? "",
    subjectId: "",
    subjectName: "—",
    subjectCode: "",
    classId: h.class?.uuid ?? "",
    className: h.class?.name ?? "—",
    sectionId: sectionName,
    sectionName,
    branchId: h.campus?.uuid ?? "all",
    branchName: h.campus?.name ?? "Campus",
    teacherId: h.assignedBy?.uuid ?? "",
    teacherName: h.assignedBy?.name ?? "—",
    assignedDate: h.createdAt,
    dueDate: h.dueDate,
    maxMarks: h.maxMarks,
    status: h.status,
    homeworkType: h.homeworkType,
    // Frontend type supports LOW | MEDIUM | HIGH — fold URGENT into HIGH.
    priority: h.priority === "URGENT" ? "HIGH" : h.priority,
    attachments: h.attachments ?? [],
    createdAt: h.createdAt,
    updatedAt: h.updatedAt,
    submissionsCount: h.submissionsCount ?? 0,
  };
}

function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export interface HomeworkListParams {
  campusId?: string | null;
  status?: string;
  type?: string;
  priority?: string;
  classUuid?: string;
  search?: string;
  dueFrom?: string;
  dueTo?: string;
  page?: number;
  limit?: number;
}

export async function fetchHomework(
  params: HomeworkListParams = {}
): Promise<{ items: Homework[]; total: number }> {
  const res = await apiFetch<{ data: BackendHomework[]; meta: { total: number } }>(
    `/homework${qs({
      status: params.status,
      type: params.type,
      priority: params.priority,
      classUuid: params.classUuid,
      search: params.search,
      dueFrom: params.dueFrom,
      dueTo: params.dueTo,
      page: params.page,
      limit: params.limit ?? 100,
    })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const items = Array.isArray(res.data) ? res.data.filter(Boolean).map(mapBackendHomework) : [];
  return { items, total: res.meta?.total ?? items.length };
}

export async function fetchHomeworkDetail(uuid: string): Promise<Homework> {
  const res = await apiFetch<{ data: BackendHomework }>(`/homework/${uuid}`);
  return mapBackendHomework(res.data);
}

export interface HomeworkPayload {
  title: string;
  description?: string;
  campusUuid?: string;
  classUuid: string;
  section?: string;
  dueDate: string;
  homeworkType?: HomeworkType;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  maxMarks?: number;
  status?: HomeworkStatus;
}

/** Create homework. Pass `files` to upload attachments (multipart). */
export async function createHomeworkApi(
  payload: HomeworkPayload,
  files: File[] = [],
  campusId?: string | null
): Promise<Homework> {
  if (files.length === 0) {
    const res = await apiFetch<{ data: BackendHomework }>(
      `/homework`,
      { method: "POST", body: JSON.stringify(payload) },
      { campusId: campusId ?? undefined }
    );
    return mapBackendHomework(res.data);
  }
  const form = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
  }
  for (const f of files) form.append("attachments", f);
  const res = await apiFetch<{ data: BackendHomework }>(
    `/homework`,
    { method: "POST", body: form },
    { campusId: campusId ?? undefined }
  );
  return mapBackendHomework(res.data);
}

/** Update homework. Pass `files` to append attachments (or replace with `replaceAttachments`). */
export async function updateHomeworkApi(
  uuid: string,
  payload: Partial<HomeworkPayload> & { replaceAttachments?: boolean } = {},
  files: File[] = []
): Promise<Homework> {
  if (files.length === 0) {
    const res = await apiFetch<{ data: BackendHomework }>(`/homework/${uuid}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return mapBackendHomework(res.data);
  }
  const form = new FormData();
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
  }
  for (const f of files) form.append("attachments", f);
  const res = await apiFetch<{ data: BackendHomework }>(`/homework/${uuid}`, {
    method: "PATCH",
    body: form,
  });
  return mapBackendHomework(res.data);
}

/** Soft-delete (archives) homework. */
export async function deleteHomeworkApi(uuid: string): Promise<Homework> {
  const res = await apiFetch<{ data: BackendHomework }>(`/homework/${uuid}`, { method: "DELETE" });
  return mapBackendHomework(res.data);
}

// ── Submissions ──────────────────────────────────────────────────────────

export async function fetchSubmissionsApi(
  homeworkUuid: string,
  params: { status?: string; studentUuid?: string; page?: number; limit?: number } = {}
): Promise<{ items: BackendHomeworkSubmission[]; total: number }> {
  const res = await apiFetch<{ data: BackendHomeworkSubmission[]; meta: { total: number } }>(
    `/homework/${homeworkUuid}/submissions${qs(params)}`
  );
  return { items: res.data ?? [], total: res.meta?.total ?? (res.data ?? []).length };
}

export async function submitHomeworkApi(
  homeworkUuid: string,
  payload: { studentUuid?: string; remarks?: string } = {},
  file?: File | null
): Promise<BackendHomeworkSubmission> {
  if (!file) {
    const res = await apiFetch<{ data: BackendHomeworkSubmission }>(
      `/homework/${homeworkUuid}/submissions`,
      { method: "POST", body: JSON.stringify(payload) }
    );
    return res.data;
  }
  const form = new FormData();
  if (payload.studentUuid) form.append("studentUuid", payload.studentUuid);
  if (payload.remarks) form.append("remarks", payload.remarks);
  form.append("file", file);
  const res = await apiFetch<{ data: BackendHomeworkSubmission }>(
    `/homework/${homeworkUuid}/submissions`,
    { method: "POST", body: form }
  );
  return res.data;
}

export async function gradeSubmissionApi(
  submissionUuid: string,
  payload: { marksGiven?: number | null; grade?: string; feedback?: string; status?: string }
): Promise<BackendHomeworkSubmission> {
  const res = await apiFetch<{ data: BackendHomeworkSubmission }>(
    `/homework/submissions/${submissionUuid}/grade`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data;
}
