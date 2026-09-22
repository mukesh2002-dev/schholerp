"use client";

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth/tokens";

// ── Error normalization ──────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  code?: string;
  fields?: Record<string, string[]>;

  constructor(status: number, message: string, code?: string, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

interface BackendErrorBody {
  error?: string;
  code?: string;
  message?: string;
  details?: unknown;
}

// ── Retry policy ─────────────────────────────────────────────────────
// Requirement: never more than 3 total attempts per logical call,
// exponential backoff on transient failures.
export const MAX_ATTEMPTS = 3; // 1 initial + 2 retries  = 3 total requests
const BASE_DELAY_MS = 400;
const MAX_DELAY_MS = 8_000;

function exponentialDelay(attempt: number): number {
  // attempt: 0 => 400ms, 1 => 800ms, 2 => 1600ms (then capped)
  const exp = BASE_DELAY_MS * Math.pow(2, attempt);
  const capped = Math.min(exp, MAX_DELAY_MS);
  const jitter = Math.random() * 180; // 0-180ms jitter avoids thundering herd
  return capped + jitter;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status?: number): boolean {
  if (!status) return true; // network / no response => retryable
  if (status === 408 || status === 429) return true;
  if (status >= 500 && status <= 599) return true;
  return false;
}

function isIdempotentMethod(method?: string): boolean {
  if (!method) return true;
  return ["get", "head", "options"].includes(method.toLowerCase());
}

// ── Axios instance ───────────────────────────────────────────────────
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Augment config with retry bookkeeping
declare module "axios" {
  interface InternalAxiosRequestConfig {
    __retryCount?: number;
    __isRetryAfterRefresh?: boolean;
    _skipAuth?: boolean;
  }
}

function getCampusIdHeader(explicit?: string | null): string | null {
  if (explicit && explicit !== "all") return explicit;
  if (explicit === "all" || explicit === "") return null;
  // Fallback: try to read active branch from persisted sessions
  try {
    const keys = ["school_erp_session", "erp_session", "activeBranchId"];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      // raw may be JSON session or plain uuid
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw) as { branchId?: string };
        if (parsed?.branchId && /^[0-9a-f-]{36}/i.test(parsed.branchId)) return parsed.branchId;
      } else if (/^[0-9a-f-]{36}/i.test(raw)) {
        return raw;
      }
    }
  } catch {}
  return null;
}

// ── Request interceptor: auth + campus scoping ───────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // File uploads: let the browser set multipart/form-data WITH boundary.
  // The instance default (application/json) would otherwise be sent with the
  // FormData body and the backend could not parse the files.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  if (!config._skipAuth) {
    const token = getAccessToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Campus header: respect explicit config param if present, else infer
  const explicitCampus = (config.headers.get("X-Campus-Id") as string | undefined) ?? null;
  // If header already set by caller, keep it. Otherwise infer from storage.
  if (!explicitCampus || explicitCampus === "all") {
    const inferred = getCampusIdHeader(explicitCampus);
    if (inferred) {
      config.headers.set("X-Campus-Id", inferred);
    } else {
      config.headers.delete("X-Campus-Id");
    }
  }

  // Helpful for tracing, not sent to backend as canonical field
  config.headers.set("X-Request-Started-At", String(Date.now()));
  return config;
});

