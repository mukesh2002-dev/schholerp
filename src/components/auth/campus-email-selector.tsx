"use client";

import React, { useState } from "react";
import {
  CAMPUS_TABS,
  CAMPUS_ACCOUNTS,
  getAccountsByCampus,
  CampusAccount,
  UNIVERSAL_PASSWORD,
} from "@/lib/auth/campus-credentials";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  Calculator,
  BookOpen,
  UserCheck,
  ShieldCheck,
  Check,
  Sparkles,
  ChevronDown,
  Building2,
} from "lucide-react";

interface CampusEmailSelectorProps {
  currentEmail?: string;
  onSelectAccount: (email: string, password?: string) => void;
  /** Optional filter to prioritize a specific role if inside a portal (e.g. "PRINCIPAL") */
  preferredCategory?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Principal: GraduationCap,
  HR: Users,
  Accountant: Calculator,
  Librarian: BookOpen,
  Teacher: UserCheck,
  Admin: ShieldCheck,
};

const CATEGORY_COLORS: Record<string, string> = {
  Principal: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20",
  HR: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20",
  Accountant: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20",
  Librarian: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20",
  Teacher: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/20",
  Admin: "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20",
};

export function CampusEmailSelector({
  currentEmail = "",
  onSelectAccount,
  preferredCategory,
}: CampusEmailSelectorProps) {
  // Infer initial campus from currentEmail if already filled
  const [activeCampus, setActiveCampus] = useState<string>(() => {
    if (currentEmail.includes(".c1@")) return "C1";
    if (currentEmail.includes(".c2@")) return "C2";
    if (currentEmail.includes(".c3@")) return "C3";
    if (currentEmail.includes(".main@")) return "MAIN";
    if (currentEmail.includes("admin@") || currentEmail.includes("ops.admin")) return "GLOBAL";
    return "MAIN";
  });

  const accounts = getAccountsByCampus(activeCampus);

  return (
    <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Quick Email Suggestion (Campus-wise)</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4 bg-background">
          Password: {UNIVERSAL_PASSWORD}
        </Badge>
      </div>

      {/* Campus Switcher Tabs */}
      <div className="flex flex-wrap gap-1 p-0.5 rounded-lg bg-background border border-border/60">
        {CAMPUS_TABS.map((tab) => {
          const isActive = activeCampus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCampus(tab.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <span className="text-xs">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role Email Suggestion Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
        {accounts.map((acc) => {
          const Icon = CATEGORY_ICONS[acc.category] ?? Building2;
          const isSelected = currentEmail.toLowerCase() === acc.email.toLowerCase();
          const isPreferred = preferredCategory && acc.category.toLowerCase() === preferredCategory.toLowerCase();

          return (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelectAccount(acc.email, UNIVERSAL_PASSWORD)}
              className={cn(
                "group flex items-start gap-2 p-2 rounded-lg border text-left text-xs transition-all relative",
                isSelected
                  ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                  : "border-border/70 bg-card hover:border-primary/50 hover:bg-accent/50",
                isPreferred && !isSelected && "ring-1 ring-primary/30"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs mt-0.5",
                  CATEGORY_COLORS[acc.category] ?? "border-border bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-foreground truncate">{acc.roleLabel}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{acc.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground/80 truncate mt-0.5">
                  {acc.email}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        💡 Click any role above to instantly fill the email and sign in.
      </p>
    </div>
  );
}
