"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Route, Users, AlertTriangle } from "lucide-react";

function daysToExpiry(dateStr: string): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 999;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function TransportMetricsRibbon() {
  const { activeBranchId } = useERP();
  const vehicles = mockDb.getVehicles(activeBranchId);
  const routes = mockDb.getTransportRoutes(activeBranchId);
  const assignments = mockDb.getStudentTransportAssignments(activeBranchId);
  const drivers = mockDb.getDrivers(activeBranchId);

  const activeVehicles = vehicles.filter((v) => v.status === "ACTIVE").length;
  const activeRoutes = routes.filter((r) => r.status === "ACTIVE").length;

  const expiryAlerts = [
    ...vehicles
      .filter((v) => daysToExpiry(v.insuranceExpiry) <= 30 || daysToExpiry(v.fitnessCertificateExpiry) <= 30)
      .map((v) => `Bus ${v.registrationNumber}`),
    ...drivers.filter((d) => daysToExpiry(d.licenseExpiry) <= 30).map((d) => `Driver ${d.name}`),
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Vehicles</span>
            <Bus className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold mt-1 block">{vehicles.length}</span>
          <span className="text-[11px] text-muted-foreground">{activeVehicles} active • {vehicles.length - activeVehicles} maintenance/inactive</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Routes</span>
            <Route className="h-4 w-4 text-purple-500" />
          </div>
          <span className="text-2xl font-bold mt-1 block">{activeRoutes}/{routes.length}</span>
          <span className="text-[11px] text-purple-600 font-medium">GPS live • {routes.reduce((s, r) => s + r.stops.length, 0)} stops</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Students Assigned</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold mt-1 block">{assignments.filter((a) => a.status === "ACTIVE").length}/{assignments.length}</span>
          <span className="text-[11px] text-emerald-600 font-medium">{vehicles.reduce((s, v) => s + v.capacity, 0)} seats total • {assignments.filter((a) => a.status === "ACTIVE").length} occupied</span>
        </CardContent>
      </Card>

      <Card className={`border-border/70 shadow-2xs ${expiryAlerts.length > 0 ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Expiry Alerts</span>
            <AlertTriangle className={`h-4 w-4 ${expiryAlerts.length > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </div>
          <span className={`text-2xl font-bold mt-1 block ${expiryAlerts.length > 0 ? "text-amber-600" : "text-foreground"}`}>{expiryAlerts.length}</span>
          <span className="text-[11px] text-muted-foreground">
            {expiryAlerts.length ? expiryAlerts.slice(0, 2).join(", ") + (expiryAlerts.length > 2 ? ` +${expiryAlerts.length - 2}` : "") : "No expiries in 30 days"}
          </span>
          {expiryAlerts.length > 0 && <Badge variant="warning" className="text-[10px] mt-1">Action needed</Badge>}
        </CardContent>
      </Card>
    </div>
  );
}
