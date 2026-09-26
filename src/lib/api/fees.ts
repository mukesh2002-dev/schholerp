"use client";
import { apiFetch } from "./client";

export interface BackendFeeStructure { uuid: string; name: string; amount: string | number; frequency?: string; classId?: string | null }
export interface BackendInvoice { uuid: string; invoiceNumber: string; amount: string | number; paidAmount: string | number; status: string; dueDate?: string }
export interface BackendPayment { uuid: string; receiptNumber: string; amount: string | number; paymentMethod?: string }

export async function fetchFeeStructures(params: { campusId?: string | null } = {}): Promise<BackendFeeStructure[]> {
  const res = await apiFetch<{ data: BackendFeeStructure[] }>(`/fees/structures`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchInvoices(params: { campusId?: string | null; status?: string; studentId?: string } = {}): Promise<BackendInvoice[]> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.studentId) q.set("studentId", params.studentId);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendInvoice[] }>(`/fees/invoices${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchFeeCollectionReport(params: { campusId?: string | null } = {}): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/reports/collection`, {}, { campusId: params.campusId ?? undefined });
  return res.data ?? null;
}

export async function recordPaymentApi(payload: {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionRef?: string;
  campusId?: string | null;
}): Promise<BackendPayment> {
  const res = await apiFetch<{ data: BackendPayment }>(
    `/fees/payments`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: payload.campusId ?? undefined }
  );
  return res.data;
}

export async function createFeeStructureApi(payload: Record<string, unknown>, campusId?: string | null): Promise<BackendFeeStructure> {
  const res = await apiFetch<{ data: BackendFeeStructure }>(
    `/fees/structures`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export interface BackendAssignment {
  uuid: string;
  status: string;
  totalAssigned: string | number;
  discount?: string | number;
  dueDate?: string;
  student?: { uuid: string; admissionNo: string; firstName: string; lastName: string };
  structure?: { uuid: string; name: string };
}

export async function fetchAssignments(params: { campusId?: string | null; studentId?: string; status?: string } = {}): Promise<BackendAssignment[]> {
  const q = new URLSearchParams();
  if (params.studentId) { q.set("studentId", params.studentId); }
  if (params.status) { q.set("status", params.status); }
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendAssignment[] }>(`/fees/assignments${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAssignmentApi(
  payload: { studentId: string; structureId: string; classId?: string; discount?: number; discountReason?: string; dueDate: string },
  campusId?: string | null
): Promise<BackendAssignment> {
  const res = await apiFetch<{ data: BackendAssignment }>(
    `/fees/assignments`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function generateInvoiceApi(assignmentId: string, campusId?: string | null): Promise<BackendInvoice> {
  const res = await apiFetch<{ data: BackendInvoice }>(
    `/fees/invoices/generate`,
    { method: "POST", body: JSON.stringify({ assignmentId }) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function createInvoiceApi(
  payload: { studentId: string; feeStructureId?: string; amount: number; dueDate: string },
  campusId?: string | null
): Promise<BackendInvoice> {
  const res = await apiFetch<{ data: BackendInvoice }>(
    `/fees/invoices`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function cancelInvoiceApi(uuid: string, reason: string): Promise<BackendInvoice> {
  const res = await apiFetch<{ data: BackendInvoice }>(`/fees/invoices/${uuid}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res.data;
}

export async function fetchStudentLedger(params: {
  studentId: string;
  campusId?: string | null;
  from?: string;
  to?: string;
}): Promise<any> {
  const q = new URLSearchParams({ studentId: params.studentId });
  if (params.from) { q.set("from", params.from); }
  if (params.to) { q.set("to", params.to); }
  const res = await apiFetch<{ data: any }>(`/fees/ledger?${q.toString()}`, {}, { campusId: params.campusId ?? undefined });
  return res.data ?? null;
}

export async function fetchDefaulters(params: { campusId?: string | null; asOf?: string } = {}): Promise<any[]> {
  const q = new URLSearchParams();
  if (params.asOf) { q.set("asOf", params.asOf); }
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: any[] }>(`/fees/reports/defaulter${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}
