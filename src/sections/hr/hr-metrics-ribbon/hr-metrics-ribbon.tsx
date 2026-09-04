"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, Calendar } from "lucide-react";

export function HrMetricsRibbon() {
  const { activeBranchId } = useERP();
  const staff = [
    ...mockDb.getStaffMembers(activeBranchId),
    ...mockDb.getTeachers(activeBranchId),
  ];
  const leaves = mockDb.getLeaveRecords(activeBranchId);

  const totalStaff = staff.length;
  const active = staff.filter((s) => s.status === "ACTIVE").length;
  const onLeave = staff.filter((s) => s.status === "ON_LEAVE").length;
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Personnel
            </span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">{totalStaff}</span>
          <span className="text-[11px] text-muted-foreground">Teaching + Admin + Support</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Active on Duty
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{active}</span>
          <span className="text-[11px] text-emerald-600 font-medium">98.2% Active roster</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              On Authorized Leave
            </span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{onLeave}</span>
          <span className="text-[11px] text-amber-600 font-medium">Approved leaves</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Leave Requests
            </span>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{pendingLeaves}</span>
          <span className="text-[11px] text-rose-600 font-medium">Pending HR approval</span>
        </CardContent>
      </Card>
    </div>
  );
}
