"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { mockDb } from "@/lib/services/mock-db";
import { InventoryItem, InventoryTransaction } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
  Package,
  Hash,
  DollarSign,
  MapPin,
  Truck,
  Calendar,
  ShoppingCart,
  ArrowDownToLine,
  ArrowUpFromLine,
  RotateCcw,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InventoryItemDetailPage() {
  const params = useParams();
  const itemId = params.id as string;

  const item = useState(() => mockDb.getInventoryItemById(itemId))[0];
  const transactions = useState(() =>
    mockDb.getInventoryTransactions(itemId)
  )[0];

  if (!item) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <Breadcrumbs />
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-xl font-semibold text-foreground">
            Item Not Found
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            The requested inventory item does not exist or has been removed.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Inventory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
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

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-500" />;
      case "ISSUE":
        return <ArrowUpFromLine className="h-3.5 w-3.5 text-amber-500" />;
      case "RETURN":
        return <RotateCcw className="h-3.5 w-3.5 text-blue-500" />;
      case "ADJUSTMENT":
        return <Settings className="h-3.5 w-3.5 text-purple-500" />;
      case "DAMAGE":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Hash className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getTransactionTypeVariant = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return "success";
      case "ISSUE":
        return "warning";
      case "RETURN":
        return "info";
      case "ADJUSTMENT":
        return "purple";
      case "DAMAGE":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <Button asChild variant="ghost" size="sm" className="w-fit gap-1.5">
        <Link href="/inventory">
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-80 shrink-0">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold text-foreground leading-tight">
                    {item.name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    {item.sku}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {item.categoryName}
                </Badge>
                <Badge
                  variant={getStatusVariant(item.status)}
                  className="text-[10px]"
                >
                  {item.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>

              <div className="pt-2 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3 w-3" />
                    Quantity
                  </span>
                  <span className="font-medium text-foreground">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Min Stock</span>
                  <span className="font-medium text-foreground">
                    {item.minStock}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3" />
                    Unit Price
                  </span>
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
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    Location
                  </span>
                  <span className="font-medium text-foreground text-right">
                    {item.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck className="h-3 w-3" />
                    Supplier
                  </span>
                  <span className="font-medium text-foreground text-right">
                    {item.supplierName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Last Restocked
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(item.lastRestocked)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground">
                  {item.branchName}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details" className="gap-1.5">
                <Package className="h-3.5 w-3.5" />
                Details
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-1.5">
                <Hash className="h-3.5 w-3.5" />
                Transaction History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Item Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Quantity</p>
                        <p className="font-medium text-foreground">
                          {item.quantity} units
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Minimum Stock Level</p>
                        <p className="font-medium text-foreground">
                          {item.minStock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unit Price</p>
                        <p className="font-medium text-foreground">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Inventory Value</p>
                        <p className="font-medium text-foreground">
                          {formatCurrency(item.totalValue)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Supplier</p>
                        <p className="font-medium text-foreground">
                          {item.supplierName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Storage Location</p>
                        <p className="font-medium text-foreground">
                          {item.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Restocked</p>
                        <p className="font-medium text-foreground">
                          {formatDate(item.lastRestocked)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Branch</p>
                        <p className="font-medium text-foreground">
                          {item.branchName}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {item.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      In Stock
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(item.unitPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unit Price
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(item.totalValue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Total Value
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Transaction History
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {transactions.length} Records
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No transaction records found for this item.
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((txn) => (
                            <TableRow
                              key={txn.id}
                              className="hover:bg-muted/40"
                            >
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  {getTransactionTypeIcon(txn.type)}
                                  <Badge
                                    variant={getTransactionTypeVariant(txn.type)}
                                    className="text-[10px]"
                                  >
                                    {txn.type}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-medium text-foreground">
                                {txn.quantity}
                              </TableCell>
                              <TableCell className="text-xs text-foreground">
                                {txn.performedBy}
                              </TableCell>
                              <TableCell className="text-xs text-foreground">
                                {txn.recipientName || "—"}
                              </TableCell>
                              <TableCell>
                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                  {txn.reason}
                                </p>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDate(txn.date)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
