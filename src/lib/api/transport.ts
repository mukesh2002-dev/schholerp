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