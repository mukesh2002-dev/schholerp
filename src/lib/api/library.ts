"use client";
import { apiFetch } from "./client";
import type {
  BookCopy,
  BookIssue,
  BookPurchaseRequest,
  BookReservation,
  BookStatus,
  Library,
  LibraryAnnouncement,
  LibraryBook,
  LibraryDashboard,
  LibraryFineDetail,
  LibraryFineRule,
  LibraryRule,
  LibrarySection,
} from "@/types";

export interface BackendBook {
  uuid: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  price: number;
  publishedYear: number;
  language: string;
  status: string;
  coverImage?: string | null;
  description: string;
  accessionNumber?: string | null;
  edition?: string | null;
  deweyDecimal?: string | null;
  rackNumber?: string | null;
  isDigital?: boolean;
  digitalAccessUrl?: string | null;
  isActive?: boolean;
  campusId?: string;
  campus?: { uuid: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface BackendIssue {
  uuid: string;
  issuedDate?: string;
  dueDate?: string;
  returnedDate?: string | null;
  status?: string;
  fineAmount?: number;
  finePaid?: number;
  notes?: string | null;
  book?: { uuid: string; title: string; isbn?: string | null } | null;
  student?: { uuid: string; firstName?: string; lastName?: string } | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

const ISSUE_STATUS: Record<string, BookIssue["status"]> = {
  issued: "ISSUED",
  returned: "RETURNED",
  overdue: "OVERDUE",
  lost: "LOST",
};

export function mapBackendBook(b: BackendBook): LibraryBook {
  return {
    id: b.uuid,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    publisher: b.publisher,
    category: (b.category as LibraryBook["category"]) ?? "Textbook",
    branchId: b.campus?.uuid ?? b.campusId ?? "all",
    branchName: b.campus?.name ?? "Campus",
    shelfLocation: b.shelfLocation,
    totalCopies: Number(b.totalCopies ?? 0),
    availableCopies: Number(b.availableCopies ?? 0),
    issuedCopies: Math.max(0, Number(b.totalCopies ?? 0) - Number(b.availableCopies ?? 0)),
    price: Number(b.price ?? 0),
    publishedYear: Number(b.publishedYear ?? 0),
    language: b.language,
    status: (b.status as BookStatus) ?? "AVAILABLE",
    coverImage: b.coverImage ?? undefined,
    description: b.description ?? "",
    addedDate: b.createdAt ?? "",
    createdAt: b.createdAt ?? "",
    updatedAt: b.updatedAt ?? "",
    accessionNumber: b.accessionNumber ?? undefined,
    edition: b.edition ?? undefined,
    deweyDecimal: b.deweyDecimal ?? undefined,
    rackNumber: b.rackNumber ?? undefined,
    digitalAccessUrl: b.digitalAccessUrl ?? undefined,
    isDigital: b.isDigital ?? false,
  };
}

export function mapBackendIssue(i: BackendIssue): BookIssue {
  const studentName = `${i.student?.firstName ?? ""} ${i.student?.lastName ?? ""}`.trim();
  return {
    id: i.uuid,
    bookId: i.book?.uuid ?? "",
    bookTitle: i.book?.title ?? "",
    bookIsbn: i.book?.isbn ?? "",
    studentId: i.student?.uuid ?? "",
    studentName: studentName || "—",
    studentRoll: "",
    className: "",
    branchId: "",
    branchName: "Campus",
    issuedDate: i.issuedDate ?? "",
    dueDate: i.dueDate ?? "",
    returnedDate: i.returnedDate ?? undefined,
    status: ISSUE_STATUS[String(i.status ?? "").toLowerCase()] ?? "ISSUED",
    fineAmount: Number(i.fineAmount ?? 0),
    finePaid: Number(i.finePaid ?? 0),
    issuedBy: "",
    notes: i.notes ?? undefined,
    createdAt: i.createdAt ?? "",
    updatedAt: i.updatedAt ?? "",
  };
}

export async function fetchBooks(params: { campusId?: string | null; search?: string; category?: string; page?: number; limit?: number } = {}): Promise<{ data: LibraryBook[]; total: number }> {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.category) q.set("category", params.category);
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendBook[]; meta?: { total: number } }>(`/library/books${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list.map(mapBackendBook), total: res.meta?.total ?? list.length };
}

export async function createBookApi(payload: Record<string, unknown>, campusId?: string | null): Promise<LibraryBook> {
  const res = await apiFetch<{ data: BackendBook }>(`/library/books`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return mapBackendBook(res.data);
}

export async function updateBookApi(uuid: string, payload: Record<string, unknown>): Promise<LibraryBook> {
  const res = await apiFetch<{ data: BackendBook }>(`/library/books/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return mapBackendBook(res.data);
}

export async function deleteBookApi(uuid: string): Promise<void> {
  await apiFetch(`/library/books/${uuid}`, { method: "DELETE" });
}

export async function fetchIssues(params: { campusId?: string | null; page?: number; limit?: number } = {}): Promise<{ data: BookIssue[]; total: number }> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendIssue[]; meta?: { total: number } }>(`/library/issues${qs}`, {}, { campusId: params.campusId ?? undefined });
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list.map(mapBackendIssue), total: res.meta?.total ?? list.length };
}

