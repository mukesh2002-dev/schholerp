import { Role } from "@/types";

/** Staff portals that can sign in through this console. */
export type StaffRole = "ADMIN" | "PRINCIPAL" | "ACCOUNTANT" | "HR_MANAGER" | "TEACHER" | "LIBRARIAN" | "STAFF";

export const STAFF_ROLES: StaffRole[] = [
  "ADMIN",
  "PRINCIPAL",
  "ACCOUNTANT",
  "HR_MANAGER",
  "TEACHER",
  "LIBRARIAN",
  "STAFF",
];

/**
 * Role names issued by the backend (Role table rows). `accountant` is the
 * finance role reserved on the frontend; the backend seeds it once finance
 * endpoints ship.
 */
export type BackendRole =
  | "super_admin"
  | "admin"
  | "ops_admin"
  | "principal"
  | "hr"
  | "accountant"
  | "teacher"
  | "librarian"
  | "front_desk"
  | "staff"
  | "student"
  | (string & {});

/** Map a backend role name to the staff portal it belongs to (null = no portal). */
export function backendRoleToStaffRole(role: BackendRole | null | undefined): StaffRole | null {
  switch ((role ?? "").toLowerCase()) {
    case "super_admin":
    case "admin":
    case "ops_admin":
      return "ADMIN";
    case "principal":
      return "PRINCIPAL";
    case "accountant":
      return "ACCOUNTANT";
    case "hr":
      return "HR_MANAGER";
    case "teacher":
      return "TEACHER";
    case "librarian":
      return "LIBRARIAN";
    case "staff":
    case "front_desk":
      return "STAFF";
    default:
      return "STAFF";
  }
}

export function backendRoleLabel(role: BackendRole | null | undefined): string {
  switch ((role ?? "").toLowerCase()) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "ops_admin":
      return "Ops Admin";
    case "principal":
      return "Principal";
    case "hr":
      return "HR Manager";
    case "accountant":
      return "Accountant";
    case "teacher":
      return "Teacher";
    case "librarian":
      return "Librarian";
    case "front_desk":
      return "Front Desk";
    case "staff":
      return "Staff";
    case "student":
      return "Student";
    default:
      return "Staff";
  }
}

/** Role type used by the existing mock-data-driven UI (sidebar, topbar, etc). */
export function staffRoleToUiRole(role: StaffRole): Role {
  switch (role) {
    case "ADMIN":
      return "ADMIN";
    case "PRINCIPAL":
      return "PRINCIPAL";
    case "ACCOUNTANT":
      return "ACCOUNTANT";
    case "HR_MANAGER":
      return "HR_MANAGER";
    case "TEACHER":
      return "TEACHER";
    case "LIBRARIAN":
      return "LIBRARIAN";
    case "STAFF":
      return "STAFF";
  }
}

export interface StaffPortal {
  role: StaffRole;
  slug: string;
  label: string;
  title: string;
  description: string;
  /** Login page cover panel gradient. */
  gradient: string;
}

/** The four dedicated logins — each has its own page under /login/<slug>. */
export const STAFF_PORTALS: StaffPortal[] = [
  {
    role: "ADMIN",
    slug: "admin",
    label: "Admin",
    title: "Administrator Portal",
    description: "Full multi-campus oversight, finance controls & system settings.",
    gradient: "from-blue-700 via-indigo-700 to-violet-800",
  },
  {
    role: "PRINCIPAL",
    slug: "principal",
    label: "Principal",
    title: "Principal Portal",
    description: "Campus academics, faculty, students, timetable & discipline.",
    gradient: "from-emerald-700 via-teal-700 to-cyan-800",
  },
  {
    role: "ACCOUNTANT",
    slug: "accountant",
    label: "Accountant",
    title: "Accounts Portal",
    description: "Fee collection, invoicing, payroll runs & expense ledger.",
    gradient: "from-amber-600 via-orange-600 to-rose-700",
  },
  {
    role: "HR_MANAGER",
    slug: "hr",
    label: "HR Manager",
    title: "HR Portal",
    description: "Recruitment, staff directory, leaves & biometric attendance.",
    gradient: "from-fuchsia-700 via-purple-700 to-indigo-800",
  },
];

export function getPortalBySlug(slug: string): StaffPortal | undefined {
  return STAFF_PORTALS.find((p) => p.slug === slug);
}

export function getPortalByRole(role: StaffRole): StaffPortal | undefined {
  return STAFF_PORTALS.find((p) => p.role === role);
}

/** Roles allowed to create/edit/delete academic records (classes, subjects). */
export function canMutateAcademics(role: string | undefined | null): boolean {
  const r = (role ?? "").toUpperCase();
  return r === "ADMIN" || r === "PRINCIPAL";
}

/** Whether the given role is campus-scoped (principal + below) vs global (admin). */
export function isCampusScopedRole(role: string | undefined | null): boolean {
  const r = (role ?? "").toUpperCase();
  return r !== "ADMIN";
}

/**
 * Only super_admin may create/edit/delete campuses (admin is read-only).
 * Uses the raw backend role carried on the session to tell super_admin apart
 * from admin (both map to the frontend ADMIN portal role).
 */
export function canManageCampuses(rawRole: string | undefined | null): boolean {
  return String(rawRole ?? "").toLowerCase() === "super_admin";
}

/** Deterministic initials avatar (SVG data URI) — no external avatar source needed. */
export function initialsAvatar(name: string, seed = ""): string {
  const initials = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
  let hash = 0;
  const key = `${name}${seed}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="hsl(${hue}, 62%, 45%)"/><text x="64" y="64" dy="0.36em" text-anchor="middle" font-family="Manrope, Arial, sans-serif" font-size="52" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
