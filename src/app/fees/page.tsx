"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CreditCard, Receipt, AlertTriangle, Wallet, Search, ExternalLink, Send, CheckCircle2, Clock, FileText } from "lucide-react";

export default function FeesPage() {
  const { activeBranchId } = useERP();
  const [structures] = useState(() => mockDb.getFeeStructures(activeBranchId));
  const [assignments, setAssignments] = useState(() => mockDb.getFeeAssignments(activeBranchId));
  const [invoices, setInvoices] = useState(() => mockDb.getInvoices(activeBranchId));
  const [payments] = useState(() => mockDb.getPayments(activeBranchId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const refresh = () => {
    setAssignments([...mockDb.getFeeAssignments(activeBranchId)]);
    setInvoices([...mockDb.getInvoices(activeBranchId)]);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = inv.studentName.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalAssigned = assignments.reduce((s, a) => s + a.totalAssigned, 0);
  const totalPaid = assignments.reduce((s, a) => s + a.totalPaid, 0);
  const totalPending = assignments.reduce((s, a) => s + a.totalPending, 0);
  const totalOverdue = assignments.reduce((s, a) => s + a.totalOverdue, 0);
  const duesCount = assignments.filter((a) => a.status === "PENDING" || a.status === "OVERDUE").length;

  const handlePay = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const amount = inv.balanceAmount;
    if (amount <= 0) { toast.success("Already paid"); return; }
    mockDb.recordPayment(invoiceId, amount, "ONLINE");
    toast.success(`Online payment successful — ${formatCurrency(amount)} for ${inv.invoiceNumber}`, { description: "Receipt generated and sent to parent." });
    refresh();
  };

  const handleReminder = (studentName: string) => {
    toast.info(`Reminder sent to ${studentName}`, { description: "SMS + Email dues reminder dispatched." });
  };

  const handleReceipt = (invNum: string) => {
    toast.success(`Receipt ${invNum} downloaded`, { description: "PDF receipt ready." });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fee Management</h1>
            <Badge variant="outline">{invoices.length} Invoices</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Fee structure, collection, receipts, dues/reminders & online payment.</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => toast.info("Create Fee Structure — demo placeholder", { description: "Structure builder coming soon." })}><FileText className="h-4 w-4" /> New Structure</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/70"><CardContent className="p-4"><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Assigned</span><span className="text-xl font-bold mt-1 block">{formatCurrency(totalAssigned)}</span><span className="text-[11px] text-muted-foreground">{assignments.length} students</span></CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-4"><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Collected</span><span className="text-xl font-bold text-emerald-600 mt-1 block">{formatCurrency(totalPaid)}</span><span className="text-[11px] text-emerald-600">{Math.round((totalPaid / Math.max(1, totalAssigned)) * 100)}% efficiency</span></CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-4"><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Pending Dues</span><span className="text-xl font-bold text-amber-600 mt-1 block">{formatCurrency(totalPending)}</span><span className="text-[11px] text-amber-600">{duesCount} dues</span></CardContent></Card>
        <Card className="border-border/70"><CardContent className="p-4"><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Overdue</span><span className="text-xl font-bold text-rose-600 mt-1 block">{formatCurrency(totalOverdue)}</span><span className="text-[11px] text-rose-600">Needs reminder</span></CardContent></Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-1.5"><Receipt className="h-3.5 w-3.5" /> Invoices & Receipts</TabsTrigger>
          <TabsTrigger value="structures" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Fee Structures</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-1.5"><Wallet className="h-3.5 w-3.5" /> Assignments & Dues</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm flex items-center gap-2">
              <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice, student..." className="pl-9 h-9 text-xs" /></div>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="PARTIAL">Partial</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="OVERDUE">Overdue</SelectItem></SelectContent></Select>
            </div>
            <Badge variant="outline" className="text-xs">{filteredInvoices.length} records</Badge>
          </div>
          <Table>
              <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Student</TableHead><TableHead>Period</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}<span className="block text-[10px] text-muted-foreground font-normal">{inv.branchName}</span></TableCell>
                    <TableCell><span className="font-semibold text-sm">{inv.studentName}</span><span className="block text-[11px] text-muted-foreground">{inv.studentRoll} • {inv.className}</span></TableCell>
                    <TableCell className="text-xs">{inv.period}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell className="text-xs text-emerald-600 font-medium">{formatCurrency(inv.paidAmount)}</TableCell>
                    <TableCell className="text-xs font-bold text-rose-600">{formatCurrency(inv.balanceAmount)}</TableCell>
                    <TableCell><Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "destructive" : inv.status === "PARTIAL" ? "warning" : "outline"} className="text-[10px]">{inv.status}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleReceipt(inv.invoiceNumber)}><Receipt className="h-3 w-3" /> Receipt</Button>
                      {inv.balanceAmount > 0 && <Button variant="gradient" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handlePay(inv.id)}><CreditCard className="h-3 w-3" /> Pay Online</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structures.map((fs) => (
              <Card key={fs.id} className="border-border/80">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center justify-between">{fs.name}<Badge variant={fs.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{fs.status}</Badge></CardTitle><p className="text-[11px] text-muted-foreground">{fs.branchName} • {fs.academicYear} • {fs.applicableClasses.join(", ")}</p></CardHeader>
                <CardContent className="space-y-2">
                  {fs.items.map((it) => (
                    <div key={it.feeHeadId} className="flex justify-between text-xs p-2 rounded-lg bg-muted/40 border border-border/60"><span>{it.feeHeadName} <span className="text-muted-foreground">({it.frequency})</span></span><span className="font-semibold">{formatCurrency(it.amount)}</span></div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-bold text-sm"><span>Total</span><span className="text-primary">{formatCurrency(fs.totalAmount)}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Structure</TableHead><TableHead>Assigned</TableHead><TableHead>Paid</TableHead><TableHead>Pending</TableHead><TableHead>Overdue</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Reminder</TableHead></TableRow></TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell><span className="font-semibold text-sm">{a.studentName}</span><span className="block text-[11px] text-muted-foreground">{a.studentRoll} • {a.className}</span></TableCell>
                    <TableCell className="text-xs">{a.structureName}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatCurrency(a.totalAssigned)}</TableCell>
                    <TableCell className="text-xs text-emerald-600">{formatCurrency(a.totalPaid)}</TableCell>
                    <TableCell className="text-xs text-amber-600">{formatCurrency(a.totalPending)}</TableCell>
                    <TableCell className="text-xs text-rose-600">{formatCurrency(a.totalOverdue)}</TableCell>
                    <TableCell><Badge variant={a.status === "PAID" ? "success" : a.status === "OVERDUE" ? "destructive" : "warning"} className="text-[10px]">{a.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => handleReminder(a.studentName)} disabled={a.status === "PAID"}><Send className="h-3 w-3" /> Send</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          {duesCount > 0 && <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs"><AlertTriangle className="h-4 w-4" /> {duesCount} students have pending/overdue dues — reminders can be sent via SMS/Email.</div>}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Table>
              <TableHeader><TableRow><TableHead>Receipt</TableHead><TableHead>Student</TableHead><TableHead>Invoice</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-bold">{p.receiptNumber}</TableCell>
                    <TableCell className="text-xs font-medium">{p.studentName}</TableCell>
                    <TableCell className="font-mono text-xs">{p.invoiceNumber}</TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.method}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(p.date)}</TableCell>
                    <TableCell><Badge variant="success" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" /> Success</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          <Card className="border-border/70 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"><CardContent className="p-4 flex items-center justify-between"><div><h4 className="text-sm font-bold">Online Payment Gateway</h4><p className="text-xs text-muted-foreground">UPI / Card / NetBanking / Wallet — Razorpay & PayU integrated (demo).</p></div><Button variant="gradient" className="gap-2" onClick={() => toast.success("Payment gateway test — simulated success", { description: "All methods operational in demo." })}><CreditCard className="h-4 w-4" /> Test Gateway</Button></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
