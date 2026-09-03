"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { demoRolesList } from "@/lib/mock-data/dashboard";
import { ShieldCheck, UserCheck, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function RoleSelector() {
  const { session, setRole } = useERP();

  const currentRoleConfig = demoRolesList.find((r) => r.role === session.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2 font-medium bg-background/80 backdrop-blur-xs border-border/80 hover:bg-accent hover:border-primary/50 text-left max-w-[200px] sm:max-w-[240px]"
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left truncate flex-1 leading-tight">
            <span className="text-xs font-semibold truncate text-foreground">
              {session.roleLabel || session.role}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">Demo Role Switcher</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] p-1.5">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center justify-between">
          <span>Demo Role & Permissions</span>
          <Badge variant="outline" className="text-[10px] font-normal">
            Demo Mode
          </Badge>
        </DropdownMenuLabel>
        <p className="text-[11px] text-muted-foreground px-2 pb-2 leading-relaxed">
          Switch roles to experience role-aware UI dashboards, data filtering, and security controls.
        </p>

        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto space-y-0.5">
          {demoRolesList.map((r) => (
            <DropdownMenuItem
              key={r.role}
              onClick={() => setRole(r.role)}
              className="gap-2.5 py-2 cursor-pointer items-start"
            >
              <div className="flex h-6 w-6 mt-0.5 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-semibold text-foreground">{r.label}</span>
                <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {r.description}
                </span>
              </div>
              {session.role === r.role && <Check className="h-4 w-4 text-primary shrink-0 mt-1" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
