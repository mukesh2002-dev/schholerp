"use client";
import { apiFetch } from "./client";
import type { AttendanceCategory, AttendanceRecord, AttendanceStatus, LeaveRecord, LeaveStatus, LeaveType } from "@/types";

export interface BackendLeave {
  uuid: string;
  leaveType?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  reason?: string | null;
  status?: string | null;
  reviewedAt?: string | null;
  user?: { uuid: string; name?: string } | null;
  reviewedBy?: { uuid: string; name?: string } | null;
  campus?: { uuid: string; name?: string } | null;
  createdAt?: string;
  [key: string]: unknown;
}

const LEAVE_TYPE_MAP: Record<string, LeaveType> = {
  casual: "CASUAL",
  sick: "MEDICAL",
  annual: "EARNED",
  unpaid: "UNPAID",
};

const LEAVE_STATUS_MAP: Record<string, LeaveStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

export function mapBackendLeave(r: BackendLeave): LeaveRecord {
  const from = r.fromDate ? String(r.fromDate).slice(0, 10) : "";
  const to = r.toDate ? String(r.toDate).slice(0, 10) : "";
  const days =
    from && to
      ? Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1)
      : 1;
  return {
    id: r.uuid,
    staffId: r.user?.uuid ?? "",
    staffName: r.user?.name ?? "—",
    branchId: r.campus?.uuid ?? "",
    branchName: r.campus?.name ?? "Campus",
    leaveType: LEAVE_TYPE_MAP[String(r.leaveType ?? "").toLowerCase()] ?? "CASUAL",
    fromDate: from,
    toDate: to,
    totalDays: days,
    reason: r.reason ?? "",
    status: LEAVE_STATUS_MAP[String(r.status ?? "").toLowerCase()] ?? "PENDING",
    appliedDate: r.createdAt ?? "",
    approvedBy: r.reviewedBy?.name ?? undefined,
    createdAt: r.createdAt ?? "",
  };
}

export async function fetchLeaves(params: { campusId?: string | null; status?: string } = {}): Promise<BackendLeave[]> {
  const q = params.status ? `?status=${encodeURIComponent(params.status)}` : "";
  const res = await apiFetch<{ data: BackendLeave[] }>(`/leaves${q}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function updateLeaveStatusApi(uuid: string, status: "approved" | "rejected", reason?: string): Promise<BackendLeave> {
  const res = await apiFetch<{ data: BackendLeave }>(`/leaves/${uuid}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
  return res.data;
}

export interface BackendStudentAttendance {
  uuid: string;
  studentId: string;
  classId: string;
  date: string;
  status: string;
  remarks?: string | null;
  student?: { uuid: string; admissionNo?: string; rollNo?: string; firstName?: string; lastName?: string } | null;
  class?: { uuid: string; name: string; section?: string | null } | null;
  markedBy?: { uuid: string; name?: string } | null;
  campusId?: string;
}
export interface BackendStaffAttendance {
  uuid: string;
  userId: string;
  date: string;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  user?: {
    uuid: string;
    name?: string;
    email?: string;
    role?: { name?: string } | null;
    staffProfile?: { staffType?: string | null; department?: string | null; designation?: string | null } | null;
  } | null;
  markedBy?: { uuid: string; name?: string } | null;
  campusId?: string;
}

// Staff attendance rows carry the person's staffType (TEACHING / NON_TEACHING /
// SUPPORT...). The gateway tabs (Teachers / Staffs) filter on this — support
// and worker staff count as Staff.
// NOTE: "NON_TEACHING" contains "TEACH", so non-teaching must be checked first.
export function mapStaffCategory(r: BackendStaffAttendance): AttendanceCategory {
  const st = String(r.user?.staffProfile?.staffType ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  if (st.includes("TEACH") && st !== "NON_TEACHING" && st !== "NON_TEACHER" && st !== "NONTEACHING") return "TEACHER" as AttendanceCategory;
  if (!st) {
    const role = String(r.user?.role?.name ?? "").toLowerCase();
    if (role === "teacher") return "TEACHER" as AttendanceCategory;
  }
  return "STAFF" as AttendanceCategory;
}

const STATUS_MAP: Record<string, AttendanceStatus> = {
  present: "PRESENT",
  absent: "ABSENT",
  late: "LATE",
  excused: "LEAVE",
  half_day: "LEAVE",
};

function mapStatus(s?: string | null): AttendanceStatus {
  return STATUS_MAP[String(s ?? "").toLowerCase()] ?? "PRESENT";
}

function toDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  return String(d).slice(0, 10);
}

export function mapBackendStudentAttendance(r: BackendStudentAttendance, campusId?: string | null): AttendanceRecord {
  const name = `${r.student?.firstName ?? ""} ${r.student?.lastName ?? ""}`.trim() || (r.student?.uuid ?? r.studentId);
  const classLabel = [r.class?.name, r.class?.section].filter(Boolean).join(" • ");
  return {
    id: r.uuid,
    personId: r.student?.uuid ?? r.studentId,
    personName: name,
    category: "STUDENT" as AttendanceCategory,
    roleName: classLabel || undefined,
    date: toDate(r.date),
    status: mapStatus(r.status),
    branchId: r.campusId ?? campusId ?? "all",
    branchName: "Campus",
    classId: r.class?.uuid ?? r.classId,
    className: r.class?.name ?? undefined,
    sectionId: r.class?.section ?? undefined,
    sectionName: r.class?.section ?? undefined,
    markedBy: r.markedBy?.name ?? "Biometric",
    markedAt: r.date,
    note: r.remarks ?? undefined,
  };
}

export function mapBackendStaffAttendance(r: BackendStaffAttendance, campusId?: string | null): AttendanceRecord {
  const prof = r.user?.staffProfile;
  const roleRaw = String(r.user?.role?.name ?? "").trim();
  const roleLabel = roleRaw ? roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1) : "";
  const cat = mapStaffCategory(r);
  const catLabel = cat === "TEACHER" ? "Teacher" : "Staff";
  return {
    id: r.uuid,
    personId: r.user?.uuid ?? r.userId,
    personName: r.user?.name ?? r.userId,
    category: cat,
    roleName: prof?.designation || roleLabel || catLabel,
    department: prof?.department ?? undefined,
    date: toDate(r.date),
    status: mapStatus(r.status),
    checkIn: r.checkIn ? toDate(r.checkIn) : undefined,
    checkOut: r.checkOut ? toDate(r.checkOut) : undefined,
    branchId: r.campusId ?? campusId ?? "all",
    branchName: "Campus",
    markedBy: r.markedBy?.name ?? "Biometric",
    markedAt: r.date,
  };
}

