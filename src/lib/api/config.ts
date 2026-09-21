/**
 * Backend API configuration.
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL (.env.local) and must include
 * the versioned prefix, e.g. http://localhost:3000/api/v1
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1"
).replace(/\/+$/, "");

export const API_TIMEOUT_MS = 15_000;
