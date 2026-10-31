"use client";
import { apiFetch } from "./client";

// ── Types (match backend serializers in transport.service.js) ──
export interface TransportVehicle {
  uuid: string;
  registrationNumber: string;
  vehicleType: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  color?: string | null;
  capacity: number;
  status: string; // ACTIVE | UNDER_MAINTENANCE | RETIRED
  fuelType?: string | null;
  insuranceExpiry?: string | null;
  fitnessCertificateExpiry?: string | null;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  gpsDeviceId?: string | null;
  isActive?: boolean;
  driver?: { uuid: string; name: string } | null;
  assignedRoute?: { uuid: string; name: string } | null;
}

export interface TransportDriver {
  uuid: string;
  employeeId?: string | null;
  name: string;
  phone?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  status?: string | null; // ACTIVE | ON_LEAVE | INACTIVE
  experienceYears?: number | null;
  dateJoined?: string | null;
  assignedVehicle?: { uuid: string; registrationNumber: string } | null;
}

export interface TransportStop {
  uuid: string;
  name: string;
  sequence: number;
  distanceKm?: number | null;
  arrivalTime?: string | null;
}

export interface TransportRoute {
  uuid: string;
  name: string;
  description?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  totalKm?: number | null;
  status: string;
  vehicle?: { uuid: string; registrationNumber: string } | null;
  driver?: { uuid: string; name: string } | null;
  stops?: TransportStop[];
}

