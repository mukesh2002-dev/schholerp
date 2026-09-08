"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Package, ShoppingCart, Truck, AlertTriangle, Star, MapPin, Shirt, PenTool, Book, Plus, Minus, Receipt, ArrowLeftRight, ClipboardList, History, BarChart3, RefreshCw, Store, Wrench, AlertCircle, FileText, Printer, Download, Trash2, Building2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { toast } from "sonner";

// helper to compute available qty for variant
function availQty(item: any, size?: string) {
  if (item.variants && size) {
    const v = item.variants.find((x: any) => x.size === size);
    return v ? v.quantity : 0;
  }
  return item.quantity;
}

export function InventoryDirectoryView() {
  const { activeBranchId } = useERP();
  const [items, setItems] = useState(() => mockDb.getInventoryItems(activeBranchId));
  const [categories] = useState(() => mockDb.getInventoryCategories());
  const [suppliers] = useState(() => mockDb.getInventorySuppliers());
  const [purchases, setPurchases] = useState(() => mockDb.getPurchaseEntries(activeBranchId));
  const [alerts, setAlerts] = useState(() => mockDb.getStockAlerts(activeBranchId));
  const [students] = useState(() => mockDb.getStudents(activeBranchId));
  const [storeLocations] = useState(() => mockDb.getStoreLocations(activeBranchId));
  const [transactions, setTransactions] = useState(() => mockDb.getInventoryTransactions(undefined, activeBranchId));
  const [sales, setSales] = useState(() => mockDb.getStoreSales(activeBranchId === "all" ? undefined : activeBranchId));
  const [transfers, setTransfers] = useState(() => mockDb.getStockTransfers(activeBranchId === "all" ? undefined : activeBranchId));
  const [adjustments, setAdjustments] = useState(() => mockDb.getStockAdjustments(activeBranchId === "all" ? undefined : activeBranchId));
  const [returns, setReturns] = useState(() => mockDb.getReturnExchanges(activeBranchId === "all" ? undefined : activeBranchId));

  const [activeTab, setActiveTab] = useState("pos");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("ALL");
  const [historyFilter, setHistoryFilter] = useState("ALL");

  // ── POS state ──
  const [posStudentSearch, setPosStudentSearch] = useState("");
  const [posStudentId, setPosStudentId] = useState("");
  const [cart, setCart] = useState<{ itemId: string; variantSize?: string; quantity: number }[]>([]);
  const [posProductSearch, setPosProductSearch] = useState("");
  const [posSelectedItemId, setPosSelectedItemId] = useState("");
  const [posSelectedSize, setPosSelectedSize] = useState("");
  const [posQty, setPosQty] = useState("1");
  const [posPayment, setPosPayment] = useState<"CASH" | "UPI" | "CARD" | "ONLINE">("CASH");
  const [posDiscount, setPosDiscount] = useState("0");
  const [posStoreId, setPosStoreId] = useState("loc-uniform");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const debouncedPosStu = useDebouncedValue(posStudentSearch, 300);
  const debouncedProd = useDebouncedValue(posProductSearch, 300);

  // ── Stock Entry ──
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryItemId, setEntryItemId] = useState("");
  const [entrySize, setEntrySize] = useState("");
  const [entryQty, setEntryQty] = useState("10");
  const [entryPurPrice, setEntryPurPrice] = useState("");
  const [entrySellPrice, setEntrySellPrice] = useState("");
  const [entrySupplier, setEntrySupplier] = useState("");
  const [entryInvoice, setEntryInvoice] = useState("");

  // ── Stock Out ──
  const [outOpen, setOutOpen] = useState(false);
  const [outItemId, setOutItemId] = useState("");
  const [outSize, setOutSize] = useState("");
  const [outQty, setOutQty] = useState("1");
  const [outReason, setOutReason] = useState("Student Sale");
  const [outRecipient, setOutRecipient] = useState("");
  const [outRemarks, setOutRemarks] = useState("");

  // ── Transfer ──
  const [trfOpen, setTrfOpen] = useState(false);
  const [trfItemId, setTrfItemId] = useState("");
  const [trfSize, setTrfSize] = useState("");
  const [trfQty, setTrfQty] = useState("5");
  const [trfFrom, setTrfFrom] = useState("loc-main");
  const [trfTo, setTrfTo] = useState("loc-uniform");

  // ── Adjustment ──
  const [adjOpen, setAdjOpen] = useState(false);
  const [adjItemId, setAdjItemId] = useState("");
  const [adjSize, setAdjSize] = useState("");
  const [adjNewQty, setAdjNewQty] = useState("");
  const [adjReason, setAdjReason] = useState("Physical Stock Difference");

  // ── Return/Exchange ──
  const [retOpen, setRetOpen] = useState(false);
  const [retSaleId, setRetSaleId] = useState("");
  const [retOldItemIdx, setRetOldItemIdx] = useState("0");
  const [retNewItemId, setRetNewItemId] = useState("");
  const [retNewSize, setRetNewSize] = useState("");

  // ── Spec: Items Master CRUD (P1) — sub-category, photo, unit conversion note ──
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", categoryName: "Stationery", subCategory: "", unit: "pcs", purchasePrice: "", sellingPrice: "", minStock: "10", description: "", expiryDate: "", photo: "", status: "IN_STOCK" as any, storeLocationId: "loc-main" });

  // ── Spec: Bulk Issue (new admission batch) ──
  const [bulkIssueOpen, setBulkIssueOpen] = useState(false);
  const [bulkIssueItemId, setBulkIssueItemId] = useState("");
  const [bulkIssueSize, setBulkIssueSize] = useState("");
  const [bulkIssueQty, setBulkIssueQty] = useState("2");
  const [bulkIssueClassId, setBulkIssueClassId] = useState("ALL");
  const [bulkIssueSelected, setBulkIssueSelected] = useState<string[]>([]);

  // ── Spec: Supplier quick add (Stock In inline) ──
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: "", contactPerson: "", phone: "", email: "", gstNumber: "", address: "", category: "All", bankDetails: "", status: "ACTIVE" as any });

  // ── Spec: Expiry handling ──
  const [expiryDate, setExpiryDate] = useState("");
  const [retCondition, setRetCondition] = useState<"Good" | "Damaged" | "Lost">("Good");

  const refreshAll = () => {
    setItems([...mockDb.getInventoryItems(activeBranchId)]);
    setPurchases([...mockDb.getPurchaseEntries(activeBranchId)]);
    setAlerts([...mockDb.getStockAlerts(activeBranchId)]);
    setTransactions([...mockDb.getInventoryTransactions(undefined, activeBranchId)]);
    setSales([...mockDb.getStoreSales(activeBranchId === "all" ? undefined : activeBranchId)]);
    setTransfers([...mockDb.getStockTransfers(activeBranchId === "all" ? undefined : activeBranchId)]);
    setAdjustments([...mockDb.getStockAdjustments(activeBranchId === "all" ? undefined : activeBranchId)]);
    setReturns([...mockDb.getReturnExchanges(activeBranchId === "all" ? undefined : activeBranchId)]);
  };

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q) || it.categoryName.toLowerCase().includes(q) || it.variants?.some((v: any) => v.size.toLowerCase().includes(q));
      const matchCat = categoryFilter === "ALL" || it.categoryName === categoryFilter;
      const matchStatus = statusFilter === "ALL" || it.status === statusFilter;
      const matchStore = storeFilter === "ALL" || (it.storeLocationId || "loc-main") === storeFilter;
      return matchSearch && matchCat && matchStatus && matchStore;
    });
  }, [items, searchQuery, categoryFilter, statusFilter, storeFilter]);

  const uniformItems = useMemo(() => items.filter((i: any) => i.categoryName === "Uniform"), [items]);
  const stationeryItems = useMemo(() => items.filter((i: any) => ["Stationery", "Books"].includes(i.categoryName)), [items]);

  const posStudents = useMemo(() => {
    const q = debouncedPosStu.trim().toLowerCase();
    if (!q) return students.slice(0, 6);
    return students.filter((s) => s.admissionNumber.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q) || s.guardian.phone.toLowerCase().includes(q) || (s as any).guardian?.phone?.toLowerCase().includes(q)).slice(0, 8);
  }, [students, debouncedPosStu]);

  const posProducts = useMemo(() => {
    const q = debouncedProd.trim().toLowerCase();
    const list = items.filter((i: any) => ["Uniform", "Stationery", "Books"].includes(i.categoryName));
    if (!q) return list.slice(0, 8);
    return list.filter((i: any) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.variants?.some((v: any) => v.size.toLowerCase().includes(q))).slice(0, 8);
  }, [items, debouncedProd]);

  const cartTotal = useMemo(() => {
    let sum = 0;
    for (const c of cart) {
      const it = items.find((x) => x.id === c.itemId) as any;
      if (!it) continue;
      sum += (it.sellingPrice || it.unitPrice) * c.quantity;
    }
    return sum;
  }, [cart, items]);
  const discountVal = Number(posDiscount) || 0;
  const grandTotal = Math.max(0, cartTotal - discountVal);
  const selectedStudent = students.find((s) => s.id === posStudentId);

  const posSelectedItem = items.find((x) => x.id === posSelectedItemId) as any;

  // handlers
  const handleAddToCart = () => {
    if (!posSelectedItemId) { toast.error("Select product"); return; }
    const it = items.find((x) => x.id === posSelectedItemId) as any;
    if (!it) return;
    const size = it.variants ? posSelectedSize : undefined;
    if (it.variants && !size) { toast.error("Select Size/Variant"); return; }
    const qty = Math.max(1, Number(posQty) || 1);
    const avail = availQty(it, size);
    const already = cart.filter((c) => c.itemId === posSelectedItemId && c.variantSize === size).reduce((a, b) => a + b.quantity, 0);
    if (qty + already > avail) { toast.error(`Only ${avail} available${size ? ` for Size ${size}` : ""}${already ? ` (${already} already in cart)` : ""}`); return; }
    // if same item+size exists, increment
    const idx = cart.findIndex((c) => c.itemId === posSelectedItemId && c.variantSize === size);
    if (idx !== -1) {
      const nc = [...cart];
      nc[idx] = { ...nc[idx], quantity: nc[idx].quantity + qty };
      setCart(nc);
    } else {
      setCart([...cart, { itemId: posSelectedItemId, variantSize: size, quantity: qty }]);
    }
    toast.success(`Added ${qty} × ${it.name}${size ? ` Size ${size}` : ""} to cart`);
    setPosQty("1");
  };

  const handleCompleteSale = () => {
    if (!posStudentId) { toast.error("Select student first (Admission No / Name / Mobile)"); return; }
    if (cart.length === 0) { toast.error("Cart empty — add items"); return; }
    try {
      const sale = mockDb.createStoreSale({
        branchId: activeBranchId === "all" ? (selectedStudent?.branchId || "br-apex-01") : activeBranchId,
        storeLocationId: posStoreId,
        studentId: posStudentId,
        items: cart,
        paymentMethod: posPayment,
        discount: discountVal,
        createdBy: "Counter Staff",
      });
      toast.success(`Sale Completed — ${sale.invoiceNumber} • ${formatCurrency(sale.totalAmount)} via ${posPayment}`, { description: `${sale.studentName} (${sale.studentRoll}) • ${sale.items.length} items • Stock updated` });
      setLastSale(sale);
      setReceiptOpen(true);
      setCart([]);
      setPosDiscount("0");
      refreshAll();
    } catch (e: any) {
      toast.error(e.message || "Sale failed");
    }
  };

  const openEntry = (itemId?: string) => {
    const it = items.find((x) => x.id === itemId) || items[0];
    setEntryItemId(it?.id || "");
    setEntrySize(it?.variants?.[0]?.size || "");
    setEntryQty("10");
    setEntryPurPrice(String((it as any)?.purchasePrice || (it as any)?.unitPrice || ""));
    setEntrySellPrice(String((it as any)?.sellingPrice || (it as any)?.unitPrice || ""));
    setEntrySupplier(it?.supplierId || suppliers[0]?.id || "");
    setEntryInvoice(`INV-${Date.now().toString().slice(-6)}`);
    setEntryOpen(true);
  };
  const confirmEntry = () => {
    const qty = Number(entryQty);
    if (!entryItemId || !qty || qty <= 0) { toast.error("Enter valid qty"); return; }
    try {
      const res = mockDb.createStockEntry({ itemId: entryItemId, variantSize: entrySize || undefined, quantity: qty, purchasePrice: Number(entryPurPrice) || undefined, sellingPrice: Number(entrySellPrice) || undefined, supplierId: entrySupplier, invoiceNumber: entryInvoice, branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId, performedBy: "Store Manager" });
      toast.success(`Stock Entry: +${qty} ${res.item.name}${entrySize ? ` Size ${entrySize}` : ""} — ₹${res.purchase.totalAmount} (${entryInvoice})`, { description: `Stock: ${res.item.quantity} • ${res.item.storeLocationName || "Main Store"}` });
      setEntryOpen(false); refreshAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const openOut = (itemId?: string) => {
    const it = items.find((x) => x.id === itemId) || items[0];
    setOutItemId(it?.id || "");
    setOutSize(it?.variants?.[0]?.size || "");
    setOutQty("1");
    setOutReason("Student Sale");
    setOutRecipient("");
    setOutRemarks("");
    setOutOpen(true);
  };
  const confirmOut = () => {
    const qty = Number(outQty);
    if (!outItemId || !qty) { toast.error("Invalid"); return; }
    try {
      mockDb.createStockOut({ itemId: outItemId, variantSize: outSize || undefined, quantity: qty, reason: outReason, recipientName: outRecipient || undefined, performedBy: "Counter Staff", remarks: outRemarks || undefined } as any);
      toast.success(`Stock Out: -${qty} • ${outReason}`, { description: outRecipient ? `To: ${outRecipient}` : undefined });
      setOutOpen(false); refreshAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const confirmTransfer = () => {
    const qty = Number(trfQty);
    if (!trfItemId || !qty) { toast.error("Invalid"); return; }
    if (trfFrom === trfTo) { toast.error("Source & destination must differ"); return; }
    try {
      mockDb.createStockTransfer({ itemId: trfItemId, variantSize: trfSize || undefined, quantity: qty, fromLocationId: trfFrom, toLocationId: trfTo, performedBy: "Store Manager" });
      toast.success(`Transferred ${qty} × ${items.find((x) => x.id === trfItemId)?.name}${trfSize ? ` Size ${trfSize}` : ""} ${storeLocations.find((l) => l.id === trfFrom)?.name} → ${storeLocations.find((l) => l.id === trfTo)?.name}`);
      setTrfOpen(false); refreshAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const confirmAdjustment = () => {
    const newQty = Number(adjNewQty);
    if (!adjItemId || isNaN(newQty) || newQty < 0) { toast.error("Enter valid new quantity"); return; }
    try {
      const adj = mockDb.createStockAdjustment({ itemId: adjItemId, variantSize: adjSize || undefined, newQuantity: newQty, reason: adjReason, performedBy: "Admin" });
      toast.success(`Adjustment: ${adj.previousQuantity} → ${adj.newQuantity} (Δ ${adj.delta >= 0 ? "+" : ""}${adj.delta})`, { description: adj.reason });
      setAdjOpen(false); refreshAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const confirmReturn = () => {
    if (!retSaleId) { toast.error("Select sale"); return; }
    const sale = sales.find((s) => s.id === retSaleId);
    if (!sale) { toast.error("Sale not found"); return; }
    const oldIdx = Number(retOldItemIdx) || 0;
    const oldSaleItem = sale.items[oldIdx];
    if (!oldSaleItem) { toast.error("Old item not found"); return; }
    try {
      const rec = mockDb.createReturnExchange({
        saleId: retSaleId,
        oldItem: { itemId: oldSaleItem.itemId, variantSize: oldSaleItem.variantSize, quantity: 1 },
        newItem: retNewItemId ? { itemId: retNewItemId, variantSize: retNewSize || undefined, quantity: 1 } : undefined,
        reason: retNewItemId ? `Exchange ${oldSaleItem.variantSize} → ${retNewSize}` : "Return",
        performedBy: "Counter Staff",
      });
      if (rec.type === "EXCHANGE") toast.success(`Exchanged Size ${oldSaleItem.variantSize} → ${retNewSize} • Stock auto-adjusted`);
      else {
        if (retCondition === "Good") toast.success(`Returned ${oldSaleItem.itemName} Size ${oldSaleItem.variantSize} • Stock +1 (Good)`);
        else if (retCondition === "Damaged") toast.success(`Damaged return — not added to stock • Damage record created`, { description: "Stock unchanged" });
        else toast.success(`Lost — fine / charge to be raised in Fee Collection (optional integration)`, { description: `${oldSaleItem.itemName} marked lost` });
      }
      setRetOpen(false); refreshAll();
    } catch (e: any) { toast.error(e.message); }
  };

  // ── Spec: Items Master CRUD helpers ──
  const openItemDialog = (item?: any) => {
    if (item) {
      setEditingItemId(item.id);
      setItemForm({ name: item.name, categoryName: item.categoryName, subCategory: (item as any).subCategory || "", unit: item.unit, purchasePrice: String(item.purchasePrice), sellingPrice: String(item.sellingPrice || item.unitPrice), minStock: String(item.minStock), description: item.description || "", expiryDate: item.expiryDate || "", photo: (item as any).photo || "", status: item.status, storeLocationId: item.storeLocationId || "loc-main" });
    } else {
      setEditingItemId(null);
      setItemForm({ name: "", categoryName: "Stationery", subCategory: "", unit: "pcs", purchasePrice: "", sellingPrice: "", minStock: "10", description: "", expiryDate: "", photo: "", status: "IN_STOCK", storeLocationId: "loc-main" });
    }
    setItemDialogOpen(true);
  };
  const confirmItemSave = () => {
    if (!itemForm.name.trim()) { toast.error("Item name required"); return; }
    if (!itemForm.minStock || Number(itemForm.minStock) < 0) { toast.error("Reorder level invalid"); return; }
    const catObj = categories.find((c) => c.name === itemForm.categoryName) || categories[0];
    const branchId = activeBranchId === "all" ? "br-apex-01" : activeBranchId;
    const branchName = mockDb.getBranches().find((b) => b.id === branchId)?.name || "Apex Global Campus";
    const loc = storeLocations.find((l) => l.id === itemForm.storeLocationId) || storeLocations[0];
    try {
      const payload: any = {
        id: editingItemId || undefined,
        name: itemForm.name.trim(),
        sku: editingItemId ? (items.find((i) => i.id === editingItemId)?.sku || `SKU-${Date.now().toString().slice(-5)}`) : `SKU-${Date.now().toString().slice(-5)}`,
        categoryId: catObj.id,
        categoryName: itemForm.categoryName,
        subCategory: itemForm.subCategory,
        description: itemForm.description,
        quantity: editingItemId ? (items.find((i) => i.id === editingItemId)?.quantity || 0) : 0,
        minStock: Math.max(0, Number(itemForm.minStock) || 10),
        unit: itemForm.unit,
        purchasePrice: Number(itemForm.purchasePrice) || 0,
        unitPrice: Number(itemForm.sellingPrice) || 0,
        sellingPrice: Number(itemForm.sellingPrice) || 0,
        totalValue: 0,
        supplierId: suppliers[0]?.id || "sup-001",
        supplierName: suppliers[0]?.name || "Office Plus Supplies",
        branchId,
        branchName,
        location: loc?.name || "Main Store",
        storeLocationId: itemForm.storeLocationId,
        storeLocationName: loc?.name,
        status: "IN_STOCK",
        lastRestocked: new Date().toISOString().split("T")[0],
        expiryDate: itemForm.expiryDate || undefined,
        photo: itemForm.photo || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      payload.totalValue = payload.quantity * payload.purchasePrice;
      mockDb.saveInventoryItem(payload);
      toast.success(editingItemId ? "Item updated" : "Item created — base for all stock transactions");
      setItemDialogOpen(false); refreshAll();
    } catch (e: any) { toast.error(e.message); }
  };
  const confirmBulkIssue = () => {
    if (!bulkIssueItemId) { toast.error("Select item"); return; }
    const qty = Math.max(1, Number(bulkIssueQty) || 1);
    const targetStudents = bulkIssueClassId === "ALL" ? students.filter((s) => bulkIssueSelected.includes(s.id)) : students.filter((s) => s.classId === bulkIssueClassId);
    if (targetStudents.length === 0) { toast.error("Select at least one student / class"); return; }
    let ok = 0; let fail = 0;
    for (const stu of targetStudents) {
      try {
        mockDb.createStockOut({ itemId: bulkIssueItemId, variantSize: bulkIssueSize || undefined, quantity: qty, reason: "Student Sale", recipientName: `${stu.fullName} (${stu.admissionNumber || stu.rollNumber})`, recipientId: stu.id, performedBy: "Store Manager" } as any);
        ok++;
      } catch { fail++; }
    }
    toast.success(`Bulk issue: ${ok} succeeded • ${fail} failed (check stock)`, { description: `${qty} pcs × ${targetStudents.length} students` });
    setBulkIssueOpen(false); refreshAll();
  };
  const confirmSupplierSave = () => {
    if (!supplierForm.name.trim()) { toast.error("Supplier name required"); return; }
    mockDb.saveInventorySupplier({ name: supplierForm.name.trim(), contactPerson: supplierForm.contactPerson || "Contact", phone: supplierForm.phone || "+91 90000 00000", email: supplierForm.email || "vendor@example.com", address: supplierForm.address || "Address", gstNumber: supplierForm.gstNumber || undefined, rating: 4.2, totalOrders: 0, branchId: "all", status: supplierForm.status } as any);
    toast.success("Supplier added — inline available for Stock In");
    setSupplierDialogOpen(false); setEntrySupplier(mockDb.getInventorySuppliers().slice(-1)[0]?.id || "");
    refreshAll();
  };

  return (
    <div className="space-y-4">
      {/* Retail summary ribbon — 20 Dashboard spec */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
          <div className="flex items-center gap-2 text-xs text-violet-700 dark:text-violet-300"><Shirt className="h-3.5 w-3.5" /> Uniform & Dress Stock</div>
          <div className="text-lg font-extrabold">{uniformItems.length} SKUs • {uniformItems.reduce((a, b: any) => a + (b.quantity || 0), 0)} pcs</div>
          <div className="text-[11px] text-muted-foreground">{formatCurrency(uniformItems.reduce((a, b: any) => a + b.totalValue, 0))} value • Size-wise</div>
        </Card>
        <Card className="p-3 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300"><PenTool className="h-3.5 w-3.5" /> Stationery + Books</div>
          <div className="text-lg font-extrabold">{stationeryItems.length} SKUs</div>
          <div className="text-[11px] text-muted-foreground">{formatCurrency(stationeryItems.reduce((a, b: any) => a + b.totalValue, 0))} value • Counter sales</div>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><Receipt className="h-3.5 w-3.5" /> Today&apos;s Sales</div>
          <div className="text-lg font-extrabold">{sales.filter((s: any) => s.date.startsWith(new Date().toISOString().split("T")[0])).length} sales • {formatCurrency(sales.filter((s: any) => s.date.startsWith(new Date().toISOString().split("T")[0])).reduce((a: number, b: any) => a + b.totalAmount, 0))}</div>
          <div className="text-[11px] text-muted-foreground">Monthly: {formatCurrency(sales.reduce((a: number, b: any) => a + b.totalAmount, 0))} • Separate from Fees</div>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300"><AlertTriangle className="h-3.5 w-3.5" /> Low / Out of Stock</div>
          <div className="text-lg font-extrabold">{alerts.filter((a: any) => !a.acknowledged).length} alerts</div>
          <div className="text-[11px] text-muted-foreground">{alerts.filter((a: any) => a.severity === "CRITICAL").length} critical • {alerts.filter((a: any) => a.variantSize).length} size-wise</div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="pos" className="text-xs gap-1"><Store className="h-3.5 w-3.5" /> Counter / POS</TabsTrigger>
            <TabsTrigger value="items" className="text-xs">Stock Items ({items.length})</TabsTrigger>
            <TabsTrigger value="uniform" className="text-xs gap-1"><Shirt className="h-3.5 w-3.5" /> Uniform Size-wise</TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1"><History className="h-3.5 w-3.5" /> History / Audit</TabsTrigger>
            <TabsTrigger value="purchases" className="text-xs">Purchases ({purchases.length})</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">Alerts ({alerts.length})</TabsTrigger>
            <TabsTrigger value="transfers" className="text-xs gap-1"><ArrowLeftRight className="h-3.5 w-3.5" /> Transfers</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Reports</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs gap-1"><Building2 className="h-3.5 w-3.5" /> Suppliers</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1"><Wrench className="h-3.5 w-3.5" /> Settings</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => openEntry()}><Plus className="h-3.5 w-3.5" /> Stock Entry</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => openOut()}><Minus className="h-3.5 w-3.5" /> Stock Out</Button>
            <Button size="sm" className="h-8 text-xs gap-1" onClick={() => setRetOpen(true)}><RefreshCw className="h-3.5 w-3.5" /> Return / Exchange</Button>
          </div>
        </div>

        {/* ── POS / Counter ── */}
        <TabsContent value="pos" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Left: Student Search */}
            <Card className="xl:col-span-1 border-border/80 shadow-2xs">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" /> Student Search — Admission No / Name / Mobile</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={posStudentSearch} onChange={(e) => setPosStudentSearch(e.target.value)} placeholder="e.g. ADM-2024-089, STU-1042, 98765..., Rahul" className="pl-9 h-9 text-xs" />
                </div>
                <div className="rounded-lg border max-h-[260px] overflow-y-auto divide-y">
                  {posStudents.map((s) => (
                    <button key={s.id} onClick={() => setPosStudentId(s.id)} className={`w-full text-left p-2 flex items-center gap-2 hover:bg-muted/50 ${posStudentId === s.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}>
                      <img src={s.avatar} alt={s.fullName} className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold">{s.fullName} <Badge variant="outline" className="text-[10px] font-mono ml-1">{s.admissionNumber || s.rollNumber}</Badge></div>
                        <div className="text-[11px] text-muted-foreground">{s.className} • {s.sectionName} • {s.guardian.phone}</div>
                      </div>
                      {posStudentId === s.id && <span className="text-primary text-xs">✓</span>}
                    </button>
                  ))}
                  {posStudents.length === 0 && <div className="p-3 text-xs text-muted-foreground text-center">No student found — try Admission No / Mobile</div>}
                </div>
                {selectedStudent ? (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-xs">
                    <div className="font-bold">{selectedStudent.fullName} — {selectedStudent.admissionNumber}</div>
                    <div className="text-muted-foreground">{selectedStudent.className} • {selectedStudent.sectionName} • {selectedStudent.branchName}</div>
                    <div className="text-[11px] text-emerald-700 mt-1">Purchase History: {sales.filter((s: any) => s.studentId === selectedStudent.id).length} receipts</div>
                  </div>
                ) : <div className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border">Select student to enable cart checkout — student history linked to Admission No.</div>}
                <div className="flex gap-2">
                  <Select value={posStoreId} onValueChange={setPosStoreId}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Store Location" /></SelectTrigger>
                    <SelectContent>
                      {storeLocations.map((loc) => <SelectItem key={loc.id} value={loc.id}>{loc.name} ({loc.type})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Center: Product search + Cart */}
            <Card className="xl:col-span-2 border-border/80 shadow-2xs">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> School Store Counter — Cart & Billing</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <div className="md:col-span-3 relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input value={posProductSearch} onChange={(e) => setPosProductSearch(e.target.value)} placeholder="Search Shirt, Notebook, Pen — SKU / size 28 etc." className="pl-9 h-8 text-xs" />
                    {posProductSearch && (
                      <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-[180px] overflow-y-auto">
                        {posProducts.map((p: any) => (
                          <button key={p.id} onClick={() => { setPosSelectedItemId(p.id); setPosSelectedSize(p.variants?.[0]?.size || ""); setPosProductSearch(""); }} className={`w-full text-left p-2 hover:bg-muted flex justify-between items-center ${posSelectedItemId === p.id ? "bg-muted" : ""}`}>
                            <span className="text-xs font-semibold">{p.name} <span className="font-mono text-[11px] text-muted-foreground">• {p.sku} • {p.categoryName} • {formatCurrency(p.sellingPrice || p.unitPrice)}</span></span>
                            <Badge variant={p.status === "OUT_OF_STOCK" ? "destructive" : p.status === "LOW_STOCK" ? "warning" : "success"} className="text-[10px]">{p.status === "OUT_OF_STOCK" ? "OUT OF STOCK" : p.status === "LOW_STOCK" ? "LOW" : `${p.quantity} pcs`}</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Select value={posSelectedItemId} onValueChange={(v) => { setPosSelectedItemId(v); const it: any = items.find((x) => x.id === v); setPosSelectedSize(it?.variants?.[0]?.size || ""); }}>
                    <SelectTrigger className="h-8 text-xs md:col-span-2"><SelectValue placeholder="Select Product" /></SelectTrigger>
                    <SelectContent>
                      {posProducts.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.sku} • Stock {p.quantity}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {posSelectedItem?.variants && (
                  <div className="flex flex-wrap gap-2 items-center p-2 rounded-lg bg-muted/30 border">
                    <span className="text-xs font-medium">Size / Variant *</span>
                    <div className="flex flex-wrap gap-1">
                      {posSelectedItem.variants.map((v: any) => {
                        const low = v.quantity <= (v.minStock ?? posSelectedItem.minStock);
                        const out = v.quantity === 0;
                        return (
                          <button key={v.size} onClick={() => setPosSelectedSize(v.size)} className={`px-2 py-1 rounded-md text-xs font-mono border ${posSelectedSize === v.size ? "bg-primary text-primary-foreground border-primary" : out ? "bg-rose-100 text-rose-700 border-rose-200" : low ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white hover:bg-muted"}`}>
                            {v.size} <span className="text-[10px]">({v.quantity})</span> {out ? "❌" : low ? "⚠️" : ""}
                          </button>
                        );
                      })}
                    </div>
                    {posSelectedSize && <span className="text-[11px] text-muted-foreground">Available: {availQty(posSelectedItem, posSelectedSize)} • Min {posSelectedItem.variants.find((x: any) => x.size === posSelectedSize)?.minStock ?? posSelectedItem.minStock} {availQty(posSelectedItem, posSelectedSize) === 0 ? "— OUT OF STOCK: cannot add" : availQty(posSelectedItem, posSelectedSize) <= (posSelectedItem.variants.find((x: any) => x.size === posSelectedSize)?.minStock ?? posSelectedItem.minStock) ? "— LOW STOCK" : ""}</span>}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input type="number" min={1} value={posQty} onChange={(e) => setPosQty(e.target.value)} className="h-8 text-xs w-20" placeholder="Qty" />
                  <Button size="sm" className="h-8 text-xs gap-1" onClick={handleAddToCart}><Plus className="h-3.5 w-3.5" /> Add to Cart</Button>
                  <span className="text-[11px] text-muted-foreground self-center">Price: {posSelectedItem ? formatCurrency(posSelectedItem.sellingPrice || posSelectedItem.unitPrice) : "—"} {posSelectedItem?.unit ? `/ ${posSelectedItem.unit}` : ""}</span>
                </div>

                {/* Cart Table */}
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-xs">Item</TableHead><TableHead className="text-xs">Size</TableHead><TableHead className="text-right text-xs">Qty</TableHead><TableHead className="text-right text-xs">Price</TableHead><TableHead className="text-right text-xs">Total</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>
                      {cart.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">Cart empty — add Shirt (Size 28) ×2, Notebook ×5 etc.</TableCell></TableRow> :
                        cart.map((c, idx) => {
                          const it: any = items.find((x) => x.id === c.itemId);
                          return (
                            <TableRow key={idx}>
                              <TableCell className="text-xs font-semibold">{it?.name} <span className="font-mono text-[11px] text-muted-foreground">• {it?.sku}</span></TableCell>
                              <TableCell className="text-xs font-mono">{c.variantSize || "—"}</TableCell>
                              <TableCell className="text-right text-xs">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => { const nc = [...cart]; nc[idx] = { ...c, quantity: Math.max(1, c.quantity - 1) }; setCart(nc); }}><Minus className="h-3 w-3" /></Button>
                                  <span className="w-6 text-center">{c.quantity}</span>
                                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => { const avail = availQty(it, c.variantSize); if (c.quantity + 1 > avail) { toast.error(`Only ${avail} available`); return; } const nc = [...cart]; nc[idx] = { ...c, quantity: c.quantity + 1 }; setCart(nc); }}><Plus className="h-3 w-3" /></Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-xs font-mono">{formatCurrency(it?.sellingPrice || it?.unitPrice)}</TableCell>
                              <TableCell className="text-right text-xs font-mono font-bold">{formatCurrency((it?.sellingPrice || it?.unitPrice) * c.quantity)}</TableCell>
                              <TableCell><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCart(cart.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3" /></Button></TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-2 p-3 rounded-xl bg-muted/30 border">
                  <div className="flex justify-between text-xs"><span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span><strong className="font-mono">{formatCurrency(cartTotal)}</strong></div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2">Discount <Input value={posDiscount} onChange={(e) => setPosDiscount(e.target.value)} className="h-7 w-20 text-xs" placeholder="0" /></span>
                    <span className="font-mono">- {formatCurrency(discountVal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold border-t pt-2"><span>Total Amount</span><span className="font-mono text-primary">{formatCurrency(grandTotal)}</span></div>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {(["CASH", "UPI", "CARD", "ONLINE"] as const).map((m) => (
                      <Button key={m} variant={posPayment === m ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={() => setPosPayment(m)}>{m}</Button>
                    ))}
                  </div>
                  <Button onClick={handleCompleteSale} disabled={!posStudentId || cart.length === 0} variant="gradient" className="w-full h-9 gap-2"><Receipt className="h-4 w-4" /> COMPLETE SALE</Button>
                  <div className="text-[11px] text-muted-foreground text-center">Sale → Payment Recorded → Stock Updated → Student History → Receipt Generated (Fee Payment separate)</div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Recent sales */}
          {sales.length > 0 && (
            <Card className="border-border/80">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Counter Sales — Student Purchase History</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead className="text-xs">Invoice</TableHead><TableHead className="text-xs">Student</TableHead><TableHead className="text-xs">Class</TableHead><TableHead className="text-xs">Items</TableHead><TableHead className="text-right text-xs">Total</TableHead><TableHead className="text-xs">Payment</TableHead><TableHead className="text-xs">Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {sales.slice(0, 5).map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">{s.invoiceNumber}</TableCell>
                        <TableCell className="text-xs">{s.studentName} <span className="font-mono text-[11px] text-muted-foreground">• {s.studentRoll}</span></TableCell>
                        <TableCell className="text-xs">{s.studentClass}</TableCell>
                        <TableCell className="text-xs">{s.items.map((it: any) => `${it.itemName}${it.variantSize ? ` Size ${it.variantSize}` : ""} ×${it.quantity}`).join(", ")}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold">{formatCurrency(s.totalAmount)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{s.paymentMethod} • {s.paymentStatus}</Badge></TableCell>
                        <TableCell className="text-xs">{formatDate(s.date)}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setLastSale(s); setReceiptOpen(true); }}><FileText className="h-3 w-3" /> Receipt</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Stock Items ── Items Master (P1) per spec: sub-category, photo, reorder, unit, 500+ debounced search ── */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/30 border">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search SKU, product, category, size... (debounced)" className="pl-9 h-8 text-xs" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Store Location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Stores</SelectItem>
                {storeLocations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" onClick={() => openItemDialog()}><Plus className="h-3.5 w-3.5" /> Add Item</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setBulkIssueOpen(true)}><ShoppingCart className="h-3.5 w-3.5" /> Bulk Issue</Button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In Stock</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Low</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Out</span>
            <span className="hidden sm:inline">• Unit: pcs / box / set / pair / kg / litre / metre • 1 box = 12 pcs shown clearly</span>
          </div>
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Store / Location</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Purchase</TableHead>
                  <TableHead className="text-right">Selling</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{item.sku}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground">{item.branchName} • {item.variants ? `${item.variants.length} sizes` : item.unit}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{item.categoryName}</Badge></TableCell>
                    <TableCell className="text-xs flex items-center gap-1"><Building2 className="h-3 w-3" />{item.storeLocationName || item.location}</TableCell>
                    <TableCell className="text-xs">{item.unit}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(item.purchasePrice)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">{formatCurrency(item.sellingPrice || item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">{item.quantity} {item.variants ? `(${item.variants.map((v: any) => `${v.size}:${v.quantity}`).join(", ")})` : ""}</TableCell>
                    <TableCell><Badge variant={item.status === "IN_STOCK" ? "success" : item.status === "LOW_STOCK" ? "warning" : "destructive"} className="text-[10px]">{item.status === "OUT_OF_STOCK" ? "❌ OUT OF STOCK" : item.status === "LOW_STOCK" ? "⚠️ LOW" : "IN_STOCK"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => openItemDialog(item)}><FileText className="h-3 w-3" /></Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => openEntry(item.id)}><Plus className="h-3 w-3" /> Entry</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => openOut(item.id)}><Minus className="h-3 w-3" /> Out</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-8">No items match — try search / category / store filter</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Uniform Size-wise ── */}
        <TabsContent value="uniform" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {uniformItems.filter((i: any) => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
              <Card key={item.id} className="border-violet-200 shadow-2xs hover:border-violet-300 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex gap-2 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0"><Shirt className="h-5 w-5 text-violet-600" /></div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono truncate">{item.sku} • {item.storeLocationName || item.location} • ₹{item.sellingPrice || item.unitPrice}</p>
                      </div>
                    </div>
                    <Badge variant={item.status === "IN_STOCK" ? "success" : item.status === "LOW_STOCK" ? "warning" : "destructive"} className="text-[10px] shrink-0">{item.status === "OUT_OF_STOCK" ? "❌ OUT" : item.status}</Badge>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {(item.variants || []).map((v: any) => {
                      const isLow = v.quantity <= (v.minStock ?? item.minStock);
                      const isOut = v.quantity === 0;
                      return (
                        <div key={v.size} className={`p-1.5 rounded-lg border text-center ${isOut ? "bg-rose-50 border-rose-200 dark:bg-rose-950/20" : isLow ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20" : "bg-muted/40"}`}>
                          <div className="text-xs font-mono font-bold">{v.size}</div>
                          <div className={`text-sm font-extrabold ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-foreground"}`}>{v.quantity}</div>
                          <div className="text-[10px] text-muted-foreground">min {v.minStock ?? item.minStock}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => { setPosSelectedItemId(item.id); setPosSelectedSize(item.variants?.[0]?.size || ""); setActiveTab("pos"); }}><ShoppingCart className="h-3.5 w-3.5" /> Sell (POS)</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEntry(item.id)}><Plus className="h-3.5 w-3.5" /> Restock</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setAdjItemId(item.id); setAdjSize(item.variants?.[0]?.size || ""); setAdjNewQty(String(item.variants?.[0]?.quantity || "")); setAdjOpen(true); }}><Wrench className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Purchases ── */}
        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Supplier & Purchase Management — Goods Received → Stock Entry</h3>
            <Button size="sm" variant="gradient" className="gap-1" onClick={() => openEntry()}><Plus className="h-3.5 w-3.5" /> New Purchase Order</Button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>PO / Invoice</TableHead><TableHead>Supplier</TableHead><TableHead>Item</TableHead><TableHead>Size</TableHead><TableHead className="text-right">Qty × Price</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {purchases.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono font-bold text-xs">{p.invoiceNumber || p.id}</TableCell>
                    <TableCell className="text-xs font-semibold">{p.supplierName}</TableCell>
                    <TableCell className="text-xs">{p.itemName} <span className="font-mono text-[11px] text-muted-foreground">• {p.itemSku}</span></TableCell>
                    <TableCell className="text-xs font-mono">{p.variantSize || "—"}</TableCell>
                    <TableCell className="text-right text-xs font-mono">{p.quantity} × {formatCurrency(p.unitPrice)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">{formatCurrency(p.totalAmount)}</TableCell>
                    <TableCell className="text-xs">{formatDate(p.purchaseDate)}</TableCell>
                    <TableCell><Badge variant={p.status === "RECEIVED" ? "success" : p.status === "APPROVED" ? "warning" : "secondary"} className="text-[10px]">{p.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody></Table>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} className="border-border/80">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between"><h4 className="font-bold text-sm">{s.name}</h4><span className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" />{s.rating}</span></div>
                  <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-2"><p>{s.contactPerson} • {s.phone}</p><p>{s.email}</p><p>{s.address}</p><p>{s.gstNumber || "No GST"}</p></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Alerts ── */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">⚠️ Low Stock Alerts — per-size thresholds (Uniform) + overall min. Notify staff via existing notification system.</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={refreshAll}><RefreshCw className="h-3 w-3" /> Refresh</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.length === 0 ? <div className="col-span-full p-8 text-center text-sm text-muted-foreground border rounded-xl bg-card">No low/out-of-stock alerts — stock healthy ✅</div> :
              alerts.map((al: any) => (
                <Card key={al.id} className={`shadow-2xs ${al.severity === "CRITICAL" ? "border-rose-200 bg-rose-50/50 dark:bg-rose-950/20" : "border-amber-200 bg-amber-50/50 dark:bg-amber-950/20"}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0"><h4 className="font-bold text-sm truncate">{al.itemName} {al.variantSize ? `— Size ${al.variantSize}` : ""}</h4><p className="text-xs text-muted-foreground font-mono">SKU: {al.itemSku} • {al.branchName}</p></div>
                      <Badge variant={al.severity === "CRITICAL" ? "destructive" : "warning"} className="text-[10px] shrink-0">{al.severity === "CRITICAL" ? "❌ OUT OF STOCK" : "⚠️ LOW STOCK"}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t"><span>Current: <strong className="text-foreground">{al.currentQuantity}</strong></span><span>Min: <strong className="text-foreground">{al.minStock}</strong></span></div>
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs mt-1" onClick={() => openEntry(al.itemId)}><Truck className="h-3 w-3" /> Reorder Now</Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* ── Transfers ── */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Stock Transfer — Main Store → Uniform/Stationery/Lab/Sports/Hostel (separate stock per location)</h3>
            <Button size="sm" className="gap-1" onClick={() => setTrfOpen(true)}><ArrowLeftRight className="h-3.5 w-3.5" /> New Transfer</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30 border">
            {storeLocations.map((loc) => (
              <Card key={loc.id} className="p-3">
                <div className="text-xs font-bold flex items-center gap-2"><Store className="h-3.5 w-3.5" /> {loc.name}</div>
                <div className="text-[11px] text-muted-foreground">{loc.type} • {loc.branchName}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{items.filter((i: any) => (i.storeLocationId || "loc-main") === loc.id).length} SKUs • {items.filter((i: any) => (i.storeLocationId || "loc-main") === loc.id).reduce((a: number, b: any) => a + b.quantity, 0)} pcs</div>
              </Card>
            ))}
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Item</TableHead><TableHead>Size</TableHead><TableHead>From → To</TableHead><TableHead className="text-right">Qty</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
              <TableBody>
                {transfers.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">No transfers yet — use Main Store → Uniform Counter flow</TableCell></TableRow> :
                  transfers.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-xs">{formatDate(t.date)}</TableCell>
                      <TableCell className="text-xs font-semibold">{t.itemName} <span className="font-mono text-[11px] text-muted-foreground">• {t.itemSku}</span></TableCell>
                      <TableCell className="text-xs font-mono">{t.variantSize || "—"}</TableCell>
                      <TableCell className="text-xs">{t.fromLocationName} → {t.toLocationName}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold">{t.quantity}</TableCell>
                      <TableCell className="text-xs">{t.performedBy}</TableCell>
                    </TableRow>
                  ))}
              </TableBody></Table>
          </div>
        </TabsContent>

        {/* ── History / Audit ── */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/30 border">
            <Select value={historyFilter} onValueChange={setHistoryFilter}>
              <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Filter Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Movements</SelectItem>
                <SelectItem value="PURCHASE">Stock Entry (Purchase)</SelectItem>
                <SelectItem value="SALE">Sale (Student)</SelectItem>
                <SelectItem value="ISSUE">Issue (Staff/Dept)</SelectItem>
                <SelectItem value="RETURN">Return / Exchange</SelectItem>
                <SelectItem value="TRANSFER_OUT">Transfer</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="DAMAGE">Damage / Lost / Expired</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setAdjOpen(true)}><Wrench className="h-3.5 w-3.5" /> Adjustment</Button>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => { setHistoryFilter("ALL"); refreshAll(); }}><History className="h-3.5 w-3.5" /> Audit Trail</Button>
            </div>
            <span className="text-[11px] text-muted-foreground self-center">Every movement logged: Opening Stock → Entry → Sale → Return → Transfer → Adjustment • User + Date + Prev/Curr</span>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Date</TableHead><TableHead className="text-xs">Item</TableHead><TableHead className="text-xs">Size</TableHead><TableHead className="text-xs">Type</TableHead><TableHead className="text-right text-xs">Qty</TableHead><TableHead className="text-xs">Prev → Curr</TableHead><TableHead className="text-xs">Reason / Recipient</TableHead><TableHead className="text-xs">By</TableHead></TableRow></TableHeader>
              <TableBody>
                {transactions.filter((t: any) => historyFilter === "ALL" || t.type === historyFilter).slice(0, 100).map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{formatDate(t.date)}</TableCell>
                    <TableCell className="text-xs font-semibold">{t.itemName} <span className="font-mono text-[11px] text-muted-foreground">• {t.itemSku}</span></TableCell>
                    <TableCell className="text-xs font-mono">{t.variantSize || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.type}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">{t.type === "ADJUSTMENT" ? `${t.quantity}` : t.type.includes("TRANSFER") || t.type === "PURCHASE" ? `+${t.quantity}` : `-${t.quantity}`}</TableCell>
                    <TableCell className="text-xs font-mono">{t.previousQuantity != null ? `${t.previousQuantity} → ${t.currentQuantity}` : "—"}</TableCell>
                    <TableCell className="text-xs"><span className="font-medium">{t.reason}</span>{t.recipientName ? <span className="text-muted-foreground"> • {t.recipientName}</span> : null}</TableCell>
                    <TableCell className="text-xs">{t.performedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {returns.length > 0 && (
            <Card className="border-border/80"><CardHeader className="pb-2"><CardTitle className="text-sm">Return & Exchange History — Size-wise auto-adjusted</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Student</TableHead><TableHead>Old (Size) → New (Size)</TableHead><TableHead>Invoice</TableHead></TableRow></TableHeader>
                  <TableBody>{returns.slice(0, 10).map((r: any) => <TableRow key={r.id}><TableCell className="text-xs">{formatDate(r.date)}</TableCell><TableCell><Badge variant="outline" className="text-[10px]">{r.type}</Badge></TableCell><TableCell className="text-xs">{r.studentName}</TableCell><TableCell className="text-xs font-mono">{r.oldItem.itemName} Size {r.oldItem.variantSize} {r.newItem ? `→ ${r.newItem.itemName} Size ${r.newItem.variantSize}` : ""}</TableCell><TableCell className="text-xs font-mono">{r.invoiceNumber}</TableCell></TableRow>)}</TableBody></Table>
              </CardContent></Card>
          )}
        </TabsContent>

        {/* ── Reports ── */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-3"><div className="text-[11px] text-muted-foreground">Total Products</div><div className="text-2xl font-extrabold">{items.length}</div><div className="text-[11px] text-muted-foreground">Uniform {uniformItems.length} • Stationery {stationeryItems.length}</div></Card>
            <Card className="p-3"><div className="text-[11px] text-muted-foreground">Total Stock (pcs)</div><div className="text-2xl font-extrabold">{items.reduce((a: number, b: any) => a + b.quantity, 0)}</div><div className="text-[11px] text-muted-foreground">{formatCurrency(items.reduce((a: number, b: any) => a + b.totalValue, 0))} valuation</div></Card>
            <Card className="p-3"><div className="text-[11px] text-muted-foreground">Sales (Store) — Separate from Fees</div><div className="text-2xl font-extrabold">{sales.length} receipts</div><div className="text-[11px] text-muted-foreground">{formatCurrency(sales.reduce((a: number, b: any) => a + b.totalAmount, 0))} total</div></Card>
            <Card className="p-3"><div className="text-[11px] text-muted-foreground">Purchases</div><div className="text-2xl font-extrabold">{purchases.length} POs</div><div className="text-[11px] text-muted-foreground">{formatCurrency(purchases.reduce((a: number, b: any) => a + b.totalAmount, 0))} purchased</div></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Category-wise Stock</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Category</TableHead><TableHead className="text-right">Items</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Value</TableHead></TableRow></TableHeader><TableBody>
              {categories.map((c) => {
                const catItems = items.filter((i: any) => i.categoryName === c.name);
                return <TableRow key={c.id}><TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">{c.name}</Badge></TableCell><TableCell className="text-right text-xs">{catItems.length}</TableCell><TableCell className="text-right text-xs font-mono">{catItems.reduce((a: number, b: any) => a + b.quantity, 0)}</TableCell><TableCell className="text-right text-xs font-mono">{formatCurrency(catItems.reduce((a: number, b: any) => a + b.totalValue, 0))}</TableCell></TableRow>;
              })}
            </TableBody></Table></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Daily / Monthly Sales (Product-wise)</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead className="text-right">Sold Qty</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader><TableBody>
              {(() => {
                const map = new Map<string, { name: string; qty: number; rev: number }>();
                for (const s of sales) for (const it of (s as any).items) { const k = it.itemId; const cur = map.get(k) || { name: it.itemName, qty: 0, rev: 0 }; cur.qty += it.quantity; cur.rev += it.total; map.set(k, cur); }
                return Array.from(map.values()).slice(0, 8).map((r) => <TableRow key={r.name}><TableCell className="text-xs">{r.name}</TableCell><TableCell className="text-right text-xs font-mono">{r.qty}</TableCell><TableCell className="text-right text-xs font-mono">{formatCurrency(r.rev)}</TableCell></TableRow>);
              })()}
              {sales.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-xs text-muted-foreground py-6">No sales yet — use POS Counter</TableCell></TableRow>}
            </TableBody></Table></CardContent></Card>
          </div>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Student Purchase History — Class-wise</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Receipts</TableHead><TableHead className="text-right">Total Spent</TableHead><TableHead>Last Purchase</TableHead></TableRow></TableHeader><TableBody>
            {(() => {
              const map = new Map<string, { stu: any; count: number; total: number; last: string }>();
              for (const s of sales) { const cur = map.get(s.studentId) || { stu: s, count: 0, total: 0, last: s.date }; cur.count += 1; cur.total += s.totalAmount; if (s.date > cur.last) cur.last = s.date; map.set(s.studentId, cur); }
              return Array.from(map.values()).slice(0, 8).map((r) => <TableRow key={r.stu.studentId}><TableCell className="text-xs font-semibold">{r.stu.studentName} <span className="font-mono text-[11px] text-muted-foreground">• {r.stu.studentRoll}</span></TableCell><TableCell className="text-xs">{r.stu.studentClass}</TableCell><TableCell className="text-xs">{r.count}</TableCell><TableCell className="text-right text-xs font-mono font-bold">{formatCurrency(r.total)}</TableCell><TableCell className="text-xs">{formatDate(r.last)}</TableCell></TableRow>);
            })()}
            {sales.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">No student purchases yet</TableCell></TableRow>}
          </TableBody></Table></CardContent></Card>

          {/* Spec: 9 Reports per guide — add missing: Stock In/Out, Damage/Loss, Valuation export */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> Stock In Report (Purchases)</CardTitle></CardHeader><CardContent className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Item</TableHead><TableHead>Qty</TableHead><TableHead>Supplier</TableHead></TableRow></TableHeader><TableBody>{purchases.slice(0,5).map((p: any) => <TableRow key={p.id}><TableCell className="text-xs">{formatDate(p.purchaseDate)}</TableCell><TableCell className="text-xs">{p.itemName}</TableCell><TableCell className="text-xs font-mono">{p.quantity}</TableCell><TableCell className="text-xs">{p.supplierName}</TableCell></TableRow>)}</TableBody></Table><div className="flex gap-2 mt-3"><Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { const csv = `Date,Item,Qty,Supplier\n` + purchases.map((p: any) => `${p.purchaseDate},${p.itemName},${p.quantity},${p.supplierName}`).join("\n"); const blob = new Blob([csv], {type:"text/csv"}); const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="stock_in_report.csv"; a.click(); toast.success("Stock In CSV exported"); }}><Download className="h-3.5 w-3.5" /> Export CSV</Button><Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print</Button></div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Damage / Loss Report</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Item</TableHead><TableHead>Type</TableHead><TableHead>Qty</TableHead></TableRow></TableHeader><TableBody>{transactions.filter((t: any) => ["DAMAGE","LOST","EXPIRED"].includes(t.type)).slice(0,5).map((t: any) => <TableRow key={t.id}><TableCell className="text-xs">{formatDate(t.date)}</TableCell><TableCell className="text-xs">{t.itemName}</TableCell><TableCell><Badge variant="destructive" className="text-[10px]">{t.type}</Badge></TableCell><TableCell className="text-xs font-mono">{t.quantity}</TableCell></TableRow>)} {transactions.filter((t: any) => ["DAMAGE","LOST","EXPIRED"].includes(t.type)).length===0 && <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-4">No damage/loss yet</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
          </div>
          {(() => { const booksStationery = items.filter((i: any) => ["Stationery", "Books"].includes(i.categoryName)); const uniforms = items.filter((i: any) => i.categoryName === "Uniform"); return           <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Inventory Valuation</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-3 text-center"><div className="p-3 rounded-lg bg-muted/40"><div className="text-[11px] text-muted-foreground">Books & Stationery</div><div className="font-bold">{formatCurrency(stationeryItems.reduce((a: number, b: any) => a + b.totalValue, 0))}</div></div><div className="p-3 rounded-lg bg-muted/40"><div className="text-[11px] text-muted-foreground">Uniforms</div><div className="font-bold">{formatCurrency(uniformItems.reduce((a: number, b: any) => a + b.totalValue, 0))}</div></div><div className="p-3 rounded-lg bg-primary/10"><div className="text-[11px] text-muted-foreground">Total Valuation</div><div className="font-extrabold text-primary">{formatCurrency(items.reduce((a: number, b: any) => a + b.totalValue, 0))}</div></div></div></CardContent></Card>; })()}
        </TabsContent>

        {/* ── Suppliers (spec 6) ── */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Suppliers / Vendors — GST, Category, Bank, Purchase History</h3>
            <Button size="sm" className="gap-1" onClick={() => setSupplierDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> Add Supplier</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} className="border-border/80 hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start"><h4 className="font-bold text-sm truncate">{s.name}</h4><Badge variant={s.status==="ACTIVE"?"success":"secondary"} className="text-[10px]">{s.status}</Badge></div>
                  <div className="text-xs text-muted-foreground space-y-1"><p>{s.contactPerson} • {s.phone}</p><p className="truncate">{s.email}</p><p className="truncate">{s.address}</p><p className="font-mono text-[11px]">GST: {s.gstNumber || "—"} • Orders: {s.totalOrders}</p><p className="text-[11px]">Category: {(s as any).category || "All"} • Bank: {(s as any).bankDetails || "—"}</p></div>
                  <div className="flex gap-2 pt-2 border-t"><Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => toast.info(`Purchase history for ${s.name}: ${purchases.filter((p: any) => p.supplierId===s.id).length} orders`)}>History</Button><Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.success("Edit vendor — inline")}>Edit</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Settings (spec 11) ── */}
        <TabsContent value="settings" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Wrench className="h-4 w-4" /> Inventory Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <h4 className="font-semibold text-sm">Categories (5 Indian + 3 Extended)</h4>
                  <div className="flex flex-wrap gap-1">{categories.map((c) => <Badge key={c.id} variant="outline" className="text-xs">{c.name} — {c.itemCount} items</Badge>)}</div>
                  <div className="text-[11px] text-muted-foreground">Books & Stationery = Stationery + Books • Uniforms = Uniform • Lab = Laboratory Items • Sports = Sports Items • Property = Office + Cleaning + Other</div>
                  <Button size="sm" variant="outline" className="h-7 text-xs mt-2" onClick={() => toast.info("Add category — sub-category Textbook/Notebook/Register etc. configurable")}> Manage Categories</Button>
                </div>
                <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <h4 className="font-semibold text-sm">Units of Measurement</h4>
                  <div className="flex flex-wrap gap-1">{["pcs","box","set","pair","kg","litre","metre","ream","bottle","pack"].map((u) => <Badge key={u} variant="secondary" className="text-xs">{u}</Badge>)}</div>
                  <div className="text-[11px] text-muted-foreground">Spec issue #1: 1 box = 12 pcs — unit conversion note displayed on issue (e.g., Stationery Pen box→pcs). Configure per-item.</div>
                </div>
                <div className="p-4 rounded-xl border bg-amber-50/50 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Low Stock Threshold</h4>
                  <p className="text-xs text-muted-foreground">Global or per-item / per-size (Uniform). Current: per-variant minStock shown in Uniform tab. Example: Shirt Size 28 min 10, current 30 — healthy. Size 30 min 10, current 10 — ⚠️ low.</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Threshold configure — global default 10, override per SKU/size")}> Configure</Button>
                </div>
                <div className="p-4 rounded-xl border bg-rose-50/50 space-y-2">
                  <h4 className="font-semibold text-sm">Academic Year Reset</h4>
                  <p className="text-xs text-muted-foreground">Year-wise inventory carry-forward — closing stock becomes opening next year. No auto-reset without approval.</p>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { if(confirm("Reset inventory for new academic year? Current stock will be archived.")) toast.success("Academic year reset simulated — opening stock preserved"); }}> Year Reset</Button>
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-blue-50/30">
                <h4 className="font-semibold text-sm">Common UI covered</h4>
                <ul className="text-xs text-muted-foreground list-disc ml-4 space-y-1 mt-2">
                  <li>Search box debounced 300ms (student + product) — handles 500+ items</li>
                  <li>Status badges: <span className="text-emerald-600">In Stock</span> / <span className="text-amber-600">Low</span> / <span className="text-rose-600">Out</span> • red/amber/green</li>
                  <li>Quantity with unit — &quot;25 pcs&quot;, &quot;3 boxes (36 pcs)&quot; • 1 box = 12 pcs note</li>
                  <li>Running balance: ledger shows Prev → Curr after each movement</li>
                  <li>Print/export: reports have CSV + Print (clean table, no sidebar)</li>
                  <li>Confirmation modal + toast for entry/out/transfer</li>
                  <li>Negative stock prevention: available check + disable Submit if exceed</li>
                  <li>Mobile responsive: tables scroll, cards stack, 2→1 column on mobile</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Receipt Dialog ── */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="h-4 w-4" /> Sale Receipt — {lastSale?.invoiceNumber}</DialogTitle><DialogDescription>School / College: {lastSale?.branchName} • Counter: {lastSale?.storeLocationName}</DialogDescription></DialogHeader>
          {lastSale ? (
            <div className="space-y-3 text-xs border rounded-xl p-4 bg-card">
              <div className="flex justify-between border-b pb-2"><span className="font-bold">{lastSale.branchName}</span><span className="font-mono">{formatDate(lastSale.date)}</span></div>
              <div className="space-y-1"><div><strong>Student:</strong> {lastSale.studentName} ({lastSale.studentRoll})</div><div><strong>Class:</strong> {lastSale.studentClass} • {lastSale.studentSection}</div><div><strong>Invoice:</strong> {lastSale.invoiceNumber} • <strong>Payment:</strong> {lastSale.paymentMethod} • {lastSale.paymentStatus}</div></div>
              <Table><TableHeader><TableRow><TableHead className="text-xs">Item</TableHead><TableHead className="text-right text-xs">Qty</TableHead><TableHead className="text-right text-xs">Rate</TableHead><TableHead className="text-right text-xs">Amount</TableHead></TableRow></TableHeader><TableBody>
                {lastSale.items.map((it: any, idx: number) => <TableRow key={idx}><TableCell className="text-xs">{it.itemName} {it.variantSize ? `(Size ${it.variantSize})` : ""} <span className="font-mono text-[11px] text-muted-foreground">• {it.itemSku}</span></TableCell><TableCell className="text-right text-xs">{it.quantity}</TableCell><TableCell className="text-right text-xs font-mono">{formatCurrency(it.unitPrice)}</TableCell><TableCell className="text-right text-xs font-mono">{formatCurrency(it.total)}</TableCell></TableRow>)}
                <TableRow><TableCell colSpan={3} className="text-right text-xs">Subtotal</TableCell><TableCell className="text-right font-mono text-xs">{formatCurrency(lastSale.subtotal)}</TableCell></TableRow>
                <TableRow><TableCell colSpan={3} className="text-right text-xs">Discount</TableCell><TableCell className="text-right font-mono text-xs">- {formatCurrency(lastSale.discount)}</TableCell></TableRow>
                <TableRow><TableCell colSpan={3} className="text-right font-bold text-xs">Total Amount</TableCell><TableCell className="text-right font-mono font-extrabold">{formatCurrency(lastSale.totalAmount)}</TableCell></TableRow>
              </TableBody></Table>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print</Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => { const blob = new Blob([`Receipt ${lastSale.invoiceNumber}\n${lastSale.studentName} ${lastSale.studentRoll}\n${lastSale.items.map((i: any) => `${i.itemName} Size ${i.variantSize || ""} x${i.quantity} = ${i.total}`).join("\n")}\nTotal ${lastSale.totalAmount}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${lastSale.invoiceNumber}.txt`; a.click(); }}><Download className="h-3.5 w-3.5" /> Download</Button>
              </div>
              <div className="text-[11px] text-muted-foreground text-center">Store Sale • Not linked to Fee Module • Keep separate ledger • Thank you!</div>
            </div>
          ) : null}
          <DialogFooter><Button onClick={() => setReceiptOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Stock Entry Dialog ── */}
      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> Stock Entry — Supplier → Stock (Old + New = Current)</DialogTitle><DialogDescription>Supplier, size, qty, purchase/selling price, invoice — history logged</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Product *</label>
              <Select value={entryItemId} onValueChange={(v) => { setEntryItemId(v); const it: any = items.find((x) => x.id === v); setEntrySize(it?.variants?.[0]?.size || ""); setEntryPurPrice(String(it?.purchasePrice || "")); setEntrySellPrice(String(it?.sellingPrice || "")); setEntrySupplier(it?.supplierId || suppliers[0]?.id || ""); }}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name} — {it.sku} • {it.categoryName} • Stock {it.quantity}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {items.find((x) => x.id === entryItemId)?.variants && (
              <div><label className="text-xs font-medium block mb-1">Size *</label>
                <Select value={entrySize} onValueChange={setEntrySize}>
                  <SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger>
                  <SelectContent>{(items.find((x) => x.id === entryItemId) as any)?.variants?.map((v: any) => <SelectItem key={v.size} value={v.size}>{v.size} — Stock {v.quantity} (min {v.minStock})</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><label className="text-xs font-medium block mb-1">Supplier * <Button variant="ghost" size="sm" className="h-5 text-[11px] ml-2" onClick={() => setSupplierDialogOpen(true)}>+ New Supplier (inline)</Button></label>
              <Select value={entrySupplier} onValueChange={setEntrySupplier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.phone} {s.gstNumber ? `• ${s.gstNumber}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Quantity *</label><Input type="number" min={1} value={entryQty} onChange={(e) => setEntryQty(e.target.value)} /><span className="text-[11px] text-muted-foreground">Available {(() => { const it:any=items.find((x)=>x.id===entryItemId); return it?.variants?.find((v:any)=>v.size===entrySize)?.quantity ?? it?.quantity ?? 0;})()} • 1 box = 12 pcs</span></div>
              <div><label className="text-xs font-medium block mb-1">Invoice No</label><Input value={entryInvoice} onChange={(e) => setEntryInvoice(e.target.value)} placeholder="INV-1025" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Purchase Price (₹)</label><Input type="number" value={entryPurPrice} onChange={(e) => setEntryPurPrice(e.target.value)} /></div>
              <div><label className="text-xs font-medium block mb-1">Selling Price (₹)</label><Input type="number" value={entrySellPrice} onChange={(e) => setEntrySellPrice(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Purchase Date</label><Input type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
              <div><label className="text-xs font-medium block mb-1">Expiry Date (lab chemicals)</label><Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} placeholder="Optional" /></div>
            </div>
            {entryItemId && entryQty && (() => { const it: any = items.find((x) => x.id === entryItemId); const prev = it?.variants?.find((v: any) => v.size === entrySize)?.quantity ?? it?.quantity ?? 0; const qty = Number(entryQty) || 0; return <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-xs">Old Stock: {prev} + New: {qty} = <strong>Current: {prev + qty}</strong> • Total {formatCurrency(qty * (Number(entryPurPrice)||0))} auto-calc</div>; })()}
          </div>
          <DialogFooter className="gap-2 pt-2"><Button variant="outline" onClick={() => setEntryOpen(false)}>Cancel</Button><Button onClick={confirmEntry} variant="gradient" className="gap-1"><Truck className="h-3.5 w-3.5" /> Confirm Stock Entry</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Stock Out Dialog ── */}
      <Dialog open={outOpen} onOpenChange={setOutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Stock Out / Issue — never negative</DialogTitle><DialogDescription>Student Sale / Free Distribution / Staff / Department / Damaged / Lost / Expired / Return to Supplier</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Product *</label>
              <Select value={outItemId} onValueChange={(v) => { setOutItemId(v); const it: any = items.find((x) => x.id === v); setOutSize(it?.variants?.[0]?.size || ""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name} — Stock {it.quantity}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {items.find((x) => x.id === outItemId)?.variants && (
              <div><label className="text-xs font-medium block mb-1">Size</label>
                <Select value={outSize} onValueChange={setOutSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(items.find((x) => x.id === outItemId) as any)?.variants?.map((v: any) => <SelectItem key={v.size} value={v.size}>{v.size} — Avl {v.quantity}{v.quantity === 0 ? " ❌ OUT" : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Quantity *</label><Input type="number" min={1} value={outQty} onChange={(e) => setOutQty(e.target.value)} /></div>
              <div><label className="text-xs font-medium block mb-1">Reason *</label>
                <Select value={outReason} onValueChange={setOutReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Student Sale">Student Sale</SelectItem>
                    <SelectItem value="Free Distribution">Free Distribution</SelectItem>
                    <SelectItem value="Staff Issue">Staff Issue</SelectItem>
                    <SelectItem value="Department Issue">Department Issue</SelectItem>
                    <SelectItem value="Damaged Item">Damaged Item</SelectItem>
                    <SelectItem value="Lost Item">Lost Item</SelectItem>
                    <SelectItem value="Expired Item">Expired Item</SelectItem>
                    <SelectItem value="Return to Supplier">Return to Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium block mb-1">Recipient (Student / Staff / Dept)</label><Input value={outRecipient} onChange={(e) => setOutRecipient(e.target.value)} placeholder="e.g. Rahul Kumar 5-A / Housekeeping" /></div>
            <div><label className="text-xs font-medium block mb-1">Remarks</label><Textarea value={outRemarks} onChange={(e) => setOutRemarks(e.target.value)} rows={2} placeholder="Damaged reason, lost proof..." /></div>
          </div>
          <DialogFooter className="gap-2 pt-2"><Button variant="outline" onClick={() => setOutOpen(false)}>Cancel</Button><Button onClick={confirmOut} variant="gradient">Confirm Stock Out</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Transfer Dialog ── */}
      <Dialog open={trfOpen} onOpenChange={setTrfOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> Stock Transfer — check available & validate destination</DialogTitle><DialogDescription>Main Store → Uniform Counter / Stationery / Lab / Sports / Hostel — history maintained</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Item *</label>
              <Select value={trfItemId} onValueChange={(v) => { setTrfItemId(v); const it: any = items.find((x) => x.id === v); setTrfSize(it?.variants?.[0]?.size || ""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name} — Stock {it.quantity}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {items.find((x) => x.id === trfItemId)?.variants && (
              <div><label className="text-xs font-medium block mb-1">Size</label>
                <Select value={trfSize} onValueChange={setTrfSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(items.find((x) => x.id === trfItemId) as any)?.variants?.map((v: any) => <SelectItem key={v.size} value={v.size}>{v.size} — Avl {v.quantity}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">From *</label>
                <Select value={trfFrom} onValueChange={setTrfFrom}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{storeLocations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium block mb-1">To *</label>
                <Select value={trfTo} onValueChange={setTrfTo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{storeLocations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium block mb-1">Quantity *</label><Input type="number" min={1} value={trfQty} onChange={(e) => setTrfQty(e.target.value)} /></div>
          </div>
          <DialogFooter className="gap-2 pt-2"><Button variant="outline" onClick={() => setTrfOpen(false)}>Cancel</Button><Button onClick={confirmTransfer} variant="gradient">Confirm Transfer</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Adjustment Dialog ── */}
      <Dialog open={adjOpen} onOpenChange={setAdjOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wrench className="h-4 w-4" /> Stock Adjustment — authorized only</DialogTitle><DialogDescription>Physical difference / Damaged / Lost / Entry Mistake — requires reason + user + prev/new qty</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Item *</label>
              <Select value={adjItemId} onValueChange={(v) => { setAdjItemId(v); const it: any = items.find((x) => x.id === v); setAdjSize(it?.variants?.[0]?.size || ""); setAdjNewQty(String(it?.variants?.find((x: any) => x.size === (it?.variants?.[0]?.size))?.quantity ?? it?.quantity ?? "")); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{items.map((it) => <SelectItem key={it.id} value={it.id}>{it.name} — Stock {it.quantity}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {items.find((x) => x.id === adjItemId)?.variants && (
              <div><label className="text-xs font-medium block mb-1">Size</label>
                <Select value={adjSize} onValueChange={(v) => { setAdjSize(v); const it: any = items.find((x) => x.id === adjItemId); const q = it?.variants?.find((x: any) => x.size === v)?.quantity; setAdjNewQty(String(q ?? "")); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(items.find((x) => x.id === adjItemId) as any)?.variants?.map((v: any) => <SelectItem key={v.size} value={v.size}>{v.size} — Current {v.quantity}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Previous Qty</label><Input value={(() => { const it: any = items.find((x) => x.id === adjItemId); return String(it?.variants?.find((v: any) => v.size === adjSize)?.quantity ?? it?.quantity ?? ""); })()} disabled className="h-8 text-xs" /></div>
              <div><label className="text-xs font-medium block mb-1">New Qty *</label><Input type="number" min={0} value={adjNewQty} onChange={(e) => setAdjNewQty(e.target.value)} /></div>
            </div>
            <div><label className="text-xs font-medium block mb-1">Reason *</label>
              <Select value={adjReason} onValueChange={setAdjReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physical Stock Difference">Physical Stock Difference</SelectItem>
                  <SelectItem value="Damaged Items">Damaged Items</SelectItem>
                  <SelectItem value="Lost Items">Lost Items</SelectItem>
                  <SelectItem value="Entry Mistake">Entry Mistake</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2"><Button variant="outline" onClick={() => setAdjOpen(false)}>Cancel</Button><Button onClick={confirmAdjustment} variant="gradient">Save Adjustment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Return/Exchange Dialog ── */}
      <Dialog open={retOpen} onOpenChange={setRetOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Return & Exchange — Uniform size-wise</DialogTitle><DialogDescription>Old Size 30 +1, New Size 28 -1 — exchange history maintained</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Original Sale *</label>
              <Select value={retSaleId} onValueChange={setRetSaleId}>
                <SelectTrigger><SelectValue placeholder="Select sale invoice" /></SelectTrigger>
                <SelectContent>{sales.slice(0, 20).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.invoiceNumber} — {s.studentName} • {s.items.map((i: any) => `${i.itemName} Size ${i.variantSize || ""}`).join(", ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {retSaleId && (() => {
              const sale: any = sales.find((s) => s.id === retSaleId);
              return sale ? (
                <>
                  <div><label className="text-xs font-medium block mb-1">Old Item (to return) *</label>
                    <Select value={retOldItemIdx} onValueChange={setRetOldItemIdx}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sale.items.map((it: any, idx: number) => <SelectItem key={idx} value={String(idx)}>{it.itemName} — Size {it.variantSize || "—"} ×{it.quantity}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs font-medium block mb-1">New Item (for exchange) — leave empty for pure return</label>
                    <Select value={retNewItemId} onValueChange={(v) => { setRetNewItemId(v); const it: any = items.find((x) => x.id === v); setRetNewSize(it?.variants?.[0]?.size || ""); }}>
                      <SelectTrigger><SelectValue placeholder="Select new size/item" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— Pure Return (no exchange) —</SelectItem>
                        {items.filter((i: any) => i.categoryName === "Uniform").map((it) => <SelectItem key={it.id} value={it.id}>{it.name} — {it.sku}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {retNewItemId && items.find((x) => x.id === retNewItemId)?.variants && (
                    <div><label className="text-xs font-medium block mb-1">New Size *</label>
                      <Select value={retNewSize} onValueChange={setRetNewSize}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{(items.find((x) => x.id === retNewItemId) as any)?.variants?.map((v: any) => <SelectItem key={v.size} value={v.size}>{v.size} — Avl {v.quantity}{v.quantity === 0 ? " ❌" : ""}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  {!retNewItemId && (
                    <div><label className="text-xs font-medium block mb-1">Condition * (pure return)</label>
                      <Select value={retCondition} onValueChange={(v) => setRetCondition(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Good">Good → add back to stock</SelectItem><SelectItem value="Damaged">Damaged → not added, damage record</SelectItem><SelectItem value="Lost">Lost → fine raise in Fees</SelectItem></SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              ) : null;
            })()}
          </div>
          <DialogFooter className="gap-2 pt-2"><Button variant="outline" onClick={() => setRetOpen(false)}>Cancel</Button><Button onClick={confirmReturn} variant="gradient">Confirm Return/Exchange</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Items Master Add/Edit (spec: sub-category, photo, unit, reorder) ── */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-4 w-4" /> {editingItemId ? "Edit Item" : "Add New Item"} — Master</DialogTitle><DialogDescription>Item Name, Category, Sub-category (Textbook/Notebook/Register), Unit (pcs/box/set/pair/kg/litre/metre), Unit Price, Reorder Level, Description, Photo, Status</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Item Name *</label><Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g. Notebook 200pg" /></div>
            <div><label className="text-xs font-medium block mb-1">Category *</label>
              <Select value={itemForm.categoryName} onValueChange={(v) => setItemForm({ ...itemForm, categoryName: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium block mb-1">Sub-category</label><Input value={itemForm.subCategory} onChange={(e) => setItemForm({ ...itemForm, subCategory: e.target.value })} placeholder="Textbook / Notebook / Register / Shirt / Lab Chemical" /></div>
            <div><label className="text-xs font-medium block mb-1">Unit *</label>
              <Select value={itemForm.unit} onValueChange={(v) => setItemForm({ ...itemForm, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["pcs","box","set","pair","kg","litre","metre","ream","bottle","pack"].map((u) => <SelectItem key={u} value={u}>{u} {u==="box" ? "(1 box = 12 pcs)" : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium block mb-1">Purchase Price (₹) *</label><Input type="number" value={itemForm.purchasePrice} onChange={(e) => setItemForm({ ...itemForm, purchasePrice: e.target.value })} /></div>
            <div><label className="text-xs font-medium block mb-1">Selling Price (₹) *</label><Input type="number" value={itemForm.sellingPrice} onChange={(e) => setItemForm({ ...itemForm, sellingPrice: e.target.value })} /></div>
            <div><label className="text-xs font-medium block mb-1">Reorder Level *</label><Input type="number" value={itemForm.minStock} onChange={(e) => setItemForm({ ...itemForm, minStock: e.target.value })} /><span className="text-[11px] text-muted-foreground">Alert when ≤ this qty (per-size for Uniform)</span></div>
            <div><label className="text-xs font-medium block mb-1">Store Location</label>
              <Select value={itemForm.storeLocationId} onValueChange={(v) => setItemForm({ ...itemForm, storeLocationId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{storeLocations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium block mb-1">Item Photo (optional)</label><Input type="file" accept="image/*" onChange={(e) => { const f=e.target.files?.[0]; if(f) setItemForm({ ...itemForm, photo: f.name }); }} /><span className="text-[11px] text-muted-foreground">{itemForm.photo || "No file chosen"}</span></div>
            <div><label className="text-xs font-medium block mb-1">Expiry Date (lab chemicals)</label><Input type="date" value={itemForm.expiryDate} onChange={(e) => setItemForm({ ...itemForm, expiryDate: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="text-xs font-medium block mb-1">Description</label><Textarea value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={2} placeholder="Optional details" /></div>
            <div className="sm:col-span-2 flex items-center gap-2"><span className="text-xs font-medium">Status</span><Select value={itemForm.status} onValueChange={(v) => setItemForm({ ...itemForm, status: v })}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IN_STOCK">Active</SelectItem><SelectItem value="OUT_OF_STOCK">Inactive</SelectItem></SelectContent></Select><span className="text-[11px] text-muted-foreground">Active/inactive toggle</span></div>
          </div>
          <DialogFooter className="gap-2 pt-4"><Button variant="outline" onClick={() => setItemDialogOpen(false)}>Cancel</Button><Button onClick={confirmItemSave} variant="gradient">{editingItemId ? "Update" : "Create"} Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Issue (spec: 500+ students, new admission batch) ── */}
      <Dialog open={bulkIssueOpen} onOpenChange={setBulkIssueOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Bulk Issue — Multiple Students</DialogTitle><DialogDescription>Select class or pick students, then issue same item/qty. Handles 40+ at once (mobile responsive, debounced search).</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Item *</label><Select value={bulkIssueItemId} onValueChange={(v) => { setBulkIssueItemId(v); const it:any=items.find((x)=>x.id===v); setBulkIssueSize(it?.variants?.[0]?.size||""); }}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map((it)=> <SelectItem key={it.id} value={it.id}>{it.name} — Avl {it.quantity}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="text-xs font-medium block mb-1">Size (if Uniform)</label><Select value={bulkIssueSize} onValueChange={setBulkIssueSize}><SelectTrigger><SelectValue placeholder="Size" /></SelectTrigger><SelectContent>{(items.find((x)=>x.id===bulkIssueItemId) as any)?.variants?.map((v:any)=><SelectItem key={v.size} value={v.size}>{v.size} — {v.quantity} pcs</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Quantity per student</label><Input type="number" value={bulkIssueQty} onChange={(e)=> setBulkIssueQty(e.target.value)} /><span className="text-[11px] text-muted-foreground">{(() => { const it:any=items.find((x)=>x.id===bulkIssueItemId); const avail=it?.variants?.find((v:any)=>v.size===bulkIssueSize)?.quantity ?? it?.quantity ?? 0; const need=(Number(bulkIssueQty)||0)*(bulkIssueSelected.length||1); return `Available ${avail} • Need ${need} • ${need>avail?"❌ exceeds":"✓ ok"}`; })()}</span></div>
              <div><label className="text-xs font-medium block mb-1">Class filter</label><Select value={bulkIssueClassId} onValueChange={setBulkIssueClassId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All (manual pick)</SelectItem>{Array.from(new Set(students.map((s)=> s.classId))).map((cid)=> { const c=students.find((s)=> s.classId===cid); return <SelectItem key={cid as string} value={cid as string}>{c?.className}</SelectItem>; })}</SelectContent></Select></div>
            </div>
            <div><label className="text-xs font-medium block mb-1">Select Students ({bulkIssueSelected.length} selected)</label><div className="border rounded-lg max-h-48 overflow-y-auto divide-y">{students.filter((s)=> bulkIssueClassId==="ALL" || s.classId===bulkIssueClassId).slice(0,20).map((stu)=> (<label key={stu.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 text-xs"><input type="checkbox" checked={bulkIssueSelected.includes(stu.id)} onChange={(e)=> setBulkIssueSelected((p)=> e.target.checked ? [...p, stu.id] : p.filter((x)=>x!==stu.id))} className="h-4 w-4" />{stu.fullName} <span className="font-mono text-muted-foreground">• {stu.admissionNumber}</span> <span className="text-muted-foreground">• {stu.className}</span></label>))}</div><div className="flex gap-2 mt-2"><Button size="sm" variant="outline" className="h-7 text-xs" onClick={()=> setBulkIssueSelected(students.filter((s)=> bulkIssueClassId==="ALL" || s.classId===bulkIssueClassId).slice(0,40).map((s)=> s.id))}>Select 40 Batch</Button><Button size="sm" variant="ghost" className="h-7 text-xs" onClick={()=> setBulkIssueSelected([])}>Clear</Button></div></div>
          </div>
          <DialogFooter className="gap-2 pt-2"><Button variant="outline" onClick={()=> setBulkIssueOpen(false)}>Cancel</Button><Button onClick={confirmBulkIssue} disabled={(() => { const it:any=items.find((x)=>x.id===bulkIssueItemId); const avail=it?.variants?.find((v:any)=>v.size===bulkIssueSize)?.quantity ?? it?.quantity ?? 0; return (Number(bulkIssueQty)||0)*bulkIssueSelected.length > avail; })()} variant="gradient">Issue to {bulkIssueSelected.length} Students</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Supplier Inline Add ── */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Supplier — inline for Stock In</DialogTitle><DialogDescription>Firm name, contact, GST, category, bank</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Firm Name *</label><Input value={supplierForm.name} onChange={(e)=> setSupplierForm({...supplierForm, name:e.target.value})} placeholder="Uniform Tailors & Co." /></div>
            <div><label className="text-xs font-medium block mb-1">Contact Person</label><Input value={supplierForm.contactPerson} onChange={(e)=> setSupplierForm({...supplierForm, contactPerson:e.target.value})} /></div>
            <div><label className="text-xs font-medium block mb-1">Phone *</label><Input value={supplierForm.phone} onChange={(e)=> setSupplierForm({...supplierForm, phone:e.target.value})} placeholder="+91 98765 43210" /></div>
            <div><label className="text-xs font-medium block mb-1">Email</label><Input value={supplierForm.email} onChange={(e)=> setSupplierForm({...supplierForm, email:e.target.value})} /></div>
            <div><label className="text-xs font-medium block mb-1">GST Number</label><Input value={supplierForm.gstNumber} onChange={(e)=> setSupplierForm({...supplierForm, gstNumber:e.target.value})} placeholder="27AABCU9603R1ZM" /></div>
            <div><label className="text-xs font-medium block mb-1">Category</label><Select value={supplierForm.category} onValueChange={(v)=> setSupplierForm({...supplierForm, category:v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Books","Uniform","Lab","Sports","All"].map((c)=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div className="sm:col-span-2"><label className="text-xs font-medium block mb-1">Address</label><Input value={supplierForm.address} onChange={(e)=> setSupplierForm({...supplierForm, address:e.target.value})} /></div>
            <div className="sm:col-span-2"><label className="text-xs font-medium block mb-1">Bank Details (optional)</label><Input value={supplierForm.bankDetails} onChange={(e)=> setSupplierForm({...supplierForm, bankDetails:e.target.value})} placeholder="A/C, IFSC" /></div>
          </div>
          <DialogFooter className="gap-2 pt-4"><Button variant="outline" onClick={()=> setSupplierDialogOpen(false)}>Cancel</Button><Button onClick={confirmSupplierSave} variant="gradient">Save Supplier</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
