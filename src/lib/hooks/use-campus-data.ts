"use client";

import { useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/axios-client";
import { qk } from "@/lib/query/keys";

interface UseCampusDataOptions<T> {
  fetcher: (campusId: string | null) => Promise<T>;
  campusId: string | null;
  fallback: T;
  enabled?: boolean;
  queryKeyPrefix?: string; // e.g. "students" to scope cache per module
}

const REFRESH_THROTTLE_MS = 1500;

export function useCampusData<T>({
  fetcher,
  campusId,
  fallback,
  enabled = true,
  queryKeyPrefix = "generic",
}: UseCampusDataOptions<T>) {
  const qc = useQueryClient();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const lastRefreshRef = useRef<number>(0);

  const queryKey = qk.campusData(queryKeyPrefix, campusId);

  const query = useQuery<T, ApiError>({
    queryKey,
    queryFn: () => fetcherRef.current(campusId),
    enabled,
    // NOTE: Use placeholderData (NOT initialData) so React Query always
    // performs the real API fetch on mount. initialData is treated as
    // "already fetched" data which suppresses the first-load network call —
    // causing the glitch where admissions/students appear empty until you
    // switch campus (which changes the queryKey and forces a fresh fetch).
    placeholderData: fallback as Exclude<T, Function>,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false, // axios already does max 3 exponential
    refetchOnWindowFocus: false,
  });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_THROTTLE_MS) return;
    lastRefreshRef.current = now;
    await qc.refetchQueries({ queryKey, exact: true });
  }, [qc, queryKey, enabled]);

  const isOffline = query.error?.status === 0;
  const error: string | null = (() => {
    if (!query.error) return null;
    if (query.error.status === 0) return "Offline — showing cached data";
    if (query.error.status === 403) return "You don't have permission to view this data";
    return query.error.message;
  })();

  return {
    data: (query.data ?? fallback) as T,
    // isPlaceholderData = true on the very first fetch while the real data
    // is in-flight. Show loading state so UI shows skeletons/spinners.
    isLoading: (query.isLoading || query.isPlaceholderData) && enabled,
    isFetching: query.isFetching,
    isOffline,
    error,
    refresh,
    setData: (updater: T | ((prev: T) => T)) => {
      qc.setQueryData<T>(queryKey, (old) => {
        const base = (old ?? fallback) as T;
        return typeof updater === "function" ? (updater as (p: T) => T)(base) : updater;
      });
    },
  };
}
