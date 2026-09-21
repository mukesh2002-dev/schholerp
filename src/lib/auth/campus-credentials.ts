"use client";

export interface CampusAccount {
  name: string;
  roleLabel: string;
  email: string;
  campusCode: "GLOBAL" | "MAIN" | "C1" | "C2" | "C3";
  campusName: string;
  category: "Admin" | "Principal" | "HR" | "Accountant" | "Librarian" | "Teacher";
  badgeColor?: string;
}

export const UNIVERSAL_PASSWORD = "Mukesh@1234";

export const CAMPUS_TABS = [
  { id: "MAIN", label: "Main Campus", city: "Pune", code: "MAIN", icon: "🏫" },
  { id: "C1", label: "Campus-1", city: "Mumbai", code: "C1", icon: "🏙️" },
  { id: "C2", label: "Campus-2", city: "Nagpur", code: "C2", icon: "🌳" },
  { id: "C3", label: "Campus-3", city: "Nashik", code: "C3", icon: "🍇" },
  { id: "GLOBAL", label: "School Admin", city: "All Campuses", code: "GLOBAL", icon: "🛡️" },
] as const;

export const CAMPUS_ACCOUNTS: CampusAccount[] = [
  // ── Global / School Administrators (Super admin panel is separate) ──
  {
    name: "School Admin",
    roleLabel: "School Admin",
    email: "admin@school.local",
    campusCode: "GLOBAL",
    campusName: "All Campuses (School Admin)",
    category: "Admin",
  },
  {
    name: "Ops Admin",
    roleLabel: "Operations Admin",
    email: "ops.admin@test.local",
    campusCode: "GLOBAL",
    campusName: "All Campuses (Ops Admin)",
    category: "Admin",
  },

  // ── Main Campus (Pune, Maharashtra — Code: MAIN) ─────────────────────
  {
    name: "Dr. Suresh Patil",
    roleLabel: "Principal",
    email: "principal.main@school.local",
    campusCode: "MAIN",
    campusName: "Main Campus (Pune)",
    category: "Principal",
  },
  {
    name: "Kavita Deshmukh",
    roleLabel: "HR Manager",
    email: "hr.main@school.local",
    campusCode: "MAIN",
    campusName: "Main Campus (Pune)",
    category: "HR",
  },
  {
    name: "Ramesh Joshi",
    roleLabel: "Accountant",
    email: "accountant.main@school.local",
    campusCode: "MAIN",
    campusName: "Main Campus (Pune)",
    category: "Accountant",
  },
  {
    name: "Anita Kulkarni",
    roleLabel: "Librarian",
    email: "librarian.main@school.local",
    campusCode: "MAIN",
    campusName: "Main Campus (Pune)",
    category: "Librarian",
  },
  {
    name: "Prakash Mehta",
    roleLabel: "Teacher 1",
    email: "teacher1.main@school.local",
    campusCode: "MAIN",
    campusName: "Main Campus (Pune)",
    category: "Teacher",
  },
  {
    name: "Sunita Rao",
    roleLabel: "Teacher 2",
    email: "teacher2.main@school.local",
    campusCode: "MAIN",
    campusName: "Main Campus (Pune)",
    category: "Teacher",
  },

  // ── Campus-1 (Mumbai, Maharashtra — Code: C1) ────────────────────────
  {
    name: "Dr. Rajendra Sharma",
    roleLabel: "Principal",
    email: "principal.c1@school.local",
    campusCode: "C1",
    campusName: "Campus-1 (Mumbai)",
    category: "Principal",
  },
  {
    name: "Pooja Singh",
    roleLabel: "HR Manager",
    email: "hr.c1@school.local",
    campusCode: "C1",
    campusName: "Campus-1 (Mumbai)",
    category: "HR",
  },
  {
    name: "Vikram Gupta",
    roleLabel: "Accountant",
    email: "accountant.c1@school.local",
    campusCode: "C1",
    campusName: "Campus-1 (Mumbai)",
    category: "Accountant",
  },
  {
    name: "Meena Verma",
    roleLabel: "Librarian",
    email: "librarian.c1@school.local",
    campusCode: "C1",
    campusName: "Campus-1 (Mumbai)",
    category: "Librarian",
  },
  {
    name: "Anil Kumar",
    roleLabel: "Teacher 1",
    email: "teacher1.c1@school.local",
    campusCode: "C1",
    campusName: "Campus-1 (Mumbai)",
    category: "Teacher",
  },
  {
    name: "Deepa Nair",
    roleLabel: "Teacher 2",
    email: "teacher2.c1@school.local",
    campusCode: "C1",
    campusName: "Campus-1 (Mumbai)",
    category: "Teacher",
  },

  // ── Campus-2 (Nagpur, Maharashtra — Code: C2) ────────────────────────
  {
    name: "Mrs. Lalitha Krishnan",
    roleLabel: "Principal",
    email: "principal.c2@school.local",
    campusCode: "C2",
    campusName: "Campus-2 (Nagpur)",
    category: "Principal",
  },
  {
    name: "Sanjay Patel",
    roleLabel: "HR Manager",
    email: "hr.c2@school.local",
    campusCode: "C2",
    campusName: "Campus-2 (Nagpur)",
    category: "HR",
  },
  {
    name: "Priya Iyer",
    roleLabel: "Accountant",
    email: "accountant.c2@school.local",
    campusCode: "C2",
    campusName: "Campus-2 (Nagpur)",
    category: "Accountant",
  },
  {
    name: "Suresh Bhat",
    roleLabel: "Librarian",
    email: "librarian.c2@school.local",
    campusCode: "C2",
    campusName: "Campus-2 (Nagpur)",
    category: "Librarian",
  },
  {
    name: "Rekha Shah",
    roleLabel: "Teacher 1",
    email: "teacher1.c2@school.local",
    campusCode: "C2",
    campusName: "Campus-2 (Nagpur)",
    category: "Teacher",
  },
  {
    name: "Mohan Tiwari",
    roleLabel: "Teacher 2",
    email: "teacher2.c2@school.local",
    campusCode: "C2",
    campusName: "Campus-2 (Nagpur)",
    category: "Teacher",
  },

  // ── Campus-3 (Nashik, Maharashtra — Code: C3) ────────────────────────
  {
    name: "Mr. Ajay Kapoor",
    roleLabel: "Principal",
    email: "principal.c3@school.local",
    campusCode: "C3",
    campusName: "Campus-3 (Nashik)",
    category: "Principal",
  },
  {
    name: "Usha Menon",
    roleLabel: "HR Manager",
    email: "hr.c3@school.local",
    campusCode: "C3",
    campusName: "Campus-3 (Nashik)",
    category: "HR",
  },
  {
    name: "Dinesh Yadav",
    roleLabel: "Accountant",
    email: "accountant.c3@school.local",
    campusCode: "C3",
    campusName: "Campus-3 (Nashik)",
    category: "Accountant",
  },
  {
    name: "Ritu Agarwal",
    roleLabel: "Librarian",
    email: "librarian.c3@school.local",
    campusCode: "C3",
    campusName: "Campus-3 (Nashik)",
    category: "Librarian",
  },
  {
    name: "Harish Pandey",
    roleLabel: "Teacher 1",
    email: "teacher1.c3@school.local",
    campusCode: "C3",
    campusName: "Campus-3 (Nashik)",
    category: "Teacher",
  },
  {
    name: "Smita Jadhav",
    roleLabel: "Teacher 2",
    email: "teacher2.c3@school.local",
    campusCode: "C3",
    campusName: "Campus-3 (Nashik)",
    category: "Teacher",
  },
];

export function getAccountsByCampus(campusCode: string): CampusAccount[] {
  return CAMPUS_ACCOUNTS.filter((a) => a.campusCode === campusCode);
}
