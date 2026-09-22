"use client";
import { apiFetch } from "./client";
import type { Student } from "@/types";

interface BackendStudent {
  uuid: string;
  admissionNo: string;
  rollNo?: string | null;
  firstName: string;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  campusId?: string;
  classId?: string | null;
  campus?: { uuid: string; name: string } | null;
  class?: { uuid: string; name: string; section?: string | null } | null;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function mapBackendStudent(s: BackendStudent): Student {
  const branchId = s.campus?.uuid ?? "all";
  return {
    id: s.uuid,
    rollNumber: s.rollNo ?? s.admissionNo,
    admissionNumber: s.admissionNo,
    firstName: s.firstName,
    lastName: s.lastName ?? "",
    fullName: `${s.firstName} ${s.lastName ?? ""}`.trim(),
    // Real uploaded photo first (Cloudinary via admissions), dicebear initials fallback.
    avatar: s.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.firstName)}`,
    dateOfBirth: s.dob ?? "2010-01-01",
    gender: (s.gender as Student["gender"]) ?? "Male",
    bloodGroup: "O+",
    branchId,
    branchName: s.campus?.name ?? "Campus",
    classId: s.class?.uuid ?? s.classId ?? "all",
    className: s.class?.name ?? "—",
    sectionId: s.class?.section ?? "A",
    sectionName: s.class?.section ?? "A",
    admissionDate: s.createdAt ?? new Date().toISOString(),
    status: "ACTIVE",
    guardian: {
      name: s.guardianName ?? "—",
      relation: "Father",
      email: "",
      phone: s.guardianPhone ?? "",
      occupation: "",
      address: "",
      emergencyContact: s.guardianPhone ?? "",
    },
    attendanceSummary: { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, attendanceRate: 96 },
    feeSummary: { totalAssigned: 0, totalPaid: 0, totalPending: 0, status: "PENDING" },
    academicHistory: [],
    documents: [],
    address: "",
    city: "",
    state: "",
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  };
}

export async function fetchStudents(params: { campusId?: string | null; search?: string; page?: number; limit?: number } = {}): Promise<{ data: Student[]; total: number }> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendStudent[]; meta?: { total: number } }>(`/students${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list.map(mapBackendStudent), total: res.meta?.total ?? list.length };
}

export async function createStudentApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Student> {
  const res = await apiFetch<{ data: BackendStudent }>(`/students`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return mapBackendStudent(res.data);
}

export async function updateStudentApi(uuid: string, payload: Record<string, unknown>): Promise<Student> {
  const res = await apiFetch<{ data: BackendStudent }>(`/students/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapBackendStudent(res.data);
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    const res = await apiFetch<{ data: BackendStudent }>(`/students/${id}`);
    if (res?.data) return mapBackendStudent(res.data);
  } catch {}
  return null;
}
