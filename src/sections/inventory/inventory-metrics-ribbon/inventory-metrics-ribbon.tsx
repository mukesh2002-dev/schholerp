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
  const purchases = mockDb.getPurchaseEntries(activeBranchId);
  const alerts = mockDb.getStockAlerts(activeBranchId);
  const sales = mockDb.getStoreSales(activeBranchId === "all" ? undefined : activeBranchId);
  const locs = mockDb.getStoreLocations(activeBranchId);

  const totalProducts = items.length;
  const totalStock = items.reduce((a, b) => a + b.quantity, 0);
  const totalValuation = items.reduce((a, b: any) => a + b.quantity * (b.purchasePrice || b.unitPrice), 0);
  const lowCount = alerts.filter((a) => a.severity === "WARNING").length;
  const outCount = alerts.filter((a) => a.severity === "CRITICAL").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysSales = sales.filter((s) => s.date.startsWith(todayStr));
  const todaysRevenue = todaysSales.reduce((a, b) => a + b.totalAmount, 0);
  const monthlyRevenue = sales.reduce((a, b) => a + b.totalAmount, 0);

  // spec 5 Indian categories mapping
  const booksStationery = items.filter((i: any) => ["Stationery", "Books"].includes(i.categoryName));
  const uniforms = items.filter((i: any) => i.categoryName === "Uniform");
  const labEquip = items.filter((i: any) => i.categoryName === "Laboratory Items");
  const sports = items.filter((i: any) => i.categoryName === "Sports Items");
  const schoolProperty = items.filter((i: any) => ["Office Supplies", "Cleaning Supplies", "Other Items"].includes(i.categoryName));
  const recentMovements = mockDb.getInventoryTransactions(undefined, activeBranchId).slice(0, 10);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Books & Stationery</div>
            <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">{booksStationery.length} items</div>
            <div className="text-[11px] text-muted-foreground">{booksStationery.reduce((a: number, b: any) => a + b.quantity, 0)} pcs • {formatCurrency(booksStationery.reduce((a: number, b: any) => a + b.totalValue, 0))}</div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 bg-violet-50/40 dark:bg-violet-950/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">Uniforms</div>
            <div className="text-2xl font-extrabold text-violet-700 dark:text-violet-300 mt-1">{uniforms.length} items</div>
            <div className="text-[11px] text-muted-foreground">{uniforms.reduce((a: number, b: any) => a + b.quantity, 0)} pcs • {uniforms.filter((i: any) => i.variants).length} size-wise</div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Lab Equipment</div>
            <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-1">{labEquip.length} items</div>
            <div className="text-[11px] text-muted-foreground">{labEquip.reduce((a: number, b: any) => a + b.quantity, 0)} pcs • {formatCurrency(labEquip.reduce((a: number, b: any) => a + b.totalValue, 0))}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Sports Equipment</div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{sports.length} items</div>
            <div className="text-[11px] text-muted-foreground">{sports.reduce((a: number, b: any) => a + b.quantity, 0)} pcs • {sports.filter((a: any) => a.status === "LOW_STOCK").length} low</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">School Property</div>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{schoolProperty.length} items</div>
            <div className="text-[11px] text-muted-foreground">Furniture/Projector/CCTV/AC • {formatCurrency(schoolProperty.reduce((a: number, b: any) => a + b.totalValue, 0))}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Valuation</span>
              <Package className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-foreground mt-1 block">{formatCurrency(totalValuation)}</span>
            <span className="text-[11px] text-muted-foreground">{totalProducts} SKUs • {locs.length} Stores • {totalStock} pcs</span>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Low / Out Alerts</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-2xl font-bold mt-1 block"><span className="text-amber-600">{lowCount}</span> <span className="text-muted-foreground text-lg">/</span> <span className="text-rose-600">{outCount}</span></span>
            <span className="text-[11px] font-medium"><span className="text-rose-600">🔴 Out {outCount}</span> • <span className="text-amber-600">🟡 Low {lowCount}</span> 🟠 Expiring {items.filter((i: any) => i.expiryDate && new Date(i.expiryDate) < new Date(Date.now() + 30*24*3600*1000)).length}</span>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Today&apos;s Sales</span>
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{formatCurrency(todaysRevenue)}</span>
            <span className="text-[11px] text-emerald-600 font-medium">{todaysSales.length} receipts • Monthly {formatCurrency(monthlyRevenue)}</span>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-2xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Recent Movements (10)</div>
            <div className="space-y-1 mt-2">
              {recentMovements.slice(0, 3).map((t: any) => (
                <div key={t.id} className="text-[11px] flex justify-between"><span className="truncate">{t.type} • {t.itemName}</span><span className="font-mono">{t.quantity > 0 ? `+${t.quantity}` : t.quantity}</span></div>
              ))}
              {recentMovements.length === 0 && <span className="text-[11px] text-muted-foreground">No movements yet</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
