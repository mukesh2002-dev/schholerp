"use client";
import { apiFetch } from "./client";

// ── Backend shapes (match src/modules/exams/exams.service.js serializers) ──

export interface BackendExamType {
  uuid: string;
  name: string;
  category: string;
  description: string | null;
  maxMarks: number;
  passingMarks: number;
  weightage: number;
  defaultMode: string | null;
  isActive: boolean;
}

export interface BackendExam {
  uuid: string;
  name: string;
  category: string;
  examMode: string;
  academicYear: string;
  section: string | null;
  startDate: string;
  endDate: string;
  status: string;
  instructions: string | null;
  noticePublishedAt: string | null;
  examType: { uuid: string; name: string } | null;
  class: { uuid: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  schedules?: BackendExamSchedule[];
}

export interface BackendExamSchedule {
  uuid: string;
  examName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  instructions: string | null;
  totalMarks: number;
  passingMarks: number;
  status: string;
  publicationStatus: string | null;
  academicYear: string | null;
  examType: { uuid: string; name: string } | null;
  class: { uuid: string; name: string } | null;
  subject: { uuid: string; name: string } | null;
  exam: { uuid: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackendGradeScale {
  uuid: string;
  grade: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
  description: string | null;
  createdAt: string;
}

export interface ExamMatrixRow {
  studentUuid: string;
  studentName: string;
  admissionNo: string;
  rollNo: string | null;
  section: string | null;
  obtained: number;
  total: number;
  percentage: number;
  grade: string | null;
  gradePoint: number | null;
  rank: number | null;
  status: string;
  papers: {
    scheduleUuid: string;
    subject: string | null;
    obtained: number | null;
    total: number;
    status: string;
    entryUuid?: string;
  }[];
}

export interface ExamMatrix {
  exam: BackendExam;
  schedules: BackendExamSchedule[];
  total: number;
  rows: ExamMatrixRow[];
}

export interface ExamAnalytics {
  exam: BackendExam;
  summary: { enrolled: number; appeared: number; absent: number; passRate: number; averagePercentage: number };
  gradeDistribution: { grade: string; count: number; percent: number }[];
  histogram: { label: string; min: number; max: number; count: number }[];
  subjects: { scheduleUuid: string; subject: string | null; papers: number; average: number; highest: number; lowest: number; passRate: number; totalMarks: number }[];
  toppers: { studentUuid: string; studentName: string; rollNo: string | null; percentage: number; grade: string | null; rank: number | null }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function qs(params: Record<string, string | number | boolean | null | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export interface ExamListParams {
  campusId?: string | null;
  status?: string;
  academicYear?: string;
  classUuid?: string;
  page?: number;
  limit?: number;
}

// ── Exam Types ─────────────────────────────────────────────────────────────

export async function fetchExamTypes(params: { campusId?: string | null; limit?: number } = {}): Promise<BackendExamType[]> {
  const res = await apiFetch<{ data: BackendExamType[] }>(
    `/exams/types${qs({ limit: params.limit ?? 100 })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return res.data ?? [];
}

export async function createExamTypeApi(payload: Record<string, unknown>, campusId?: string | null): Promise<BackendExamType> {
  const res = await apiFetch<{ data: BackendExamType }>(
    `/exams/types`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function updateExamTypeApi(uuid: string, payload: Record<string, unknown>): Promise<BackendExamType> {
  const res = await apiFetch<{ data: BackendExamType }>(`/exams/types/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

// ── Exams ──────────────────────────────────────────────────────────────────

export async function fetchExams(params: ExamListParams = {}): Promise<{ items: BackendExam[]; total: number }> {
  const res = await apiFetch<{ data: BackendExam[]; meta: { total: number } }>(
    `/exams${qs({
      status: params.status,
      academicYear: params.academicYear,
      classUuid: params.classUuid,
      page: params.page,
      limit: params.limit ?? 100,
    })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return { items: res.data ?? [], total: res.meta?.total ?? (res.data ?? []).length };
}

export async function fetchExamById(uuid: string): Promise<BackendExam> {
  const res = await apiFetch<{ data: BackendExam }>(`/exams/${uuid}`);
  return res.data;
}

export interface CreateExamPayload {
  name: string;
  examTypeUuid: string;
  category: string;
  examMode: string;
  academicYear: string;
  classUuid: string;
  campusUuid?: string;
  startDate: string;
  endDate: string;
  status?: string;
  instructions?: string;
}

export async function createExamApi(payload: CreateExamPayload, campusId?: string | null): Promise<BackendExam> {
  const res = await apiFetch<{ data: BackendExam }>(
    `/exams`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function updateExamApi(uuid: string, payload: Partial<CreateExamPayload>): Promise<BackendExam> {
  const res = await apiFetch<{ data: BackendExam }>(`/exams/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

// ── Schedules (datesheet) ──────────────────────────────────────────────────

export interface CreateSchedulePayload {
  examUuid?: string;
  examName: string;
  examTypeUuid: string;
  classUuid: string;
  subjectUuid: string;
  campusUuid?: string;
  academicYear?: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  instructions?: string;
  totalMarks: number;
  passingMarks: number;
  status?: string;
}

export async function fetchExamSchedules(params: { campusId?: string | null; examUuid?: string; status?: string; limit?: number } = {}): Promise<BackendExamSchedule[]> {
  const res = await apiFetch<{ data: BackendExamSchedule[] }>(
    `/exams/schedules${qs({ examUuid: params.examUuid, status: params.status, limit: params.limit ?? 200 })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return res.data ?? [];
}

export async function createExamScheduleApi(payload: CreateSchedulePayload, campusId?: string | null): Promise<BackendExamSchedule> {
  const res = await apiFetch<{ data: BackendExamSchedule }>(
    `/exams/schedules`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function updateExamScheduleApi(uuid: string, payload: Partial<CreateSchedulePayload>): Promise<BackendExamSchedule> {
  const res = await apiFetch<{ data: BackendExamSchedule }>(`/exams/schedules/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

// ── Enrollment / matrix / marks / analytics ────────────────────────────────

export async function enrollClassStudentsApi(examUuid: string): Promise<{ enrolled: number; totalStudents: number }> {
  const res = await apiFetch<{ data: { enrolled: number; totalStudents: number } }>(`/exams/${examUuid}/enroll`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res.data;
}

export async function fetchExamStudentsMatrix(
  examUuid: string,
  params: { section?: string; search?: string; status?: string } = {}
): Promise<ExamMatrix> {
  const res = await apiFetch<{ data: ExamMatrix }>(
    `/exams/${examUuid}/students${qs({ section: params.section, search: params.search, status: params.status })}`
  );
  return res.data;
}

export interface BulkMarksEntry {
  studentUuid: string;
  marksObtained?: number;
  isAbsent?: boolean;
  remarks?: string;
}

export async function saveBulkMarks(scheduleUuid: string, entries: BulkMarksEntry[]): Promise<{ saved: number; recomputed: number }> {
  const res = await apiFetch<{ data: { saved: number; recomputed: number } }>(
    `/exams/schedules/${scheduleUuid}/marks/bulk`,
    { method: "PUT", body: JSON.stringify({ entries }) }
  );
  return res.data;
}

export async function recomputeExamApi(examUuid: string): Promise<{ recomputed: number }> {
  const res = await apiFetch<{ data: { recomputed: number } }>(`/exams/${examUuid}/recompute`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res.data;
}

export async function publishExamApi(examUuid: string): Promise<{ published: number; publishedAt: string }> {
  const res = await apiFetch<{ data: { published: number; publishedAt: string } }>(`/exams/${examUuid}/publish`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return res.data;
}

// ── Results ────────────────────────────────────────────────────────────────

export interface BackendResult {
  uuid: string;
  academicYear: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  grade: string | null;
  gradePoint: number | null;
  rank: number | null;
  status: string;
  remarks: string | null;
  subjectWise: { scheduleUuid: string; subject: string | null; obtained: number; total: number; status: string }[] | null;
  publishedAt: string | null;
  student: { uuid: string; firstName: string; lastName: string } | null;
  exam: { uuid: string; name: string } | null;
  examType: { uuid: string; name: string } | null;
  class: { uuid: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchResultsApi(params: {
  examUuid?: string;
  published?: boolean;
  status?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ items: BackendResult[]; total: number }> {
  const res = await apiFetch<{ data: BackendResult[]; meta: { total: number } }>(
    `/exams/results${qs({
      examUuid: params.examUuid,
      published: params.published,
      status: params.status,
      academicYear: params.academicYear,
      page: params.page,
      limit: params.limit ?? 200,
    })}`
  );
  return { items: res.data ?? [], total: res.meta?.total ?? (res.data ?? []).length };
}

export async function fetchExamAnalytics(examUuid: string): Promise<ExamAnalytics> {
  const res = await apiFetch<{ data: ExamAnalytics }>(`/exams/${examUuid}/analytics`);
  return res.data;
}

// ── Grade scales ───────────────────────────────────────────────────────────

export async function fetchGradeScales(campusId?: string | null): Promise<BackendGradeScale[]> {
  const res = await apiFetch<{ data: BackendGradeScale[] }>(
    `/exams/grade-scales${qs({ campusId: campusId ?? undefined })}`
  );
  return res.data ?? [];
}

export interface GradeScalePayload {
  grade: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
  description?: string;
}

export async function upsertGradeScaleApi(payload: GradeScalePayload): Promise<BackendGradeScale> {
  const res = await apiFetch<{ data: BackendGradeScale }>(`/exams/grade-scales`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteGradeScaleApi(uuid: string): Promise<{ deleted: boolean }> {
  const res = await apiFetch<{ data: { deleted: boolean } }>(`/exams/grade-scales/${uuid}`, { method: "DELETE" });
  return res.data;
}

export async function seedDefaultGradeScales(campusId?: string | null): Promise<BackendGradeScale[]> {
  const res = await apiFetch<{ data: BackendGradeScale[] }>(
    `/exams/grade-scales/seed-default${qs({ campusId: campusId ?? undefined })}`,
    { method: "POST", body: JSON.stringify({}) }
  );
  return res.data;
}