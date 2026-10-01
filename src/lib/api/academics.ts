"use client";
import { apiFetch } from "./client";

export interface BackendAcademicYear {
  uuid: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export async function fetchAcademicYears(params: { campusId?: string | null } = {}): Promise<BackendAcademicYear[]> {
  const res = await apiFetch<{ data: BackendAcademicYear[] }>(`/academics/academic-years`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return list;
}