const q = (params: Record<string, string | number | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

// ── Vehicles ──
export async function fetchVehicles(params: { campusId?: string | null; status?: string; page?: number; limit?: number } = {}): Promise<{ data: TransportVehicle[]; total: number }> {
  const res = await apiFetch<{ data: TransportVehicle[]; meta?: { total: number } }>(
    `/transport/vehicles${q({ status: params.status, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function createVehicleApi(payload: {
  registrationNumber: string;
  vehicleType: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  capacity: number;
  fuelType?: string;
  insuranceExpiry: string;
  fitnessCertificateExpiry: string;
  gpsDeviceId?: string;
  campusUuid?: string;
}, campusId?: string | null): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(
    `/transport/vehicles`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

export async function updateVehicleApi(uuid: string, payload: {
  status?: string;
  isActive?: boolean;
  insuranceExpiry?: string;
  fitnessCertificateExpiry?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
}): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(`/transport/vehicles/${uuid}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data;
}

// ── Drivers ──
export async function fetchDrivers(params: { campusId?: string | null; status?: string; page?: number; limit?: number } = {}): Promise<{ data: TransportDriver[]; total: number }> {
  const res = await apiFetch<{ data: TransportDriver[]; meta?: { total: number } }>(
    `/transport/drivers${q({ status: params.status, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function createDriverApi(payload: {
  employeeId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  experienceYears?: number;
  dateJoined?: string;
  campusUuid?: string;
}, campusId?: string | null): Promise<TransportDriver> {
  const res = await apiFetch<{ data: TransportDriver }>(
    `/transport/drivers`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

// ── Routes ──
export async function fetchRoutes(params: { campusId?: string | null; status?: string; page?: number; limit?: number } = {}): Promise<{ data: TransportRoute[]; total: number }> {
  const res = await apiFetch<{ data: TransportRoute[]; meta?: { total: number } }>(
    `/transport/routes${q({ status: params.status, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function createRouteApi(payload: {
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  totalKm?: number;
  stops?: { name: string; sequence?: number; distanceKm?: number; arrivalTime?: string }[];
  campusUuid?: string;
}, campusId?: string | null): Promise<TransportRoute> {
  const res = await apiFetch<{ data: TransportRoute }>(
    `/transport/routes`,
    { method: "POST", body: JSON.stringify(payload) },
    { campusId: campusId ?? undefined }
  );
  return res.data;
}

// ── Route detail + stop management ──
export interface TransportRouteDetail extends TransportRoute {
  totalStudents?: number;
  activeStudents?: number;
  capacityUtilization?: number | null;
}

export async function fetchRouteDetail(uuid: string, tab?: string, params: Record<string, string | number | undefined> = {}): Promise<TransportRouteDetail> {
  const res = await apiFetch<{ data: TransportRouteDetail }>(`/transport/routes/${uuid}${q({ tab, ...params })}`);
  return res.data;
}

export interface TransportStudentSearchRow {
  student: { uuid: string; name: string; admissionNo?: string | null; class?: string | null };
  onTransport: boolean;
  assignment: {
    uuid: string;
    status: string;
    route: { uuid: string; name: string } | null;
    stop: string | null;
  } | null;
}

export async function searchTransportStudentsApi(query: string): Promise<TransportStudentSearchRow[]> {
  const res = await apiFetch<{ data: TransportStudentSearchRow[] }>(
    `/transport/students/search${q({ q: query })}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function createTransportAssignmentApi(payload: {
  studentUuid: string;
  routeUuid: string;
  stopUuid: string;
  startDate?: string;
  billingPlan?: "MONTHLY" | "HALF_YEARLY" | "YEARLY";
  feePerMonth?: number;
  pickupTime?: string;
  dropTime?: string;
}): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/assignments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export interface TransportAssignment {
  uuid: string;
  status: string;
  stopName?: string | null;
  stop?: { uuid: string; name: string; sequence: number } | null;
  pickupTime?: string | null;
  dropTime?: string | null;
  startDate: string;
  endDate?: string | null;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  discontinuedReason?: string | null;
  billingPlan: string;
  feePerMonth?: number | null;
  feePer6Month?: number | null;
  feePerYear?: number | null;
  student?: {
    uuid: string;
    name: string;
    admissionNo?: string | null;
    class?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
  };
  route?: {
    uuid: string;
    name: string;
    feePerMonth?: number | null;
    feePer6Month?: number | null;
    feePerYear?: number | null;
  } | null;
  vehicle?: { uuid: string; registrationNumber: string } | null;
}

export async function fetchTransportAssignments(params: {
  status?: string;
  routeUuid?: string;
  studentUuid?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: TransportAssignment[]; total: number }> {
  const res = await apiFetch<{ data: TransportAssignment[]; meta?: { total: number } }>(
    `/transport/assignments${q({ ...params })}`
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function suspendTransportAssignmentApi(
  uuid: string,
  payload: { reason?: string; effectiveFrom?: string } = {}
): Promise<TransportAssignment & { message?: string }> {
  const res = await apiFetch<{ data: TransportAssignment & { message?: string } }>(
    `/transport/assignments/${uuid}/suspend`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function reinstateTransportAssignmentApi(
  uuid: string
): Promise<TransportAssignment & { message?: string }> {
  const res = await apiFetch<{ data: TransportAssignment & { message?: string } }>(
    `/transport/assignments/${uuid}/reinstate`,
    { method: "PATCH" }
  );
  return res.data;
}

export async function discontinueTransportAssignmentApi(
  uuid: string,
  payload: { reason?: string; endDate?: string } = {}
): Promise<TransportAssignment & { message?: string }> {
  const res = await apiFetch<{ data: TransportAssignment & { message?: string } }>(
    `/transport/assignments/${uuid}/discontinue`,
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

export interface TransportHelper {
  uuid: string;
  name: string;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  employeeId?: string | null;
  assignedVehicle?: { uuid: string; registrationNumber: string } | null;
}

export async function fetchTransportHelpers(params: {
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: TransportHelper[]; total: number }> {
  const res = await apiFetch<{ data: TransportHelper[]; meta?: { total: number } }>(
    `/transport/helpers${q({ ...params })}`
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export interface TransportBill {
  uuid: string;
  academicYear: string;
  month: number;
  year: number;
  planType: string;
  planMonths: number;
  amountDue: number;
  lateFee: number;
  discountAmount: number;
  waiverAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  effectiveStatus: string;
  dueDate?: string | null;
  student?: { uuid: string; name: string; admissionNo?: string | null };
  assignment?: {
    uuid: string;
    status: string;
    route?: { uuid: string; name: string };
  };
  paymentsCount?: number;
  createdAt?: string;
}

export async function fetchTransportBills(params: {
  studentUuid?: string;
  status?: string;
  search?: string;
  academicYear?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: TransportBill[]; meta: { total: number; pendingTransportFee?: number } }> {
  const res = await apiFetch<{ data: TransportBill[]; meta: any }>(`/transport/fees${q({ ...params })}`);
  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: (res as any).meta ?? { total: 0 },
  };
}

export async function collectTransportPaymentApi(
  billingUuid: string,
  payload: {
    amount: number;
    paymentMode?: string;
    transactionRef?: string;
    paymentDate?: string;
    remarks?: string;
  }
): Promise<{ receipt: any; bill: TransportBill }> {
  const res = await apiFetch<{ data: { receipt: any; bill: TransportBill } }>(
    `/transport/fees/${billingUuid}/payment`,
    { method: "POST", body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function fetchTransportPayments(params: {
  studentUuid?: string;
  paymentMode?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: any[]; meta: any }> {
  const res = await apiFetch<{ data: any[]; meta: any }>(`/transport/fee-payments${q({ ...params })}`);
  return { data: Array.isArray(res.data) ? res.data : [], meta: (res as any).meta ?? {} };
}

export async function fetchTransportPaymentReceipt(paymentUuid: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/fee-payments/${paymentUuid}/receipt`);
  return res.data;
}

export interface TransportPendingBill extends TransportBill {
  assignment?: {
    uuid: string;
    status: string;
    route?: { uuid: string; name: string };
    stopName?: string | null;
  };
}

export async function fetchPendingTransportBills(params: {
  routeUuid?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: TransportPendingBill[]; meta: { total: number; outstanding?: number } }> {
  const res = await apiFetch<{ data: TransportPendingBill[]; meta: any }>(
    `/transport/fee-reports/pending${q({ ...params })}`
  );
  return {
    data: Array.isArray(res.data) ? res.data : [],
    meta: (res as any).meta ?? { total: 0, outstanding: 0 },
  };
}

export interface TransportCollectionGroup {
  key: string;
  label: string;
  collected: number;
  receipts: number;
}

export async function fetchTransportCollectionReport(params: {
  from?: string;
  to?: string;
  groupBy?: "day" | "mode" | "route" | "class" | "month";
} = {}): Promise<{
  groups: TransportCollectionGroup[];
  totals: { receipts: number; collected: number; byMode: Record<string, number> };
}> {
  const res = await apiFetch<{
    data: {
      groups: TransportCollectionGroup[];
      totals: { receipts: number; collected: number; byMode: Record<string, number> };
    };
  }>(`/transport/fee-reports/collection${q({ ...params })}`);
  return res.data ?? { groups: [], totals: { receipts: 0, collected: 0, byMode: {} } };
}

export async function updateRouteApi(uuid: string, payload: {
  name?: string; description?: string; startTime?: string; endTime?: string; totalKm?: number; status?: string;
}): Promise<TransportRoute> {
  const res = await apiFetch<{ data: TransportRoute }>(`/transport/routes/${uuid}`, {
    method: "PATCH", body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateRouteCrewApi(uuid: string, payload: { vehicleId?: string | null; driverId?: string | null }): Promise<TransportRoute> {
  const res = await apiFetch<{ data: TransportRoute }>(`/transport/routes/${uuid}/crew`, {
    method: "PATCH", body: JSON.stringify(payload),
  });
  return res.data;
}

export async function addRouteStopApi(routeUuid: string, payload: {
  name: string; distanceKm?: number; arrivalTime?: string; zoneCode?: string;
  dropTime?: string; latitude?: number; longitude?: number; landmark?: string;
}): Promise<TransportStop> {
  const res = await apiFetch<{ data: TransportStop }>(`/transport/routes/${routeUuid}/stops`, {
    method: "POST", body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateRouteStopApi(routeUuid: string, stopUuid: string, payload: Partial<TransportStop>): Promise<TransportStop> {
  const res = await apiFetch<{ data: TransportStop }>(`/transport/routes/${routeUuid}/stops/${stopUuid}`, {
    method: "PATCH", body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteRouteStopApi(routeUuid: string, stopUuid: string): Promise<void> {
  await apiFetch(`/transport/routes/${routeUuid}/stops/${stopUuid}`, { method: "DELETE" });
}

export async function reorderRouteStopsApi(routeUuid: string, stopUuids: string[]): Promise<TransportStop[]> {
  const res = await apiFetch<{ data: TransportStop[] }>(`/transport/routes/${routeUuid}/reorder-stops`, {
    method: "PATCH", body: JSON.stringify({ stopUuids }),
  });
  return Array.isArray(res.data) ? res.data : [];
}

// ── Trip attendance (3-state) ──
export type BoardingStatus = "BOARDED" | "NOT_BOARDED" | "NOT_MARKED";
export type NotPickedReason = "ABSENT" | "SELF_ARRANGED" | "NO_SHOW" | "HOLIDAY";

export interface AttendanceStudentRow {
  uuid: string;
  student: {
    uuid: string;
    name: string;
    admissionNo?: string | null;
    class?: string | null;
    avatar?: string | null;
  };
  stop?: { uuid: string; name: string; sequence: number } | null;
  stopName?: string | null;
  pickupTime?: string | null;
  dropTime?: string | null;
  boarding: {
    boardingStatus: BoardingStatus;
    reason?: string | null;
    markedAt?: string | null;
    markedById?: string | null;
  };
}

export interface AttendanceStopGroup {
  stopName: string;
  stopSequence: number;
  students: AttendanceStudentRow[];
}

export interface AttendanceManifest {
  routeUuid: string;
  routeName: string;
  tripDate: string;
  tripType: "PICKUP" | "DROP";
  vehicle: { uuid: string; registrationNumber: string } | null;
  driver: { uuid: string; name: string } | null;
  summary: { expected: number; boarded: number; notBoarded: number; notMarked: number };
  stops: AttendanceStopGroup[];
  warning: string | null;
}

export async function fetchTripAttendance(params: {
  routeUuid: string;
  date?: string;
  tripType?: "PICKUP" | "DROP";
}): Promise<AttendanceManifest> {
  const res = await apiFetch<{ data: AttendanceManifest }>(
    `/transport/trips/attendance${q({ routeUuid: params.routeUuid, date: params.date, tripType: params.tripType })}`
  );
  return res.data;
}

export interface SubmitAttendancePayload {
  routeUuid: string;
  tripDate?: string;
  tripType: "PICKUP" | "DROP";
  confirm: boolean;
  correctionReason?: string;
  students: { studentUuid: string; boardingStatus: BoardingStatus; reason?: NotPickedReason }[];
}

export async function submitTripAttendance(payload: SubmitAttendancePayload): Promise<{
  submitted: number;
  unmarked: number;
  confirmed: boolean;
  corrections: number;
  notificationsSent: number;
}> {
  const res = await apiFetch<{
    data: {
      submitted: number;
      unmarked: number;
      confirmed: boolean;
      corrections: number;
      notificationsSent: number;
    };
  }>("/transport/trips/attendance", { method: "PUT", body: JSON.stringify(payload) });
  return res.data;
}

export interface BoardingCorrection {
  uuid: string;
  correctedAt: string;
  correctedBy: { uuid: string; name: string; role: string } | null;
  oldStatus: BoardingStatus;
  oldReason: string | null;
  newStatus: BoardingStatus;
  newReason: string | null;
  reason: string | null;
  tripDate: string | null;
  tripType: string | null;
  route: { uuid: string; name: string } | null;
  student: { uuid: string; name: string; admissionNumber: string | null } | null;
}

export async function fetchBoardingCorrections(params: {
  routeUuid?: string;
  studentUuid?: string;
  date?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ data: BoardingCorrection[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
  const res = await apiFetch<{ data: BoardingCorrection[]; meta: any }>(
    `/transport/trips/corrections${q({ ...params })}`
  );
  return { data: Array.isArray(res.data) ? res.data : [], meta: (res as any).meta ?? { page: 1, limit: 50, total: 0, totalPages: 0 } };
}

export interface BoardingRouteSummary {
  routeUuid: string;
  routeName: string;
  activeStudents: number;
  tripsMarked: number;
  boarded: number;
  notBoarded: number;
  notMarked: number;
  boardingPct: number | null;
}

export async function fetchBoardingRouteSummary(params: { from?: string; to?: string } = {}): Promise<BoardingRouteSummary[]> {
  const res = await apiFetch<{ data: BoardingRouteSummary[] }>(
    `/transport/trips/route-summary${q({ ...params })}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

export interface StudentBoardingSummaryRow {
  student: {
    uuid: string;
    name: string;
    admissionNo?: string | null;
    class?: string | null;
    avatar?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
  };
  assignment: {
    uuid: string;
    status: string;
    route?: { uuid: string; name: string } | null;
    stopName?: string | null;
    stop?: { uuid: string; name: string; sequence: number } | null;
    pickupTime?: string | null;
    dropTime?: string | null;
  } | null;
  boarded: number;
  notBoarded: number;
  notMarked: number;
  total: number;
  lastTrip: {
    date: string;
    tripType: string;
    boardingStatus: BoardingStatus;
    reason: string | null;
  } | null;
}

export async function fetchBoardingStudentSummary(params: {
  routeUuid: string;
  from?: string;
  to?: string;
}): Promise<{ route: { uuid: string; name: string } | null; students: StudentBoardingSummaryRow[] }> {
  const res = await apiFetch<{ data: { route: { uuid: string; name: string } | null; students: StudentBoardingSummaryRow[] } }>(
    `/transport/trips/student-summary${q({ ...params })}`
  );
  return res.data ?? { route: null, students: [] };
}

export interface StudentBoardingHistoryRow {
  date: string;
  tripType: string;
  boardingStatus: BoardingStatus;
  reason: string | null;
  markedAt?: string | null;
  route: { uuid: string; name: string } | null;
}

export async function fetchStudentBoardingHistory(
  studentUuid: string,
  params: { from?: string; to?: string } = {}
): Promise<StudentBoardingHistoryRow[]> {
  const res = await apiFetch<{ data: StudentBoardingHistoryRow[] }>(
    `/transport/trips/student/${studentUuid}${q({ ...params })}`
  );
  return Array.isArray(res.data) ? res.data : [];
}

// ── Parent view (staff preview of the parent-facing transport dashboard) ──
export interface ParentChildTransport {
  child: { uuid: string; name: string; class?: string | null; photo?: string | null };
  transport: {
    route: { uuid: string; name: string } | null;
    vehicle: any;
    stop: string | null;
    pickupTime: string | null;
    dropTime: string | null;
    driver: { uuid: string; name: string; phone?: string | null } | null;
    conductor: { uuid: string; name: string; phone?: string | null } | null;
    zoneCode: string | null;
    feePerMonth: number | null;
  } | null;
  boardingHistory: {
    tripDate: string;
    tripType: string;
    boardingStatus: BoardingStatus;
    notPickedReason: string | null;
  }[];
  fee: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    currentMonthStatus: string | null;
    nextDueDate: string | null;
    records: any[];
  };
}

export async function fetchParentTransportChild(studentUuid: string): Promise<ParentChildTransport> {
  const res = await apiFetch<{ data: ParentChildTransport }>(
    `/transport/parent/child${q({ studentUuid })}`
  );
  return res.data;
}

export async function fetchParentTransportFees(studentUuid: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/parent/fees${q({ studentUuid })}`);
  return res.data;
}

export async function fetchParentTransportPayments(studentUuid: string, params: { from?: string; to?: string; page?: number; limit?: number } = {}): Promise<{ data: any[]; meta: any }> {
  const res = await apiFetch<{ data: any[]; meta: any }>(
    `/transport/parent/payments${q({ studentUuid, ...params })}`
  );
  return { data: Array.isArray(res.data) ? res.data : [], meta: (res as any).meta ?? {} };
}

export async function fetchParentTransportInvoices(studentUuid: string, params: { page?: number; limit?: number } = {}): Promise<{ data: any[]; meta: any }> {
  const res = await apiFetch<{ data: any[]; meta: any }>(
    `/transport/parent/invoices${q({ studentUuid, ...params })}`
  );
  return { data: Array.isArray(res.data) ? res.data : [], meta: (res as any).meta ?? {} };
}

export async function fetchParentTransportAttendance(studentUuid: string, params: { from?: string; to?: string; page?: number; limit?: number } = {}): Promise<{ data: any[]; meta: any }> {
  const res = await apiFetch<{ data: any[]; meta: any }>(
    `/transport/parent/attendance${q({ studentUuid, ...params })}`
  );
  return { data: Array.isArray(res.data) ? res.data : [], meta: (res as any).meta ?? {} };
}