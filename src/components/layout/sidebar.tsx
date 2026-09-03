"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useERP } from "@/components/providers/erp-provider";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Briefcase,
  HardHat,
  CreditCard,
  Fingerprint,
  Bus,
  Package,
  Receipt,
  BarChart3,
  ClipboardList,
  ShieldAlert,
  Megaphone,
  MessageSquare,
  Bell,
  Calendar,
  Sparkles,
  Rocket,
  Server,
  ChevronLeft,
  Library,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isPhaseFuture?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    group: "Core Management",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Campus Branches", href: "/branches", icon: Building2, badge: "6 Active" },
    ],
  },
  {
    group: "Academics & Faculty",
    items: [
      { title: "Admissions", href: "/admissions", icon: UserPlus, badge: "Pipeline" },
      { title: "Students", href: "/students", icon: GraduationCap, badge: "Roster" },
      { title: "Classes & Sections", href: "/classes", icon: BookOpen },
      { title: "Faculty / Teachers", href: "/teachers", icon: Users },
      { title: "Timetable", href: "/timetable", icon: CalendarDays, badge: "5" },
      { title: "Homework", href: "/homework", icon: ClipboardList, badge: "5" },
      { title: "Exams & Results", href: "/exams", icon: FileSpreadsheet, badge: "5" },
      { title: "Library", href: "/library", icon: Library, badge: "8" },
    ],
  },
  {
    group: "HR & Support Staff",
    items: [
      { title: "HR / Staff Directory", href: "/hr", icon: Briefcase, badge: "HR" },
      { title: "Payroll & Leave", href: "/hr", icon: HardHat, badge: "7" },
    ],
  },
  {
    group: "Finance & Operations",
    items: [
      { title: "Fees & Collections", href: "/fees", icon: CreditCard, badge: "9" },
      { title: "Attendance & Biometric", href: "/attendance", icon: Fingerprint, badge: "Live" },
      { title: "Transport & Fleet", href: "/transport", icon: Bus, badge: "5" },
      { title: "Inventory & Stock", href: "/inventory", icon: Package, badge: "7" },
      { title: "Expenses & Ledger", href: "/expenses", icon: Receipt, badge: "7" },
      { title: "Payroll", href: "/payroll", icon: Briefcase, badge: "7" },
      { title: "Documents", href: "/documents", icon: FileSpreadsheet, badge: "7" },
    ],
  },
  {
    group: "Communication & Events",
    items: [
      { title: "Announcements", href: "/announcements", icon: Megaphone, badge: "6" },
      { title: "Messages", href: "/messages", icon: MessageSquare, badge: "3" },
      { title: "Notifications", href: "/notifications", icon: Bell, badge: "5" },
      { title: "Events Calendar", href: "/events", icon: Calendar, badge: "8" },
      { title: "Parent Portal", href: "/parents", icon: Heart, badge: "Live" },
    ],
  },
  {
    group: "Intelligence & Audit",
    items: [
      { title: "Reports & BI", href: "/reports", icon: BarChart3, badge: "7" },
      { title: "QA & Bug Tracker", href: "/qa", icon: ClipboardList, badge: "8" },
      { title: "Audit Logs", href: "/audit", icon: ShieldAlert, badge: "10" },
      { title: "Engineering", href: "/engineering", icon: Rocket, badge: "10" },
    ],
  },
  {
    group: "System & DevOps",
    items: [
      { title: "Builds", href: "/builds", icon: Rocket, badge: "9" },
      { title: "Deployments", href: "/deployments", icon: Server, badge: "9" },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { session } = useERP();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

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
                  onClick={(e) => {
                    if (item.isPhaseFuture) {
                      e.preventDefault();
                      toast.info(`${item.title} — ${item.badge} module coming soon`, {
                        description: "This feature is planned for a future release. Stay tuned!",
                      });
                    } else {
                      setPendingHref(item.href);
                      if (onNavigate) {
                        onNavigate();
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative active:scale-[0.98]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    item.isPhaseFuture && "opacity-75 hover:opacity-100 cursor-default",
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
                      variant={isActive ? "secondary" : item.isPhaseFuture ? "outline" : "default"}
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

      {/* Footer / User Session Card */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/30">
        {!collapsed ? (
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
        ) : (
          <div className="flex justify-center">
            <img
              src={session.avatar}
              alt={session.name}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
