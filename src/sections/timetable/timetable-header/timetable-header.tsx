"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export function TimetableHeader() {
  const { activeBranchId } = useERP();
  const slots = mockDb.getTimetableSlots(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Master Academic Timetable
            </h1>
            <Badge variant="outline" className="text-xs">
              {slots.length} Active Slots
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Weekly class schedules, period matrix, teacher workload distribution, and conflict detection.
          </p>
        </div>
      </div>
    </div>
  );
}
