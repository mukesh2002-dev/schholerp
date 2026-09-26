"use client";

import {
  LayoutDashboard,
  Building2,
  UserPlus,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Briefcase,
  Fingerprint,
  Bus,
  Receipt,
  BarChart3,
  ClipboardList,
  ShieldAlert,
  Megaphone,
  MessageSquare,
  Bell,
  Calendar,
  Rocket,
  Server,
  Package as PackageIcon,
  History as HistoryIcon,
  Library,
  Heart,
  Settings,
  CreditCard,
  Layers,
  BookMarked,
  PenLine,
  FileText,
  FileBadge,
  Send,
  Award,
  Settings2,
} from "lucide-react";
import { Role } from "@/types";
import { StaffRole } from "./roles";

export interface RoleNavSubItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
  allowedRoles?: StaffRole[];
  /** Backend module key â€” when set, the item is hidden unless the backend
   *  grants this module to the user's role (dynamic sidebar from /auth/me). */
  moduleKey?: string;
}

export interface RoleNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  /** Roles allowed to see this item. Omitted = visible to every staff role. */
  allowedRoles?: StaffRole[];
  /** Backend feature flag key - if set, item is hidden when flag is disabled (ADMIN dynamic toggle). */
  featureKey?: string;
  /** Backend module key â€” when set, the item is hidden unless the backend
   *  grants this module to the user's role (dynamic sidebar from /auth/me). */
  moduleKey?: string;
  children?: RoleNavSubItem[];
}

export interface RoleNavGroup {
  group: string;
  items: RoleNavItem[];
}

const ALL: StaffRole[] = ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "HR_MANAGER", "TEACHER", "LIBRARIAN", "STAFF"];
const LEADERSHIP: StaffRole[] = ["ADMIN", "PRINCIPAL"];
const FINANCE: StaffRole[] = ["ADMIN", "ACCOUNTANT"];
// HR manages fee entries end-to-end (backend grants: prisma/seed.js HR_FEE_ALLOW).
const FINANCE_HR: StaffRole[] = ["ADMIN", "ACCOUNTANT", "HR_MANAGER"];
const PEOPLE: StaffRole[] = ["ADMIN", "PRINCIPAL", "HR_MANAGER"];
const ACADEMIC: StaffRole[] = ["ADMIN", "PRINCIPAL"];

