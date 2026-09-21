"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Branch, Role, UserSession } from "@/types";
import { mockDb } from "@/lib/services/mock-db";
import { defaultUserSession, demoRolesList } from "@/lib/mock-data/dashboard";
import { ApiError } from "@/lib/api/client";
import {
  fetchBranches,
  createBranchApi,
  updateBranchApi,
  deleteBranchApi,
} from "@/lib/api/branches";
import {
  loginRequest,
  logoutRequest,
  mapBackendUserToSession,
  meRequest,
} from "@/lib/auth/auth-service";
import {
  BackendRole,
  backendRoleLabel,
  backendRoleToStaffRole,
  getPortalByRole,
  StaffRole,
} from "@/lib/auth/roles";
import {
  clearTokens,
  clearAllAppData,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokens";

export interface LoginResult {
  success: boolean;
  error?: string;
}

interface ERPContextType {
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  activeBranch: Branch | null;
  branches: Branch[];
  session: UserSession;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (portalRole: StaffRole, email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  refreshBranches: () => Promise<void>;
  saveBranch: (branchData: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Promise<Branch>;
  deleteBranch: (id: string) => Promise<boolean>;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  stats: ReturnType<typeof mockDb.getAggregatedStats>;
  triggerBiometricSync: () => { success: boolean; syncedCount: number; message: string };
  branchesLoading: boolean;
  branchesError: string | null;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [activeBranchId, setActiveBranchIdState] = useState<string>("all");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [session, setSession] = useState<UserSession>(defaultUserSession);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // ── Session hydration: validate the persisted token against the backend ────
  useEffect(() => {
    let cancelled = false;
    setMounted(true);
    // Branches come only from the live backend (no mock seed). They load in
    // hydrate() below once authenticated.

    async function hydrate() {
      if (!getRefreshToken() && !getAccessToken()) {
        setIsAuthLoading(false);
        return;
      }
      try {
        // apiFetch transparently refreshes + retries once on 401.
        const { data } = await meRequest();
        if (cancelled) return;
        const nextSession = mapBackendUserToSession(data);
        setSession(nextSession);
        mockDb.saveSession(nextSession);
        setActiveBranchIdState(nextSession.branchId || "all");
        setIsAuthenticated(true);
        // After auth, load branches from backend (source-of-truth, no mock).
        setBranchesLoading(true);
        try {
          const backendBranches = await fetchBranches();
          if (!cancelled) {
            setBranches(backendBranches);
            try { localStorage.setItem("school_erp_branches_v1", JSON.stringify(backendBranches)); } catch {}
          }
        } catch (err) {
          if (!cancelled) {
            const msg = err instanceof ApiError ? err.message : (err as Error)?.message ?? "Failed to load branches";
            if (err instanceof ApiError && err.status === 403) {
              setBranchesError("You don't have access to Campuses — this role's API permission is not enabled.");
            } else if (!(err instanceof ApiError) || err.status !== 401) {
              setBranchesError(msg);
            }
          }
        } finally {
          if (!cancelled) setBranchesLoading(false);
        }
      } catch {
        // refresh already cleared tokens inside apiFetch; make sure they are.
        if (!cancelled) {
          clearTokens();
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Login: portal role is verified against the backend-issued role ─────────
  const login = React.useCallback(
    async (portalRole: StaffRole, email: string, password: string): Promise<LoginResult> => {
      const portal = getPortalByRole(portalRole);
      const portalLabel = portal?.label ?? portalRole;
      try {
        const { data } = await loginRequest(email.trim().toLowerCase(), password);
        const backendRole: BackendRole | null = data.user?.role ?? null;
        const mappedRole = backendRoleToStaffRole(backendRole);

        if (!mappedRole) {
          clearTokens();
          return {
            success: false,
            error: `This account (${backendRole ?? "no role"}) is not recognized for this console.`,
          };
        }

        setTokens(data.accessToken, data.refreshToken);
        const nextSession = mapBackendUserToSession(data.user);
        setSession(nextSession);
        mockDb.saveSession(nextSession);
        setActiveBranchIdState(nextSession.branchId || "all");
        setIsAuthenticated(true);

        // Load campuses immediately so the header shows the real campus name
        // (and the branch list is ready) right after login — not just after refresh.
        setBranchesLoading(true);
        try {
          const loadedBranches = await fetchBranches();
          setBranches(loadedBranches);
          try { localStorage.setItem("school_erp_branches_v1", JSON.stringify(loadedBranches)); } catch {}
        } catch (err) {
          const msg = err instanceof ApiError ? err.message : (err as Error)?.message ?? "Failed to load branches";
          if (!(err instanceof ApiError) || err.status !== 401) setBranchesError(msg);
        } finally {
          setBranchesLoading(false);
        }

        mockDb.addActivity({
          user: { name: nextSession.name, avatar: nextSession.avatar, role: nextSession.role },
          action: "LOGIN",
          module: "Auth",
          entityName: `${portalLabel} portal sign-in`,
          branchId: nextSession.branchId,
          branchName: "All Campuses",
          details: `${nextSession.name} signed in via the ${portalLabel} portal.`,
          status: "SUCCESS",
        });
        return { success: true };
      } catch (err) {
        clearTokens();
        if (err instanceof ApiError) {
          const fieldHint = err.fields
            ? Object.entries(err.fields)
                .map(([k, v]) => `${k}: ${v[0]}`)
                .join(" · ")
            : undefined;
          return {
            success: false,
            error: err.status === 0 ? err.message : fieldHint || err.message,
          };
        }
        return { success: false, error: "Sign-in failed. Please try again." };
      }
    },
    []
  );

  const logout = React.useCallback(() => {
    // Revoke the refresh-token family server-side (best-effort) before wiping.
    logoutRequest(getRefreshToken());
    // Remove every persisted app datum: tokens, session, mock-DB data,
    // settings, caches, sessionStorage and app cookies.
    clearAllAppData();
    // Drop all in-memory query data so nothing leaks across sign-ins.
    queryClient.clear();
    setIsAuthenticated(false);
    setSession(defaultUserSession);
    setActiveBranchIdState(defaultUserSession.branchId || "all");
  }, [queryClient]);

  const refreshBranches = React.useCallback(async () => {
    setBranchesLoading(true);
    setBranchesError(null);
    if (getAccessToken() || getRefreshToken()) {
      try {
        const backendBranches = await fetchBranches();
        setBranches(backendBranches);
        try {
          localStorage.setItem("school_erp_branches_v1", JSON.stringify(backendBranches));
        } catch {}
        setBranchesLoading(false);
        return;
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : (err as Error)?.message ?? "Failed to load branches";
        if (err instanceof ApiError && err.status === 401) {
          setBranches([]);
          setBranchesLoading(false);
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          // Role-based API access is disabled for this role on the backend.
          setBranches([]);
          setBranchesError("You don't have access to Campuses — this role's API permission is not enabled.");
          setBranchesLoading(false);
          return;
        }
        setBranchesError(msg);
        setBranchesLoading(false);
        return;
      }
    }
    // Not authenticated — no mock fallback, nothing to show yet.
    setBranches([]);
    setBranchesLoading(false);
  }, []);

  const setActiveBranchId = React.useCallback((id: string) => {
    // Campus-bound roles (principal, hr, teacher, staff...) may only ever
    // stay on their own campus — global switching is an admin privilege.
    const role = session.role;
    const lockedTo = session.branchId;
    const next = role !== "ADMIN" && lockedTo && lockedTo !== "all" ? lockedTo : id;
    setActiveBranchIdState(next);
    setSession((prev) => {
      const updated = { ...prev, branchId: next };
      mockDb.saveSession(updated);
      return updated;
    });
  }, [session.role, session.branchId]);

  const setRole = React.useCallback((role: Role) => {
    const roleConfig = demoRolesList.find((r) => r.role === role);
    setSession((prev) => {
      const updated: UserSession = {
        ...prev,
        role,
        roleLabel: roleConfig ? roleConfig.label : role,
        branchId: roleConfig?.branchId || "all",
        // Demo role switch uses the static role-based nav (no backend sidebar
        // is known for the simulated persona).
        sidebar: undefined,
      };
      setActiveBranchIdState(updated.branchId);
      mockDb.saveSession(updated);
      return updated;
    });
  }, []);

  const saveBranch = React.useCallback(async (branchData: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    // Campus writes go to the live backend only (no mock fallback). The
    // backend is super_admin-only; permission errors surface as 403.
    const isUpdate = Boolean(branchData.id);
    if (!getAccessToken() && !getRefreshToken()) {
      throw new Error("Sign in required to manage campuses.");
    }
    const saved = isUpdate
      ? await updateBranchApi(branchData.id!, branchData)
      : await createBranchApi(branchData as Omit<Branch, "id" | "createdAt" | "updatedAt">);
    try {
      const refreshed = await fetchBranches();
      setBranches(refreshed);
      try { localStorage.setItem("school_erp_branches_v1", JSON.stringify(refreshed)); } catch {}
    } catch {
      setBranches((prev) => {
        if (isUpdate) return prev.map((b) => (b.id === saved.id ? saved : b));
        return [saved, ...prev];
      });
    }
    return saved;
  }, []);

  const deleteBranch = React.useCallback(async (id: string) => {
    // Hard delete → backend only. 403/401 are soft-deleted (status INACTIVE)
    // inside deleteBranchApi; any other error (409 FK conflict, 500) surfaces.
    if (!getAccessToken() && !getRefreshToken()) {
      throw new Error("Sign in required to manage campuses.");
    }
    await deleteBranchApi(id);
    setActiveBranchIdState((prev) => (prev === id ? "all" : prev));
    try {
      const refreshed = await fetchBranches();
      setBranches(refreshed);
      try { localStorage.setItem("school_erp_branches_v1", JSON.stringify(refreshed)); } catch {}
    } catch {
      setBranches((prev) => prev.filter((b) => b.id !== id));
    }
    return true;
  }, []);

  const triggerBiometricSync = React.useCallback(() => {
    return mockDb.triggerBiometricSync();
  }, []);

  const activeBranch = React.useMemo(
    () => (activeBranchId === "all" ? null : branches.find((b) => b.id === activeBranchId) || null),
    [activeBranchId, branches]
  );

  const stats = React.useMemo(
    () => mockDb.getAggregatedStats(activeBranchId),
    [activeBranchId]
  );

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = React.useMemo(
    () => ({
      activeBranchId,
      setActiveBranchId,
      activeBranch,
      branches,
      session,
      setRole,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      refreshBranches,
      saveBranch,
      deleteBranch,
      searchOpen,
      setSearchOpen,
      stats,
      triggerBiometricSync,
      branchesLoading,
      branchesError,
    }),
    [
      activeBranchId,
      setActiveBranchId,
      activeBranch,
      branches,
      session,
      setRole,
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      refreshBranches,
      saveBranch,
      deleteBranch,
      searchOpen,
      setSearchOpen,
      stats,
      triggerBiometricSync,
      branchesLoading,
      branchesError,
    ]
  );

  return (
    <ERPContext.Provider value={value}>
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error("useERP must be used within an ERPProvider");
  }
  return context;
}
