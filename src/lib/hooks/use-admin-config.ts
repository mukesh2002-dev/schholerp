"use client";

import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/axios-client";
import {
  AdminConfig,
  AdminFeature,
  AdminPhase,
  fetchAdminConfig,
  updateAdminFeature,
  updateAdminPhase,
} from "@/lib/api/admin-config";
import { qk } from "@/lib/query/keys";

const STORAGE_KEY = "admin_config_cache_v1";
const REFRESH_THROTTLE_MS = 1500; // spam guard: ignore refresh clicks within 1.5s

function readCachedConfig(): AdminConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminConfig;
  } catch {
    return null;
  }
}

function writeCachedConfig(config: AdminConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

interface UseAdminConfigReturn {
  config: AdminConfig | null;
  phases: AdminPhase[];
  features: AdminFeature[];
  isLoading: boolean;
  isFetching: boolean;
  isOffline: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  togglePhase: (phaseId: number, enabled: boolean) => Promise<void>;
  toggleFeature: (key: string, enabled: boolean) => Promise<void>;
  isFeatureEnabled: (key: string) => boolean;
  isPhaseEnabled: (phaseId: number) => boolean;
}

export function useAdminConfig(): UseAdminConfigReturn {
  const qc = useQueryClient();
  const lastRefreshRef = useRef<number>(0);

  // Seed initialData from localStorage so offline first-paint never crashes
  const cached = typeof window !== "undefined" ? readCachedConfig() : null;

  const query = useQuery<AdminConfig, ApiError>({
    queryKey: qk.adminConfig(),
    queryFn: fetchAdminConfig,
    initialData: cached ?? undefined,
    // Keep previous data while refetching so UI never flashes empty
    placeholderData: (prev) => prev ?? cached ?? undefined,
    staleTime: 60_000, // 60s — refresh spam within this window is served from cache (no network)
    gcTime: 5 * 60_000,
    // retry is handled by axios (max 3 attempts exponential). Disabling here avoids 3×3=9 attempts.
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Derive UI flags from query state
  const config = query.data ?? cached ?? null;
  const isLoading = query.isLoading && !config; // true only on cold start with no cache
  const isOffline = query.error?.status === 0;
  const error: string | null = (() => {
    if (!query.error) return null;
    if (query.error.status === 0) return "Offline - showing last known config";
    if (query.error.status === 401 || query.error.status === 403) return null; // non-admin: silent
    return query.error.message;
  })();

  // Persist successful fetches to localStorage (keeps offline fallback fresh)
  if (query.data) {
    // Avoid writing on every render storm: only when status is success and data changed
    // We write lazily here; alternatively use useEffect — but direct is fine for small payload
    try {
      const serialized = JSON.stringify(query.data);
      const existing = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (serialized !== existing) writeCachedConfig(query.data);
    } catch {}
  }

  const refresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_THROTTLE_MS) return; // spam guard
    lastRefreshRef.current = now;
    // Don't use invalidateQueries storm — single refetch is deduped by TanStack
    await qc.refetchQueries({ queryKey: qk.adminConfig(), exact: true });
  }, [qc]);

  // ── Mutations with optimistic cache update + rollback ────────────────
  const phaseMut = useMutation<AdminPhase, ApiError, { phaseId: number; enabled: boolean }, { prev?: AdminConfig }>({
    mutationFn: ({ phaseId, enabled }) => updateAdminPhase(phaseId, enabled),
    onMutate: async ({ phaseId, enabled }) => {
      await qc.cancelQueries({ queryKey: qk.adminConfig() });
      const prev = qc.getQueryData<AdminConfig>(qk.adminConfig());
      if (prev) {
        const next: AdminConfig = {
          ...prev,
          phases: prev.phases.map((p) => (p.id === phaseId ? { ...p, enabled } : p)),
        };
        qc.setQueryData(qk.adminConfig(), next);
      }
      return { prev };
    },
    onSuccess: (updated) => {
      qc.setQueryData<AdminConfig>(qk.adminConfig(), (old) => {
        if (!old) return old;
        const next = { ...old, phases: old.phases.map((p) => (p.id === updated.id ? updated : p)) };
        writeCachedConfig(next);
        return next;
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.adminConfig(), ctx.prev);
    },
  });

  const featureMut = useMutation<AdminFeature, ApiError, { key: string; enabled: boolean }, { prev?: AdminConfig }>({
    mutationFn: ({ key, enabled }) => updateAdminFeature(key, enabled),
    onMutate: async ({ key, enabled }) => {
      await qc.cancelQueries({ queryKey: qk.adminConfig() });
      const prev = qc.getQueryData<AdminConfig>(qk.adminConfig());
      if (prev) {
        const next: AdminConfig = {
          ...prev,
          features: prev.features.map((f) => (f.key === key ? { ...f, enabled } : f)),
        };
        qc.setQueryData(qk.adminConfig(), next);
      }
      return { prev };
    },
    onSuccess: (updated) => {
      qc.setQueryData<AdminConfig>(qk.adminConfig(), (old) => {
        if (!old) return old;
        const next = { ...old, features: old.features.map((f) => (f.key === updated.key ? updated : f)) };
        writeCachedConfig(next);
        return next;
      });
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.adminConfig(), ctx.prev);
    },
  });

  const togglePhase = useCallback(
    async (phaseId: number, enabled: boolean) => {
      // Caller already passes target (page does `togglePhase(id, !current)`), so pass through
      try {
        await phaseMut.mutateAsync({ phaseId, enabled });
      } catch (err) {
        if (err instanceof ApiError && err.status === 0) throw err;
        throw err;
      }
    },
    [phaseMut]
  );

  const toggleFeature = useCallback(
    async (key: string, enabled: boolean) => {
      try {
        await featureMut.mutateAsync({ key, enabled });
      } catch (err) {
        if (err instanceof ApiError && err.status === 0) throw err;
        throw err;
      }
    },
    [featureMut]
  );

  const isFeatureEnabled = useCallback(
    (key: string) => {
      if (!config) return true;
      const f = config.features.find((x) => x.key === key);
      return f ? f.enabled : true;
    },
    [config]
  );

  const isPhaseEnabled = useCallback(
    (phaseId: number) => {
      if (!config) return true;
      const p = config.phases.find((x) => x.id === phaseId);
      return p ? p.enabled : true;
    },
    [config]
  );

  return {
    config,
    phases: config?.phases ?? [],
    features: config?.features ?? [],
    isLoading,
    isFetching: query.isFetching,
    isOffline,
    error,
    refresh,
    togglePhase,
    toggleFeature,
    isFeatureEnabled,
    isPhaseEnabled,
  };
}
