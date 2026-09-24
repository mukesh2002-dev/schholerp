"use client";
import { apiFetch } from "./client";
import type { Teacher, TeacherAssignedClass } from "@/types";

export interface BackendStaffAssignment {
  uuid: string;
  class?: { id?: string | number; uuid: string; name: string; section?: string | null };
  section?: string | null;
  subject?: { id?: string | number; uuid: string; name: string } | null;
  academicYear?: { uuid: string; name: string } | null;
  createdAt?: string;
}

export interface BackendStaffTeacher {
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
  employmentStatus?: string | null;
  status?: string | null;
  joiningDate?: string | null;
  mobile?: string | null;
  email?: string | null;
  experienceYears?: number | null;
  highestQualification?: string | null;
  qualification?: string | null;
  isActive?: boolean;
  campus?: { uuid: string; name: string } | null;
  user?: { uuid: string; name: string; email: string } | null;
  classAssignments?: BackendStaffAssignment[];
  subjectAssignments?: BackendStaffAssignment[];
}

export function mapBackendStaffToTeacher(s: BackendStaffTeacher): Teacher {
  const branchId = s.campus?.uuid ?? "all";
  const branchName = s.campus?.name ?? "Main Campus";
  const firstName = s.firstName || s.user?.name?.split(" ")[0] || "Faculty";
  const lastName = s.lastName || s.user?.name?.split(" ").slice(1).join(" ") || "";
  const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ").trim() || s.user?.name || s.employeeId;
  const today = new Date().toISOString().split("T")[0];

  // Extract subjects taught
  const subjectsSet = new Set<string>();
  (s.subjectAssignments || []).forEach((sa) => {
    if (sa.subject?.name) subjectsSet.add(sa.subject.name);
  });
  (s.classAssignments || []).forEach((ca) => {
    if (ca.subject?.name) subjectsSet.add(ca.subject.name);
  });
  const subjectsTaught = Array.from(subjectsSet);

  // Extract assigned classes
  const assignedClasses: TeacherAssignedClass[] = [];
  (s.classAssignments || []).forEach((ca) => {
    if (ca.class) {
      assignedClasses.push({
        classId: ca.class.uuid,
        className: ca.class.name,
        sectionId: ca.section || "",
        sectionName: ca.section || ca.class.section || "A",
        subjectName: ca.subject?.name || "Class Teacher",
        weeklyPeriods: 6,
      });
    }
  });

  (s.subjectAssignments || []).forEach((sa) => {
    if (sa.class) {
      const already = assignedClasses.some(
        (c) => c.classId === sa.class?.uuid && c.sectionName === (sa.section || "A") && c.subjectName === (sa.subject?.name || "")
      );
      if (!already) {
        assignedClasses.push({
          classId: sa.class.uuid,
          className: sa.class.name,
          sectionId: sa.section || "",
          sectionName: sa.section || "A",
          subjectName: sa.subject?.name || "Assigned Subject",
          weeklyPeriods: 5,
        });
      }
    }
  });

  return {
    id: s.uuid,
    employeeId: s.employeeId || "TCH-000",
    firstName,
    lastName,
    fullName,
    avatar: s.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    email: s.email || s.user?.email || "",
    phone: s.mobile || "",
    gender: "Other",
    dateOfBirth: "",
    qualification: s.highestQualification || s.qualification || "M.Sc / B.Ed",
    joiningDate: s.joiningDate ? s.joiningDate.slice(0, 10) : today,
    branchId,
    branchName,
    department: s.department || "Academics",
    designation: s.designation || "Teacher",
    status: s.isActive === false ? "RESIGNED" : (s.status as any) || "ACTIVE",
    subjectsTaught: subjectsTaught.length > 0 ? subjectsTaught : ["General"],
    assignedClasses,
    attendanceRate: 0,
    leaveSummary: { totalAllowed: 18, used: 2, balance: 16, casualLeaves: 1, medicalLeaves: 1 },
    salarySummary: { baseSalary: 45000, allowances: 5000, grossSalary: 50000, paymentStatus: "PAID", lastDisbursedDate: "" },
    experienceYears: s.experienceYears ?? 3,
    createdAt: today,
    updatedAt: today,
  };
}

