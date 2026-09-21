"use client";

import { Role, UserSession } from "@/types";
import type { StaffRole } from "./roles";

/** @deprecated Use StaffRole from @/lib/auth/roles (single source of truth). */
export type { StaffRole };

export const STAFF_ROLES: StaffRole[] = [
  "ADMIN",
  "PRINCIPAL",
  "ACCOUNTANT",
  "HR_MANAGER",
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

// Backend-seeded staff credentials (see mukesh-school-node.js/scripts/seed-staff-users.js + prisma/seed.js)
// Password is the real DB hash for Mukesh@1234 — prefilled so one-click login works.
const DEMO_PASSWORD = "Mukesh@1234";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin",
    title: "Group Director & Chief Administrator",
    description: "Full multi-campus oversight, finance controls & system settings.",
    email: "admin@school.local",
    password: DEMO_PASSWORD,
    landingPage: "/",
    session: {
      id: "usr-admin-01",
      name: "Dr. Alexander Wright",
      email: "admin@school.local",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      role: "ADMIN",
      branchId: "all",
      roleLabel: "Admin (Global ERP)",
      title: "Group Director & Chief Administrator",
    },
  },
  {
    role: "PRINCIPAL",
    label: "Principal",
    title: "Campus Principal — Apex Global Campus",
    description: "Campus academics, faculty, students, timetable & discipline.",
    email: "principal@school.local",
    password: DEMO_PASSWORD,
    landingPage: "/",
    session: {
      id: "usr-principal-01",
      name: "Dr. Clara Higgins",
      email: "principal@school.local",
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
    email: "accountant@school.local",
    password: DEMO_PASSWORD,
    landingPage: "/fees",
    session: {
      id: "usr-accountant-01",
      name: "Hannah Montgomery",
      email: "accountant@school.local",
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
    email: "hr@school.local",
    password: DEMO_PASSWORD,
    landingPage: "/hr",
    session: {
      id: "usr-hr-01",
      name: "Daniel Okafor",
      email: "hr@school.local",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "HR_MANAGER",
      branchId: "all",
      roleLabel: "HR Manager (People & Culture)",
      title: "Director of People & Culture",
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
 * password (`Mukesh@1234`); the email address decides the role.
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
    return { success: false, error: "Incorrect password. Hint: Mukesh@1234" };
  }
  return { success: true, session: account.session, account };
}
