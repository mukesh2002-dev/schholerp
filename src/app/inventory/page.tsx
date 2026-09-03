"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import {
  InventoryItem,
  InventoryItemStatus,
  InventorySupplier,
  PurchaseEntry,
  StockAlert,
} from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
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
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InventoryPage() {
  const { activeBranchId } = useERP();
  const [items] = useState(() =>
    mockDb.getInventoryItems(activeBranchId)
  );
  const [suppliers] = useState(() => mockDb.getInventorySuppliers());
  const [purchases] = useState(() =>
    mockDb.getPurchaseEntries(activeBranchId)
  );
  const [alerts] = useState(() =>
    mockDb.getStockAlerts(activeBranchId)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const categories = useMemo(() => mockDb.getInventoryCategories(), []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" || item.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const getItemStatusVariant = (status: InventoryItemStatus) => {
    switch (status) {
      case "IN_STOCK":
        return "success";
      case "LOW_STOCK":
        return "warning";
      case "OUT_OF_STOCK":
        return "destructive";
      case "DISCONTINUED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPurchaseStatusVariant = (status: string) => {
    switch (status) {
      case "RECEIVED":
        return "success";
      case "APPROVED":
        return "info";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAlertSeverityVariant = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "destructive";
      case "WARNING":
        return "warning";
      case "INFO":
        return "info";
      default:
        return "outline";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.round(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Inventory & Stock
            </h1>
            <Badge variant="outline" className="text-xs">
              {items.length} Items
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage stock levels, suppliers, purchase orders, and inventory alerts.
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items" className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Items
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Stock Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1.5 py-0">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items, SKU, category..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No inventory items found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Link key={item.id} href={`/inventory/${item.id}`}>
                  <Card className="group cursor-pointer hover:border-primary/40 transition-all duration-200 h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {item.sku}
                          </p>
                        </div>
                        <Badge
                          variant={getItemStatusVariant(item.status)}
                          className="text-[10px] shrink-0 ml-2"
                        >
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <Badge variant="outline" className="text-[10px]">
                          {item.categoryName}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Quantity</span>
                          <span className="font-medium text-foreground">
                            {item.quantity}
                            <span className="text-muted-foreground ml-1">
                              (min: {item.minStock})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Unit Price</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Value</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.totalValue)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">
                            {item.branchName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          {suppliers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No suppliers found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground">
                          {supplier.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {supplier.contactPerson}
                        </p>
                      </div>
                      <Badge
                        variant={
                          supplier.status === "ACTIVE" ? "success" : "secondary"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {supplier.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium text-foreground font-mono">
                          {supplier.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium text-foreground truncate max-w-[160px] text-right">
                          {supplier.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          {renderStars(supplier.rating)}
                          <span className="text-[11px] text-muted-foreground ml-1">
                            {supplier.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-medium text-foreground">
                          {supplier.totalOrders}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No purchase orders found.
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {entry.itemName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {entry.itemSku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground">
                        {entry.supplierName}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {entry.quantity}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {formatCurrency(entry.totalAmount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(entry.purchaseDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getPurchaseStatusVariant(entry.status)}
                          className="text-[10px]"
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No stock alerts at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Badge
                          variant={getAlertSeverityVariant(alert.severity)}
                          className="text-[10px] shrink-0"
                        >
                          {alert.severity}
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground">
                            {alert.itemName}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {alert.itemSku}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-medium text-foreground">
                          {alert.currentQuantity}
                          <span className="text-muted-foreground mx-1">/</span>
                          {alert.minStock}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Current / Min Stock
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
