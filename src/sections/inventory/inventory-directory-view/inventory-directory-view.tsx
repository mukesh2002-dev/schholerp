"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Package, ShoppingCart, Truck, AlertTriangle, Star, MapPin, Shirt, PenTool, Book, Plus, Minus, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { toast } from "sonner";

export function InventoryDirectoryView() {
  const { activeBranchId } = useERP();
  const [items, setItems] = useState(() => mockDb.getInventoryItems(activeBranchId));
  const [suppliers] = useState(() => mockDb.getInventorySuppliers());
  const [purchases, setPurchases] = useState(() => mockDb.getPurchaseEntries(activeBranchId));
  const [alerts] = useState(() => mockDb.getStockAlerts(activeBranchId));
  const [students] = useState(() => mockDb.getStudents(activeBranchId));
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));

  const [activeTab, setActiveTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Sell dialog — Dress / Pen / Diary
  const [sellOpen, setSellOpen] = useState(false);
  const [sellItemId, setSellItemId] = useState<string>("");
  const [sellQty, setSellQty] = useState("1");
  const [sellStudentSearch, setSellStudentSearch] = useState("");
  const [sellStudentId, setSellStudentId] = useState("");
  const [sellPayment, setSellPayment] = useState<"CASH" | "UPI" | "ONLINE">("CASH");
  const debouncedSellSearch = useDebouncedValue(sellStudentSearch, 300);

  // Purchase dialog
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purItemId, setPurItemId] = useState<string>("");
  const [purSupplierId, setPurSupplierId] = useState<string>("");
  const [purQty, setPurQty] = useState("10");
  const [purPrice, setPurPrice] = useState("");
  const [purInvoice, setPurInvoice] = useState("");

  const refresh = () => {
    setItems([...mockDb.getInventoryItems(activeBranchId)]);
    setPurchases([...mockDb.getPurchaseEntries(activeBranchId)]);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase()) || item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "ALL" || item.categoryName === categoryFilter;
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [items, searchQuery, categoryFilter, statusFilter]);

  const uniformItems = useMemo(() => items.filter((i) => i.categoryName === "Uniform & Dress"), [items]);
  const stationeryItems = useMemo(() => items.filter((i) => i.categoryName === "Stationery" || i.categoryName === "Books & Diary"), [items]);
  const uniformValue = useMemo(() => uniformItems.reduce((a, b) => a + b.totalValue, 0), [uniformItems]);
  const stationeryValue = useMemo(() => stationeryItems.reduce((a, b) => a + b.totalValue, 0), [stationeryItems]);

  const filteredSellStudents = useMemo(() => {
    const q = debouncedSellSearch.trim().toLowerCase();
    if (!q) return students.slice(0, 8);
    return students.filter((s) => s.rollNumber.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q) || s.className.toLowerCase().includes(q) || s.admissionNumber.toLowerCase().includes(q)).slice(0, 8);
  }, [students, debouncedSellSearch]);

  const openSell = (itemId?: string) => {
    setSellItemId(itemId || items.find((i) => i.categoryName === "Uniform & Dress")?.id || items[0]?.id || "");
    setSellQty("1");
    setSellStudentSearch("");
    setSellStudentId(students[0]?.id || "");
    setSellPayment("CASH");
    setSellOpen(true);
  };

  const handleSellConfirm = () => {
    const item = items.find((i) => i.id === sellItemId);
    const stu = students.find((s) => s.id === sellStudentId);
    const qty = Number(sellQty);
    if (!item || !stu || !qty || qty <= 0) { toast.error("Select item, student and valid qty"); return; }
    if (qty > item.quantity) { toast.error(`Only ${item.quantity} units available`); return; }
    const total = qty * item.unitPrice;
    // deduct stock
    const updated = { ...item, quantity: item.quantity - qty, totalValue: (item.quantity - qty) * item.unitPrice, status: (item.quantity - qty <= item.minStock ? (item.quantity - qty === 0 ? "OUT_OF_STOCK" : "LOW_STOCK") : "IN_STOCK") as any, updatedAt: new Date().toISOString() };
    mockDb.saveInventoryItem(updated as any);
    toast.success(`Sold ${qty} × ${item.name} to ${stu.fullName} (${stu.rollNumber}) — ${formatCurrency(total)} via ${sellPayment}`, { description: `Class ${stu.className} • Receipt generated` });
    setSellOpen(false);
    refresh();
  };

  const openPurchase = (itemId?: string) => {
    const item = items.find((i) => i.id === itemId) || items[0];
    setPurItemId(item?.id || "");
    setPurSupplierId(item?.supplierId || suppliers[0]?.id || "");
    setPurQty("10");
    setPurPrice(String(item?.unitPrice || ""));
    setPurInvoice(`INV-${Date.now().toString().slice(-6)}`);
    setPurchaseOpen(true);
  };

  const handlePurchaseConfirm = () => {
    const item = items.find((i) => i.id === purItemId);
    const sup = suppliers.find((s) => s.id === purSupplierId);
    const qty = Number(purQty);
    const price = Number(purPrice);
    if (!item || !sup || !qty || qty <= 0) { toast.error("Select item, supplier and qty"); return; }
    const total = qty * (price || item.unitPrice);
    const updated = { ...item, quantity: item.quantity + qty, totalValue: (item.quantity + qty) * (price || item.unitPrice), unitPrice: price || item.unitPrice, status: "IN_STOCK" as any, lastRestocked: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString() };
    mockDb.saveInventoryItem(updated as any);
    // also add purchase entry via localStorage
    const entries = mockDb.getPurchaseEntries();
    const newEntry: any = { id: `pur-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, supplierId: sup.id, supplierName: sup.name, quantity: qty, unitPrice: price || item.unitPrice, totalAmount: total, branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId, branchName: item.branchName, purchaseDate: new Date().toISOString().split("T")[0], status: "RECEIVED", invoiceNumber: purInvoice, createdAt: new Date().toISOString() };
    entries.unshift(newEntry);
    if (typeof window !== "undefined") localStorage.setItem("school_erp_purchase_entries_v1", JSON.stringify(entries));
    toast.success(`Purchased ${qty} × ${item.name} from ${sup.name} — ${formatCurrency(total)}`, { description: `Invoice ${purInvoice} • Stock updated` });
    setPurchaseOpen(false);
    refresh();
  };

  return (
    <div className="space-y-4">
      {/* Retail summary ribbon — school software reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
          <div className="flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300"><Shirt className="h-3.5 w-3.5" /> Uniform & Dress Stock</div>
          <div className="text-lg font-extrabold">{uniformItems.length} SKUs</div>
          <div className="text-[11px] text-muted-foreground">{formatCurrency(uniformValue)} value • Sell to students</div>
        </Card>
        <Card className="p-3 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"><PenTool className="h-3.5 w-3.5" /> Pen / Stationery</div>
          <div className="text-lg font-extrabold">{stationeryItems.length} SKUs</div>
          <div className="text-[11px] text-muted-foreground">{formatCurrency(stationeryValue)} value • Counter sales</div>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300"><Book className="h-3.5 w-3.5" /> Books & Diary</div>
          <div className="text-lg font-extrabold">{items.filter((i) => i.categoryName === "Books & Diary").length} SKUs</div>
          <div className="text-[11px] text-muted-foreground">Diary, bundles — academic store</div>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><ShoppingCart className="h-3.5 w-3.5" /> Quick Actions</div>
          <div className="flex gap-2 mt-1">
            <Button size="sm" className="h-7 text-xs flex-1" onClick={() => openSell()}><ShoppingCart className="h-3 w-3" /> Sell</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => openPurchase()}><Truck className="h-3 w-3" /> Purchase</Button>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="items" className="text-xs px-3">Stock Items ({items.length})</TabsTrigger>
            <TabsTrigger value="uniform" className="text-xs px-3 gap-1"><Shirt className="h-3.5 w-3.5" /> Uniform & Dress ({uniformItems.length})</TabsTrigger>
            <TabsTrigger value="stationery" className="text-xs px-3 gap-1"><PenTool className="h-3.5 w-3.5" /> Pen/Diary ({stationeryItems.length})</TabsTrigger>
            <TabsTrigger value="purchases" className="text-xs px-3">Purchase Orders ({purchases.length})</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs px-3">Alerts ({alerts.length})</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs px-3">Vendors ({suppliers.length})</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search SKU, dress, pen, diary..." className="pl-9 h-8 text-xs" />
            </div>
            <Button size="sm" className="h-8 text-xs gap-1 hidden sm:flex" onClick={() => openPurchase()}><Plus className="h-3.5 w-3.5" /> Stock In</Button>
          </div>
        </div>

        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/30 border">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-7 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="Uniform & Dress">Uniform & Dress</SelectItem>
                <SelectItem value="Stationery">Stationery</SelectItem>
                <SelectItem value="Books & Diary">Books & Diary</SelectItem>
                <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                <SelectItem value="IT Hardware">IT Hardware</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-7 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground self-center">School retail: Dress, Pen, Diary jaise sale — Fedena / Entab reference</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right tabular-nums">Price</TableHead>
                  <TableHead className="text-right tabular-nums">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs">{item.sku}</TableCell>
                    <TableCell><span className="font-semibold text-sm block">{item.name}</span><span className="text-[11px] text-muted-foreground block">{item.branchName}</span></TableCell>
                    <TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">{item.categoryName}</Badge></TableCell>
                    <TableCell className="text-xs"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span></TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono font-semibold">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono font-bold">{item.quantity}</TableCell>
                    <TableCell><Badge variant={item.status === "IN_STOCK" ? "success" : item.status === "LOW_STOCK" ? "warning" : "destructive"} className="text-[10px]">{item.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {(item.categoryName === "Uniform & Dress" || item.categoryName === "Stationery" || item.categoryName === "Books & Diary") ? (
                          <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => openSell(item.id)}><ShoppingCart className="h-3 w-3" /> Sell</Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => openSell(item.id)}><Minus className="h-3 w-3" /> Issue</Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => openPurchase(item.id)}><Truck className="h-3 w-3" /> Buy</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="uniform" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {uniformItems.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
              <Card key={item.id} className="border-violet-200 shadow-2xs hover:border-violet-300 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center"><Shirt className="h-5 w-5 text-violet-600" /></div>
                      <div>
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku} • {item.location}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === "IN_STOCK" ? "success" : "warning"} className="text-[10px]">{item.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-2 rounded-lg bg-muted/40 border"><span className="block font-bold">{item.quantity}</span><span className="text-[10px] text-muted-foreground">Stock</span></div>
                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20"><span className="block font-bold text-violet-700">{formatCurrency(item.unitPrice)}</span><span className="text-[10px] text-muted-foreground">Price</span></div>
                    <div className="p-2 rounded-lg bg-amber-500/10 border"><span className="block font-bold">{item.minStock}</span><span className="text-[10px] text-muted-foreground">Min</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => openSell(item.id)}><ShoppingCart className="h-3.5 w-3.5" /> Sell Dress</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openPurchase(item.id)}><Plus className="h-3.5 w-3.5" /> Restock</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stationery" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stationeryItems.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
              <Card key={item.id} className="border-blue-200 shadow-2xs hover:border-blue-300 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">{item.categoryName === "Books & Diary" ? <Book className="h-5 w-5 text-blue-600" /> : <PenTool className="h-5 w-5 text-blue-600" />}</div>
                      <div>
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku} • {item.categoryName}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === "IN_STOCK" ? "success" : "warning"} className="text-[10px]">{item.status}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.location}</span>
                    <span className="font-bold">{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-center">
                    <div className="p-2 rounded-lg bg-muted/40 border"><span className="block font-bold">{item.quantity} pcs</span><span className="text-[10px] text-muted-foreground">Available</span></div>
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><span className="block font-bold text-emerald-700">{formatCurrency(item.unitPrice * 1)}</span><span className="text-[10px] text-muted-foreground">Per unit</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => openSell(item.id)}><ShoppingCart className="h-3.5 w-3.5" /> Sell Pen/Diary</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openPurchase(item.id)}><Plus className="h-3.5 w-3.5" /> Buy</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="gradient" className="gap-1" onClick={() => openPurchase()}><Plus className="h-3.5 w-3.5" /> New Purchase Order</Button>
          </div>
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO / Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right tabular-nums">Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{p.invoiceNumber || p.id}</TableCell>
                    <TableCell className="text-sm font-semibold">{p.supplierName}</TableCell>
                    <TableCell className="text-xs font-mono">{p.itemName} ({p.quantity} qty)</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono font-bold">{formatCurrency(p.totalAmount)}</TableCell>
                    <TableCell className="text-xs">{formatDate(p.purchaseDate)}</TableCell>
                    <TableCell><Badge variant="success" className="text-[10px]">{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((al) => (
              <Card key={al.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{al.itemName}</h4>
                      <p className="text-xs text-muted-foreground font-mono">SKU: {al.itemSku}</p>
                    </div>
                    <Badge variant={al.severity === "CRITICAL" ? "destructive" : "warning"} className="text-[10px]">{al.severity}</Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Current: <strong className="text-foreground">{al.currentQuantity}</strong></span>
                    <span>Reorder at: <strong className="text-foreground">{al.minStock}</strong></span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs mt-1" onClick={() => openPurchase(items.find((i) => i.sku === al.itemSku)?.id)}><Truck className="h-3 w-3" /> Reorder Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{s.name}</h4>
                      <p className="text-xs text-muted-foreground">{s.status}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" /><span>{s.rating}</span></div>
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

      {/* Sell Dialog — Dress / Pen / Diary */}
      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Sell Item — Dress / Pen / Diary</DialogTitle>
            <DialogDescription>School retail counter — select student by Roll No, choose dress size/pen qty, receipt auto.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Item *</label>
              <Select value={sellItemId} onValueChange={setSellItemId}>
                <SelectTrigger><SelectValue placeholder="Select Dress / Pen / Diary" /></SelectTrigger>
                <SelectContent>
                  {items.filter((i) => ["Uniform & Dress", "Stationery", "Books & Diary"].includes(i.categoryName)).map((it) => (
                    <SelectItem key={it.id} value={it.id}>{it.name} — {it.sku} • {formatCurrency(it.unitPrice)} • Stock {it.quantity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Quantity *</label>
                <Input type="number" min={1} value={sellQty} onChange={(e) => setSellQty(e.target.value)} />
                {sellItemId && (() => { const it = items.find((i) => i.id === sellItemId); return it ? <p className="text-[11px] text-muted-foreground mt-1">Available: {it.quantity} • Price: {formatCurrency(it.unitPrice)}</p> : null; })()}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Payment</label>
                <Select value={sellPayment} onValueChange={(v) => setSellPayment(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Student Search — Roll No / Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={sellStudentSearch} onChange={(e) => setSellStudentSearch(e.target.value)} placeholder="e.g. STU-1042, Aarav, Grade 10" className="pl-9 h-8 text-xs" />
              </div>
              <div className="mt-2 rounded-lg border max-h-[180px] overflow-y-auto divide-y divide-border/60">
                {filteredSellStudents.map((s) => (
                  <button key={s.id} onClick={() => setSellStudentId(s.id)} className={`w-full text-left p-2 flex items-center gap-2 hover:bg-muted/50 ${sellStudentId === s.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}>
                    <img src={s.avatar} alt={s.fullName} className="h-7 w-7 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold">{s.fullName} <Badge variant="outline" className="text-[10px] font-mono ml-1">{s.rollNumber}</Badge></div>
                      <div className="text-[11px] text-muted-foreground">{s.className} • {s.sectionName}</div>
                    </div>
                    {sellStudentId === s.id && <span className="text-primary text-xs">✓</span>}
                  </button>
                ))}
                {filteredSellStudents.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">No student found</div>}
              </div>
            </div>
            {sellItemId && sellQty && (() => {
              const it = items.find((i) => i.id === sellItemId);
              const qty = Number(sellQty) || 0;
              const total = qty * (it?.unitPrice || 0);
              return <div className="p-3 rounded-lg bg-muted/40 border flex justify-between items-center text-sm"><span>Qty {qty} × {it?.name}</span><strong className="text-primary">{formatCurrency(total)}</strong></div>;
            })()}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setSellOpen(false)}>Cancel</Button>
            <Button onClick={handleSellConfirm} variant="gradient" className="gap-1"><Receipt className="h-3.5 w-3.5" /> Confirm Sale & Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Truck className="h-4 w-4" /> Purchase / Stock In — Dress / Pen / Diary</DialogTitle>
            <DialogDescription>Add stock from supplier — uniforms, books etc. Like school store purchase.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Item *</label>
              <Select value={purItemId} onValueChange={setPurItemId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name} — {it.sku} • Stock {it.quantity}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Supplier *</label>
              <Select value={purSupplierId} onValueChange={setPurSupplierId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.contactPerson}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs font-medium block mb-1">Qty *</label><Input type="number" value={purQty} onChange={(e) => setPurQty(e.target.value)} /></div>
              <div><label className="text-xs font-medium block mb-1">Unit Price (₹)</label><Input type="number" value={purPrice} onChange={(e) => setPurPrice(e.target.value)} /></div>
              <div><label className="text-xs font-medium block mb-1">Invoice No</label><Input value={purInvoice} onChange={(e) => setPurInvoice(e.target.value)} /></div>
            </div>
            {purItemId && purQty && (() => {
              const it = items.find((i) => i.id === purItemId);
              const qty = Number(purQty) || 0;
              const price = Number(purPrice) || it?.unitPrice || 0;
              return <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between text-sm"><span>Purchase total</span><strong>{formatCurrency(qty * price)}</strong></div>;
            })()}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPurchaseOpen(false)}>Cancel</Button>
            <Button onClick={handlePurchaseConfirm} variant="gradient" className="gap-1"><Truck className="h-3.5 w-3.5" /> Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
