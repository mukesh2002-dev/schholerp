"use client";
import { apiFetch } from "./client";
import type { AdmissionApplication, AdmissionDocumentItem } from "@/types";

/** Raw backend admission record (admissions.service.js serializeApplication). */
export interface BackendAdmission {
  uuid: string;
  applicationNumber: string;
  firstName?: string | null;
  middleName?: string | null;
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
  previousGpa?: string | null;
  aadhaarNumber?: string | null;
  board?: string | null;
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
  // Extended 8-section fields
  bloodGroup?: string | null;
  nationality?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  fatherName?: string | null;
  fatherQualification?: string | null;
  fatherOccupation?: string | null;
  fatherOrganization?: string | null;
  fatherAnnualIncome?: string | null;
  fatherMobile?: string | null;
  fatherEmail?: string | null;
  fatherAadhaar?: string | null;
  motherName?: string | null;
  motherQualification?: string | null;
  motherOccupation?: string | null;
  motherOrganization?: string | null;
  motherAnnualIncome?: string | null;
  motherMobile?: string | null;
  motherEmail?: string | null;
  motherAadhaar?: string | null;
  guardianName?: string | null;
  guardianRelation?: string | null;
  guardianContact?: string | null;
  guardianEmail?: string | null;
  presentHouseNo?: string | null;
  presentStreet?: string | null;
  presentArea?: string | null;
  presentDistrict?: string | null;
  permanentSameAsPresent?: boolean | null;
  permanentHouseNo?: string | null;
  permanentStreet?: string | null;
  permanentArea?: string | null;
  permanentCity?: string | null;
  permanentDistrict?: string | null;
  permanentState?: string | null;
  permanentPostalCode?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  previousSchoolLocation?: string | null;
  lastClassAttended?: string | null;
  lastClassPassed?: string | null;
  percentageGrade?: string | null;
  mediumOfInstruction?: string | null;
  reasonForLeaving?: string | null;
  allergies?: string | null;
  chronicIllness?: string | null;
  specialNeeds?: boolean | null;
  specialNeedsDetails?: string | null;
  transportRequired?: boolean | null;
  busStop?: string | null;
  pickupRoute?: string | null;
  siblingName?: string | null;
  siblingClass?: string | null;
  siblingAdmissionNo?: string | null;
  siblingCategory?: string | null;
  declarationAccepted?: boolean | null;
  declarationDate?: string | null;
  declarationPlace?: string | null;
  signatureUrl?: string | null;
  [key: string]: unknown;
}

export interface ApprovedDropdownItem {
  uuid: string;
  applicationNumber: string;
  firstName: string | null;
  lastName: string | null;
  gradeApplied: string | null;
  parentName: string | null;
  parentPhone: string | null;
  campus?: { uuid: string; name: string } | null;
}

export interface AdmissionFiles {
  avatar?: File | null;
  documents?: Array<{ file: File; name: string }>;
  signature?: File | null;
}

function cap(s?: string | null): string {
  const v = String(s ?? "").trim();
  return v ? `${v[0].toUpperCase()}${v.slice(1)}` : "Other";
}

export function mapBackendAdmission(a: BackendAdmission): AdmissionApplication {
  const firstName = a.firstName ?? "";
  const middleName = a.middleName ?? "";
  const lastName = a.lastName ?? "";
  const full = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();
  return {
    id: a.uuid,
    applicationNumber: a.applicationNumber ?? "",
    applicantFirstName: firstName,
    applicantLastName: lastName,
    applicantFullName: full || "—",
    middleName: middleName || undefined,
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
    previousGpa: a.previousGpa ?? undefined,
    aadhaarNumber: a.aadhaarNumber ?? undefined,
    apaarId: undefined,
    category: a.category ?? undefined,
    religion: a.religion ?? undefined,
    motherTongue: a.motherTongue ?? undefined,
    board: a.board ?? undefined,
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
    bloodGroup: a.bloodGroup ?? undefined,
    nationality: a.nationality ?? undefined,
    fatherName: a.fatherName ?? undefined,
    fatherQualification: a.fatherQualification ?? undefined,
    fatherOccupation: a.fatherOccupation ?? undefined,
    fatherOrganization: a.fatherOrganization ?? undefined,
    fatherAnnualIncome: a.fatherAnnualIncome ?? undefined,
    fatherMobile: a.fatherMobile ?? undefined,
    fatherEmail: a.fatherEmail ?? undefined,
    fatherAadhaar: a.fatherAadhaar ?? undefined,
    motherName: a.motherName ?? undefined,
    motherQualification: a.motherQualification ?? undefined,
    motherOccupation: a.motherOccupation ?? undefined,
    motherOrganization: a.motherOrganization ?? undefined,
    motherAnnualIncome: a.motherAnnualIncome ?? undefined,
    motherMobile: a.motherMobile ?? undefined,
    motherEmail: a.motherEmail ?? undefined,
    motherAadhaar: a.motherAadhaar ?? undefined,
    guardianName: a.guardianName ?? undefined,
    guardianRelation: a.guardianRelation ?? undefined,
    guardianContact: a.guardianContact ?? undefined,
    guardianEmail: a.guardianEmail ?? undefined,
    presentHouseNo: a.presentHouseNo ?? undefined,
    presentStreet: a.presentStreet ?? undefined,
    presentArea: a.presentArea ?? undefined,
    presentDistrict: a.presentDistrict ?? undefined,
    permanentSameAsPresent: a.permanentSameAsPresent ?? undefined,
    permanentHouseNo: a.permanentHouseNo ?? undefined,
    permanentStreet: a.permanentStreet ?? undefined,
    permanentArea: a.permanentArea ?? undefined,
    permanentCity: a.permanentCity ?? undefined,
    permanentDistrict: a.permanentDistrict ?? undefined,
    permanentState: a.permanentState ?? undefined,
    permanentPostalCode: a.permanentPostalCode ?? undefined,
    emergencyContactName: a.emergencyContactName ?? undefined,
    emergencyContactPhone: a.emergencyContactPhone ?? undefined,
    emergencyContactRelation: a.emergencyContactRelation ?? undefined,
    previousSchoolLocation: a.previousSchoolLocation ?? undefined,
    lastClassAttended: a.lastClassAttended ?? undefined,
    lastClassPassed: a.lastClassPassed ?? undefined,
    percentageGrade: a.percentageGrade ?? undefined,
    mediumOfInstruction: a.mediumOfInstruction ?? undefined,
    reasonForLeaving: a.reasonForLeaving ?? undefined,
    allergies: a.allergies ?? undefined,
    chronicIllness: a.chronicIllness ?? undefined,
    specialNeeds: a.specialNeeds ?? undefined,
    specialNeedsDetails: a.specialNeedsDetails ?? undefined,
    transportRequired: a.transportRequired ?? undefined,
    busStop: a.busStop ?? undefined,
    pickupRoute: a.pickupRoute ?? undefined,
    siblingName: a.siblingName ?? undefined,
    siblingClass: a.siblingClass ?? undefined,
    siblingAdmissionNo: a.siblingAdmissionNo ?? undefined,
    siblingCategory: a.siblingCategory ?? undefined,
    declarationAccepted: a.declarationAccepted ?? undefined,
    declarationDate: a.declarationDate ?? undefined,
    declarationPlace: a.declarationPlace ?? undefined,
    signatureUrl: a.signatureUrl ?? undefined,
  };
}

