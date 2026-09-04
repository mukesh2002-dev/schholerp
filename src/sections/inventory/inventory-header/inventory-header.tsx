"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export function InventoryHeader() {
  const { activeBranchId } = useERP();
  const items = mockDb.getInventoryItems(activeBranchId);
  const suppliers = mockDb.getInventorySuppliers();

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Inventory, Assets &amp; Procurement
            </h1>
            <Badge variant="outline" className="text-xs">
              {items.length} Stock SKUs • {suppliers.length} Approved Vendors
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            School assets, lab consumables, uniform stock, vendor orders, and reorder alerts across campuses.
          </p>
        </div>
      </div>
    </div>
  );
}
