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
  const locs = mockDb.getStoreLocations(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Inventory & Stock — Centralized Store
            </h1>
            <Badge variant="outline" className="text-xs">
              {items.length} SKUs • {locs.length} Stores • {suppliers.length} Vendors
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Categories • Uniform size-wise • Stock Entry/Out • School Counter POS (Student) • Transfers • Low Stock • Audit — Small School → Large College ready.
          </p>
        </div>
      </div>
    </div>
  );
}
