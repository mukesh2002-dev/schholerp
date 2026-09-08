"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RoleNavSubItem } from "@/lib/auth/role-navigation";
import type { StaffRole } from "@/lib/auth/demo-accounts";
import {
  ClipboardList,
  CalendarDays,
  PenLine,
  FileText,
  GraduationCap,
  FileBadge,
  Send,
  BarChart3,
  Award,
  Settings2,
} from "lucide-react";

export interface ExamResultsSubmenuProps {
  activeRoute: string;
  isExpanded: boolean;
  onNavigate?: () => void;
  userPermissions?: (StaffRole | string)[];
  items?: RoleNavSubItem[];
  collapsed?: boolean;
  submenuId?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Exams: ClipboardList,
  "Exam Schedule": CalendarDays,
  Timetable: CalendarDays,
  "Marks Entry": PenLine,
  "Exam Types": FileText,
  Results: GraduationCap,
  "My Results": GraduationCap,
  "Report Cards": FileBadge,
  "Publish Results": Send,
  "Result Analytics": BarChart3,
  "Grading System": Award,
  "Assessment Settings": Settings2,
};

const FALLBACK_ICON = FileText;

interface MenuGroup {
  label: string;
  keys: string[];
}

const MENU_GROUPS: MenuGroup[] = [
  {
    label: "EXAM MANAGEMENT",
    keys: ["Exams", "Exam Schedule", "Timetable", "Marks Entry", "Exam Types"],
  },
  {
    label: "RESULTS & REPORTS",
    keys: ["Results", "My Results", "Report Cards", "Publish Results", "Result Analytics"],
  },
  {
    label: "SETTINGS",
    keys: ["Grading System", "Assessment Settings"],
  },
];

