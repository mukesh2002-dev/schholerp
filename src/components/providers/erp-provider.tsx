"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Branch, Role, UserSession } from "@/types";
import { mockDb } from "@/lib/services/mock-db";
import { defaultUserSession, demoRolesList } from "@/lib/mock-data/dashboard";
import { initialBranches } from "@/lib/mock-data/branches";

interface ERPContextType {
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  activeBranch: Branch | null;
  branches: Branch[];
  session: UserSession;
  setRole: (role: Role) => void;
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

  useEffect(() => {
    setMounted(true);
    const loadedBranches = mockDb.getBranches();
    setBranches(loadedBranches);
    const loadedSession = mockDb.getSession();
    setSession(loadedSession);
    setActiveBranchIdState(loadedSession.branchId || "all");
  }, []);

  const refreshBranches = () => {
    const loadedBranches = mockDb.getBranches();
    setBranches(loadedBranches);
  };

  const setActiveBranchId = (id: string) => {
    setActiveBranchIdState(id);
    const updated = { ...session, branchId: id };
    setSession(updated);
    mockDb.saveSession(updated);
  };

  const setRole = (role: Role) => {
    const roleConfig = demoRolesList.find((r) => r.role === role);
    const updated: UserSession = {
      ...session,
      role,
      roleLabel: roleConfig ? roleConfig.label : role,
      branchId: roleConfig?.branchId || "all",
    };
    setSession(updated);
    setActiveBranchIdState(updated.branchId);
    mockDb.saveSession(updated);
  };

  const saveBranch = (branchData: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const saved = mockDb.saveBranch(branchData);
    refreshBranches();
    return saved;
  };

  const deleteBranch = (id: string) => {
    const result = mockDb.deleteBranch(id);
    if (result) {
      if (activeBranchId === id) {
        setActiveBranchId("all");
      }
      refreshBranches();
    }
    return result;
  };

  const triggerBiometricSync = () => {
    return mockDb.triggerBiometricSync();
  };

  const activeBranch = activeBranchId === "all" ? null : branches.find((b) => b.id === activeBranchId) || null;
  const stats = mockDb.getAggregatedStats(activeBranchId);

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

  return (
    <ERPContext.Provider
      value={{
        activeBranchId,
        setActiveBranchId,
        activeBranch,
        branches,
        session,
        setRole,
        refreshBranches,
        saveBranch,
        deleteBranch,
        searchOpen,
        setSearchOpen,
        stats,
        triggerBiometricSync,
      }}
    >
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