export async function fetchAdmissions(params: { campusId?: string | null; search?: string; status?: string; includeEnrolled?: boolean; page?: number; limit?: number } = {}): Promise<AdmissionApplication[]> {
  // Do NOT swallow errors — let ApiError surface so useCampusData shows the
  // proper offline / permission banner instead of a silent empty list.
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.includeEnrolled) q.set("includeEnrolled", "true");
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

export async function createAdmissionApi(
  payload: Record<string, unknown>,
  campusId?: string | null,
  files?: AdmissionFiles
): Promise<AdmissionApplication> {
  // With files (photo / documents) send multipart so the backend streams them
  // to Cloudinary and persists the URLs; otherwise plain JSON.
  if (files && (files.avatar || files.signature || (files.documents && files.documents.length > 0))) {
    const form = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (v !== undefined && v !== null && v !== "") form.append(k, String(v));
    }
    if (files.avatar) form.append("avatar", files.avatar);
    if (files.signature) form.append("signature", files.signature);
    for (const d of files.documents ?? []) {
      form.append("documentNames[]", d.name || d.file.name);
      form.append("documents", d.file);
    }
    // Backend now creates record instantly and uploads to Cloudinary in background,
    // but we still allow up to 60s for the multipart to reach the server (large docs / slow network).
    // 30s is enough for the DB-only path; 60s safety for legacy blocking behavior.
    // skipRetry: POST is not idempotent — retry on timeout would create duplicate applications.
    const res = await apiFetch<{ data: BackendAdmission }>(
      `/admissions`,
      { method: "POST", body: form as unknown as BodyInit },
      { campusId: campusId ?? undefined, timeoutMs: 60_000, skipRetry: true }
    );
    return mapBackendAdmission(res.data);
  }
  const res = await apiFetch<{ data: BackendAdmission }>(`/admissions`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined, timeoutMs: 30_000, skipRetry: true });
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

export async function uploadAdmissionDocumentApi(uuid: string, docName: string, file: File): Promise<AdmissionDocumentItem> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiFetch<{ data: AdmissionDocumentItem }>(
    `/admissions/${uuid}/documents/${encodeURIComponent(docName)}`,
    { method: "PATCH", body: form as unknown as BodyInit }
  );
  return res.data;
}

export interface ApproveAdmissionResult {
  application: AdmissionApplication;
  student: { uuid: string; admissionNo: string; firstName: string; lastName?: string | null; classId?: string | null };
}

/** Approve → enroll: creates the lean student + enrollment, marks APPROVED. Principal / HR / admin. */
export async function approveAdmissionApi(
  uuid: string,
  payload: { classId?: string | null; section?: string | null; rollNo?: string | null; academicYearId?: string | null } = {}
): Promise<ApproveAdmissionResult> {
  const res = await apiFetch<{ data: { application: BackendAdmission; student: ApproveAdmissionResult["student"] } }>(
    `/admissions/${uuid}/approve`,
    { method: "POST", body: JSON.stringify(payload) }
  );
  return { application: mapBackendAdmission(res.data.application), student: res.data.student };
}

/** Approved-but-not-enrolled names for the principal/HR dropdown. Never includes already-students. */
export async function fetchApprovedDropdown(params: { campusId?: string | null; gradeApplied?: string } = {}): Promise<ApprovedDropdownItem[]> {
  const q = new URLSearchParams();
  if (params.gradeApplied) q.set("gradeApplied", params.gradeApplied);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: ApprovedDropdownItem[] }>(
    `/admissions/dropdown/approved${qs}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return Array.isArray(res.data) ? res.data : [];
}
export async function bulkImportAdmissionsApi(rows: any[], campusId?: string | null) {
  const res = await apiFetch<{
    success: boolean;
    total: number;
    imported: number;
    failed: number;
    errors: { row: number; name: string; error: string }[];
  }>('/admissions/bulk-import', { method: 'POST', body: JSON.stringify({ rows, campusId }) }, { campusId: campusId ?? undefined });
  return (res as any);
}