export const ROLE_NAV_GROUPS: RoleNavGroup[] = [
  {
    group: "Core Management",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard, moduleKey: "dashboard" },
      {
        title: "Campus Branches",
        href: "/branches",
        icon: Building2,
        badge: "6 Active",
        allowedRoles: ["ADMIN"],
        moduleKey: "campuses",
      },
    ],
  },
  {
    group: "Academics & Faculty",
    items: [
      {
        title: "Admissions",
        href: "/admissions",
        icon: UserPlus,
        badge: "Pipeline",
        allowedRoles: [...LEADERSHIP, "HR_MANAGER"],
        moduleKey: "students",
      },
      {
        title: "Students",
        href: "/students",
        icon: GraduationCap,
        badge: "Roster",
        allowedRoles: [...LEADERSHIP, "ACCOUNTANT", "HR_MANAGER"],
        featureKey: "students",
        moduleKey: "students",
      },
      {
        title: "Teachers",
        href: "/teachers",
        icon: Users,
        badge: "Faculty",
        allowedRoles: [...PEOPLE, "TEACHER"],
        moduleKey: "staff",
      },
      {
        title: "Academics",
        href: "/academics",
        icon: Layers,
        allowedRoles: LEADERSHIP,
        featureKey: "academics",
        moduleKey: "academics",
        children: [
          { title: "Overview", href: "/academics", icon: LayoutDashboard, moduleKey: "academics" },
          { title: "Classes & Sections", href: "/academics?tab=classes", icon: Layers, moduleKey: "academics" },
          { title: "Subject Master", href: "/academics?tab=subjects", icon: BookMarked, moduleKey: "academics" },
          { title: "Chapters", href: "/academics?tab=chapters", icon: BookOpen, moduleKey: "academics" },
          { title: "Topics", href: "/academics?tab=topics", icon: ClipboardList, moduleKey: "academics" },
          { title: "Assign Subjects", href: "/academics?tab=mappings", icon: GraduationCap, moduleKey: "academics" },
        ],
      },
      {
        title: "Timetable",
        href: "/timetable",
        icon: CalendarDays,
        badge: "5",
        allowedRoles: LEADERSHIP,
        featureKey: "academics",
        moduleKey: "academics",
      },
      {
        title: "Homework",
        href: "/homework",
        icon: ClipboardList,
        badge: "5",
        allowedRoles: [...LEADERSHIP, "HR_MANAGER"],
      },
      {
        title: "Exams & Results",
        href: "/exams",
        icon: FileSpreadsheet,
        badge: "5",
        allowedRoles: ALL,
        children: [
          { title: "Exams", href: "/exams?tab=exams", icon: ClipboardList, allowedRoles: LEADERSHIP },
          { title: "Exam Schedule", href: "/exams?tab=timetable", icon: CalendarDays },
          { title: "Marks Entry", href: "/exams?tab=marks", icon: PenLine, allowedRoles: LEADERSHIP },
          { title: "Exam Types", href: "/exams?tab=exam-types", icon: FileText, allowedRoles: LEADERSHIP },
          { title: "Results", href: "/exams?tab=results", icon: GraduationCap },
          { title: "Report Cards", href: "/exams?tab=cards", icon: FileBadge },
          { title: "Publish Results", href: "/exams?tab=publish", icon: Send, allowedRoles: LEADERSHIP },
          { title: "Result Analytics", href: "/exams?tab=analytics", icon: BarChart3, allowedRoles: LEADERSHIP },
          { title: "Grading System", href: "/exams?tab=grading", icon: Award, allowedRoles: LEADERSHIP },
          { title: "Assessment Settings", href: "/exams?tab=assessment", icon: Settings2, allowedRoles: LEADERSHIP },
        ],
      },
      {
        title: "Library",
        href: "/library",
        icon: Library,
        badge: "8",
        allowedRoles: [...LEADERSHIP, "LIBRARIAN"],
      },
    ],
  },
  {
    group: "Staff Management",
    items: [
      {
        title: "School Staff",
        href: "/staff",
        icon: Briefcase,
        badge: "HR",
        allowedRoles: PEOPLE,
        moduleKey: "staff",
        children: [
          { title: "Dashboard", href: "/staff", icon: LayoutDashboard, moduleKey: "staff" },
          { title: "All Staff", href: "/staff?tab=list", icon: Users, moduleKey: "staff" },
          { title: "Add Staff", href: "/staff?tab=add", icon: UserPlus, moduleKey: "staff" },
          { title: "Attendance", href: "/staff?tab=attendance", icon: Fingerprint, moduleKey: "staff" },
          { title: "Leave", href: "/staff?tab=leave", icon: Calendar, moduleKey: "staff" },
          { title: "Payroll", href: "/staff?tab=payroll", icon: Receipt, moduleKey: "staff" },
          { title: "Documents", href: "/staff?tab=documents", icon: FileSpreadsheet, moduleKey: "staff" },
          { title: "Performance", href: "/staff?tab=performance", icon: Award, moduleKey: "staff" },
          { title: "Reports", href: "/staff?tab=reports", icon: BarChart3, moduleKey: "staff" },
        ],
      },
    ],
  },
  {
    group: "HR & Support Staff",
    items: [{ title: "HR / Staff Directory", href: "/hr", icon: Briefcase, badge: "HR", allowedRoles: PEOPLE, moduleKey: "staff" }],
  },
  {
    group: "Finance & Operations",
    items: [
      {
        title: "Fees & Collections",
        href: "/fees",
        icon: CreditCard,
        badge: "9",
        allowedRoles: [...FINANCE_HR, "PRINCIPAL"],
        featureKey: "fees",
        moduleKey: "fees",
      },
      {
        title: "Attendance & Biometric",
        href: "/attendance",
        icon: Fingerprint,
        badge: "Live",
        allowedRoles: [...PEOPLE, "ACCOUNTANT"],
        featureKey: "attendance",
        moduleKey: "attendance",
      },
      {
        title: "Transport & Fleet",
        href: "/transport",
        icon: Bus,
        badge: "5",
        allowedRoles: LEADERSHIP,
      },
      {
        title: "Expenses & Ledger",
        href: "/expenses",
        icon: Receipt,
        badge: "7",
        allowedRoles: [...FINANCE_HR, "PRINCIPAL"],
        moduleKey: "fees",
      },
      {
        title: "Payroll",
        href: "/payroll",
        icon: Briefcase,
        badge: "7",
        allowedRoles: [...FINANCE, "HR_MANAGER"],
        moduleKey: "staff",
      },
      {
        title: "Documents",
        href: "/documents",
        icon: FileSpreadsheet,
        badge: "7",
      },
    ],
  },
  {
    group: "Communication & Events",
    items: [
      { title: "Announcements", href: "/announcements", icon: Megaphone, badge: "6", featureKey: "broadcast", moduleKey: "notices" },
      { title: "Messages", href: "/messages", icon: MessageSquare, badge: "3" },
      {
        title: "Events Calendar",
        href: "/events",
        icon: Calendar,
        badge: "8",
        allowedRoles: [...LEADERSHIP, "HR_MANAGER"],
      },
    ],
  },
  {
    group: "Intelligence & Audit",
    items: [
      { title: "Reports & BI", href: "/reports", icon: BarChart3, badge: "7", featureKey: "admin_analytics", moduleKey: "analytics" },
      {
        title: "Audit Logs",
        href: "/audit",
        icon: ShieldAlert,
        badge: "10",
        allowedRoles: ["ADMIN"],
        moduleKey: "audit",
      },
    ],
  },
  {
    group: "System & DevOps",
    items: [
      { title: "Settings", href: "/settings", icon: Settings, allowedRoles: ["ADMIN"], moduleKey: "settings" },
      { title: "Admin Control", href: "/settings/admin", icon: ShieldAlert, badge: "Dynamic", allowedRoles: ["ADMIN"], featureKey: "admin_analytics", moduleKey: "settings" },
    ],
  },
];

