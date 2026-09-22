"use client";
import { apiFetch } from "./client";
import type { SchoolEvent } from "@/types";

export async function fetchEvents(params: { campusId?: string | null; status?: string; type?: string } = {}): Promise<SchoolEvent[]> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.type) q.set("type", params.type);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: SchoolEvent[] }>(`/events${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createEventApi(payload: Record<string, unknown>, campusId?: string | null): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchEventByUuid(uuid: string): Promise<SchoolEvent | null> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}`);
  return res?.data ?? null;
}

export async function updateEventApi(uuid: string, payload: Record<string, unknown>): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function submitEventApi(uuid: string): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}/submit`, { method: "PATCH" });
  return res.data;
}

export async function approveEventApi(uuid: string): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}/approve`, { method: "PATCH" });
  return res.data;
}

export async function rejectEventApi(uuid: string, reason: string): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
  return res.data;
}

export async function completeEventApi(uuid: string): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}/complete`, { method: "PATCH" });
  return res.data;
}

export async function cancelEventApi(uuid: string): Promise<SchoolEvent> {
  const res = await apiFetch<{ data: SchoolEvent }>(`/events/${uuid}`, { method: "DELETE" });
  return res.data;
}