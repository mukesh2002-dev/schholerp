"use client";
import { apiFetch } from "./client";
import type { Student } from "@/types";

interface BackendStudent {
  uuid: string;
  admissionNo: string;
  rollNo?: string | null;
  firstName: string;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  bloodGroup?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  guardianRelation?: string | null;
  guardianOccupation?: string | null;
  guardianAddress?: string | null;
  guardianEmergencyContact?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  aadhaarNumber?: string | null;
  apaarId?: string | null;
  category?: string | null;
  religion?: string | null;
  motherTongue?: string | null;
  board?: string | null;
  medium?: string | null;
  avatar?: string | null;
  status?: string | null;
  academicHistory?: any;
  documents?: any;
  campusId?: string;
  classId?: string | null;
  campus?: { uuid: string; name: string } | null;
  class?: { uuid: string; name: string; section?: string | null } | null;
  academicYear?: { uuid: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
  // Enriched via admission dossier (getStudentByUuid now includes admissionApplications[0] as admissionApplication)
  admissionApplication?: any;
  admissionApplications?: any[];
}

function mapBackendStudent(s: BackendStudent): Student {
  const branchId = s.campus?.uuid ?? "all";
  // Admission dossier is the source of truth for students created via Approve & Enroll (lean student row)
  const app: any = (s as any).admissionApplication || (Array.isArray((s as any).admissionApplications) && (s as any).admissionApplications[0]) || null;

  // Helpers to pick first non-empty value (student lean row may be sparse)
  const pick = (...vals: any[]) => vals.find((v) => v !== null && v !== undefined && String(v).trim() !== "") ?? null;

  const bloodGroup = pick((s as any).bloodGroup, app?.bloodGroup) || "—";
  const avatar = pick((s as any).avatar, app?.avatar) || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.firstName)}`;
  const address = pick((s as any).address, app?.address, [app?.presentHouseNo, app?.presentStreet, app?.presentArea].filter(Boolean).join(", ")) || "";
  const city = pick((s as any).city, app?.city, app?.presentDistrict) || "";
  const state = pick((s as any).state, app?.state, app?.permanentState) || "";
  const aadhaarNumber = pick((s as any).aadhaarNumber, app?.aadhaarNumber) || undefined;
  const category = pick((s as any).category, app?.category) || undefined;
  const religion = pick((s as any).religion, app?.religion) || undefined;
  const motherTongue = pick((s as any).motherTongue, app?.motherTongue) || undefined;

  // Guardian: prefer explicit student guardian, else admission's father/mother/parent chain
  const guardianName = pick((s as any).guardianName, app?.fatherName, app?.motherName, app?.parentName, app?.guardianName) || "—";
  const guardianPhone = pick((s as any).guardianPhone, app?.fatherMobile, app?.parentPhone, app?.guardianContact, app?.motherMobile) || "";
  const guardianEmail = pick((s as any).guardianEmail, app?.fatherEmail, app?.parentEmail, app?.guardianEmail, app?.motherEmail) || "";
  const guardianRelation = pick((s as any).guardianRelation, app?.guardianRelation, app?.parentRelationship) || (app?.fatherName ? "Father" : "Guardian");
  const guardianOccupation = pick((s as any).guardianOccupation, app?.fatherOccupation, app?.motherOccupation) || "";
  const guardianAddress = pick((s as any).guardianAddress, app?.presentStreet, app?.permanentStreet) || address;
  const emergencyContact = pick((s as any).guardianEmergencyContact, app?.emergencyContactPhone, guardianPhone) || "";

  // Academic history: real data only — no fake 75%/3.2 synthesis (rules.md §1, §3)
  let academicHistory: Student["academicHistory"] = [];
  if (Array.isArray((s as any).academicHistory) && (s as any).academicHistory.length > 0) {
    academicHistory = (s as any).academicHistory;
  } else if (app?.previousSchool || app?.lastClassAttended || app?.percentageGrade) {
    // Only create entry if at least one real field exists; use real percentage/GPA, not fake 75/3.2
    const rawPct = app?.percentageGrade ? parseFloat(String(app.percentageGrade).replace("%","").trim()) : NaN;
    const hasRealPct = !isNaN(rawPct);
    if (app?.previousSchool || hasRealPct || app?.lastClassPassed || app?.board) {
      academicHistory = [{
        term: app?.previousSchool ? `${app.previousSchool}${app.previousSchoolLocation ? ` — ${app.previousSchoolLocation}` : ""}` : (app?.lastClassAttended ? `Previous: ${app.lastClassAttended}` : "Previous School"),
        grade: app?.board || app?.lastClassPassed || "—",
        gpa: hasRealPct ? Math.min(4, rawPct/25) : 0,
        percentage: hasRealPct ? rawPct : 0,
        rank: 0,
        remarks: app?.reasonForLeaving ? `Leaving reason: ${app.reasonForLeaving}` : (app?.lastClassAttended || app?.gradeApplied ? `Previous: ${app.lastClassAttended || app.gradeApplied} • Medium: ${app.mediumOfInstruction || "—"}` : "—"),
      }];
    }
  }

  // Documents: prefer student.documents json, else admission documents
  let documents: Student["documents"] = [];
  if (Array.isArray((s as any).documents) && (s as any).documents.length > 0) {
    documents = (s as any).documents.map((d: any) => ({
      id: d.id || d.uuid,
      name: d.name,
      type: d.type || "OTHER",
      uploadedAt: d.uploadedAt || d.createdAt || s.createdAt || new Date().toISOString(),
      verified: !!d.verified,
      size: d.size || "—",
    }));
  } else if (Array.isArray(app?.documents) && app.documents.length > 0) {
    documents = app.documents.map((d: any) => ({
      id: d.uuid || d.id,
      name: d.name,
      type: d.required ? "IDENTITY" : "OTHER",
      uploadedAt: d.createdAt || app.createdAt || s.createdAt || new Date().toISOString(),
      verified: !!d.verified,
      size: d.fileUrl ? "Cloudinary" : "—",
    }));
  }

  return {
    id: s.uuid,
    rollNumber: s.rollNo ?? s.admissionNo,
    admissionNumber: s.admissionNo,
    firstName: s.firstName,
    lastName: s.lastName ?? "",
    fullName: `${s.firstName} ${s.lastName ?? ""}`.trim(),
    avatar,
    dateOfBirth: (s.dob as string) || app?.dob || "2010-01-01",
    gender: (s.gender as Student["gender"]) ?? (app?.gender ? (String(app.gender).charAt(0).toUpperCase()+String(app.gender).slice(1).toLowerCase()) as any : "Male"),
    bloodGroup,
    branchId,
    branchName: s.campus?.name ?? app?.campus?.name ?? "Campus",
    classId: s.class?.uuid ?? s.classId ?? app?.gradeApplied ?? "all",
    className: s.class?.name ?? app?.gradeApplied ?? "—",
    sectionId: s.class?.section ?? app?.lastClassAttended ?? "A",
    sectionName: s.class?.section ?? "A",
    admissionDate: s.createdAt ?? app?.createdAt ?? new Date().toISOString(),
    status: (s.status as Student["status"]) ?? "ACTIVE",
    guardian: {
      name: guardianName,
      relation: guardianRelation as any,
      email: guardianEmail,
      phone: guardianPhone,
      occupation: guardianOccupation,
      address: guardianAddress,
      emergencyContact,
    },
    attendanceSummary: { totalDays: 0, presentDays: 0, absentDays: 0, lateDays: 0, attendanceRate: 0 },
    feeSummary: { totalAssigned: 0, totalPaid: 0, totalPending: 0, status: "PENDING" },
    academicHistory,
    documents,
    address,
    city,
    state,
    aadhaarNumber,
    category,
    religion,
    motherTongue,
    createdAt: s.createdAt ?? new Date().toISOString(),
    updatedAt: s.updatedAt ?? new Date().toISOString(),
  };
}

export async function fetchStudents(params: { campusId?: string | null; search?: string; page?: number; limit?: number } = {}): Promise<{ data: Student[]; total: number }> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendStudent[]; meta?: { total: number } }>(`/students${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list.map(mapBackendStudent), total: res.meta?.total ?? list.length };
}

export async function createStudentApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Student> {
  const res = await apiFetch<{ data: BackendStudent }>(`/students`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return mapBackendStudent(res.data);
}

export async function updateStudentApi(uuid: string, payload: Record<string, unknown>): Promise<Student> {
  const res = await apiFetch<{ data: BackendStudent }>(`/students/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return mapBackendStudent(res.data);
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    const res = await apiFetch<{ data: BackendStudent }>(`/students/${id}`);
    if (res?.data) return mapBackendStudent(res.data);
  } catch {}
  return null;
}
