"use client";

/**
 * Fee Collection business logic — single source of truth.
 * Spec §3 Core Formula: Due = Assigned - Discount - TotalPaid
 * Spec §6: overdue >15 days, receipt RCP-YYYY-XXXXX, late fee optional
 */

import type { FeeAssignment, FeePaymentStatus, PaymentRecord } from "@/types";

// ---------------------------------------------------------------------------
// Core formula
// ---------------------------------------------------------------------------
export function calculateDueAmount(assigned: number, discount: number, totalPaid: number): number {
  return Math.max(0, assigned - (discount ?? 0) - (totalPaid ?? 0));
}

export function calculateDueWithLateFee(
  assigned: number,
  discount: number,
  totalPaid: number,
  lateFee: number
): number {
  return Math.max(0, assigned - (discount ?? 0) - (totalPaid ?? 0) + (lateFee ?? 0));
}

// Sum multiple partial payments for same fee head
export function sumPaymentsForHead(payments: PaymentRecord[], feeHeadId?: string): number {
  if (!feeHeadId) return payments.reduce((s, p) => s + p.amount, 0);
  return payments
    .filter((p) => !p.feeHeadIds || p.feeHeadIds.length === 0 || p.feeHeadIds.includes(feeHeadId))
    .reduce((s, p) => s + p.amount, 0);
}

// ---------------------------------------------------------------------------
// Overdue logic: if due date passed by more than 15 days -> OVERDUE
// ---------------------------------------------------------------------------
export function daysOverdue(dueDate: string, now: Date = new Date()): number {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return 0;
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function isOverdue(dueDate: string, now: Date = new Date()): boolean {
  return daysOverdue(dueDate, now) > 15;
}

export function getOverdueAmount(assignment: FeeAssignment, now: Date = new Date()): number {
  if (!isOverdue(assignment.dueDate, now)) return 0;
  // Overdue amount is the pending due amount when overdue
  return calculateDueAmount(assignment.totalAssigned, assignment.discount ?? 0, assignment.totalPaid) + (assignment.lateFee ?? 0);
}

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------
export function deriveFeeStatus(
  assigned: number,
  discount: number,
  totalPaid: number,
  dueDate: string,
  lateFee: number = 0,
  now: Date = new Date()
): FeePaymentStatus {
  const due = calculateDueAmount(assigned, discount, totalPaid) + (lateFee ?? 0);
  if (due <= 0) return "PAID";
  if (isOverdue(dueDate, now)) return "OVERDUE";
  if (totalPaid > 0) return "PARTIAL";
  return "PENDING";
}

export function statusBadgeVariant(status: FeePaymentStatus): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "PAID":
      return "success"; // Green
    case "PARTIAL":
      return "warning"; // Amber
    case "OVERDUE":
      return "destructive"; // Red
    case "PENDING":
      return "secondary";
    default:
      return "secondary";
  }
}

// ---------------------------------------------------------------------------
// Receipt numbering: RCP-{year}-{5-digit-number} sequential unique
// ---------------------------------------------------------------------------
const RECEIPT_COUNTER_KEY = "school_erp_receipt_counter_v1";

export function generateReceiptNumber(now: Date = new Date()): string {
  const year = now.getFullYear();
  let counter = 1;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(RECEIPT_COUNTER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        counter = (parsed[year] ?? 0) + 1;
        parsed[year] = counter;
        localStorage.setItem(RECEIPT_COUNTER_KEY, JSON.stringify(parsed));
      } else {
        const obj: Record<string, number> = { [year]: 1 };
        localStorage.setItem(RECEIPT_COUNTER_KEY, JSON.stringify(obj));
        counter = 1;
      }
    } catch {
      counter = Math.floor(Math.random() * 90000) + 10000;
    }
  }
  return `RCP-${year}-${String(counter).padStart(5, "0")}`;
}

export function peekNextReceiptNumber(now: Date = new Date()): string {
  const year = now.getFullYear();
  let counter = 1;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(RECEIPT_COUNTER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, number>;
        counter = (parsed[year] ?? 0) + 1;
      }
    } catch {
      counter = 1;
    }
  }
  return `RCP-${year}-${String(counter).padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
// Late fee helper (fixed or percentage)
// ---------------------------------------------------------------------------
export function computeLateFee(baseDue: number, fixedAmount?: number, percent?: number): number {
  if (fixedAmount !== undefined && fixedAmount > 0) return fixedAmount;
  if (percent !== undefined && percent > 0) return Math.round((baseDue * percent) / 100);
  return 0;
}

// ---------------------------------------------------------------------------
// Search spec §4: three patterns
//  - pure numbers => admission number
//  - "10-A" / "10 A" => Class + Section
//  - else => student name partial
// ---------------------------------------------------------------------------
export type FeeSearchKind = "ADMISSION_NUMBER" | "CLASS_SECTION" | "NAME";

export function detectFeeSearchKind(input: string): FeeSearchKind {
  const trimmed = input.trim();
  if (trimmed === "") return "NAME";
  // Pure numbers (allow optional ADM- prefix? spec says pure numbers)
  if (/^\d+$/.test(trimmed)) return "ADMISSION_NUMBER";
  // Allow admission pattern like ADM-... or STU-... to be admission search as well
  if (/^(ADM|STU)[-\s]?\d+/i.test(trimmed)) return "ADMISSION_NUMBER";
  // Class-Section pattern: e.g. "10-A", "10 A", "Grade 10-A", "10 - A", "B.Tech CSE — Sem 5"
  // Heuristic: contains hyphen or space separating class and section single char / word
  if (/^\d+\s*[-\s]\s*[A-Za-z0-9]+$/.test(trimmed) || /^[A-Za-z]+\s*\d*\s*[-\s]\s*[A-Za-z0-9]+$/.test(trimmed)) {
    return "CLASS_SECTION";
  }
  // If input contains a dash and looks like class-section
  if (trimmed.includes("-") && trimmed.split("-").length === 2) {
    const parts = trimmed.split("-").map((p) => p.trim());
    if (parts[0].length > 0 && parts[1].length > 0 && parts[1].length <= 4) return "CLASS_SECTION";
  }
  return "NAME";
}

export function matchesFeeSearch(
  student: { fullName: string; admissionNumber: string; rollNumber: string; className: string; sectionName: string },
  rawInput: string
): boolean {
  const q = rawInput.trim().toLowerCase();
  if (q.length < 2) return false;
  const kind = detectFeeSearchKind(rawInput);
  if (kind === "ADMISSION_NUMBER") {
    // pure numbers: match admission number digits
    const digits = q.replace(/\D/g, "");
    return (
      student.admissionNumber.toLowerCase().includes(q) ||
      student.admissionNumber.toLowerCase().includes(digits) ||
      student.rollNumber.toLowerCase().includes(q)
    );
  }
  if (kind === "CLASS_SECTION") {
    // normalize: "10-A" and "10 A" both => check className + sectionName
    const normalized = q.replace(/\s+/g, " ").replace(/\s*-\s*/g, "-").replace(/\s+/g, "-").toLowerCase();
    const classSection = `${student.className} ${student.sectionName}`.toLowerCase();
    const classSectionDash = `${student.className}-${student.sectionName}`.toLowerCase();
    // also handle section letter alone e.g. "A" or "10-A"
    return (
      classSection.includes(q) ||
      classSectionDash.includes(normalized) ||
      classSection.replace(/\s+/g, "-").includes(normalized) ||
      q.split(/[-\s]+/).every((part) => classSection.includes(part))
    );
  }
  // NAME: partial case-insensitive
  return student.fullName.toLowerCase().includes(q);
}
