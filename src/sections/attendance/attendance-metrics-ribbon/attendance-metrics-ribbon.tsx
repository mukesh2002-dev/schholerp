"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Users } from "lucide-react";

export function AttendanceMetricsRibbon() {
  const { activeBranchId } = useERP();
  const allRecords = mockDb.getAttendanceRecords(activeBranchId, "STUDENT");
  const availableDates = Array.from(new Set(allRecords.map((r) => r.date))).sort().reverse();
  const effectiveDate = availableDates[0] || new Date().toISOString().split("T")[0];
  const records = allRecords.filter((r) => r.date === effectiveDate);

  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const rate = records.length ? Math.round(((present + late) / records.length) * 100) : 96;

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
          <span className="text-[11px] text-emerald-600 font-medium">{rate}% Verified Attendance</span>
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
          <span className="text-[11px] text-amber-600 font-medium">Punch after 8:30 AM</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Unexcused Absences
            </span>
            <XCircle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{absent}</span>
          <span className="text-[11px] text-rose-600 font-medium">Automated SMS alerted</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Terminals
            </span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">4 / 4</span>
          <span className="text-[11px] text-emerald-600 font-medium">100% Online sync</span>
        </CardContent>
      </Card>
    </div>
  );
}
