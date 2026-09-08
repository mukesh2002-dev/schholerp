"use client";

import { Role, UserSession } from "@/types";

/**
 * Staff + academic roles allowed on login.
 * Teacher/Student/Parent now have dedicated portal access
 * with filtered Exams & Results views.
 */
export type StaffRole = "SUPER_ADMIN" | "PRINCIPAL" | "ACCOUNTANT" | "HR_MANAGER" | "TEACHER" | "STUDENT" | "PARENT";

export const STAFF_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "PRINCIPAL",
  "ACCOUNTANT",
  "HR_MANAGER",
  "TEACHER",
  "STUDENT",
  "PARENT",
];

export interface DemoAccount {
  role: StaffRole;
  label: string;
  title: string;
  description: string;
  email: string;
  /** Demo password — identical for every staff role for easy testing. */
  password: string;
  session: UserSession;
  landingPage: string;
}

const DEMO_PASSWORD = "admin123";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin",
    title: "Group Director & Chief Administrator",
    description: "Full multi-campus oversight, finance controls & system settings.",
    email: "admin@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/",
    session: {
      id: "usr-admin-01",
      name: "Dr. Alexander Wright",
      email: "admin@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      role: "SUPER_ADMIN",
      branchId: "all",
      roleLabel: "Super Admin (Global ERP)",
      title: "Group Director & Chief Administrator",
    },
  },
  {
    role: "PRINCIPAL",
    label: "Principal",
    title: "Campus Principal — Apex Global Campus",
    description: "Campus academics, faculty, students, timetable & discipline.",
    email: "principal@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/",
    session: {
      id: "usr-principal-01",
      name: "Dr. Clara Higgins",
      email: "principal@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      role: "PRINCIPAL",
      branchId: "br-apex-01",
      roleLabel: "Principal (Apex Campus)",
      title: "Campus Principal — Apex Global Campus",
    },
  },
  {
    role: "ACCOUNTANT",
    label: "Chief Accountant",
    title: "Head of Group Finance",
    description: "Fee collection, invoicing, payroll runs & expense ledger.",
    email: "accountant@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/fees",
    session: {
      id: "usr-accountant-01",
      name: "Hannah Montgomery",
      email: "accountant@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      role: "ACCOUNTANT",
      branchId: "all",
      roleLabel: "Chief Accountant (Group Finance)",
      title: "Head of Group Finance",
    },
  },
  {
    role: "HR_MANAGER",
    label: "HR Manager",
    title: "Director of People & Culture",
    description: "Recruitment, staff directory, leaves & biometric attendance.",
    email: "hr@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/hr",
    session: {
      id: "usr-hr-01",
      name: "Daniel Okafor",
      email: "hr@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "HR_MANAGER",
      branchId: "all",
      roleLabel: "HR Manager (People & Culture)",
      title: "Director of People & Culture",
    },
  },
  {
    role: "TEACHER",
    label: "Teacher",
    title: "PGT Mathematics — Apex Global Campus",
    description: "Assigned subjects only: enter marks, view exam timetable.",
    email: "teacher@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/exams",
    session: {
      id: "tch-01",
      name: "Mrs. Sunita Rao",
      email: "teacher@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      role: "TEACHER",
      branchId: "br-apex-01",
      roleLabel: "Teacher (PGT Mathematics)",
      title: "PGT Mathematics — Apex Global Campus",
    },
  },
  {
    role: "STUDENT",
    label: "Student",
    title: "Grade 10 — Section A (STEM Honors)",
    description: "View own exam schedule, published results & report card.",
    email: "student@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/exams",
    session: {
      id: "stu-01",
      name: "Aarav Sharma",
      email: "student@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      role: "STUDENT",
      branchId: "br-apex-01",
      roleLabel: "Student (STU-1042)",
      title: "Grade 10 — Section A (STEM Honors)",
    },
  },
  {
    role: "PARENT",
    label: "Parent",
    title: "Parent of Aarav Sharma (Grade 10-A)",
    description: "View linked child's exam schedule, results & report card.",
    email: "parent@gmail.com",
    password: DEMO_PASSWORD,
    landingPage: "/exams",
    session: {
      id: "stu-01-guardian",
      name: "Ramesh Sharma",
      email: "parent@gmail.com",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      role: "PARENT",
      branchId: "br-apex-01",
      roleLabel: "Parent (Aarav Sharma)",
      title: "Parent of Aarav Sharma (Grade 10-A)",
    },
  },
];

export const DEMO_PASSWORD_HINT = DEMO_PASSWORD;

export function getDemoAccountByEmail(email: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === normalized);
}

export function getDemoAccountByRole(role: Role | StaffRole): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((a) => a.role === role);
}

export interface AuthResult {
  success: boolean;
  session?: UserSession;
  account?: DemoAccount;
  error?: string;
}

/**
 * Dummy credential check. Every staff role shares the same
 * password (`admin123`); the email address decides the role.
 */
export function authenticateDemoUser(email: string, password: string): AuthResult {
  const account = getDemoAccountByEmail(email);
  if (!account) {
    return {
      success: false,
      error: "No staff account found for this email. Pick a demo account below.",
    };
  }
  if (password !== account.password) {
    return { success: false, error: "Incorrect password. Hint: admin123" };
  }
  return { success: true, session: account.session, account };
}
