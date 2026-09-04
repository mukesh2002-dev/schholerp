"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Building2, Check, ChevronDown, Globe } from "lucide-react";
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

export function BranchSelector() {
  const { activeBranchId, setActiveBranchId, branches } = useERP();

  const selectedBranch = branches.find((b) => b.id === activeBranchId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 sm:h-9 px-2.5 sm:px-3 gap-1.5 sm:gap-2 font-medium bg-background/80 backdrop-blur-xs border-border/80 hover:bg-accent hover:border-primary/50 text-left min-w-0 max-w-[118px] min-[380px]:max-w-[148px] min-[480px]:max-w-[190px] sm:max-w-[260px]"
          aria-label="Select campus"
        >
          {activeBranchId === "all" ? (
            <Globe className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedBranch?.color || "#3b82f6" }}
            />
          )}
          <div className="flex flex-col text-left truncate flex-1 min-w-0 leading-tight">
            <span className="text-xs font-semibold truncate text-foreground">
              {activeBranchId === "all" ? "All Campuses" : selectedBranch?.name}
            </span>
            {/* Subtitle hidden on phones — keeps the topbar from overflowing */}
            <span className="hidden sm:block text-[10px] text-muted-foreground truncate">
              {activeBranchId === "all" ? `${branches.length} Active Branches` : selectedBranch?.code}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-[280px] max-w-[calc(100vw-2rem)] p-1.5">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
          Select Campus Context
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setActiveBranchId("all")}
          className="gap-2.5 py-2 cursor-pointer font-medium"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm">All Campuses (Global View)</span>
            <span className="text-[11px] text-muted-foreground">Aggregated analytics & records</span>
          </div>
          {activeBranchId === "all" && <Check className="h-4 w-4 text-primary shrink-0" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
          Individual Branches ({branches.length})
        </DropdownMenuLabel>

        <div className="max-h-[260px] overflow-y-auto space-y-0.5">
          {branches.map((b) => (
            <DropdownMenuItem
              key={b.id}
              onClick={() => setActiveBranchId(b.id)}
              className="gap-2.5 py-2 cursor-pointer"
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs"
                style={{ backgroundColor: b.color || "#3b82f6" }}
              >
                {b.code.split("-")[0]}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{b.name}</span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {b.code} • {b.totalStudents} students
                </span>
              </div>
              {activeBranchId === b.id && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