export async function fetchTeachers(
  params: { campusId?: string | null; search?: string; page?: number; limit?: number; department?: string } = {}
): Promise<{ data: Teacher[]; total: number }> {
  const q = new URLSearchParams();
  q.set("staffType", "TEACHING");
  if (params.search) q.set("search", params.search);
  if (params.department && params.department !== "ALL") q.set("department", params.department);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";

  try {
    const res = await apiFetch<{ data: BackendStaffTeacher[]; meta?: { total: number } }>(
      `/staff${qs}`,
      {},
      { campusId: params.campusId ?? undefined }
    );
    const list = Array.isArray(res.data) ? res.data : [];
    if (list.length > 0) {
      return { data: list.map(mapBackendStaffToTeacher), total: res.meta?.total ?? list.length };
    }
  } catch (err) {
    console.warn("Falling back to /users for teachers:", err);
  }

  // Fallback to /users?role=teacher
  const fallbackQ = new URLSearchParams();
  fallbackQ.set("role", "teacher");
  if (params.search) fallbackQ.set("search", params.search);
  const fallbackQs = fallbackQ.toString() ? `?${fallbackQ.toString()}` : "";
  const fallbackRes = await apiFetch<{ data: any[]; meta?: { total: number } }>(
    `/users${fallbackQs}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const uList = Array.isArray(fallbackRes.data) ? fallbackRes.data : [];
  return {
    data: uList.map((u: any) => ({
      id: u.uuid,
      employeeId: `TCH-${(u.uuid || "0000").slice(0, 4).toUpperCase()}`,
      firstName: u.name?.split(" ")[0] || "Faculty",
      lastName: u.name?.split(" ").slice(1).join(" ") || "",
      fullName: u.name || "Faculty Member",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "Teacher")}`,
      email: u.email || "",
      phone: "",
      gender: "Other",
      dateOfBirth: "",
      qualification: "B.Ed",
      joiningDate: new Date().toISOString().split("T")[0],
      branchId: u.campus?.uuid ?? "all",
      branchName: u.campus?.name ?? "Campus",
      department: "Academics",
      designation: "Teacher",
      status: u.isActive === false ? "RESIGNED" : "ACTIVE",
      subjectsTaught: ["General"],
      assignedClasses: [],
      attendanceRate: 90,
      leaveSummary: { totalAllowed: 18, used: 0, balance: 18, casualLeaves: 0, medicalLeaves: 0 },
      salarySummary: { baseSalary: 0, allowances: 0, grossSalary: 0, paymentStatus: "PENDING", lastDisbursedDate: "" },
      experienceYears: 2,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    })),
    total: fallbackRes.meta?.total ?? uList.length,
  };
}

export async function fetchTeacherById(id: string): Promise<Teacher | null> {
  try {
    const res = await apiFetch<{ data: BackendStaffTeacher }>(`/staff/${id}`);
    if (res?.data) return mapBackendStaffToTeacher(res.data);
  } catch {
    try {
      const uRes = await apiFetch<{ data: any }>(`/users/${id}`);
      if (uRes?.data) {
        const u = uRes.data;
        return {
          id: u.uuid,
          employeeId: `TCH-${(u.uuid || "0000").slice(0, 4).toUpperCase()}`,
          firstName: u.name?.split(" ")[0] || "Faculty",
          lastName: u.name?.split(" ").slice(1).join(" ") || "",
          fullName: u.name || "Faculty Member",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || "Teacher")}`,
          email: u.email || "",
          phone: "",
          gender: "Other",
          dateOfBirth: "",
          qualification: "B.Ed",
          joiningDate: new Date().toISOString().split("T")[0],
          branchId: u.campus?.uuid ?? "all",
          branchName: u.campus?.name ?? "Campus",
          department: "Academics",
          designation: "Teacher",
          status: u.isActive === false ? "RESIGNED" : "ACTIVE",
          subjectsTaught: ["General"],
          assignedClasses: [],
          attendanceRate: 0,
          leaveSummary: { totalAllowed: 18, used: 0, balance: 18, casualLeaves: 0, medicalLeaves: 0 },
          salarySummary: { baseSalary: 0, allowances: 0, grossSalary: 0, paymentStatus: "PENDING", lastDisbursedDate: "" },
          experienceYears: 2,
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        };
      }
    } catch {}
  }
  return null;
}

export async function createTeacherApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Teacher> {
  // Save as TEACHING staff directly in the staff system
  const staffPayload = {
    ...payload,
    staffType: "TEACHING",
    designation: payload.designation || "Teacher",
    department: payload.department || "Academics",
  };
  const res = await apiFetch<{ data: BackendStaffTeacher }>(
    `/staff`,
    { method: "POST", body: JSON.stringify(staffPayload) },
    { campusId: campusId ?? undefined }
  );
  return mapBackendStaffToTeacher(res.data);
}

// Assignment APIs
export async function fetchTeacherAssignments(staffUuid: string): Promise<{
  classAssignments: any[];
  subjectAssignments: any[];
}> {
  const res = await apiFetch<{ data: { classAssignments: any[]; subjectAssignments: any[] } }>(
    `/staff/${staffUuid}/assignments`
  );
  return res.data || { classAssignments: [], subjectAssignments: [] };
}

export async function assignTeacherClassOrSubject(
  staffUuid: string,
  payload: {
    classId: string;
    section?: string | null;
    subjectId?: string | null;
    academicYearId?: string | null;
    campusId?: string | null;
  }
): Promise<any> {
  const res = await apiFetch<{ data: any }>(
    `/staff/${staffUuid}/assignments`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return res.data;
}

export async function removeTeacherAssignment(
  staffUuid: string,
  assignmentUuid: string,
  type: "class" | "subject" = "subject"
): Promise<any> {
  const res = await apiFetch<{ data: any }>(
    `/staff/${staffUuid}/assignments/${assignmentUuid}?type=${type}`,
    { method: "DELETE" }
  );
  return res.data;
}
