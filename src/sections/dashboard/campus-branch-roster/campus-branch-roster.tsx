"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export function CampusBranchRoster() {
  const { activeBranchId, branches, setActiveBranchId } = useERP();

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Campus Branch Roster
          </h3>
          <p className="text-xs text-muted-foreground">
            Click any campus to filter dashboard metrics or manage individual school operations
          </p>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
          <Link href="/branches">
            <span>View All {branches.length} Branches</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {branches.map((b) => (
          <div
            key={b.id}
            onClick={() => setActiveBranchId(b.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden bg-card ${
              activeBranchId === b.id
                ? "border-primary shadow-md ring-2 ring-primary/20"
                : "border-border/80 hover:border-primary/40 hover:shadow-sm"
            }`}
          >
            <div
              className="absolute top-0 left-0 bottom-0 w-1.5"
              style={{ backgroundColor: b.color || "#3b82f6" }}
            />
            <div className="pl-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-muted-foreground">{b.code}</span>
                <Badge variant="outline" className="text-[10px] py-0">
                  {b.status}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {b.name}
              </h4>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>{formatNumber(b.totalStudents)} Students</span>
                <span>{b.totalTeachers} Teachers</span>
                <span className="font-semibold text-foreground">{b.attendanceRate}% Attendance</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
