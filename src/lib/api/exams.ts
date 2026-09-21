"use client";
// Exams backend not yet fully migrated — proxy to existing mock with try/catch
// Once /api/exams/* ships, swap here without touching sections.
import { apiFetch } from "./client";

export async function fetchExams(params: { campusId?: string | null } = {}): Promise<any[]> {
  try {
    const res = await apiFetch<{ data: any[] }>(`/exams`, {}, { campusId: params.campusId ?? undefined });
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
  } catch {}
  return [];
}
