"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchStaffDirectory } from "@/lib/api/hr";
import { fetchLeaves, mapBackendLeave } from "@/lib/api/attendance";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, Clock, Calendar } from "lucide-react";

export function HrMetricsRibbon() {
  const { activeBranchId } = useERP();
  const { data: staff } = useCampusData({
    fetcher: (cid) => fetchStaffDirectory({ campusId: cid, limit: 100 }).then((r) => r.data),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "hr-staff",
  });
  const { data: leaves } = useCampusData({
    fetcher: (cid) => fetchLeaves({ campusId: cid }).then((list) => (Array.isArray(list) ? list : []).map(mapBackendLeave)),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "leaves",
  });

  const totalStaff = staff.length;
  const active = staff.filter((s: any) => s.isActive !== false).length;
  const onLeave = 0;
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
          <span className="text-[11px] text-muted-foreground">From user directory</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Active Accounts
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{active}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Active roster</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Approved Leaves
            </span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{leaves.filter((l) => l.status === "APPROVED").length}</span>
          <span className="text-[11px] text-amber-600 font-medium">Approved leaves</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Pending Leaves
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
