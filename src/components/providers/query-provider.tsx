"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/axios-client";

// ── Production query defaults ─────────────────────────────────────────
// Single source of truth for network policy:
//  • axios enforces max 3 attempts with exponential backoff
//  • TanStack disables its own retry (retry: false) to avoid double-counting
//  • staleTime / gcTime give smart caching so refresh spam hits cache anyway
//  • refetchOnWindowFocus=false prevents surprise burst after tab switch
//  • networkMode="online" (default): ALWAYS attempt the fetch on mount.
//    (NOT "offlineFirst" — once a single request fails with a network error,
//    TanStack marks the whole client "offline" and suppresses all subsequent
//    fetches until a success "reconnects" it, which showed up as pages that
//    never called the API on first load. Offline/error is handled by axios
//    + useCampusData via ApiError.status === 0.)

function shouldRetryQuery(failureCount: number, err: unknown): boolean {
  // Defensive: tanstack retry is disabled, but keep predicate for manual callers
  if (failureCount >= 3) return false;
  if (err instanceof ApiError) {
    if (err.status === 0) return true; // offline / timeout → retryable
    if (err.status === 408 || err.status === 429) return true;
    if (err.status >= 500 && err.status <= 599) return true;
    return false; // 4xx (401/403) → never retry here
  }
  return false;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache for 60s → identical renders within 60s are deduped without network.
        // This is the user-visible "smart" part: spamming Refresh within stale window reuses cache.
        staleTime: 60_000,
        gcTime: 5 * 60_000, // keep unused cache 5m before GC
        retry: false, // axios already guarantees ≤3 attempts with exponential backoff
        // If someone re-enables query retry, use guarded predicate above:
        // retry: shouldRetryQuery,
        // retryDelay: (attempt) => Math.min(400 * 2 ** attempt + Math.random() * 200, 8000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: false, // if cache is fresh, don't re-fetch on remount
        networkMode: "online", // always try the network (offline handled by axios/useCampusData)
      },
      mutations: {
        retry: false,
        networkMode: "online",
      },
    },
  });
}

// Singleton per browser session (Next.js may HMR-reload, so lazy init)
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // SSR: always create fresh client
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => getQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export { shouldRetryQuery };