export async function fetchStudentAttendance(params: { campusId?: string | null; classId?: string; date?: string } = {}): Promise<BackendStudentAttendance[]> {
  const q = new URLSearchParams();
  if (params.classId) q.set("classId", params.classId);
  if (params.date) q.set("date", params.date);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendStudentAttendance[] }>(`/attendance/students${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchStaffAttendance(params: { campusId?: string | null; date?: string } = {}): Promise<BackendStaffAttendance[]> {
  const q = params.date ? `?date=${encodeURIComponent(params.date)}` : "";
  const res = await apiFetch<{ data: BackendStaffAttendance[] }>(`/attendance/staff${q}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function markStudentAttendanceApi(payload: { campusId?: string | null; classId: string; date: string; records: { studentId: string; status: string; remarks?: string | null }[] }): Promise<{ count: number; date: string }> {
  const res = await apiFetch<{ data: { count: number; date: string } }>(`/attendance/students`, { method: "POST", body: JSON.stringify({ ...payload, records: payload.records.map((r) => ({ ...r, status: String(r.status).toLowerCase() })) }) }, { campusId: payload.campusId ?? undefined });
  return res.data;
}

// Bootstrap for first-time marking: builds the student roster server-side
// (campus/class), so "Mark All Present" works even when no attendance
// records exist yet for the date (list would be empty otherwise).
export async function markAllStudentAttendanceApi(payload: { campusId?: string | null; classId?: string; date: string; status?: string; remarks?: string | null }): Promise<{ count: number; date: string; status: string }> {
  const res = await apiFetch<{ data: { count: number; date: string; status: string } }>(`/attendance/students/mark-all`, { method: "POST", body: JSON.stringify(payload) }, { campusId: payload.campusId ?? undefined });
  return res.data;
}

export async function recordStaffAttendanceApi(payload: { campusId?: string | null; userId?: string; date?: string; status?: string; remarks?: string | null }): Promise<BackendStaffAttendance> {
  const res = await apiFetch<{ data: BackendStaffAttendance }>(`/attendance/staff`, { method: "POST", body: JSON.stringify(payload) }, { campusId: payload.campusId ?? undefined });
  return res.data;
}

// Manual single-person mark by Admin/HR/Principal (Attendance Gateway modal).
// Backend: POST /attendance/staff/single { campusId, userId, date, status, remarks }
export async function markSingleStaffAttendanceApi(payload: { campusId?: string | null; userId: string; date: string; status: string; remarks?: string | null }): Promise<BackendStaffAttendance> {
  const res = await apiFetch<{ data: BackendStaffAttendance }>(`/attendance/staff/single`, { method: "POST", body: JSON.stringify(payload) }, { campusId: payload.campusId ?? undefined });
  return res.data;
}

// Bulk mark (Admin/HR/Principal) — used by "Mark All Present" on staff tabs.
// Backend: POST /attendance/staff/bulk { campusId, date, records: [{ userId, status }] }
export async function bulkMarkStaffAttendanceApi(payload: { campusId?: string | null; date: string; records: { userId: string; status: string; remarks?: string | null }[] }): Promise<{ saved: number; errors: { userId: string; error: string }[] }> {
  const res = await apiFetch<{ data: { saved: number; errors: { userId: string; error: string }[] } }>(`/attendance/staff/bulk`, { method: "POST", body: JSON.stringify(payload) }, { campusId: payload.campusId ?? undefined });
  return res.data;
}

// Staff-directory category used by the gateway tabs and bulk marking,
// consistent with mapStaffCategory for attendance rows.
// NOTE: "NON_TEACHING" contains "TEACH", so non-teaching must be checked first.
export function staffDirectoryCategory(s: { staffType?: string | null; role?: string | null }): AttendanceCategory {
  const st = String(s?.staffType ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  if (st.includes("TEACH") && st !== "NON_TEACHING" && st !== "NON_TEACHER" && st !== "NONTEACHING") return "TEACHER" as AttendanceCategory;
  if (!st) {
    const role = String((s as any)?.role ?? "").toLowerCase();
    if (role === "teacher") return "TEACHER" as AttendanceCategory;
  }
  return "STAFF" as AttendanceCategory;
}
