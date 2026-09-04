"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Bus } from "lucide-react";

export function TransportHeader() {
  const { activeBranchId } = useERP();
  const vehicles = mockDb.getVehicles(activeBranchId);
  const routes = mockDb.getTransportRoutes(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Bus className="h-6 w-6 text-primary" />
              Transport &amp; Fleet Logistics
            </h1>
            <Badge variant="outline" className="text-xs">
              {vehicles.length} Fleet Buses • {routes.length} Active Routes
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time GPS bus tracking, student route manifests, driver licenses, and vehicle maintenance.
          </p>
        </div>
      </div>
    </div>
  );
}
