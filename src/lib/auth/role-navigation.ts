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
  Package,
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
import { StaffRole } from "./demo-accounts";

export interface RoleNavSubItem {
  title: string;
  href: string;
  icon?: React.ElementType;
  badge?: string;
  allowedRoles?: StaffRole[];
}

export interface RoleNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  /** Roles allowed to see this item. Omitted = visible to every staff role. */
  allowedRoles?: StaffRole[];
  children?: RoleNavSubItem[];
}

export interface RoleNavGroup {
  group: string;
  items: RoleNavItem[];
}

const ALL: StaffRole[] = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT", "HR_MANAGER"];
const LEADERSHIP: StaffRole[] = ["SUPER_ADMIN", "PRINCIPAL"];
const FINANCE: StaffRole[] = ["SUPER_ADMIN", "ACCOUNTANT"];
const PEOPLE: StaffRole[] = ["SUPER_ADMIN", "PRINCIPAL", "HR_MANAGER"];
const ACADEMIC: StaffRole[] = ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"];
const LEARNER: StaffRole[] = ["STUDENT", "PARENT"];

export const ROLE_NAV_GROUPS: RoleNavGroup[] = [
  {
    group: "Core Management",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        title: "Campus Branches",
        href: "/branches",
        icon: Building2,
        badge: "6 Active",
        allowedRoles: LEADERSHIP,
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
        allowedRoles: LEADERSHIP,
      },
      {
        title: "Students",
        href: "/students",
        icon: GraduationCap,
        badge: "Roster",
        allowedRoles: [...LEADERSHIP, "ACCOUNTANT"],
      },
      {
        title: "Classes & Sections",
        href: "/classes",
        icon: BookOpen,
        allowedRoles: LEADERSHIP,
        children: [
          { title: "All Classes", href: "/classes", icon: BookOpen },
          { title: "Subjects & Topics", href: "/subjects", icon: Layers },
        ],
      },
      {
        title: "Faculty / Teachers",
        href: "/teachers",
        icon: Users,
        allowedRoles: PEOPLE,
      },
      {
        title: "Timetable",
        href: "/timetable",
        icon: CalendarDays,
        badge: "5",
        allowedRoles: LEADERSHIP,
      },
      {
        title: "Homework",
        href: "/homework",
        icon: ClipboardList,
        badge: "5",
        allowedRoles: LEADERSHIP,
      },
      {
        title: "Exams & Results",
        href: "/exams",
        icon: FileSpreadsheet,
        badge: "5",
        allowedRoles: [...LEADERSHIP, "TEACHER", "STUDENT", "PARENT"] as StaffRole[],
        children: [
          { title: "Exams", href: "/exams?tab=exams", icon: ClipboardList, allowedRoles: [...LEADERSHIP, "TEACHER"] as StaffRole[] },
          { title: "Exam Schedule", href: "/exams?tab=timetable", icon: CalendarDays },
          { title: "Marks Entry", href: "/exams?tab=marks", icon: PenLine, allowedRoles: [...LEADERSHIP, "TEACHER"] as StaffRole[] },
          { title: "Exam Types", href: "/exams?tab=exam-types", icon: FileText, allowedRoles: [...LEADERSHIP] as StaffRole[] },
          { title: "Results", href: "/exams?tab=results", icon: GraduationCap },
          { title: "Report Cards", href: "/exams?tab=cards", icon: FileBadge },
          { title: "Publish Results", href: "/exams?tab=publish", icon: Send, allowedRoles: [...LEADERSHIP] as StaffRole[] },
          { title: "Result Analytics", href: "/exams?tab=analytics", icon: BarChart3, allowedRoles: [...LEADERSHIP] as StaffRole[] },
          { title: "Grading System", href: "/exams?tab=grading", icon: Award, allowedRoles: [...LEADERSHIP] as StaffRole[] },
          { title: "Assessment Settings", href: "/exams?tab=assessment", icon: Settings2, allowedRoles: [...LEADERSHIP] as StaffRole[] },
        ],
      },
      {
        title: "Library",
        href: "/library",
        icon: Library,
        badge: "8",
        allowedRoles: LEADERSHIP,
      },
    ],
  },
  {
    group: "HR & Support Staff",
    items: [
      { title: "HR / Staff Directory", href: "/hr", icon: Briefcase, badge: "HR", allowedRoles: PEOPLE },
    ],
  },
  {
    group: "Finance & Operations",
    items: [
      {
        title: "Fees & Collections",
        href: "/fees",
        icon: CreditCard,
        badge: "9",
        allowedRoles: [...FINANCE, "PRINCIPAL"],
      },
      {
        title: "Attendance & Biometric",
        href: "/attendance",
        icon: Fingerprint,
        badge: "Live",
        allowedRoles: [...PEOPLE, "ACCOUNTANT"],
      },
      {
        title: "Transport & Fleet",
        href: "/transport",
        icon: Bus,
        badge: "5",
        allowedRoles: LEADERSHIP,
      },
      {
        title: "Inventory & Stock",
        href: "/inventory",
        icon: Package,
        badge: "7",
        allowedRoles: ALL,
      },
      {
        title: "Expenses & Ledger",
        href: "/expenses",
        icon: Receipt,
        badge: "7",
        allowedRoles: [...FINANCE, "PRINCIPAL"],
      },
      {
        title: "Payroll",
        href: "/payroll",
        icon: Briefcase,
        badge: "7",
        allowedRoles: [...FINANCE, "HR_MANAGER"],
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
      { title: "Announcements", href: "/announcements", icon: Megaphone, badge: "6" },
      { title: "Messages", href: "/messages", icon: MessageSquare, badge: "3" },
      {
        title: "Events Calendar",
        href: "/events",
        icon: Calendar,
        badge: "8",
        allowedRoles: [...LEADERSHIP, "HR_MANAGER"],
      },
      {
        title: "Parent Portal",
        href: "/parents",
        icon: Heart,
        badge: "Live",
        allowedRoles: LEADERSHIP,
      },
    ],
  },
  {
    group: "Intelligence & Audit",
    items: [
      { title: "Reports & BI", href: "/reports", icon: BarChart3, badge: "7" },
      {
        title: "Audit Logs",
        href: "/audit",
        icon: ShieldAlert,
        badge: "10",
        allowedRoles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    group: "System & DevOps",
    items: [{ title: "Settings", href: "/settings", icon: Settings, allowedRoles: ["SUPER_ADMIN"] }],
  },
];

/** Filter nav groups down to what `role` may see. Unknown roles fall back to full access. */
export function getNavForRole(role: Role | StaffRole | undefined): RoleNavGroup[] {
  if (!role) return ROLE_NAV_GROUPS;
  const knownRoles: StaffRole[] = ["SUPER_ADMIN", "PRINCIPAL", "ACCOUNTANT", "HR_MANAGER", "TEACHER", "STUDENT", "PARENT"];
  const staffRole = knownRoles.includes(role as StaffRole) ? (role as StaffRole) : "SUPER_ADMIN";

  // Student/Parent see Dashboard + Exams & Results (filtered)
  if (staffRole === "STUDENT" || staffRole === "PARENT") {
    return [
      { group: "Core Management", items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }] },
      {
        group: "Academics",
        items: [
          {
            title: "Exams & Results",
            href: "/exams",
            icon: FileSpreadsheet,
            badge: "My Results",
            children: [
              { title: "Exam Schedule", href: "/exams?tab=timetable", icon: CalendarDays },
              { title: "Results", href: "/exams?tab=results", icon: GraduationCap },
              { title: "Report Cards", href: "/exams?tab=cards", icon: FileBadge },
            ],
          },
        ],
      },
    ];
  }
  if (staffRole === "TEACHER") {
    return [
      { group: "Core Management", items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }] },
      {
        group: "Academics & Faculty",
        items: [
          {
            title: "Exams & Results",
            href: "/exams",
            icon: FileSpreadsheet,
            badge: "Enter Marks",
            children: [
              { title: "Exams", href: "/exams?tab=exams", icon: ClipboardList },
              { title: "Exam Schedule", href: "/exams?tab=timetable", icon: CalendarDays },
              { title: "Marks Entry", href: "/exams?tab=marks", icon: PenLine },
              { title: "Exam Types", href: "/exams?tab=exam-types", icon: FileText },
              { title: "Results", href: "/exams?tab=results", icon: GraduationCap },
              { title: "Report Cards", href: "/exams?tab=cards", icon: FileBadge },
            ],
          },
          { title: "Timetable", href: "/timetable", icon: CalendarDays },
          { title: "Homework", href: "/homework", icon: ClipboardList },
        ],
      },
    ];
  }

  return ROLE_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (!item.children) return item;
      const filteredChildren = item.children.filter((c) => !c.allowedRoles || c.allowedRoles.includes(staffRole));
      return { ...item, children: filteredChildren };
    }).filter((item) => !item.allowedRoles || item.allowedRoles.includes(staffRole)),
  })).filter((group) => group.items.length > 0);
}

/** First route a role is allowed to visit — used after login redirects. */
export function getLandingPageForRole(role: Role | StaffRole | undefined): string {
  const nav = getNavForRole(role);
  return nav[0]?.items[0]?.href ?? "/";
}

/** Guard helper — is `role` allowed to visit `pathname`? */
export function canRoleAccessPath(role: Role | StaffRole | undefined, pathname: string): boolean {
  if (!pathname || pathname === "/login") return true;
  const nav = getNavForRole(role);
  const cleanPath = pathname.split("?")[0];
  return nav.some((group) =>
    group.items.some((item) => {
      const base = item.href.split("?")[0];
      if (base === "/" ? cleanPath === "/" : cleanPath === base || cleanPath.startsWith(base + "/")) return true;
      if (item.children) return item.children.some((c) => cleanPath === c.href.split("?")[0]);
      return false;
    })
  );
}
