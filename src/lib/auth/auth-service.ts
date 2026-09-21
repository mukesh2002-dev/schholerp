"use client";

import { apiFetch } from "@/lib/api/client";
import { UserSession } from "@/types";
import {
  BackendRole,
  backendRoleLabel,
  backendRoleToStaffRole,
  getPortalByRole,
  initialsAvatar,
  staffRoleToUiRole,
} from "./roles";

/** Backend `/auth/login` + `/auth/refresh` payload (auth.service.js `toPublic`). */
export interface BackendUser {
  id: string;
  uuid: string;
  email: string;
  name: string;
  role: BackendRole | null;
  roleUuid?: string | null;
  campus?: { uuid: string; name: string } | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
  /** Backend-driven list of modules this role can access (dynamic sidebar). */
  sidebar?: string[];
  [key: string]: unknown;
}

export interface AuthPayload {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

function deviceLabel(): string {
  if (typeof navigator === "undefined") return "web";
  return `${navigator.platform || "web"} · ${navigator.userAgent.slice(0, 60)}`;
}

export function loginRequest(email: string, password: string): Promise<{ data: AuthPayload }> {
  return apiFetch<{ data: AuthPayload }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password, deviceLabel: deviceLabel() }),
    },
    { auth: false }
  );
}

export function refreshRequest(refreshToken: string): Promise<{ data: AuthPayload }> {
  return apiFetch<{ data: AuthPayload }>(
    "/auth/refresh",
    { method: "POST", body: JSON.stringify({ refreshToken }) },
    { auth: false }
  );
}

export function meRequest(): Promise<{ data: BackendUser }> {
  return apiFetch<{ data: BackendUser }>("/auth/me", { method: "GET" });
}

/** Best-effort server-side revocation of the refresh-token family. */
export function logoutRequest(refreshToken: string | null): void {
  if (!refreshToken) return;
  void fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1"}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    keepalive: true,
  }).catch(() => {
    // revocation is best-effort; tokens are cleared locally regardless
  });
}

/** Shape the backend user into the UserSession the existing UI consumes. */
export function mapBackendUserToSession(user: BackendUser): UserSession {
  // Never silently promote an unknown/undecorated role to ADMIN (full access).
  // A role the console doesn't recognize is denied here — the caller clears
  // tokens and treats the session as unauthenticated.
  const staffRole = backendRoleToStaffRole(user.role);
  if (!staffRole) {
    throw new Error(`Role "${user.role ?? "none"}" is not allowed to use this console`);
  }
  // Display the PORTAL label ("Admin") — not the raw backend role label — so
  // logging into the Admin portal always shows "Admin" even if the underlying
  // account is super_admin (a distinct, panel-only role). Capability checks
  // (e.g. canManageCampuses) still use rawRole below.
  const portal = getPortalByRole(staffRole);
  const prettyRole = portal?.label ?? backendRoleLabel(user.role);
  const campusName = user.campus?.name;
  return {
    id: String(user.uuid ?? user.id ?? user.email),
    name: user.name || user.email,
    email: user.email,
    avatar: initialsAvatar(user.name || user.email, user.email),
    role: staffRoleToUiRole(staffRole),
    // Auto-default a campus-bound user (principal/hr/teacher/staff) to their
    // own campus; global users (super_admin/admin) default to "all".
    branchId: user.campus?.uuid ?? "all",
    roleLabel: campusName ? `${prettyRole} · ${campusName}` : `${prettyRole} (All Campuses)`,
    title: prettyRole,
    rawRole: user.role ?? undefined,
    campusName: user.campus?.name ?? undefined,
    // Backend-driven navigation modules (dynamic sidebar). Falls back to the
    // static role-based nav when absent (offline / demo mode).
    sidebar: Array.isArray(user.sidebar) ? user.sidebar : undefined,
  };
}

/** Human-readable message for a failed sign-in. */
export function loginErrorMessage(
  err: unknown,
  portalLabel: string,
  actualRole: BackendRole | null
): string {
  const actualPretty = backendRoleLabel(actualRole);
  if (actualRole && backendRoleToStaffRole(actualRole) === null) {
    return `This account is a ${actualPretty}. Only admin, principal, accountant and HR staff can sign in here.`;
  }
  return `This account is not authorized for the ${portalLabel} portal. Please use the ${actualPretty} login instead.`;
}
