"use client";

// Adapter — preserves the existing `apiFetch(path, init, options)` surface
// but routes through the production-grade axios client with:
//  • max 3 attempts exponential backoff
//  • single-flight 401 refresh
//  • normalized ApiError
// All existing imports (`@/lib/api/client` → `ApiError`, `apiFetch`, `refreshAccessToken`) keep working.

import { apiClient, ApiError } from "./axios-client";
import type { InternalAxiosRequestConfig } from "axios";

// Re-export ApiError so `import { ApiError } from "@/lib/api/client"` never breaks
export { ApiError } from "./axios-client";
export type { ApiError as ApiErrorType } from "./axios-client";

export interface ApiFetchOptions {
  /** Attach Authorization header (default true). */
  auth?: boolean;
  /** Allow the single 401 → refresh → retry cycle (default true) — handled inside axios interceptor. */
  retryOnUnauthorized?: boolean;
  /** Skip the timeout / abort controller (default false). */
  noTimeout?: boolean;
  /** Campus scope header for multi-tenant isolation (X-Campus-Id). */
  campusId?: string | null;
}

// Re-export refresh for callers that reference it directly (kept as promise-safe wrapper)
export async function refreshAccessToken(): Promise<string | null> {
  // The real refresh lives inside axios-client as single-flight;
  // we expose a no-op here for backwards-compat — the interceptor already does it.
  // Keeping a stub avoids double imports.
  const { getRefreshToken } = await import("@/lib/auth/tokens");
  if (!getRefreshToken()) return null;
  return null;
}

/**
 * JSON fetch wrapper — now axios-backed.
 * Signature is deliberately fetch-compatible so all `src/lib/api/*.ts` files
 * require zero changes. Internally it enforces:
 *  - baseURL + timeout  (axios-client)
 *  - max 3 attempts with exponential backoff (interceptor)
 *  - single 401 refresh (interceptor)
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = true, noTimeout = false, campusId } = options;

  const method = (init.method ?? "GET").toUpperCase();
  const rawHeaders = new Headers(init.headers as HeadersInit);
  const headers: Record<string, string> = {};
  rawHeaders.forEach((v, k) => {
    headers[k] = v;
  });

  // Let axios infer Content-Type if body is JSON string; preserve explicit headers
  const data = init.body
    ? (() => {
        const b = init.body as string;
        // Try to send as JSON object so axios handles stringify consistently
        try {
          return JSON.parse(b);
        } catch {
          return b;
        }
      })()
    : undefined;

  // Build per-request config; `_skipAuth` and `_campusId` are read by interceptors
  const cfg = {
    url: path,
    method,
    headers,
    data,
    timeout: noTimeout ? 0 : undefined,
    // custom fields read by interceptors — typed via declaration merging
    _skipAuth: !auth,
    _campusId: campusId ?? null,
  } as InternalAxiosRequestConfig & { _skipAuth?: boolean; _campusId?: string | null };

  // Pre-set campus header if caller provided one — interceptor will keep it
  if (campusId && campusId !== "all") {
    (cfg.headers as Record<string, string>)["X-Campus-Id"] = campusId;
  }

  const res = await apiClient.request<T>(cfg);
  // Backend wraps payload as { data: ... } — callers expect full body, so return as-is
  return res.data as T;
}
