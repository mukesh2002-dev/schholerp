"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useERP } from "@/components/providers/erp-provider";

const routeLabels: Record<string, string> = {
  branches: "Campus Branches",
  admissions: "Admissions",
  students: "Students",
  classes: "Classes & Sections",
  teachers: "Faculty & Teachers",
  staff: "HR & Staff",
  workers: "Worker Management",
  fees: "Fees & Finance",
  attendance: "Attendance & Biometric",
  transport: "Transport & Fleet",
  timetable: "Timetable",
  homework: "Homework",
  exams: "Exams & Results",
  announcements: "Announcements",
  messages: "Messages",
  notifications: "Notifications",
  events: "Events Calendar",
  inventory: "Inventory & Stock",
  expenses: "Expenses & Ledger",
  payroll: "Payroll",
  documents: "Documents",
  reports: "Reports & Analytics",
  qa: "QA & Bug Tracker",
  builds: "Builds",
  deployments: "Deployments",
  audit: "Audit Logs",
  engineering: "Engineering Dashboard",
  bugs: "Bug Tracker",
  "test-cases": "Test Cases",
  "test-plans": "Test Plans",
  "test-suites": "Test Suites",
  settings: "Settings",
  login: "Sign In",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const { branches } = useERP();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center space-x-1 text-xs text-muted-foreground mb-4">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        // Check if segment is a branch ID
        const branchMatch = branches.find((b) => b.id === segment);
        const label = branchMatch
          ? branchMatch.name
          : routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-foreground truncate max-w-[200px]">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors font-medium">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