export async function issueBookApi(payload: Record<string, unknown>, campusId?: string | null): Promise<BookIssue> {
  const res = await apiFetch<{ data: BackendIssue }>(`/library/issues`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return mapBackendIssue(res.data);
}

export async function returnBookApi(uuid: string, payload?: Record<string, unknown>): Promise<BookIssue> {
  const res = await apiFetch<{ data: BackendIssue }>(`/library/issues/${uuid}/return`, {
    method: "PATCH",
    body: payload ? JSON.stringify(payload) : undefined,
  });
  return mapBackendIssue(res.data);
}

// ============================================================================
// LIBRARY v2 — libraries, sections, copies, fine-rules, fines, reservations
// ============================================================================

export async function fetchLibraries(params: { campusId?: string | null } = {}): Promise<Library[]> {
  const res = await apiFetch<{ data: Library[] }>(`/library/libraries`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createLibraryApi(payload: Record<string, unknown>, campusId?: string | null): Promise<Library> {
  const res = await apiFetch<{ data: Library }>(`/library/libraries`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchLibrarySections(libraryUuid: string, params: { campusId?: string | null } = {}): Promise<LibrarySection[]> {
  const res = await apiFetch<{ data: LibrarySection[] }>(`/library/libraries/${libraryUuid}/sections`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createSectionApi(libraryUuid: string, payload: Record<string, unknown>, campusId?: string | null): Promise<LibrarySection> {
  const res = await apiFetch<{ data: LibrarySection }>(`/library/libraries/${libraryUuid}/sections`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchCopies(bookUuid: string, params: { campusId?: string | null } = {}): Promise<BookCopy[]> {
  const res = await apiFetch<{ data: BookCopy[] }>(`/library/books/${bookUuid}/copies`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function addCopiesApi(bookUuid: string, payload: Record<string, unknown>, campusId?: string | null): Promise<BookCopy[]> {
  const res = await apiFetch<{ data: BookCopy[] }>(`/library/books/${bookUuid}/copies`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function updateCopyApi(uuid: string, payload: Record<string, unknown>): Promise<BookCopy> {
  const res = await apiFetch<{ data: BookCopy }>(`/library/copies/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function fetchFineRules(params: { campusId?: string | null } = {}): Promise<LibraryFineRule[]> {
  const res = await apiFetch<{ data: LibraryFineRule[] }>(`/library/fine-rules`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function upsertFineRuleApi(payload: Record<string, unknown>, campusId?: string | null): Promise<LibraryFineRule> {
  const res = await apiFetch<{ data: LibraryFineRule }>(`/library/fine-rules`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchFines(params: { campusId?: string | null; status?: string } = {}): Promise<LibraryFineDetail[]> {
  const q = params.status ? `?status=${encodeURIComponent(params.status)}` : "";
  const res = await apiFetch<{ data: LibraryFineDetail[] }>(`/library/fines${q}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function payFineApi(uuid: string, payload: Record<string, unknown>, campusId?: string | null): Promise<{ receiptNumber: string; amount: number; balance: number }> {
  const res = await apiFetch<{ data: { receiptNumber: string; amount: number; balance: number } }>(`/library/fines/${uuid}/pay`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function waiveFineApi(uuid: string, payload: Record<string, unknown>): Promise<LibraryFineDetail> {
  const res = await apiFetch<{ data: LibraryFineDetail }>(`/library/fines/${uuid}/waive`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function fetchReservations(params: { campusId?: string | null } = {}): Promise<BookReservation[]> {
  const res = await apiFetch<{ data: BookReservation[] }>(`/library/reservations`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createReservationApi(payload: Record<string, unknown>, campusId?: string | null): Promise<BookReservation> {
  const res = await apiFetch<{ data: BookReservation }>(`/library/reservations`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function cancelReservationApi(uuid: string): Promise<BookReservation> {
  const res = await apiFetch<{ data: BookReservation }>(`/library/reservations/${uuid}`, { method: "DELETE" });
  return res.data;
}

export async function fetchLibraryDashboard(params: { campusId?: string | null } = {}): Promise<LibraryDashboard | null> {
  const res = await apiFetch<{ data: LibraryDashboard }>(`/library/dashboard`, {}, { campusId: params.campusId ?? undefined });
  return res.data ?? null;
}

// ==================== Purchase requests / Announcements / Rules ====================

export async function fetchPurchaseRequests(params: { campusId?: string | null } = {}): Promise<BookPurchaseRequest[]> {
  const res = await apiFetch<{ data: BookPurchaseRequest[] }>(`/library/purchase-requests`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createPurchaseRequestApi(payload: Record<string, unknown>, campusId?: string | null): Promise<BookPurchaseRequest> {
  const res = await apiFetch<{ data: BookPurchaseRequest }>(`/library/purchase-requests`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function reviewPurchaseRequestApi(uuid: string, payload: Record<string, unknown>): Promise<BookPurchaseRequest> {
  const res = await apiFetch<{ data: BookPurchaseRequest }>(`/library/purchase-requests/${uuid}/review`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function receivePurchaseRequestApi(uuid: string, payload: Record<string, unknown>): Promise<BookPurchaseRequest> {
  const res = await apiFetch<{ data: BookPurchaseRequest }>(`/library/purchase-requests/${uuid}/receive`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function fetchAnnouncements(params: { campusId?: string | null } = {}): Promise<LibraryAnnouncement[]> {
  const res = await apiFetch<{ data: LibraryAnnouncement[] }>(`/library/announcements`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createAnnouncementApi(payload: Record<string, unknown>, campusId?: string | null): Promise<LibraryAnnouncement> {
  const res = await apiFetch<{ data: LibraryAnnouncement }>(`/library/announcements`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function publishAnnouncementApi(uuid: string): Promise<LibraryAnnouncement> {
  const res = await apiFetch<{ data: LibraryAnnouncement }>(`/library/announcements/${uuid}/publish`, { method: "PATCH" });
  return res.data;
}

export async function fetchRules(params: { campusId?: string | null } = {}): Promise<LibraryRule[]> {
  const res = await apiFetch<{ data: LibraryRule[] }>(`/library/rules`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createRuleApi(payload: Record<string, unknown>, campusId?: string | null): Promise<LibraryRule> {
  const res = await apiFetch<{ data: LibraryRule }>(`/library/rules`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function toggleRuleApi(uuid: string): Promise<LibraryRule> {
  const res = await apiFetch<{ data: LibraryRule }>(`/library/rules/${uuid}/toggle`, { method: "PATCH" });
  return res.data;
}