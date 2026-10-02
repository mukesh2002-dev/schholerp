"use client";

import React, { useMemo, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchStudentAttendance,
  fetchStaffAttendance,
  mapBackendStudentAttendance,
  mapBackendStaffAttendance,
} from "@/lib/api/attendance";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { AttendanceRecord } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Users } from "lucide-react";

export function AttendanceMetricsRibbon() {
  const { activeBranchId } = useERP();
  const [scope, setScope] = useState<"STUDENT" | "STAFF">("STUDENT");

  const { data: studentRecords } = useCampusData<AttendanceRecord[]>({
    fetcher: (cid) => fetchStudentAttendance({ campusId: cid }).then((res) =>
      Array.isArray(res) ? res.map((r) => mapBackendStudentAttendance(r, cid)) : []
    ),
    campusId: activeBranchId,
    fallback: [],
    enabled: scope === "STUDENT",
    queryKeyPrefix: "attendance-metrics-student",
  });

  const { data: staffRecords } = useCampusData<AttendanceRecord[]>({
    fetcher: (cid) => fetchStaffAttendance({ campusId: cid }).then((res) =>
      Array.isArray(res) ? res.map((r) => mapBackendStaffAttendance(r, cid)) : []
    ),
    campusId: activeBranchId,
    fallback: [],
    enabled: scope === "STAFF",
    queryKeyPrefix: "attendance-metrics-staff",
  });

  const records = scope === "STUDENT" ? studentRecords : staffRecords;

  const availableDates = useMemo(() => Array.from(new Set(records.map((r) => r.date))).sort().reverse(), [records]);
  const effectiveDate = availableDates[0] || new Date().toISOString().split("T")[0];
  const today = useMemo(() => records.filter((r) => r.date === effectiveDate), [records, effectiveDate]);

  const present = today.filter((r) => r.status === "PRESENT").length;
  const late = today.filter((r) => r.status === "LATE").length;
  const absent = today.filter((r) => r.status === "ABSENT").length;
  const rate = today.length ? Math.round(((present + late) / today.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant={scope === "STUDENT" ? "default" : "outline"}
          size="sm"
          onClick={() => setScope("STUDENT")}
          className="text-xs h-7"
        >
          Students
        </Button>
        <Button
          variant={scope === "STAFF" ? "default" : "outline"}
          size="sm"
          onClick={() => setScope("STAFF")}
          className="text-xs h-7"
        >
          Staff
        </Button>
        <span className="text-[11px] text-muted-foreground ml-1">
          Showing {scope === "STUDENT" ? "student roll-call" : "teacher / staff / worker check-ins"}
        </span>
      </div>
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
    </div>
  );
}