"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { InventoryItem, InventoryItemStatus, InventorySupplier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Star,
  MapPin,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function InventoryDirectoryView() {
  const { activeBranchId } = useERP();
  const [items] = useState(() => mockDb.getInventoryItems(activeBranchId));
  const [suppliers] = useState(() => mockDb.getInventorySuppliers());
  const [purchases] = useState(() => mockDb.getPurchaseEntries(activeBranchId));
  const [alerts] = useState(() => mockDb.getStockAlerts(activeBranchId));

  const [activeTab, setActiveTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "ALL" || item.categoryName === categoryFilter;
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="h-9">
            <TabsTrigger value="items" className="text-xs px-3">
              Stock Items ({items.length})
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs px-3">
              Reorder Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="purchases" className="text-xs px-3">
              Purchase Orders ({purchases.length})
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs px-3">
              Vendors ({suppliers.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item, SKU, category..."
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        {/* Tab 1: Items */}
        <TabsContent value="items" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min Threshold</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs">{item.sku}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm text-foreground block">{item.name}</span>
                      <span className="text-[11px] text-muted-foreground block">{item.branchName}</span>
                    </TableCell>
                    <TableCell className="text-xs">{item.categoryName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold">
                      {item.quantity} units
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {item.minStock} units
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "IN_STOCK"
                            ? "success"
                            : item.status === "LOW_STOCK"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Alerts */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((al) => (
              <Card key={al.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{al.itemName}</h4>
                      <p className="text-xs text-muted-foreground font-mono">SKU: {al.itemSku}</p>
                    </div>
                    <Badge variant={al.severity === "CRITICAL" ? "destructive" : "warning"} className="text-[10px]">
                      {al.severity}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Current: <strong className="text-foreground">{al.currentQuantity}</strong></span>
                    <span>Reorder at: <strong className="text-foreground">{al.minStock}</strong></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Purchases */}
        <TabsContent value="purchases" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO / Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{p.invoiceNumber || p.id}</TableCell>
                    <TableCell className="text-sm font-semibold">{p.supplierName}</TableCell>
                    <TableCell className="text-xs font-mono">{p.itemName} ({p.quantity} qty)</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-foreground">
                      {formatCurrency(p.totalAmount)}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(p.purchaseDate)}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 4: Suppliers */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{s.name}</h4>
                      <p className="text-xs text-muted-foreground">{s.status}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{s.rating}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5 pt-2 border-t">
                    <p>Contact: {s.contactPerson} ({s.phone})</p>
                    <p>Email: {s.email}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
