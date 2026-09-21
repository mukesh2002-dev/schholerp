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
