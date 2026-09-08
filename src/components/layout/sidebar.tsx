"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useERP } from "@/components/providers/erp-provider";
import { getNavForRole } from "@/lib/auth/role-navigation";
import { toast } from "sonner";
import {
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SCHOOL_DATA } from "@/lib/school-data";
import { ExamResultsSubmenu } from "@/components/layout/exam-results-submenu";
import type { RoleNavSubItem } from "@/lib/auth/role-navigation";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useERP();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [logoFailed, setLogoFailed] = React.useState(false);
  const showLogo = !logoFailed && SCHOOL_DATA.logoPath;

  const navGroups = React.useMemo(() => getNavForRole(session.role), [session.role]);

  // Derive full active route including query for tab-aware matching – client-only, avoids useSearchParams CSR bailout
  const [searchString, setSearchString] = React.useState("");
  React.useEffect(() => {
    const sync = () => setSearchString(window.location.search);
    sync();
    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);
    const patchedPush: typeof window.history.pushState = (...args) => {
      const res = (origPush as any)(...args);
      sync();
      return res;
    };
    const patchedReplace: typeof window.history.replaceState = (...args) => {
      const res = (origReplace as any)(...args);
      sync();
      return res;
    };
    window.history.pushState = patchedPush as any;
    window.history.replaceState = patchedReplace as any;
    window.addEventListener("popstate", sync);
    return () => {
      window.history.pushState = origPush as any;
      window.history.replaceState = origReplace as any;
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);
  const activeRoute = searchString ? `${pathname}${searchString}` : pathname;

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/exams")) init["Exams & Results"] = true;
      if (window.location.pathname.startsWith("/classes") || window.location.pathname.startsWith("/subjects")) init["Classes & Sections"] = true;
    }
    return init;
  });

  React.useEffect(() => {
    if (pathname.startsWith("/exams")) setExpanded((prev) => ({ ...prev, "Exams & Results": true }));
    if (pathname.startsWith("/classes") || pathname.startsWith("/subjects")) setExpanded((prev) => ({ ...prev, "Classes & Sections": true }));
  }, [pathname]);

  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname, searchString]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out", { description: "See you soon. Demo session cleared." });
    router.replace("/login");
    onNavigate?.();
  };

  const toggleExpanded = React.useCallback((title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  }, []);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-30 select-none gpu-accelerated",
        collapsed ? "w-20" : "w-64"
      )}
      aria-label="Primary navigation"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-3 group" onClick={onNavigate}>
            {showLogo ? (
              <img
                src={SCHOOL_DATA.logoPath}
                alt={SCHOOL_DATA.appName}
                onError={() => setLogoFailed(true)}
                className="h-10 w-10 rounded-xl object-contain bg-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                {SCHOOL_DATA.appName}
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {SCHOOL_DATA.appTagline}
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto" onClick={onNavigate} aria-label="Go to dashboard">
            {showLogo ? (
              <img
                src={SCHOOL_DATA.logoPath}
                alt={SCHOOL_DATA.appName}
                onError={() => setLogoFailed(true)}
                className="h-10 w-10 rounded-xl object-contain bg-white shadow-md shadow-primary/20"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20">
                <Sparkles className="h-5 w-5" />
              </div>
            )}
          </Link>
        )}

        {onToggle && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-muted">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-2">
                {group.group}
              </h4>
            )}
            {group.items.map((item) => {
              const hasChildren = !!(item as any).children && (item as any).children.length > 0;
              const children = (item as any).children as RoleNavSubItem[] | undefined;
              const isExpanded = expanded[item.title] ?? false;
              const currentMatches =
                item.href !== "#" &&
                (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
              const isActive = pendingHref !== null ? pendingHref === item.href : currentMatches;

              const Icon = item.icon;

              // Determine if any child is active (tab-aware)
              const isChildActive =
                hasChildren &&
                children?.some((c) => {
                  // exact match including query
                  if (activeRoute === c.href) return true;
                  // href with query: check that activeRoute contains same tab param
                  const [cPath, cQuery] = c.href.split("?");
                  if (pathname !== cPath) return false;
                  if (!cQuery) return true;
                  const cParams = new URLSearchParams(cQuery);
                  const aParams = new URLSearchParams(searchString.replace(/^\?/, ""));
                  for (const [k, v] of cParams.entries()) {
                    if (aParams.get(k) !== v) return false;
                  }
                  return true;
                });

              const parentActive = isActive || !!isChildActive;

              if (hasChildren) {
                const isExamsResults = item.title === "Exams & Results";
                return (
                  <div key={item.title} className="space-y-1">
                    {/* ── Premium Parent Menu Item ── 48px, rounded-xl, gradient, chevron rotate */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      aria-controls={isExamsResults ? "exam-results-submenu" : undefined}
                      aria-label={`${item.title} menu`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!collapsed) toggleExpanded(item.title);
                        }
                      }}
                      onClick={() => {
                        if (collapsed) return;
                        toggleExpanded(item.title);
                      }}
                      className={cn(
                        "group flex items-center gap-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer select-none outline-none",
                        "min-h-[48px] h-12", // 48px height per spec
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
                        parentActive
                          ? "bg-gradient-to-br from-primary to-[hsl(var(--primary)/0.92)] text-primary-foreground shadow-[0_8px_20px_-8px_hsl(var(--primary)/0.35),0_2px_8px_hsl(var(--primary)/0.18)] font-semibold"
                          : isExpanded
                            ? "bg-sidebar-accent/70 text-sidebar-foreground shadow-sm border border-sidebar-border/40"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? `${item.title}${item.badge ? ` (${item.badge})` : ""}` : undefined}
                    >
                      <Link
                        href={item.href}
                        prefetch
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingHref(item.href);
                          if (onNavigate) onNavigate();
                        }}
                        className="flex items-center gap-3 flex-1 min-w-0"
                        aria-label={`Go to ${item.title}`}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-colors",
                            parentActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                          )}
                          strokeWidth={parentActive ? 2.2 : 1.9}
                        />
                        {!collapsed && <span className="flex-1 truncate tracking-[-0.01em]">{item.title}</span>}
                      </Link>

                      {!collapsed && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge && (
                            <Badge
                              variant={parentActive ? "secondary" : "default"}
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-5 font-medium rounded-full",
                                parentActive && "bg-white/20 text-white border-0 shadow-sm"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-lg transition-colors",
                              parentActive ? "bg-white/15 text-primary-foreground" : "bg-transparent text-muted-foreground group-hover:bg-sidebar-accent"
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                                isExpanded && "rotate-90"
                              )}
                            />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Premium Submenu Container ── delegated to reusable component */}
                    {isExamsResults ? (
                      <ExamResultsSubmenu
                        items={children}
                        activeRoute={activeRoute}
                        isExpanded={isExpanded}
                        collapsed={collapsed}
                        userPermissions={[session.role]}
                        submenuId="exam-results-submenu"
                        onNavigate={() => {
                          if (onNavigate) onNavigate();
                        }}
                      />
                    ) : (
                      !collapsed && (
                        <div
                          className={cn(
                            "grid transition-all ease-[cubic-bezier(0.4,0,0.2,1)]",
                            isExpanded ? "grid-rows-[1fr] opacity-100 duration-[260ms]" : "grid-rows-[0fr] opacity-0 duration-200"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="ml-[22px] pl-4 border-l border-sidebar-border/50 space-y-1 py-1">
                              {children?.map((child) => {
                                const childActive = activeRoute === child.href;
                                const ChildIcon = child.icon;
                                return (
                                  <Link
                                    key={child.title}
                                    href={child.href}
                                    prefetch
                                    onClick={() => {
                                      setPendingHref(child.href);
                                      if (onNavigate) onNavigate();
                                    }}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium min-h-[40px] transition-colors",
                                      childActive
                                        ? "bg-primary/[0.10] text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                    )}
                                  >
                                    {ChildIcon && <ChildIcon className="h-[18px] w-[18px] shrink-0" />}
                                    <span className="truncate">{child.title}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  prefetch
                  onClick={() => {
                    setPendingHref(item.href);
                    if (onNavigate) {
                      onNavigate();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "min-h-[44px]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    collapsed && "justify-center px-0 py-2.5"
                  )}
                  title={collapsed ? `${item.title}${item.badge ? ` (${item.badge})` : ""}` : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                    strokeWidth={isActive ? 2.2 : 1.9}
                  />
                  {!collapsed && <span className="flex-1 truncate tracking-[-0.01em]">{item.title}</span>}
                  {!collapsed && item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={cn("text-[10px] px-1.5 py-0 h-5 font-medium rounded-full", isActive && "bg-white/20 text-white border-0")}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / User Session Card + Sign out */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30 space-y-2">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-card border border-border/60 shadow-xs">
              <div className="relative">
                <img src={session.avatar} alt={session.name} className="h-9 w-9 rounded-xl object-cover ring-1 ring-border" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground truncate">{session.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">{session.roleLabel}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img src={session.avatar} alt={session.name} className="h-9 w-9 rounded-xl object-cover ring-1 ring-border" title={session.roleLabel} />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