// ── Refresh single-flight ────────────────────────────────────────────
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    // Use raw axios without interceptors to avoid loop
    const res = await axios.post<{ data?: { accessToken?: string; refreshToken?: string } }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: API_TIMEOUT_MS, headers: { "Content-Type": "application/json" } }
    );
    const nextAccess = res.data?.data?.accessToken;
    const nextRefresh = res.data?.data?.refreshToken;
    if (!nextAccess || !nextRefresh) {
      clearTokens();
      return null;
    }
    setTokens(nextAccess, nextRefresh);
    return nextAccess;
  } catch (e: unknown) {
    // network error on refresh: keep tokens so a later retry can succeed
    // but if 401/403, clearTokens so we don't loop
    const status = (e as AxiosError)?.response?.status;
    if (status === 401 || status === 403) clearTokens();
    return null;
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const ax = error as AxiosError<BackendErrorBody>;
  const status = ax.response?.status ?? 0;
  const body = ax.response?.data as BackendErrorBody | undefined;

  // Timeout
  if (ax.code === "ECONNABORTED" || ax.message?.includes("timeout")) {
    return new ApiError(0, "The server took too long to respond. Try again.");
  }
  // Network / CORS / offline (no response)
  if (!ax.response) {
    return new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  const details = body?.details;
  let fields: Record<string, string[]> | undefined;
  if (Array.isArray(details)) {
    fields = Object.fromEntries(
      (details as Array<{ path?: string; message?: string }>).map((d) => [
        String(d?.path ?? "form"),
        [String(d?.message ?? "Invalid value")],
      ])
    );
  }

  return new ApiError(
    status,
    body?.message || (body as unknown as { error?: string })?.error || `Request failed (${status})`,
    body?.code,
    fields
  );
}

// ── Response interceptor: 401 refresh + exponential retry (max 3) ─────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendErrorBody>) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    if (!config) return Promise.reject(toApiError(error));

    const status = error.response?.status;
    const retryCount = config.__retryCount ?? 0;

    // 1) 401 → single silent refresh + one retry (does NOT count toward MAX_ATTEMPTS)
    if (status === 401 && !config.__isRetryAfterRefresh && !config._skipAuth) {
      // Avoid refresh loop on the refresh endpoint itself
      if (config.url?.includes("/auth/refresh")) {
        clearTokens();
        return Promise.reject(toApiError(error));
      }

      try {
        const newToken = await (refreshInFlight ??= refreshAccessToken().finally(() => {
          refreshInFlight = null;
        }));
        if (newToken) {
          config.__isRetryAfterRefresh = true;
          config.headers.set("Authorization", `Bearer ${newToken}`);
          // Don't increment retryCount for this refresh retry — it's auth recovery, not transient retry
          return apiClient.request(config);
        }
      } catch {
        // refresh failed: fall through to ApiError
      }
      // No token → surface original 401 as ApiError (caller decides to silent-handle)
      return Promise.reject(toApiError(error));
    }

    // 2) Transient failures → exponential backoff, capped at MAX_ATTEMPTS total
    const shouldRetry =
      retryCount < MAX_ATTEMPTS - 1 && // e.g. MAX_ATTEMPTS=3 → allow 0,1 → at most 3 requests
      (isRetryableStatus(status) || error.code === "ECONNABORTED" || !error.response);

    // Only auto-retry idempotent methods for 5xx/429; for network/timeout retry all methods
    const isNetworkOrTimeout = !error.response || error.code === "ECONNABORTED" || status === 408;
    const canRetryMethod = isIdempotentMethod(config.method) || isNetworkOrTimeout;

    if (shouldRetry && canRetryMethod) {
      const nextCount = retryCount + 1;
      config.__retryCount = nextCount;
      const wait = exponentialDelay(retryCount); // 0=>400,1=>800,2=>1600
      await delay(wait);
      return apiClient.request(config);
    }

    return Promise.reject(toApiError(error));
  }
);

// ── Typed helpers for non-hook code ──────────────────────────────────
export async function apiFetchAxios<T>(
  path: string,
  init: RequestInit & { _skipAuth?: boolean; _campusId?: string | null; _noTimeout?: boolean } = {},
  _legacyOptions?: unknown
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers: Record<string, string> = {};
  if (init.headers) {
    new Headers(init.headers as HeadersInit).forEach((v, k) => {
      headers[k] = v;
    });
  }
  if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const cfg: AxiosRequestConfig & { _skipAuth?: boolean } = {
    url: path,
    method,
    headers,
    data: init.body ? (typeof init.body === "string" ? JSON.parse(init.body as string) : init.body) : undefined,
    timeout: (init as { _noTimeout?: boolean })._noTimeout ? 0 : undefined,
    _skipAuth: (init as { _skipAuth?: boolean })._skipAuth,
  };

  // Campus scope: let interceptor handle, but pre-set if explicit
  const campusId = (init as { _campusId?: string | null })._campusId;
  if (campusId) {
    (cfg.headers as Record<string, string>)["X-Campus-Id"] = campusId;
  }

  const res = await apiClient.request<T>(cfg);
  return res.data as T;
}
