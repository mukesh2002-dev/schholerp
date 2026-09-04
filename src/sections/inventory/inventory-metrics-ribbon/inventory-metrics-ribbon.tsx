"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingCart, Truck, AlertTriangle } from "lucide-react";

export function InventoryMetricsRibbon() {
  const { activeBranchId } = useERP();
  const items = mockDb.getInventoryItems(activeBranchId);
  const suppliers = mockDb.getInventorySuppliers();
  const purchases = mockDb.getPurchaseEntries(activeBranchId);
  const alerts = mockDb.getStockAlerts(activeBranchId);

  const totalAssetValuation = items.reduce(
    (acc, i) => acc + i.quantityOnHand * i.unitPrice,
    0
  );
  const lowStockCount = items.filter(
    (i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK"
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Stock Valuation
            </span>
            <Package className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {formatCurrency(totalAssetValuation)}
          </span>
          <span className="text-[11px] text-muted-foreground">{items.length} Tracked SKUs</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
              Reorder Alerts
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">{lowStockCount}</span>
          <span className="text-[11px] text-rose-600 font-medium">Critical thresholds</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">
              Purchase Orders
            </span>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </div>
          <span className="text-2xl font-bold text-purple-600 mt-1 block">{purchases.length}</span>
          <span className="text-[11px] text-purple-600 font-medium">Procurement ledger</span>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-2xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
              Approved Vendors
            </span>
            <Truck className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{suppliers.length}</span>
          <span className="text-[11px] text-emerald-600 font-medium">Verified supply chain</span>
        </CardContent>
      </Card>
    </div>
  );
}