/** Filter nav groups down to what `role` may see.
 *  - Role gate: `allowedRoles` (role-based, used always).
 *  - Dynamic module gate: when `allowedModules` (backend /auth/me sidebar) is
 *    provided, items with a `moduleKey` are only shown if the backend granted
 *    that module to the user's role. Without a sidebar (offline/demo) the
 *    role gate alone decides.
 *  - Unknown roles are NOT promoted to ADMIN â€” they get no navigation. */
export function getNavForRole(
  role: Role | StaffRole | undefined,
  opts?: { isFeatureEnabled?: (key: string) => boolean; allowedModules?: string[] }
): RoleNavGroup[] {
  if (!role) return ROLE_NAV_GROUPS;
  const knownRoles: StaffRole[] = ["ADMIN", "PRINCIPAL", "ACCOUNTANT", "HR_MANAGER", "TEACHER", "LIBRARIAN", "STAFF"];
  const staffRole = knownRoles.includes(role as StaffRole) ? (role as StaffRole) : null;
  if (!staffRole) return [];
  const isFeatureEnabled = opts?.isFeatureEnabled ?? (() => true);
  const allowedModules = opts?.allowedModules;
  const hasModuleGate = Array.isArray(allowedModules) && allowedModules.length > 0;
  const moduleAllowed = (moduleKey?: string) => {
    if (!moduleKey) return true;
    // HR is explicitly enabled on the frontend to access students
    if (staffRole === "HR_MANAGER" && moduleKey === "students") return true;
    if (!hasModuleGate) return true;
    return allowedModules.includes(moduleKey);
  };

  return ROLE_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .map((item) => {
        if (!item.children) return item;
        const filteredChildren = item.children.filter(
          (c) => (!c.allowedRoles || c.allowedRoles.includes(staffRole)) && moduleAllowed(c.moduleKey)
        );
        return { ...item, children: filteredChildren };
      })
      .filter((item) => {
        if (item.allowedRoles && !item.allowedRoles.includes(staffRole)) return false;
        if (!moduleAllowed(item.moduleKey)) return false;
        if (item.featureKey && !isFeatureEnabled(item.featureKey)) return false;
        return true;
      }),
  })).filter((group) => group.items.length > 0);
}

/** First route a role is allowed to visit â€” used after login redirects. */
export function getLandingPageForRole(
  role: Role | StaffRole | undefined,
  opts?: { isFeatureEnabled?: (key: string) => boolean; allowedModules?: string[] }
): string {
  const nav = getNavForRole(role, opts);
  // Librarians land on their workspace, not the generic dashboard.
  if ((role as string) === "LIBRARIAN") {
    const hasLibrary = nav.some((group) =>
      group.items.some((item) => item.href.split("?")[0] === "/library")
    );
    if (hasLibrary) return "/library";
  }
  return nav[0]?.items[0]?.href ?? "/";
}

/** Guard helper — is `role` allowed to visit `pathname`? */
export function canRoleAccessPath(
  role: Role | StaffRole | undefined,
  pathname: string,
  opts?: { isFeatureEnabled?: (key: string) => boolean; allowedModules?: string[] }
): boolean {
  if (!pathname || pathname === "/login") return true;
  const nav = getNavForRole(role, opts);
  const cleanPath = pathname.split("?")[0];

  const ROUTE_ALIASES: Record<string, string[]> = {
    "/academics": ["/classes", "/subjects", "/academics"],
    "/students": ["/admissions"],
    "/admissions": ["/students"],
    "/teachers": ["/staff", "/teachers"],
    "/hr": ["/staff", "/hr"],
    "/staff": ["/staff", "/teachers", "/hr"],
  };

  const matchesPath = (base: string) => {
    if (base === "/") return cleanPath === "/";
    if (cleanPath === base || cleanPath.startsWith(base + "/")) return true;
    const aliases = ROUTE_ALIASES[base];
    if (aliases && aliases.some((a) => cleanPath === a || cleanPath.startsWith(a + "/"))) return true;
    return false;
  };

  return nav.some((group) =>
    group.items.some((item) => {
      const base = item.href.split("?")[0];
      if (matchesPath(base)) return true;
      if (item.children) return item.children.some((c) => matchesPath(c.href.split("?")[0]));
      return false;
    })
  );
}


