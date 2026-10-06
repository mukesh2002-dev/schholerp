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
  dropTime?: string | null;
  zoneCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  landmark?: string | null;
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

export async function fetchRouteDetail(uuid: string): Promise<TransportRouteDetail> {
  const res = await apiFetch<{ data: TransportRouteDetail }>(`/transport/routes/${uuid}`);
  return res.data;
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

// ── Dashboard + compliance ──
export interface TransportDashboard {
  fleet: { total: number; active: number; underMaintenance: number; retired: number };
  routes: { total: number; active: number };
  students: { totalAssigned: number; active: number; discontinued: number; suspended: number };
  staff: { drivers: { total: number; active: number; onLeave: number }; helpers: { total: number; active: number } };
  todayBoarding: { expected: number; boarded: number; notBoarded: number; notMarked: number };
  pendingTransportFee: number;
  compliance: { expired: number; danger: number; warning: number; caution: number };
  incidents: { open: number; resolvedThisMonth: number };
}

export async function fetchTransportDashboard(campusId?: string | null): Promise<TransportDashboard> {
  const res = await apiFetch<{ data: TransportDashboard }>(`/transport/dashboard`, {}, { campusId: campusId ?? undefined });
  return res.data;
}

export interface ComplianceAlert {
  level: string; entity: string; uuid: string; label: string; docType: string; expiresOn: string | null; daysLeft: number | null;
}

export async function fetchCompliance(params: { campusId?: string | null; withinDays?: number; page?: number; limit?: number } = {}): Promise<{ data: ComplianceAlert[]; summary: Record<string, number>; total: number }> {
  const res = await apiFetch<{ data: { summary: Record<string, number>; alerts: ComplianceAlert[] }; meta?: { total: number } }>(
    `/transport/compliance${q({ withinDays: params.withinDays, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  return { data: res.data.alerts ?? [], summary: res.data.summary ?? {}, total: (res as any).meta?.total ?? (res.data.alerts ?? []).length };
}

// ── Vehicle detail / crew / status / documents ──
export async function fetchVehicleDetail(uuid: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/vehicles/${uuid}/detail`);
  return res.data;
}

export async function updateVehicleFullApi(uuid: string, payload: Record<string, any>): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(`/transport/vehicles/${uuid}`, { method: "PUT", body: JSON.stringify(payload) });
  return res.data;
}

export async function assignVehicleCrewApi(uuid: string, payload: { driverUuid?: string | null; conductorUuid?: string | null }): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(`/transport/vehicles/${uuid}/crew`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function assignVehicleRouteApi(uuid: string, routeUuid: string | null): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(`/transport/vehicles/${uuid}/route`, { method: "PATCH", body: JSON.stringify({ routeUuid }) });
  return res.data;
}

