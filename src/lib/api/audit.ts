"use client";
import { apiFetch } from "./client";
import type { AuditLog } from "@/types";

export interface BackendAuditLog {
  uuid: string;
  tableName?: string | null;
  recordPk?: string | null;
  action?: string | null;
  actorId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  result?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  [key: string]: unknown;
}

const ACTION_MAP: Record<string, string> = {
  INSERT: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

export function mapBackendAuditLog(r: BackendAuditLog): AuditLog {
  const meta = (r.metadata ?? {}) as Record<string, unknown>;
  const action = ACTION_MAP[String(r.action ?? "").toUpperCase()] ?? String(r.action ?? "UPDATE");
  return {
    id: r.uuid,
    user: String(meta.actorName ?? `User ${r.actorId ?? "—"}`),
    userRole: String(meta.role ?? ""),
    action: action as AuditLog["action"],
    module: r.tableName ?? "System",
    recordId: r.recordPk ?? "",
    recordName: r.recordPk ?? "—",
    timestamp: r.createdAt ?? "",
    ipAddress: r.ipAddress ?? "",
    device: r.userAgent ?? "",
    beforeSummary: r.oldData ? JSON.stringify(r.oldData).slice(0, 400) : undefined,
    afterSummary: r.newData ? JSON.stringify(r.newData).slice(0, 400) : undefined,
    details: `Table: ${r.tableName ?? "—"} • Result: ${r.result ?? "—"} • Request: ${r.requestId ?? "—"}`,
  };
}

export async function fetchAuditLogs(params: { page?: number; limit?: number; search?: string; action?: string } = {}): Promise<{ data: AuditLog[]; total: number }> {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.action) q.set("action", params.action);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<{ data: BackendAuditLog[]; meta?: { total: number } }>(`/audit-logs${qs}`);
  const list = Array.isArray(res.data) ? res.data : [];
  return { data: list.map(mapBackendAuditLog), total: res.meta?.total ?? list.length };
}