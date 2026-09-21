"use client";
import { apiFetch } from "./client";
import type { AdmissionApplication, AdmissionDocumentItem } from "@/types";

/** Raw backend admission record (admissions.service.js serializeApplication). */
export interface BackendAdmission {
  uuid: string;
  applicationNumber: string;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  gradeApplied?: string | null;
  academicYear?: string | null;
  campusId?: string | null;
  campus?: { uuid: string; name: string } | null;
  parentName?: string | null;
  parentRelationship?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  previousSchool?: string | null;
  previousGrade?: string | null;
  category?: string | null;
  rteQuota?: boolean;
  status?: string;
  entranceTestScore?: number | null;
  interviewDate?: string | null;
  notes?: string | null;
  avatar?: string | null;
  documents?: AdmissionDocumentItem[];
  enrolledStudentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

function cap(s?: string | null): string {
  const v = String(s ?? "").trim();
  return v ? `${v[0].toUpperCase()}${v.slice(1)}` : "Other";
}

export function mapBackendAdmission(a: BackendAdmission): AdmissionApplication {
  const firstName = a.firstName ?? "";
  const lastName = a.lastName ?? "";
  return {
    id: a.uuid,
    applicationNumber: a.applicationNumber ?? "",
    applicantFirstName: firstName,
    applicantLastName: lastName,
    applicantFullName: `${firstName} ${lastName}`.trim() || "—",
    avatar: a.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firstName || "A")}`,
    dateOfBirth: a.dob ?? "",
    gender: (cap(a.gender) === "Other" ? "Other" : cap(a.gender)) as "Male" | "Female" | "Other",
    gradeApplied: a.gradeApplied ?? "",
    branchId: a.campus?.uuid ?? a.campusId ?? "all",
    branchName: a.campus?.name ?? "Campus",
    academicYear: a.academicYear ?? "",
    submissionDate: a.createdAt ?? "",
    status: (a.status ?? "NEW") as AdmissionApplication["status"],
    parentName: a.parentName ?? "",
    parentRelationship: a.parentRelationship ?? "",
    parentEmail: a.parentEmail ?? "",
    parentPhone: a.parentPhone ?? "",
    address: a.address ?? "",
    city: a.city ?? "",
    state: a.state ?? "",
    postalCode: a.postalCode ?? "",
    previousSchool: a.previousSchool ?? undefined,
    previousGrade: a.previousGrade ?? undefined,
    previousGpa: undefined,
    aadhaarNumber: undefined,
    apaarId: undefined,
    category: a.category ?? undefined,
    religion: undefined,
    motherTongue: undefined,
    board: undefined,
    rteQuota: a.rteQuota ?? undefined,
    entranceTestScore: a.entranceTestScore ?? undefined,
    interviewDate: a.interviewDate ?? undefined,
    interviewFeedback: undefined,
    documents: Array.isArray(a.documents)
      ? (a.documents as unknown[]).map((raw: any) => ({
          id: raw.uuid ?? raw.id,
          name: raw.name ?? "",
          required: Boolean(raw.required),
          submitted: Boolean(raw.submitted),
          verified: Boolean(raw.verified),
          fileUrl: raw.fileUrl ?? undefined,
        }))
      : [],
    notes: a.notes ?? undefined,
    enrolledStudentId: a.enrolledStudentId ?? undefined,
    createdAt: a.createdAt ?? "",
    updatedAt: a.updatedAt ?? "",
  };
}

export async function fetchAdmissions(params: { campusId?: string | null; search?: string; status?: string; page?: number; limit?: number } = {}): Promise<AdmissionApplication[]> {
  // Do NOT swallow errors — let ApiError surface so useCampusData shows the
  // proper offline / permission banner instead of a silent empty list.
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendAdmission[] }>(`/admissions${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data.map(mapBackendAdmission) : [];
}

export async function fetchAdmissionById(id: string): Promise<AdmissionApplication | null> {
  try {
    const res = await apiFetch<{ data: BackendAdmission }>(`/admissions/${id}`);
    if (res?.data) return mapBackendAdmission(res.data);
  } catch {}
  return null;
}

export async function createAdmissionApi(payload: Record<string, unknown>, campusId?: string | null): Promise<AdmissionApplication> {
  const res = await apiFetch<{ data: BackendAdmission }>(`/admissions`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return mapBackendAdmission(res.data);
}

export async function updateAdmissionStatusApi(uuid: string, payload: Record<string, unknown>): Promise<AdmissionApplication> {
  const res = await apiFetch<{ data: BackendAdmission }>(`/admissions/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapBackendAdmission(res.data);
}

export async function updateAdmissionDocumentApi(uuid: string, docName: string, payload: Record<string, unknown>): Promise<AdmissionDocumentItem> {
  const res = await apiFetch<{ data: AdmissionDocumentItem }>(
    `/admissions/${uuid}/documents/${encodeURIComponent(docName)}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data;
}