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
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  // Sidebar reshapes itself for the signed-in staff role.
  const navGroups = React.useMemo(() => getNavForRole(session.role), [session.role]);

  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out", { description: "See you soon. Demo session cleared." });
    router.replace("/login");
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-30 select-none gpu-accelerated",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border shrink-0">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-3 group" onClick={onNavigate}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-sidebar-foreground">
                Apex ERP
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                Multi-Campus Group
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/" className="mx-auto" onClick={onNavigate}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
          </Link>
        )}

        {onToggle && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
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
              const currentMatches =
                item.href !== "#" &&
                (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
              const isActive = pendingHref !== null ? pendingHref === item.href : currentMatches;
              const Icon = item.icon;

              return (
                <Link
                    key={item.title}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      setPendingHref(item.href);
                      if (onNavigate) {
                        onNavigate();
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative active:scale-[0.98]",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      collapsed && "justify-center px-0 py-2.5"
                    )}
                  title={collapsed ? `${item.title}${item.badge ? ` (${item.badge})` : ""}` : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                  {!collapsed && item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "default"}
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 font-normal",
                        isActive && "bg-white/20 text-white border-0"
                      )}
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
                <img
                  src={session.avatar}
                  alt={session.name}
                  className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground truncate">{session.name}</span>
                <span className="text-[10px] text-muted-foreground truncate">{session.roleLabel}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={session.avatar}
              alt={session.name}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
              title={session.roleLabel}
            />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
