"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { useERP } from "@/components/providers/erp-provider";
import { useSettings } from "@/components/providers/settings-provider";
import { cn } from "@/lib/utils";
import { canRoleAccessPath, getLandingPageForRole } from "@/lib/auth/role-navigation";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAuthenticated, isAuthLoading } = useERP();
  const { contentWidth } = useSettings();

  useEffect(() => {
    const saved = localStorage.getItem("apex_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("apex_sidebar_collapsed", String(next));
      return next;
    });
  };

  const isLoginRoute = pathname === "/login";

  // Auth gate: unauthenticated users only ever see /login.
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated && !isLoginRoute) {
      router.replace("/login");
    } else if (isAuthenticated && isLoginRoute) {
      router.replace(getLandingPageForRole(session.role));
    } else if (isAuthenticated && !isLoginRoute && !canRoleAccessPath(session.role, pathname)) {
      router.replace(getLandingPageForRole(session.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading, pathname]);

  // Login page renders chromeless (no sidebar / topbar).
  if (isLoginRoute) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </div>
    );
  }

  // "Loading workspace…" is reserved for the dashboard (/). Other modules render
  // their own shell + skeletons while auth resolves; logged-out visitors get a
  // blank frame here while the gate above redirects them to /login.
  if ((isAuthLoading || !isAuthenticated) && pathname === "/") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Application Column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen overflow-x-hidden">
        <Topbar sidebarCollapsed={collapsed} onToggleSidebar={toggleSidebar} />
        <main
          className={cn(
            "flex-1 p-3 sm:p-6 lg:p-8 w-full mx-auto space-y-8",
            contentWidth === "full" ? "max-w-none" : "max-w-[1400px]"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