export async function updateVehicleStatusApi(uuid: string, status: string): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(`/transport/vehicles/${uuid}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  return res.data;
}

export async function uploadVehicleDocApi(uuid: string, payload: { docType: string; fileUrl: string; expiryDate?: string }): Promise<TransportVehicle> {
  const res = await apiFetch<{ data: TransportVehicle }>(`/transport/vehicles/${uuid}/documents`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

// ── Helpers ──
export interface TransportHelper {
  uuid: string; name: string; phone?: string | null; role: string; status?: string | null;
  employeeId?: string | null; photoUrl?: string | null;
  assignedVehicle?: { uuid: string; registrationNumber: string } | null;
}

export async function fetchHelpers(params: { campusId?: string | null; status?: string; role?: string; page?: number; limit?: number } = {}): Promise<{ data: TransportHelper[]; total: number }> {
  const res = await apiFetch<{ data: TransportHelper[]; meta?: { total: number } }>(
    `/transport/helpers${q({ status: params.status, role: params.role, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function createHelperApi(payload: Record<string, any>, campusId?: string | null): Promise<TransportHelper> {
  const res = await apiFetch<{ data: TransportHelper }>(`/transport/helpers`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function updateHelperApi(uuid: string, payload: Record<string, any>): Promise<TransportHelper> {
  const res = await apiFetch<{ data: TransportHelper }>(`/transport/helpers/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

// ── Maintenance ──
export async function fetchVehicleMaintenance(vehicleUuid: string): Promise<any[]> {
  const res = await apiFetch<{ data: any[] }>(`/transport/vehicles/${vehicleUuid}/maintenance`);
  return Array.isArray(res.data) ? res.data : [];
}

export async function createMaintenanceApi(vehicleUuid: string, payload: Record<string, any>): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/vehicles/${vehicleUuid}/maintenance`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

export async function completeMaintenanceApi(uuid: string, payload: Record<string, any> = {}): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/maintenance/${uuid}/complete`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

// ── Assignments ──
export interface TransportAssignment {
  uuid: string; status: string; stopName?: string | null; pickupTime?: string | null; dropTime?: string | null;
  zoneCode?: string | null; feePerMonth?: number | null; startDate?: string | null; endDate?: string | null;
  student?: { uuid: string; name: string; admissionNo: string; class?: string | null; avatar?: string | null; guardianName?: string | null; guardianPhone?: string | null };
  route?: { uuid: string; name: string }; vehicle?: { uuid: string; registrationNumber: string } | null;
}

export async function fetchAssignments(params: { campusId?: string | null; routeUuid?: string; studentUuid?: string; status?: string; page?: number; limit?: number } = {}): Promise<{ data: TransportAssignment[]; total: number }> {
  const res = await apiFetch<{ data: TransportAssignment[]; meta?: { total: number } }>(
    `/transport/assignments${q({ routeUuid: params.routeUuid, studentUuid: params.studentUuid, status: params.status, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function createAssignmentApi(payload: Record<string, any>, campusId?: string | null): Promise<TransportAssignment> {
  const res = await apiFetch<{ data: TransportAssignment }>(`/transport/assignments`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function changeStopApi(uuid: string, payload: Record<string, any>): Promise<TransportAssignment> {
  const res = await apiFetch<{ data: TransportAssignment }>(`/transport/assignments/${uuid}/change-stop`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

export async function suspendAssignmentApi(uuid: string, reason?: string): Promise<TransportAssignment> {
  const res = await apiFetch<{ data: TransportAssignment }>(`/transport/assignments/${uuid}/suspend`, { method: "PATCH", body: JSON.stringify({ reason }) });
  return res.data;
}

export async function reinstateAssignmentApi(uuid: string): Promise<TransportAssignment> {
  const res = await apiFetch<{ data: TransportAssignment }>(`/transport/assignments/${uuid}/reinstate`, { method: "PATCH", body: JSON.stringify({}) });
  return res.data;
}

export async function discontinueAssignmentApi(uuid: string, payload: { endDate?: string; reason?: string }): Promise<TransportAssignment> {
  const res = await apiFetch<{ data: TransportAssignment }>(`/transport/assignments/${uuid}/discontinue`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

export async function fetchRouteManifest(routeUuid: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/assignments/manifest${q({ routeUuid })}`);
  return res.data;
}

// ── Trip boarding ──
export async function markBoardingApi(payload: { routeUuid: string; tripDate?: string; tripType: string; boardedStudentUuids?: string[]; notBoardedStudents?: { studentUuid: string; reason: string }[] }): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/trips/mark-boarding`, { method: "POST", body: JSON.stringify(payload) });
  return res.data;
}

export async function fetchTripManifest(params: { routeUuid: string; date?: string; tripType?: string }): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/trips/manifest${q({ routeUuid: params.routeUuid, date: params.date, tripType: params.tripType })}`);
  return res.data;
}

export async function fetchNotPicked(params: { routeUuid: string; date?: string; tripType?: string }): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/trips/not-picked${q({ routeUuid: params.routeUuid, date: params.date, tripType: params.tripType })}`);
  return res.data;
}

export async function fetchStudentBoardingHistory(studentUuid: string, params: { from?: string; to?: string } = {}): Promise<any[]> {
  const res = await apiFetch<{ data: any[] }>(`/transport/trips/student/${studentUuid}${q({ from: params.from, to: params.to })}`);
  return Array.isArray(res.data) ? res.data : [];
}

// ── Fee slabs + billing ──
export interface TransportFeeSlab { uuid: string; zone: string; label: string; minDistance: number | null; maxDistance: number | null; feePerMonth: number; academicYear: string; isActive: boolean }

export async function fetchFeeSlabs(params: { campusId?: string | null; academicYear?: string } = {}): Promise<TransportFeeSlab[]> {
  const res = await apiFetch<{ data: TransportFeeSlab[] }>(`/transport/fee-slabs${q({ academicYear: params.academicYear })}`, {}, { campusId: params.campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function upsertFeeSlabsApi(payload: { campusUuid?: string; academicYear: string; slabs: { zone: string; label?: string; minDistance: number; maxDistance: number; feePerMonth: number }[] }, campusId?: string | null): Promise<TransportFeeSlab[]> {
  const res = await apiFetch<{ data: TransportFeeSlab[] }>(`/transport/fee-slabs`, { method: "PUT", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function resolveStudentFeeApi(studentUuid: string, academicYear?: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/fee-slabs/resolve${q({ studentUuid, academicYear })}`);
  return res.data;
}

export async function generateBillingApi(payload: { campusUuid?: string; academicYear?: string; month: number; year: number }, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/billing/generate`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function fetchBilling(params: { campusId?: string | null; academicYear?: string; month?: number; year?: number; status?: string; studentUuid?: string; page?: number; limit?: number } = {}): Promise<{ data: any[]; total: number; pending?: number }> {
  const res = await apiFetch<{ data: any[]; meta?: { total: number; pendingTransportFee?: number } }>(
    `/transport/billing${q({ academicYear: params.academicYear, month: params.month, year: params.year, status: params.status, studentUuid: params.studentUuid, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length, pending: (res as any).meta?.pendingTransportFee };
}

export async function updateBillingApi(uuid: string, payload: Record<string, any>): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/billing/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

// ── Incidents ──
export async function fetchIncidents(params: { campusId?: string | null; status?: string; severity?: string; vehicleUuid?: string; page?: number; limit?: number } = {}): Promise<{ data: any[]; total: number }> {
  const res = await apiFetch<{ data: any[]; meta?: { total: number } }>(
    `/transport/incidents${q({ status: params.status, severity: params.severity, vehicleUuid: params.vehicleUuid, page: params.page, limit: params.limit })}`,
    {},
    { campusId: params.campusId ?? undefined }
  );
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list, total: (res as any).meta?.total ?? list.length };
}

export async function createIncidentApi(payload: Record<string, any>, campusId?: string | null): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/incidents`, { method: "POST", body: JSON.stringify(payload) }, { campusId: campusId ?? undefined });
  return res.data;
}

export async function updateIncidentApi(uuid: string, payload: Record<string, any>): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/incidents/${uuid}`, { method: "PATCH", body: JSON.stringify(payload) });
  return res.data;
}

// ── Parent portal + reports ──
export async function fetchParentTransport(studentUuid?: string): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/parent/child${q({ studentUuid })}`);
  return res.data;
}

export async function fetchUtilizationReport(campusId?: string | null): Promise<any[]> {
  const res = await apiFetch<{ data: any[] }>(`/transport/reports/utilization`, {}, { campusId: campusId ?? undefined });
  return Array.isArray(res.data) ? res.data : [];
}

export async function fetchRevenueReport(params: { campusId?: string | null; academicYear?: string; month?: number; year?: number } = {}): Promise<any> {
  const res = await apiFetch<{ data: any }>(`/transport/reports/revenue${q({ academicYear: params.academicYear, month: params.month, year: params.year })}`, {}, { campusId: params.campusId ?? undefined });
  return res.data;
}