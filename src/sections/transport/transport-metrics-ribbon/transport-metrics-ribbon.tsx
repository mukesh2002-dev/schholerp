"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card } from "@/components/ui/card";
import { Bus, Route, Users, Truck } from "lucide-react";

export function TransportMetricsRibbon() {
  const { activeBranchId } = useERP();
  const vehicles = mockDb.getVehicles(activeBranchId);
  const routes = mockDb.getTransportRoutes(activeBranchId);
  const assignments = mockDb.getStudentTransportAssignments(activeBranchId);

  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Fleet Buses
          </span>
          <Bus className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{vehicles.length}</span>
        <span className="text-[11px] text-muted-foreground">{activeVehicles} on active routes</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Routes
          </span>
          <Route className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{routes.length}</span>
        <span className="text-[11px] text-purple-600 font-medium">GPS tracked live</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Commuter Students
          </span>
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{assignments.length}</span>
        <span className="text-[11px] text-emerald-600 font-medium">Assigned seats</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Fleet Capacity
          </span>
          <Truck className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {vehicles.reduce((s, v) => s + (v.capacity || 0), 0)}
        </span>
        <span className="text-[11px] text-muted-foreground">Total passenger seats</span>
      </Card>
    </div>
  );
}
