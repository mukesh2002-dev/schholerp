"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { formatNumber } from "@/lib/utils";

export function BranchMetricsRibbon() {
  const { branches } = useERP();

  const totalCapacity = branches.reduce((acc, b) => acc + b.capacity, 0);
  const totalStudents = branches.reduce((acc, b) => acc + b.totalStudents, 0);
  const totalFaculty = branches.reduce((acc, b) => acc + b.totalTeachers, 0);
  const totalStaff = branches.reduce((acc, b) => acc + b.totalStaff + b.totalWorkers, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Campuses */}
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Total Campuses
        </span>
        <span className="text-2xl font-bold text-foreground mt-1 block">{branches.length}</span>
        <span className="text-[11px] text-emerald-600 font-medium">All operational</span>
      </div>

      {/* Group Student Capacity */}
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Group Student Capacity
        </span>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {formatNumber(totalStudents)} / {formatNumber(totalCapacity)}
        </span>
        <span className="text-[11px] text-primary font-medium">{avgOccupancy}% Occupancy</span>
      </div>

      {/* Faculty & Teachers */}
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Faculty &amp; Teachers
        </span>
        <span className="text-2xl font-bold text-foreground mt-1 block">{formatNumber(totalFaculty)}</span>
        <span className="text-[11px] text-muted-foreground">Certified Instructors</span>
      </div>

      {/* Support & Workers */}
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Support &amp; Workers
        </span>
        <span className="text-2xl font-bold text-foreground mt-1 block">{formatNumber(totalStaff)}</span>
        <span className="text-[11px] text-muted-foreground">Admin + Facility Staff</span>
      </div>
    </div>
  );
}
