"use client";

import React, { useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchStudentAttendance, mapBackendStudentAttendance } from "@/lib/api/attendance";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { AttendanceRecord } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Users } from "lucide-react";

export function AttendanceMetricsRibbon() {
  const { activeBranchId } = useERP();
  const { data: records } = useCampusData<AttendanceRecord[]>({
    fetcher: (cid) => fetchStudentAttendance({ campusId: cid }).then((res) =>
      Array.isArray(res) ? res.map((r) => mapBackendStudentAttendance(r, cid)) : []
    ),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "attendance-metrics",
  });

  const availableDates = useMemo(() => Array.from(new Set(records.map((r) => r.date))).sort().reverse(), [records]);
  const effectiveDate = availableDates[0] || new Date().toISOString().split("T")[0];
  const today = useMemo(() => records.filter((r) => r.date === effectiveDate), [records, effectiveDate]);

  const present = today.filter((r) => r.status === "PRESENT").length;
  const late = today.filter((r) => r.status === "LATE").length;
  const absent = today.filter((r) => r.status === "ABSENT").length;
  const rate = today.length ? Math.round(((present + late) / today.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Present Today
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{present}</span>
          <span className="text-[11px] text-emerald-600 font-medium">{rate}% attendance rate</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
              Late Arrivals
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{late}</span>
          <span className="text-[11px] text-amber-600 font-medium">{effectiveDate}</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Absences
            </span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{absent}</span>
          <span className="text-[11px] text-rose-600 font-medium">Live from attendance ledger</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Records
            </span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">{today.length}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Marked on {effectiveDate}</span>
        </CardContent>
      </Card>
    </div>
  );
}