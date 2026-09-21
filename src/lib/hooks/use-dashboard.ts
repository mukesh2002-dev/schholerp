"use client";

import { useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/axios-client";
import { DashboardData, fetchDashboard } from "@/lib/api/dashboard";
import { qk } from "@/lib/query/keys";

const CACHE_KEY = "dashboard_cache_v1";
const REFRESH_THROTTLE_MS = 1500;

function readCache(): DashboardData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardData;
  } catch {
    return null;
  }
}

function writeCache(d: DashboardData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(d));
  } catch {}
}

interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  isFetching: boolean;
  isOffline: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const qc = useQueryClient();
  const lastRefreshRef = useRef<number>(0);
  const cached = typeof window !== "undefined" ? readCache() : null;

  const query = useQuery<DashboardData, ApiError>({
    queryKey: qk.dashboard(),
    queryFn: fetchDashboard,
    initialData: cached ?? undefined,
    placeholderData: (prev) => prev ?? cached ?? undefined,
    staleTime: 45_000,
    gcTime: 5 * 60_000,
    retry: false, // axios caps at 3 attempts exponential
    refetchOnWindowFocus: false,
  });

  if (query.data) {
    try {
      const serialized = JSON.stringify(query.data);
      const existing = typeof window !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
      if (serialized !== existing) writeCache(query.data);
    } catch {}
  }

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_THROTTLE_MS) return;
    lastRefreshRef.current = now;
    await qc.refetchQueries({ queryKey: qk.dashboard(), exact: true });
  }, [qc]);

  const isLoading = query.isLoading && !query.data;
  const isOffline = query.error?.status === 0;
  const error: string | null = (() => {
    if (!query.error) return null;
    if (query.error.status === 0) return "Offline - showing last known stats";
    return query.error.message;
  })();

  return {
    data: query.data ?? cached ?? null,
    isLoading,
    isFetching: query.isFetching,
    isOffline,
    error,
    refresh,
  };
}
