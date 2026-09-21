"use client";
import { apiFetch } from "./client";

export interface PeriodDTO {
  id: string;
  uuid: string;
  number: number;
  label: string;
  startTime: string;
  endTime: string;
  type: string;
  isBreak: boolean;
  campusId: string;
}

export interface TimetableSlotDTO {
  id: string;
  uuid: string;
  day: string;
  periodNumber: number;
  subjectId: string;
  subjectName: string | null;
  subjectCode: string | null;
  teacherId: string;
  teacherName: string | null;
  classId: string;
  className: string | null;
  section: string | null;
  sectionId: string | null;
  sectionName: string | null;
  roomNumber: string;
  campusId: string;
  branchId: string;
  branchName: string | null;
  academicYear: string;
}

export async function fetchPeriods(params: { campusId?: string | null } = {}): Promise<PeriodDTO[]> {
  const res = await apiFetch<{ data: PeriodDTO[] }>(`/timetable/periods`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createPeriodApi(payload: Record<string, unknown>, campusId?: string | null): Promise<PeriodDTO> {
  const res = await apiFetch<{ data: PeriodDTO }>(`/timetable/periods`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function updatePeriodApi(uuid: string, payload: Record<string, unknown>): Promise<PeriodDTO> {
  const res = await apiFetch<{ data: PeriodDTO }>(`/timetable/periods/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function deletePeriodApi(uuid: string): Promise<void> {
  await apiFetch(`/timetable/periods/${uuid}`, { method: "DELETE" });
}

export async function fetchSlots(params: { campusId?: string | null; classId?: string | null; section?: string | null; day?: string | null } = {}): Promise<TimetableSlotDTO[]> {
  const q = new URLSearchParams();
  if (params.classId) q.set("classId", params.classId);
  if (params.section) q.set("section", params.section);
  if (params.day) q.set("day", params.day);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: TimetableSlotDTO[] }>(`/timetable/slots${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchTimetableGrid(params: { campusId?: string | null; classId: string; section?: string | null }): Promise<{ periods: PeriodDTO[]; slots: TimetableSlotDTO[] }> {
  const q = new URLSearchParams();
  q.set("classId", params.classId);
  if (params.section) q.set("section", params.section);
  const qs = q.toString();
  const res = await apiFetch<{ data: { periods: PeriodDTO[]; slots: TimetableSlotDTO[] } }>(`/timetable/grid?${qs}`, {}, { campusId: params.campusId ?? undefined });
  return res.data ?? { periods: [], slots: [] };
}

export async function createSlotApi(payload: Record<string, unknown>, campusId?: string | null): Promise<TimetableSlotDTO> {
  const res = await apiFetch<{ data: TimetableSlotDTO }>(`/timetable/slots`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function updateSlotApi(uuid: string, payload: Record<string, unknown>): Promise<TimetableSlotDTO> {
  const res = await apiFetch<{ data: TimetableSlotDTO }>(`/timetable/slots/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function deleteSlotApi(uuid: string): Promise<void> {
  await apiFetch(`/timetable/slots/${uuid}`, { method: "DELETE" });
}

export async function bulkSlotsApi(payload: { classId: string; section?: string | null; slots: Array<{ day: string; periodNumber: number; subjectId: string; teacherId: string; roomNumber?: string }> }, campusId?: string | null): Promise<TimetableSlotDTO[]> {
  const res = await apiFetch<{ data: TimetableSlotDTO[] }>(`/timetable/slots/bulk`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}
