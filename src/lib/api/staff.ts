"use client";
import { apiFetch } from "./client";

export interface BackendStaff {
  uuid: string;
  employeeId: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  profilePhoto?: string | null;
  department: string;
  designation: string;
  staffType: string;
  employmentType?: string | null;
  workType?: string | null;
  employmentStatus?: string | null;
  status?: string | null;
  joiningDate: string;
  mobile?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  isActive?: boolean;
  campus?: { uuid: string; name: string } | null;
  user?: { uuid: string; name: string; email: string } | null;
  qualifications?: any[];
  experiences?: any[];
  documents?: any[];
  performances?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface StaffDashboard {
  cards: {
    totalStaff: number;
    teachingStaff: number;
    nonTeachingStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    todaysAttendance: number;
    staffOnLeave: number;
    newJoining: number;
  };
  charts: {
    staffByDepartment: { department: string; count: number }[];
    teachingVsNonTeaching: { teaching: number; nonTeaching: number };
    monthlyAttendance: { present: number; absent: number; late: number; half_day: number; leave: number; total: number };
    leaveStatistics: { casual: number; sick: number; earned: number };
    documentExpiry: { expiring: number; expired: number };
  };
  recentJoining: BackendStaff[];
}

export async function fetchStaffDashboard(campusId?: string | null): Promise<StaffDashboard> {
  const res = await apiFetch<{ data: StaffDashboard }>(`/staff/dashboard`, {}, { campusId: campusId ?? undefined });
  return (res as any).data ?? (res as any);
}

export async function fetchStaffList(params: {
  campusId?: string | null;
  search?: string;
  department?: string;
  designation?: string;
  staffType?: string;
  employmentType?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}): Promise<{ data: BackendStaff[]; total: number; meta?: any }> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.department) q.set("department", params.department);
  if (params.designation) q.set("designation", params.designation);
  if (params.staffType) q.set("staffType", params.staffType);
  if (params.employmentType) q.set("employmentType", params.employmentType);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.sortOrder) q.set("sortOrder", params.sortOrder);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendStaff[]; meta?: { total: number } }>(`/staff${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray((res as any).data) ? (res as any).data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length, meta: (res as any).meta };
}

export async function fetchStaffById(uuid: string): Promise<BackendStaff> {
  const res = await apiFetch<{ data: BackendStaff }>(`/staff/${uuid}`);
  return (res as any).data;
}

export async function createStaffApi(payload: Record<string, unknown>, campusId?: string | null): Promise<BackendStaff> {
  const res = await apiFetch<{ data: BackendStaff }>(`/staff`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return (res as any).data;
}

export async function updateStaffApi(uuid: string, payload: Record<string, unknown>): Promise<BackendStaff> {
  const res = await apiFetch<{ data: BackendStaff }>(`/staff/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function deleteStaffApi(uuid: string): Promise<void> {
  await apiFetch(`/staff/${uuid}`, { method: "DELETE" });
}

export async function fetchStaffAttendance(uuid: string, params?: { month?: number; year?: number; date?: string }) {
  const q = new URLSearchParams();
  if (params?.month) q.set("month", String(params.month));
  if (params?.year) q.set("year", String(params.year));
  if (params?.date) q.set("date", params.date);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: any[] }>(`/staff/${uuid}/attendance${qs}`);
  return (res as any).data ?? [];
}

export async function markStaffAttendance(uuid: string, payload: Record<string, unknown>) {
  const res = await apiFetch<{ data: any }>(`/staff/${uuid}/attendance`, { method: "POST", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function bulkMarkAttendance(payload: Record<string, unknown>) {
  const res = await apiFetch<{ data: any }>(`/staff/attendance/bulk`, { method: "POST", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function fetchStaffDocuments(uuid: string) {
  const res = await apiFetch<{ data: any[] }>(`/staff/${uuid}/documents`);
  return (res as any).data ?? [];
}

export async function uploadStaffFile(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiFetch<{ data: { url: string } }>(`/staff/upload`, { method: "POST", body: form as any });
  return (res as any).data;
}

export async function createStaffDocument(uuid: string, payload: Record<string, unknown>) {
  const res = await apiFetch<{ data: any }>(`/staff/${uuid}/documents`, { method: "POST", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function deleteStaffDocument(docUuid: string) {
  await apiFetch(`/staff/documents/${docUuid}`, { method: "DELETE" });
}

export async function fetchStaffPerformance(uuid: string) {
  const res = await apiFetch<{ data: any[] }>(`/staff/${uuid}/performance`);
  return (res as any).data ?? [];
}

export async function createStaffPerformance(uuid: string, payload: Record<string, unknown>) {
  const res = await apiFetch<{ data: any }>(`/staff/${uuid}/performance`, { method: "POST", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function fetchStaffAssignments(uuid: string) {
  const res = await apiFetch<{ data: any }>(`/staff/${uuid}/assignments`);
  return (res as any).data;
}

export async function createStaffAssignment(uuid: string, payload: Record<string, unknown>) {
  const res = await apiFetch<{ data: any }>(`/staff/${uuid}/assignments`, { method: "POST", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function fetchStaffPayroll(uuid: string) {
  const res = await apiFetch<{ data: any[] }>(`/staff/${uuid}/payroll`);
  return (res as any).data ?? [];
}

export async function generatePayroll(payload: Record<string, unknown>) {
  const res = await apiFetch<{ data: any }>(`/payroll/generate`, { method: "POST", body: JSON.stringify(payload) });
  return (res as any).data;
}

export async function fetchDocumentExpiryReport(campusId?: string | null) {
  const res = await apiFetch<{ data: { expiring: any[]; expired: any[] } }>(`/staff/reports/expiry`, {}, { campusId: campusId ?? undefined });
  return (res as any).data;
}

export async function bulkImportStaffApi(rows: any[], campusId?: string | null) {
  const res = await apiFetch<{
    success: boolean;
    total: number;
    imported: number;
    failed: number;
    errors: { row: number; name: string; error: string }[];
  }>('/staff/bulk-import', { method: 'POST', body: JSON.stringify({ rows, campusId }) }, { campusId: campusId ?? undefined });
  return (res as any);
}
