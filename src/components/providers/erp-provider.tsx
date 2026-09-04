"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Branch, Role, UserSession } from "@/types";
import { mockDb } from "@/lib/services/mock-db";
import { defaultUserSession, demoRolesList } from "@/lib/mock-data/dashboard";
import { initialBranches } from "@/lib/mock-data/branches";
import { authenticateDemoUser, getDemoAccountByRole } from "@/lib/auth/demo-accounts";

const AUTH_STORAGE_KEY = "school_erp_auth_v1";

interface PersistedAuth {
  email: string;
  role: Role;
  loggedInAt: string;
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
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  refreshBranches: () => void;
  saveBranch: (branchData: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Branch;
  deleteBranch: (id: string) => boolean;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  stats: ReturnType<typeof mockDb.getAggregatedStats>;
  triggerBiometricSync: () => { success: boolean; syncedCount: number; message: string };
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export function ERPProvider({ children }: { children: React.ReactNode }) {
  const [activeBranchId, setActiveBranchIdState] = useState<string>("all");
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [session, setSession] = useState<UserSession>(defaultUserSession);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const loadedBranches = mockDb.getBranches();
    setBranches(loadedBranches);
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const persisted = JSON.parse(raw) as PersistedAuth;
        const account = getDemoAccountByRole(persisted.role);
        if (account && persisted.email.toLowerCase() === account.email.toLowerCase()) {
          setSession(account.session);
          mockDb.saveSession(account.session);
          setActiveBranchIdState(account.session.branchId || "all");
          setIsAuthenticated(true);
        } else {
          const loadedSession = mockDb.getSession();
          setSession(loadedSession);
          setActiveBranchIdState(loadedSession.branchId || "all");
        }
      } else {
        const loadedSession = mockDb.getSession();
        setSession(loadedSession);
        setActiveBranchIdState(loadedSession.branchId || "all");
      }
    } catch {
      const loadedSession = mockDb.getSession();
      setSession(loadedSession);
      setActiveBranchIdState(loadedSession.branchId || "all");
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = React.useCallback((email: string, password: string) => {
    const result = authenticateDemoUser(email, password);
    if (!result.success || !result.session || !result.account) {
      return { success: false as const, error: result.error || "Login failed. Try admin123." };
    }
    setSession(result.session);
    mockDb.saveSession(result.session);
    setActiveBranchIdState(result.session.branchId || "all");
    setIsAuthenticated(true);
    try {
      const persisted: PersistedAuth = {
        email: result.account.email,
        role: result.account.role,
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // storage unavailable — session-only login still works
    }
    mockDb.addActivity({
      user: { name: result.session.name, avatar: result.session.avatar, role: result.session.role },
      action: "LOGIN",
      module: "Auth",
      entityName: `${result.account.label} sign-in`,
      branchId: result.session.branchId,
      branchName: "All Campuses",
      details: `${result.session.name} signed in as ${result.account.label}.`,
      status: "SUCCESS",
    });
    return { success: true as const };
  }, []);

  const logout = React.useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setSession(defaultUserSession);
    mockDb.saveSession(defaultUserSession);
    setActiveBranchIdState(defaultUserSession.branchId || "all");
  }, []);

  const refreshBranches = React.useCallback(() => {
    const loadedBranches = mockDb.getBranches();
    setBranches(loadedBranches);
  }, []);

  const setActiveBranchId = React.useCallback((id: string) => {
    setActiveBranchIdState(id);
    setSession((prev) => {
      const updated = { ...prev, branchId: id };
      mockDb.saveSession(updated);
      return updated;
    });
  }, []);

  const setRole = React.useCallback((role: Role) => {
    const roleConfig = demoRolesList.find((r) => r.role === role);
    setSession((prev) => {
      const updated: UserSession = {
        ...prev,
        role,
        roleLabel: roleConfig ? roleConfig.label : role,
        branchId: roleConfig?.branchId || "all",
      };
      setActiveBranchIdState(updated.branchId);
      mockDb.saveSession(updated);
      return updated;
    });
  }, []);

  const saveBranch = React.useCallback((branchData: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const saved = mockDb.saveBranch(branchData);
    const loadedBranches = mockDb.getBranches();
    setBranches(loadedBranches);
    return saved;
  }, []);

  const deleteBranch = React.useCallback((id: string) => {
    const result = mockDb.deleteBranch(id);
    if (result) {
      setActiveBranchIdState((prev) => (prev === id ? "all" : prev));
      const loadedBranches = mockDb.getBranches();
      setBranches(loadedBranches);
    }
    return result;
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
