import type { TransportFeeSlab, StudentTransportAssignment } from "@/types";

/** Config flag — when false, transport fee not auto-added (optional vs mandatory) */
export const TRANSPORT_FEE_ENABLED = true;

/** Fee head id used for transport in Fee Collection */
export const TRANSPORT_FEE_HEAD_ID = "fh-04";

export function getSlabForDistance(km: number, slabs: TransportFeeSlab[]): TransportFeeSlab | undefined {
  return slabs.find((s) => s.isActive && km >= s.minDistance && km < s.maxDistance);
}

export function getSlabForZone(zone: "A" | "B" | "C" | "D", slabs: TransportFeeSlab[]): TransportFeeSlab | undefined {
  return slabs.find((s) => s.isActive && s.zone === zone);
}

/**
 * Prorated billing — mid-session join. Exact day-based.
 * Example: fee 1200, joined 2026-08-18 (13 days left in 31-day Aug) => 1200*13/31 ≈ 503
 */
export function proratedFee(fullFee: number, effectiveFrom: string): number {
  const d = new Date(effectiveFrom);
  if (isNaN(d.getTime())) return fullFee;
  const year = d.getFullYear();
  const month = d.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const remaining = daysInMonth - d.getDate() + 1;
  return Math.round((fullFee * remaining) / daysInMonth);
}

/** Display helper for fee breakdown */
export function transportFeeBreakdown(a: StudentTransportAssignment) {
  if (a.isProrated && a.proratedFee !== undefined) {
    return { label: `Prorated (${a.effectiveFrom})`, amount: a.proratedFee, full: a.feePerMonth };
  }
  return { label: a.shift === "BOTH" ? "Full month (both shifts)" : `${a.shift} shift`, amount: a.feePerMonth, full: a.feePerMonth };
}

/** Check capacity before assignment */
export function canAssignToRoute(routeStudentCount: number, capacity: number): boolean {
  return routeStudentCount < capacity;
}

/** Refund on cancellation — remaining months of session (assume session ends Mar 31) */
export function refundOnCancellation(feePerMonth: number, cancelledDate: string, sessionEnd = "2027-03-31"): number {
  const c = new Date(cancelledDate);
  const end = new Date(sessionEnd);
  if (c >= end) return 0;
  const monthsRemaining = (end.getFullYear() - c.getFullYear()) * 12 + (end.getMonth() - c.getMonth());
  // prorate current month remainder
  const daysInMonth = new Date(c.getFullYear(), c.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - c.getDate() + 1;
  const proratedCurrent = Math.round((feePerMonth * remainingDays) / daysInMonth);
  const fullMonths = Math.max(0, monthsRemaining - 1);
  return proratedCurrent + fullMonths * feePerMonth;
}