const CATALOGUE: (RoleNavSubItem & { group: string })[] = [
  { title: "Exams", href: "/exams?tab=exams", icon: ClipboardList, group: "EXAM MANAGEMENT" },
  { title: "Exam Schedule", href: "/exams?tab=timetable", icon: CalendarDays, group: "EXAM MANAGEMENT" },
  { title: "Marks Entry", href: "/exams?tab=marks", icon: PenLine, group: "EXAM MANAGEMENT", allowedRoles: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER"] as StaffRole[] },
  { title: "Exam Types", href: "/exams?tab=exam-types", icon: FileText, group: "EXAM MANAGEMENT", allowedRoles: ["SUPER_ADMIN", "PRINCIPAL"] as StaffRole[] },
  { title: "Results", href: "/exams?tab=results", icon: GraduationCap, group: "RESULTS & REPORTS" },
  { title: "Report Cards", href: "/exams?tab=cards", icon: FileBadge, group: "RESULTS & REPORTS" },
  { title: "Publish Results", href: "/exams?tab=publish", icon: Send, group: "RESULTS & REPORTS", allowedRoles: ["SUPER_ADMIN", "PRINCIPAL"] as StaffRole[] },
  { title: "Result Analytics", href: "/exams?tab=analytics", icon: BarChart3, group: "RESULTS & REPORTS", allowedRoles: ["SUPER_ADMIN", "PRINCIPAL"] as StaffRole[] },
  { title: "Grading System", href: "/exams?tab=grading", icon: Award, group: "SETTINGS", allowedRoles: ["SUPER_ADMIN", "PRINCIPAL"] as StaffRole[] },
  { title: "Assessment Settings", href: "/exams?tab=assessment", icon: Settings2, group: "SETTINGS", allowedRoles: ["SUPER_ADMIN", "PRINCIPAL"] as StaffRole[] },
];

function isItemActive(activeRoute: string, href: string): boolean {
  if (!href) return false;
  const [hrefPath, hrefQuery] = href.split("?");
  const [activePath, activeQueryRaw] = activeRoute.split("?");
  const activeQuery = activeQueryRaw ?? "";
  if (activePath !== hrefPath) {
    if (!(activePath === hrefPath.split("?")[0] && !hrefQuery)) return false;
  }
  if (!hrefQuery) {
    return !activeQuery || activeRoute === href;
  }
  const hrefParams = new URLSearchParams(hrefQuery);
  const activeParams = new URLSearchParams(activeQuery);
  for (const [k, v] of hrefParams.entries()) {
    if (activeParams.get(k) !== v) return false;
  }
  return true;
}

function resolveIcon(title: string, explicit?: React.ElementType): React.ElementType {
  if (explicit) return explicit;
  return ICON_MAP[title] ?? FALLBACK_ICON;
}

export function ExamResultsSubmenu({
  activeRoute,
  isExpanded,
  onNavigate,
  userPermissions,
  items,
  collapsed = false,
  submenuId = "exam-results-submenu",
}: ExamResultsSubmenuProps) {
  const visibleByGroup = React.useMemo(() => {
    let pool: RoleNavSubItem[];
    if (items && items.length > 0) {
      pool = items;
    } else {
      pool = CATALOGUE;
    }

    if (userPermissions && userPermissions.length > 0) {
      pool = pool.filter((it) => {
        if (!it.allowedRoles || it.allowedRoles.length === 0) return true;
        return it.allowedRoles.some((r) => (userPermissions as string[]).includes(r as string));
      });
    }

    const map = new Map<string, RoleNavSubItem[]>();
    MENU_GROUPS.forEach((g) => map.set(g.label, []));
    const fallbackKey = "__fallback__";
    map.set(fallbackKey, []);

    for (const item of pool) {
      const group = MENU_GROUPS.find((g) => g.keys.includes(item.title));
      const key = group ? group.label : fallbackKey;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    for (const [label, list] of map.entries()) {
      if (label === fallbackKey) continue;
      const order = MENU_GROUPS.find((g) => g.label === label)?.keys ?? [];
      list.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    }

    for (const [k, v] of [...map.entries()]) {
      if (v.length === 0) map.delete(k);
    }
    if (map.has(fallbackKey) && map.get(fallbackKey)!.length === 0) map.delete(fallbackKey);

    return map;
  }, [items, userPermissions]);

  if (collapsed) return null;

  const hasAny = visibleByGroup.size > 0;

  return (
    <div
      id={submenuId}
      role="group"
      aria-label="Exams and Results submenu"
      className={cn(
        "grid transition-all ease-[cubic-bezier(0.4,0,0.2,1)]",
        isExpanded ? "grid-rows-[1fr] opacity-100 duration-[260ms]" : "grid-rows-[0fr] opacity-0 duration-200"
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "relative mt-1.5 ml-[22px] pl-4 border-l border-sidebar-border/50 space-y-5 py-1",
            "transition-all duration-200",
            isExpanded ? "translate-y-0" : "-translate-y-1"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-sidebar-border/40 to-transparent"
          />

          {!hasAny ? (
            <p className="px-3 py-2 text-xs text-muted-foreground/60">No items available</p>
          ) : (
            Array.from(visibleByGroup.entries()).map(([groupLabel, groupItems]) => {
              if (groupLabel === "__fallback__") {
                return (
                  <div key={groupLabel} className="space-y-1">
                    {groupItems.map((item) => (
                      <SubmenuItem key={item.href + item.title} item={item} activeRoute={activeRoute} onNavigate={onNavigate} />
                    ))}
                  </div>
                );
              }
              return (
                <div key={groupLabel} className="space-y-2">
                  <div className="flex items-center gap-2 px-2 select-none" aria-hidden>
                    <span className="h-px w-3 rounded-full bg-sidebar-border/70" />
                    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/55 leading-none">
                      {groupLabel}
                    </span>
                    <span className="h-px flex-1 rounded-full bg-sidebar-border/30" />
                  </div>

                  <ul role="list" className="space-y-1">
                    {groupItems.map((item) => (
                      <li key={item.href + item.title} role="listitem">
                        <SubmenuItem item={item} activeRoute={activeRoute} onNavigate={onNavigate} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SubmenuItem({
  item,
  activeRoute,
  onNavigate,
}: {
  item: RoleNavSubItem;
  activeRoute: string;
  onNavigate?: () => void;
}) {
  const active = isItemActive(activeRoute, item.href);
  const Icon = resolveIcon(item.title, item.icon);

  return (
    <Link
      href={item.href}
      prefetch
      onClick={() => onNavigate?.()}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/item relative flex items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium leading-none outline-none transition-all duration-150",
        "min-h-[40px] py-2.5",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        active
          ? "bg-primary/[0.10] dark:bg-primary/[0.14] text-primary dark:text-primary font-semibold shadow-[inset_0_1px_0_hsl(var(--primary)/0.08)]"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground bg-transparent"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-sm"
        />
      )}

      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
          active ? "text-primary" : "text-muted-foreground/70 group-hover/item:text-primary"
        )}
        strokeWidth={active ? 2.2 : 1.9}
        aria-hidden
      />
      <span className="flex-1 truncate tracking-[-0.01em]">{item.title}</span>

      {active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary/70 shadow-sm" />}
    </Link>
  );
}

export default ExamResultsSubmenu;
