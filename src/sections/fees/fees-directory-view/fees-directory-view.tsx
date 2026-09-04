"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CreditCard, Receipt, AlertTriangle, Search, ExternalLink, Send, CheckCircle2 } from "lucide-react";

export function FeesDirectoryView() {
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
      const matchSearch =
        inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const handlePay = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const amount = inv.balanceAmount;
    if (amount <= 0) {
      toast.success("Already paid");
      return;
    }
    mockDb.recordPayment(invoiceId, amount, "ONLINE");
    toast.success(`Online payment successful — ${formatCurrency(amount)} for ${inv.invoiceNumber}`, {
      description: "Receipt generated and sent to parent.",
    });
    refresh();
  };

  const handleReminder = (studentName: string) => {
    toast.info(`Reminder sent to ${studentName}`, {
      description: "SMS + Email dues reminder dispatched.",
    });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-1.5 text-xs">
            <Receipt className="h-3.5 w-3.5" /> Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="dues" className="gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" /> Dues Defaulters (
            {assignments.filter((a) => a.status === "PENDING" || a.status === "OVERDUE").length})
          </TabsTrigger>
          <TabsTrigger value="structures" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" /> Fee Heads ({structures.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" /> Payment Ledger ({payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm flex items-center gap-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice #, student name..."
                className="pl-9 h-9 text-xs flex-1"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Bill</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-sm block">{inv.studentName}</span>
                      <span className="text-[11px] text-muted-foreground block font-mono">
                        {inv.studentRoll}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{inv.className}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">
                      {formatCurrency(inv.paidAmount)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-rose-600">
                      {inv.balanceAmount > 0 ? formatCurrency(inv.balanceAmount) : "—"}
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "PARTIAL"
                            ? "warning"
                            : inv.status === "OVERDUE"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== "PAID" && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handlePay(inv.id)}
                          >
                            <CreditCard className="h-3 w-3" /> Pay Online
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => handleReminder(inv.studentName)}
                        >
                          <Send className="h-3 w-3" /> Remind
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Dues Defaulters */}
        <TabsContent value="dues" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments
                  .filter((a) => a.status === "PENDING" || a.status === "OVERDUE")
                  .map((a) => (
                    <TableRow key={a.id} className="hover:bg-muted/40">
                      <TableCell>
                        <span className="font-semibold text-sm">{a.studentName}</span>
                        <span className="block text-[11px] text-muted-foreground font-mono">
                          {a.studentRoll}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{a.className}</TableCell>
                      <TableCell className="text-xs font-semibold">{formatCurrency(a.totalAssigned)}</TableCell>
                      <TableCell className="text-xs text-emerald-600">{formatCurrency(a.totalPaid)}</TableCell>
                      <TableCell className="text-xs font-bold text-amber-600">
                        {formatCurrency(a.totalPending)}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-rose-600">
                        {formatCurrency(a.totalOverdue)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={a.status === "OVERDUE" ? "destructive" : "warning"}
                          className="text-[10px]"
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => handleReminder(a.studentName)}
                        >
                          <Send className="h-3 w-3" /> Send Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: Fee Structures */}
        <TabsContent value="structures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.map((s) => (
              <Card key={s.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.academicYear} • {s.branchName}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{s.applicableClasses?.join(", ")}</Badge>
                  </div>
                  <div className="space-y-1 pt-2 border-t text-xs">
                    {(s.items ?? []).map((h, idx) => (
                      <div key={h.feeHeadId || idx} className="flex justify-between text-muted-foreground">
                        <span>{h.feeHeadName} ({h.frequency})</span>
                        <span className="font-mono font-medium text-foreground">{formatCurrency(h.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t text-xs">
                    <span className="font-semibold text-foreground">Annual Total:</span>
                    <span className="font-bold text-sm text-primary">{formatCurrency(s.totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 4: Payments */}
        <TabsContent value="payments" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{p.receiptNumber}</TableCell>
                    <TableCell className="text-sm font-semibold">{p.studentName}</TableCell>
                    <TableCell className="text-sm font-bold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{p.method}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(p.date)}</TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-[10px]">SUCCESS</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
