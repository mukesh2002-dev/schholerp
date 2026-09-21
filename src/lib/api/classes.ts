"use client";
import { apiFetch } from "./client";
import type { ClassRoom, Subject, SubjectTopic, Section } from "@/types";

export interface BackendSubject {
  id: string;
  uuid: string;
  name: string;
  code: string | null;
  classId: string | null;
  class?: { id: string; uuid: string; name: string; section: string | null } | null;
  campusId?: string;
  campus?: { uuid: string; name: string } | null;
  teacherId?: string | null;
  teacher?: { uuid: string; name: string } | null;
  weeklyPeriods?: number | null;
  credits?: number | null;
  description?: string | null;
  topics?: unknown[] | null;
  isActive?: boolean;
  _count?: { examSchedules?: number; markEntries?: number; homeworks?: number; timetableSlots?: number };
}

export interface BackendClass {
  uuid: string;
  name: string;
  section?: string | null;
  campusId?: string;
  campus?: { uuid: string; name: string; code?: string | null } | null;
  academicYear?: { name: string } | null;
  academicYearId?: string | null;
  gradeLevel?: number | null;
  category?: string | null;
  capacity?: number | null;
  description?: string | null;
  program?: string | null;
  department?: string | null;
  semester?: number | null;
  university?: string | null;
  isActive?: boolean;
  subjects?: BackendSubject[];
  students?: unknown[];
  _count?: { students?: number; subjects?: number; enrollments?: number };
}

export type MappedSubject = Subject & {
  classId: string;
  className: string;
  branchId: string;
  branchName: string;
  uuid: string;
  class: { uuid: string; name: string };
  teacher: { uuid: string; name: string };
};

export function mapBackendSubject(
  s: BackendSubject,
  classCtx?: { classId: string; className: string; branchId: string; branchName: string }
): MappedSubject {
  const classId = classCtx?.classId ?? s.class?.uuid ?? s.classId ?? "";
  const teacherId = s.teacher?.uuid ?? s.teacherId ?? "";
  const teacherName = s.teacher?.name ?? "Unassigned";
  return {
    id: s.uuid,
    uuid: s.uuid,
    name: s.name,
    code: s.code ?? "",
    teacherId,
    teacherName,
    weeklyPeriods: s.weeklyPeriods ?? 4,
    credits: s.credits ?? undefined,
    topics: (Array.isArray(s.topics) ? s.topics : []) as SubjectTopic[],
    description: s.description ?? undefined,
    classId,
    className: classCtx?.className ?? s.class?.name ?? "Unknown Class",
    branchId: classCtx?.branchId ?? s.campus?.uuid ?? "all",
    branchName: classCtx?.branchName ?? s.campus?.name ?? "Campus",
    // Back-compat aliases for consumers that read the raw backend shape
    // (e.g. timetable grid): class.{uuid,name} and teacher.{uuid,name}.
    class: { uuid: classId, name: classCtx?.className ?? s.class?.name ?? "Unknown Class" },
    teacher: { uuid: teacherId, name: teacherName },
  };
}

export function mapBackendClass(c: BackendClass): ClassRoom {
  const subjects = Array.isArray(c.subjects)
    ? c.subjects.map((s) =>
        mapBackendSubject(s, {
          classId: c.uuid,
          className: c.name,
          branchId: c.campus?.uuid ?? "all",
          branchName: c.campus?.name ?? "Campus",
        })
      )
    : [];
  const sectionName = c.section ? `Section ${c.section}` : "Section A";
  const section: Section = {
    id: `${c.uuid}-sec`,
    name: sectionName,
    roomNumber: "—",
    classTeacherId: "",
    classTeacherName: "—",
    studentCount: c._count?.students ?? 0,
    capacity: c.capacity ?? 40,
  };
  return {
    id: c.uuid,
    name: c.name,
    gradeLevel: c.gradeLevel ?? 10,
    category: (c.category as ClassRoom["category"]) ?? "High School",
    branchId: c.campus?.uuid ?? "all",
    branchName: c.campus?.name ?? "Campus",
    sections: [section],
    subjects,
    totalStudents: c._count?.students ?? 0,
    capacity: c.capacity ?? 40,
    description: c.description ?? undefined,
    program: c.program ?? undefined,
    department: c.department ?? undefined,
    semester: c.semester ?? undefined,
    university: c.university ?? undefined,
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

// ── Classes ────────────────────────────────────────────────────────────
export async function fetchClasses(
  params: {
    campusId?: string | null;
    search?: string;
    category?: string;
    academicYearId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}
): Promise<ClassRoom[]> {
  const res = await apiFetch<{ data: BackendClass[]; meta?: { total: number } }>(
    `/academics/classes${qs({
      search: params.search,
      category: params.category,
      academicYearId: params.academicYearId,
      isActive: params.isActive,
      page: params.page,
      limit: params.limit,
    })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return Array.isArray(res.data) ? res.data.map(mapBackendClass) : [];
}

export async function fetchClassByUuid(uuid: string): Promise<ClassRoom> {
  const res = await apiFetch<{ data: BackendClass }>(`/academics/classes/${uuid}`);
  return mapBackendClass(res.data);
}

export async function createClassApi(
  payload: Record<string, unknown>,
  campusId?: string | null
): Promise<ClassRoom> {
  const res = await apiFetch<{ data: BackendClass }>(
    `/academics/classes`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return mapBackendClass(res.data);
}

export async function updateClassApi(uuid: string, payload: Record<string, unknown>): Promise<ClassRoom> {
  const res = await apiFetch<{ data: BackendClass }>(`/academics/classes/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapBackendClass(res.data);
}

export async function deleteClassApi(uuid: string): Promise<void> {
  await apiFetch(`/academics/classes/${uuid}`, { method: "DELETE" });
}

// ── Subjects ───────────────────────────────────────────────────────────
export async function fetchSubjects(
  params: {
    campusId?: string | null;
    classId?: string | null;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}
): Promise<MappedSubject[]> {
  const res = await apiFetch<{ data: BackendSubject[]; meta?: { total: number } }>(
    `/academics/subjects${qs({
      classId: params.classId,
      search: params.search,
      isActive: params.isActive,
      page: params.page,
      limit: params.limit,
    })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return Array.isArray(res.data) ? res.data.map((s) => mapBackendSubject(s)) : [];
}

export async function fetchSubjectByUuid(uuid: string): Promise<BackendSubject> {
  const res = await apiFetch<{ data: BackendSubject }>(`/academics/subjects/${uuid}`);
  return res.data;
}

export async function createSubjectApi(
  payload: Record<string, unknown>,
  campusId?: string | null
): Promise<BackendSubject> {
  const res = await apiFetch<{ data: BackendSubject }>(
    `/academics/subjects`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function updateSubjectApi(uuid: string, payload: Record<string, unknown>): Promise<BackendSubject> {
  const res = await apiFetch<{ data: BackendSubject }>(`/academics/subjects/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteSubjectApi(uuid: string): Promise<void> {
  await apiFetch(`/academics/subjects/${uuid}`, { method: "DELETE" });
}