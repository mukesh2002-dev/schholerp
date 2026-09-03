"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NavigationProgress } from "@/components/layout/navigation-progress";

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <NavigationProgress />
      
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </div>

      {/* Main Application Column */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen overflow-x-hidden">
        <Topbar sidebarCollapsed={collapsed} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
