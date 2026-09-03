"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Branch } from "@/types";
import { useERP } from "@/components/providers/erp-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface BranchCardProps {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  const { activeBranchId, setActiveBranchId } = useERP();
  const isCurrentActive = activeBranchId === branch.id;

  const occupancyRate = Math.round((branch.totalStudents / branch.capacity) * 100);

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "EXPANDING":
        return "purple";
      case "MAINTENANCE":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/80 transition-all duration-300 hover:shadow-lg hover:border-primary/40 bg-card">
      {/* Top Accent Bar */}
      <div className="h-2 w-full" style={{ backgroundColor: branch.color || "#3b82f6" }} />

      <CardContent className="p-5 space-y-4">
        {/* Header: Title & Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                {branch.code}
              </span>
              <Badge variant={statusVariant(branch.status) as any} className="text-[10px]">
                {branch.status}
              </Badge>
            </div>
            <Link
              href={`/branches/${branch.id}`}
              className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
            >
              {branch.name}
            </Link>
            <p className="text-xs text-muted-foreground line-clamp-1">{branch.tagline}</p>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/branches/${branch.id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>View Full Details</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveBranchId(branch.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Switch to Campus</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(branch)} className="flex items-center gap-2 cursor-pointer">
                <Edit2 className="h-4 w-4 text-amber-500" />
                <span>Edit Branch</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(branch)}
                className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Deactivate Branch</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Capacity Utilization Progress Bar */}
        <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Student Occupancy</span>
            <span className="font-bold text-foreground">
              {formatNumber(branch.totalStudents)} / {formatNumber(branch.capacity)}{" "}
              <span className="text-primary font-semibold">({occupancyRate}%)</span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(occupancyRate, 100)}%`,
                backgroundColor: branch.color || "#3b82f6",
              }}
            />
          </div>
        </div>

        {/* Staff & Faculty Counts Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Faculty</span>
            <span className="font-bold text-sm text-foreground">{branch.totalTeachers}</span>
          </div>
          <div className="p-2 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Staff</span>
            <span className="font-bold text-sm text-foreground">{branch.totalStaff}</span>
          </div>
          <div className="p-2 rounded-lg bg-background border border-border/60">
            <span className="text-[10px] text-muted-foreground block">Support Workers</span>
            <span className="font-bold text-sm text-foreground">{branch.totalWorkers}</span>
          </div>
        </div>

        {/* Principal and Contact Snapshot */}
        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-2 truncate">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              Principal: <strong className="text-foreground">{branch.principalName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">
              {branch.city}, {branch.state}
            </span>
          </div>
        </div>

        {/* Key Facilities Badges */}
        <div className="flex flex-wrap gap-1 pt-1">
          {branch.facilities.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium"
            >
              {f}
            </span>
          ))}
          {branch.facilities.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground bg-muted">
              +{branch.facilities.length - 3} more
            </span>
          )}
        </div>

        {/* Footer Card Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <Button
            variant={isCurrentActive ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveBranchId(branch.id)}
            className="flex-1 text-xs h-8"
          >
            {isCurrentActive ? "Active Campus Context" : "Switch Context"}
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs h-8 px-2.5">
            <Link href={`/branches/${branch.id}`} className="flex items-center gap-1">
              <span>Explore</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
