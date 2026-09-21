"use client";

import { apiFetch } from "./client";
import type { Branch, BranchStatus, BranchType } from "@/types";

// Backend Campus row (after serializeBigInt) — fields align with Prisma model
// Keep `any` tolerant so new nullable fields don't break parsing.
export interface BackendCampus {
  uuid: string;
  id?: string | number;
  name: string;
  code: string | null;
  tagline?: string | null;
  type?: string | null;
  udiseCode?: string | null;
  affiliationNumber?: string | null;
  board?: string | null;
  principalName?: string | null;
  principalEmail?: string | null;
  principalPhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  establishedYear?: number | null;
  status?: string | null;
  capacity?: number | null;
  totalStudents?: number | null;
  totalTeachers?: number | null;
  totalStaff?: number | null;
  totalWorkers?: number | null;
  monthlyRevenue?: string | number | null;
  monthlyExpenses?: string | number | null;
  attendanceRate?: string | number | null;
  feeCollectionRate?: string | number | null;
  facilities?: string[] | null;
  departments?: { name: string; head: string; staffCount: number }[] | null;
  color?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

function toNumber(v: string | number | null | undefined, fallback: number): number {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : fallback;
}

/** Map backend Campus → frontend Branch (frontend is source-of-truth shape). */
export function mapCampusToBranch(c: BackendCampus): Branch {
  const code = (c.code ?? c.uuid.slice(0, 8).toUpperCase()).toString();
  return {
    id: c.uuid,
    name: c.name,
    code,
    tagline: c.tagline ?? `${c.name} — Excellence in Education`,
    type: (c.type as BranchType) ?? "Main Campus",
    udiseCode: c.udiseCode ?? undefined,
    affiliationNumber: c.affiliationNumber ?? undefined,
    board: c.board ?? "CBSE",
    principalName: c.principalName ?? "—",
    principalEmail: c.principalEmail ?? `principal@${code.toLowerCase()}.edu.in`,
    principalPhone: c.principalPhone ?? "+91 98220 00000",
    address: c.address ?? "Main School Road",
    city: c.city ?? "Pune",
    state: c.state ?? "Maharashtra",
    postalCode: c.postalCode ?? "411001",
    phone: c.phone ?? "+91 20 2545 0000",
    email: c.email ?? `info@${code.toLowerCase()}.edu.in`,
    website: c.website ?? `https://${code.toLowerCase()}.edu.in`,
    establishedYear: c.establishedYear ?? 2010,
    status: ((c.status ?? "ACTIVE") as BranchStatus),
    totalStudents: c.totalStudents ?? 0,
    capacity: c.capacity ?? 1000,
    totalTeachers: c.totalTeachers ?? 0,
    totalStaff: c.totalStaff ?? 0,
    totalWorkers: c.totalWorkers ?? 0,
    monthlyRevenue: toNumber(c.monthlyRevenue, 0),
    monthlyExpenses: toNumber(c.monthlyExpenses, 0),
    attendanceRate: toNumber(c.attendanceRate, 96),
    feeCollectionRate: toNumber(c.feeCollectionRate, 95),
    facilities: Array.isArray(c.facilities) && c.facilities.length > 0 ? c.facilities : ["Smart Classrooms", "Library", "Labs"],
    departments: Array.isArray(c.departments) && c.departments.length > 0 ? c.departments : [
      { name: "Academic Faculty", head: c.principalName ?? "Principal", staffCount: c.totalTeachers ?? 0 },
      { name: "Administration & Support", head: "Campus Ops", staffCount: c.totalStaff ?? 0 },
    ],
    color: c.color ?? "#3b82f6",
    createdAt: c.createdAt ?? new Date().toISOString(),
    updatedAt: c.updatedAt ?? new Date().toISOString(),
  };
}

/** Map frontend Branch → backend Campus payload (used for create/update). */
export function mapBranchToCampusPayload(b: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
  return {
    name: b.name,
    code: b.code,
    tagline: b.tagline,
    type: b.type,
    udiseCode: b.udiseCode ?? null,
    affiliationNumber: b.affiliationNumber ?? null,
    board: b.board,
    principalName: b.principalName,
    principalEmail: b.principalEmail,
    principalPhone: b.principalPhone,
    address: b.address,
    city: b.city,
    state: b.state,
    postalCode: b.postalCode,
    phone: b.phone,
    email: b.email,
    website: b.website,
    establishedYear: b.establishedYear,
    status: b.status,
    capacity: b.capacity,
    totalStudents: b.totalStudents,
    totalTeachers: b.totalTeachers,
    totalStaff: b.totalStaff,
    totalWorkers: b.totalWorkers,
    monthlyRevenue: b.monthlyRevenue,
    monthlyExpenses: b.monthlyExpenses,
    attendanceRate: b.attendanceRate,
    feeCollectionRate: b.feeCollectionRate,
    facilities: b.facilities,
    departments: b.departments,
    color: b.color,
  };
}

// ---- API wrappers (use apiFetch with auth + refresh) ----
export async function fetchBranches(): Promise<Branch[]> {
  const res = await apiFetch<{ data: BackendCampus[]; meta?: unknown }>("/campuses?limit=100", {}, { auth: true });
  const list = Array.isArray(res.data) ? res.data : [];
  return list.map(mapCampusToBranch);
}

export async function createBranchApi(b: Omit<Branch, "id" | "createdAt" | "updatedAt">): Promise<Branch> {
  const payload = mapBranchToCampusPayload(b);
  const res = await apiFetch<{ data: BackendCampus }>("/campuses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapCampusToBranch(res.data);
}

export async function updateBranchApi(uuid: string, b: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Branch> {
  const payload = mapBranchToCampusPayload(b);
  const res = await apiFetch<{ data: BackendCampus }>(`/campuses/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapCampusToBranch(res.data);
}

export async function deleteBranchApi(uuid: string): Promise<void> {
  // Backend restricts DELETE to super_admin — for admin users we soft-delete via status
  try {
    await apiFetch(`/campuses/${uuid}`, { method: "DELETE" });
    return;
  } catch (e: unknown) {
    const status = (e as { status?: number })?.status;
    if (status === 403 || status === 401) {
      await apiFetch<{ data: BackendCampus }>(`/campuses/${uuid}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "INACTIVE" }),
      });
      return;
    }
    throw e;
  }
}
