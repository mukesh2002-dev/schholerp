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
  payload: { studentId: string; structureId: string; classId?: string; academicYearId?: string; discount?: number; discountType?: string; discountReason?: string; concessionCategory?: string; dueDate: string },
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

// ---------------------------------------------------------------------------
// Fee heads (full CRUD)
// ---------------------------------------------------------------------------

export interface BackendFeeHead {
  uuid: string;
  name: string;
  description?: string | null;
  category: string;
  isMandatory?: boolean;
  isRecurring?: boolean;
  color?: string | null;
}

export async function fetchFeeHeads(): Promise<BackendFeeHead[]> {
  const res = await apiFetch<{ data: BackendFeeHead[] }>(`/fees/heads`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createFeeHeadApi(payload: {
  name: string;
  category: string;
  description?: string;
  isMandatory?: boolean;
  isRecurring?: boolean;
  color?: string;
}): Promise<BackendFeeHead> {
  const res = await apiFetch<{ data: BackendFeeHead }>(`/fees/heads`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateFeeHeadApi(uuid: string, payload: Partial<BackendFeeHead>): Promise<BackendFeeHead> {
  const res = await apiFetch<{ data: BackendFeeHead }>(`/fees/heads/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteFeeHeadApi(uuid: string): Promise<void> {
  await apiFetch(`/fees/heads/${uuid}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Fee structures (detail / update / items / rollover / delete)
// ---------------------------------------------------------------------------

export interface BackendStructureItem {
  uuid: string;
  feeHeadId?: string | number | null;
  feeHead?: { uuid: string; name: string; category: string } | null;
  amount: string | number;
  frequency?: string;
  billingMonths?: number[];
  billingTerms?: string[];
  isNewStudentOnly?: boolean;
}

export interface BackendFeeStructureDetail extends BackendFeeStructure {
  uuid: string;
  class?: { uuid: string; name: string; section?: string | null } | null;
  section?: { uuid: string; name: string } | null;
  academicYear?: { uuid: string; name: string } | null;
  campus?: { uuid: string; name: string; code?: string } | null;
  dueDay?: number | null;
  structureItems?: BackendStructureItem[];
}

export async function fetchFeeStructureDetail(uuid: string): Promise<BackendFeeStructureDetail> {
  const res = await apiFetch<{ data: BackendFeeStructureDetail }>(`/fees/structures/${uuid}`);
  return res.data;
}

export async function updateFeeStructureApi(uuid: string, payload: Record<string, unknown>): Promise<BackendFeeStructureDetail> {
  const res = await apiFetch<{ data: BackendFeeStructureDetail }>(`/fees/structures/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateFeeStructureItemApi(structureUuid: string, itemUuid: string, payload: Record<string, unknown>): Promise<unknown> {
  const res = await apiFetch<{ data: unknown }>(`/fees/structures/${structureUuid}/items/${itemUuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteFeeStructureApi(uuid: string): Promise<void> {
  await apiFetch(`/fees/structures/${uuid}`, { method: "DELETE" });
}

export async function rolloverFeeStructureApi(payload: {
  fromStructureId: string;
  toAcademicYearId: string;
  incrementPercent?: number;
  copyItems?: boolean;
}): Promise<BackendFeeStructureDetail> {
  const res = await apiFetch<{ data: BackendFeeStructureDetail }>(`/fees/structures/rollover`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Collection counter (search → profile → collect)
// ---------------------------------------------------------------------------

export async function searchStudentsForCollection(params: {
  query: string;
  classId?: string;
  campusId?: string | null;
}): Promise<any[]> {
  const q = new URLSearchParams({ query: params.query });
  if (params.classId) q.set("classId", params.classId);
  const res = await apiFetch<{ data: any[] }>(`/fees/collection/search-student?${q.toString()}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchStudentCollectionProfile(studentUuid: string, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/collection/student-summary/${studentUuid}`, {}, { campusId: campusId ?? undefined });
  return res.data ?? null;
}

export async function collectFeeApi(payload: {
  studentId: string;
  periodType: string;
  selectedMonths: number[];
  paidAmount: number;
  paymentMethod: string;
  academicYearId?: string;
  transactionRef?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  discountType?: string;
  discountValue?: number;
  waivedFineAmount?: number;
  advanceAdjustedAmount?: number;
  allowExcess?: boolean;
  idempotencyKey?: string;
  campusId?: string | null;
}): Promise<any> {
  const { campusId, ...body } = payload;
  const res = await apiFetch<{ data: any }>(
    `/fees/collection/collect`,
    { method: "POST", body: JSON.stringify(body) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Assignments (bulk + discontinue)
// ---------------------------------------------------------------------------

export async function bulkCreateAssignmentsApi(payload: {
  campusId?: string;
  classId?: string;
  academicYearId?: string;
  structureId: string;
  dueDate: string;
  studentIds: string[];
}, campusId?: string | null): Promise<{ created: number; skipped: number }> {
  const res = await apiFetch<{ data: { created: number; skipped: number } }>(
    `/fees/assignments/bulk`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function discontinueAssignmentApi(uuid: string, payload: {
  discontinuedAt?: string;
  discontinuedReason?: string;
  waiveOutstanding?: boolean;
}): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/assignments/${uuid}/discontinue`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Invoices (monthly engine + bulk + cancel)
// ---------------------------------------------------------------------------

export async function generateMonthlyInvoiceApi(payload: {
  assignmentId: string;
  month: number;
  year: number;
}, campusId?: string | null): Promise<BackendInvoice> {
  const res = await apiFetch<{ data: BackendInvoice }>(
    `/fees/invoices/generate-monthly`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function generateMonthlyBulkInvoicesApi(payload: {
  campusId?: string;
  classId?: string;
  academicYearId?: string;
  month: number;
  year: number;
}, campusId?: string | null): Promise<{ generated: number; skipped: number; errors: any[] }> {
  const res = await apiFetch<{ data: { generated: number; skipped: number; errors: any[] } }>(
    `/fees/invoices/generate-monthly-bulk`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function bulkGenerateFeesApi(payload: Record<string, unknown>, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(
    `/fees/bulk/generate`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

// ---------------------------------------------------------------------------
// Payments + receipts
// ---------------------------------------------------------------------------

export async function fetchPayments(params: { campusId?: string | null; page?: number; limit?: number } = {}): Promise<{ data: any[]; meta?: any }> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: any[]; meta?: any }>(`/fees/payments${qs}`, {}, { campusId: params.campusId ?? undefined });
  return { data: Array.isArray(res.data) ? res.data : [], meta: (res as any).meta };
}

export async function fetchReceiptDetail(uuid: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/receipts/${uuid}`);
  return res.data ?? null;
}

export async function cancelReceiptApi(uuid: string, reason: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/receipts/${uuid}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res.data;
}

export async function markOverdueApi(): Promise<{ marked: number }> {
  const res = await apiFetch<{ data: { marked: number } }>(`/fees/jobs/mark-overdue`, { method: "POST" });
  return res.data;
}

// ---------------------------------------------------------------------------
// Discounts / fines / adjustments / refunds / settings
// ---------------------------------------------------------------------------

export async function fetchDiscounts(params: { campusId?: string | null } = {}): Promise<any[]> {
  const res = await apiFetch<{ data: any[] }>(`/fees/discounts`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createDiscountApi(payload: Record<string, unknown>, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/discounts`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchFines(params: { campusId?: string | null } = {}): Promise<any[]> {
  const res = await apiFetch<{ data: any[] }>(`/fees/fines`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function waiveFineApi(payload: { studentId: string; invoiceId?: string; amount: number; reason: string }, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/fines/waive`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchAdjustments(params: { campusId?: string | null } = {}): Promise<any[]> {
  const res = await apiFetch<{ data: any[] }>(`/fees/adjustments`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAdjustmentApi(payload: Record<string, unknown>, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/adjustments`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchRefunds(params: { campusId?: string | null; status?: string; studentId?: string } = {}): Promise<any[]> {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.studentId) q.set("studentId", params.studentId);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: any[] }>(`/fees/refunds${qs}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createRefundApi(payload: Record<string, unknown>, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/refunds`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function approveRefundApi(uuid: string, payload: { approvedAmount?: number; notes?: string }): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/refunds/${uuid}/approve`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function markRefundPaidApi(uuid: string, payload: { refundMode?: string; transactionRef?: string; processedAt?: string; notes?: string }): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/refunds/${uuid}/mark-paid`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function fetchFeeSettings(campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/settings`, {}, { campusId: campusId ?? undefined });
  return res.data ?? null;
}

export async function updateFeeSettingsApi(payload: Record<string, unknown>, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/fees/settings`, { method: "PUT", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}
