"use client";
import { apiFetch } from "./client";
import type { BackendUser } from "./hr";
import type { Teacher } from "@/types";

export interface BackendTeacher extends BackendUser {}

export function mapBackendTeacher(u: BackendTeacher): Teacher {
  const branchId = u.campus?.uuid ?? "all";
  const nameParts = (u.name ?? u.email ?? "").split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || u.email?.split("@")[0] || "Teacher";
  const lastName = nameParts.slice(1).join(" ") || "";
  const today = new Date().toISOString().split("T")[0];
  const short = (u.uuid || "").replace(/-/g, "").slice(0, 4).toUpperCase() || "0000";
  return {
    id: u.uuid,
    employeeId: `TCH-${short}`,
    firstName,
    lastName,
    fullName: u.name || `${firstName} ${lastName}`.trim(),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || firstName)}`,
    email: u.email,
    phone: "",
    gender: "Other",
    dateOfBirth: "",
    qualification: "—",
    joiningDate: today,
    branchId,
    branchName: u.campus?.name ?? "Campus",
    department: "—",
    designation: "Teacher",
    status: u.isActive === false ? "RESIGNED" : "ACTIVE",
    subjectsTaught: [],
    assignedClasses: [],
    attendanceRate: 0,
    leaveSummary: { totalAllowed: 0, used: 0, balance: 0, casualLeaves: 0, medicalLeaves: 0 },
    salarySummary: { baseSalary: 0, allowances: 0, grossSalary: 0, paymentStatus: "PENDING", lastDisbursedDate: "" },
    experienceYears: 0,
    createdAt: today,
    updatedAt: today,
  };
}

export async function fetchTeachers(
  params: { campusId?: string | null; search?: string; page?: number; limit?: number } = {}
): Promise<{ data: Teacher[]; total: number }> {
  const q = new URLSearchParams();
  q.set("role", "teacher");
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendTeacher[]; meta?: { total: number } }>(`/users${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list.map(mapBackendTeacher), total: res.meta?.total ?? list.length };
}

export async function fetchTeacherById(id: string): Promise<Teacher | null> {
  try {
    const res = await apiFetch<{ data: BackendTeacher }>(`/users/${id}`);
    if (res?.data) return mapBackendTeacher(res.data);
  } catch {}
  return null;
}

export async function createTeacherApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Teacher> {
  const res = await apiFetch<{ data: BackendTeacher }>(
    `/users`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return mapBackendTeacher(res.data);
}