"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import { ListPagination } from "@/components/ui/list-pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CreditCard, Receipt, AlertTriangle, Search, Send, CheckCircle2, Bus, School, User, Hash, GraduationCap } from "lucide-react";

export function FeesDirectoryView() {
  const { activeBranchId } = useERP();
  const [structures] = useState(() => mockDb.getFeeStructures(activeBranchId));
  const [assignments, setAssignments] = useState(() => mockDb.getFeeAssignments(activeBranchId));
  const [invoices, setInvoices] = useState(() => mockDb.getInvoices(activeBranchId));
  const [payments, setPayments] = useState(() => mockDb.getPayments(activeBranchId));
  const [students] = useState(() => mockDb.getStudents(activeBranchId));
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const debouncedSearch = useDebouncedValue(search, 300);

  // Student lookup state (fees module special)
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupClass, setLookupClass] = useState<string>("ALL");
  const debouncedLookup = useDebouncedValue(lookupQuery, 300);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payStudent, setPayStudent] = useState<{ id: string; name: string; roll: string } | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"ONLINE" | "CASH" | "UPI" | "BANK_TRANSFER" | "CARD">("ONLINE");
  const [payCategory, setPayCategory] = useState<"SCHOOL" | "BUS" | "BOTH">("BOTH");

  const refresh = useCallback(() => {
    setAssignments([...mockDb.getFeeAssignments(activeBranchId)]);
    setInvoices([...mockDb.getInvoices(activeBranchId)]);
    setPayments([...mockDb.getPayments(activeBranchId)]);
  }, [activeBranchId]);

  const filteredInvoices = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchSearch = q === "" || inv.studentName.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q) || inv.studentRoll.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, debouncedSearch, statusFilter]);

  const { page: invoicePage, totalPages: invoiceTotalPages, totalItems: invoiceTotalItems, pageItems: invoicePageItems, setPage: setInvoicePage } = usePagination(filteredInvoices, 10);

  const defaulters = useMemo(() => assignments.filter((a) => a.status === "PENDING" || a.status === "OVERDUE"), [assignments]);

  // Lookup filtered students
  const lookupStudents = useMemo(() => {
    const q = debouncedLookup.trim().toLowerCase();
    if (!q && lookupClass === "ALL") return [];
    return students.filter((s) => {
      const matchQuery =
        q === "" ||
        s.fullName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q);
      const matchClass = lookupClass === "ALL" || s.classId === lookupClass || s.className === lookupClass;
      return matchQuery && matchClass;
    }).slice(0, 8);
  }, [students, debouncedLookup, lookupClass]);

  const getStudentFeeSummary = (studentId: string) => {
    const invs = invoices.filter((i) => i.studentId === studentId);
    const assigns = assignments.find((a) => a.studentId === studentId);
    let schoolPending = 0, busPending = 0, schoolPaid = 0, busPaid = 0, totalPending = 0, totalPaid = 0;
    for (const inv of invs) {
      for (const item of inv.items || []) {
        const isBus = item.feeHeadName.toLowerCase().includes("transport");
        const paidPortion = inv.paidAmount > 0 ? (item.amount / inv.totalAmount) * inv.paidAmount : 0;
        const pendingPortion = Math.max(0, item.amount - paidPortion);
        if (isBus) { busPaid += paidPortion; busPending += pendingPortion; } else { schoolPaid += paidPortion; schoolPending += pendingPortion; }
      }
      totalPending += inv.balanceAmount;
      totalPaid += inv.paidAmount;
    }
    // fallback to assignment if no invoices
    if (invs.length === 0 && assigns) {
      totalPending = assigns.totalPending;
      totalPaid = assigns.totalPaid;
      // approximate split: 85% school, 15% bus if transport exists
      schoolPending = Math.round(totalPending * 0.85);
      busPending = totalPending - schoolPending;
    }
    return { invs, assigns, schoolPending, busPending, schoolPaid, busPaid, totalPending, totalPaid, totalAssigned: (assigns?.totalAssigned ?? totalPaid + totalPending) };
  };

  const handlePay = useCallback((invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const amount = inv.balanceAmount;
    if (amount <= 0) { toast.success("Already paid"); return; }
    mockDb.recordPayment(invoiceId, amount, "ONLINE");
    toast.success(`Online payment successful — ${formatCurrency(amount)} for ${inv.invoiceNumber}`, { description: "Receipt generated and sent to parent." });
    refresh();
  }, [invoices, refresh]);

  const handlePayForStudent = () => {
    if (!payStudent) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    const invs = invoices.filter((i) => i.studentId === payStudent.id && i.balanceAmount > 0);
    if (invs.length === 0) { toast.error("No pending invoices for this student"); return; }
    // Pay first invoice partially/full (simplified)
    let remaining = amt;
    for (const inv of invs) {
      if (remaining <= 0) break;
      const payAmt = Math.min(remaining, inv.balanceAmount);
      mockDb.recordPayment(inv.id, payAmt, payMethod as any);
      remaining -= payAmt;
    }
    if (remaining > 0) {
      // create ad-hoc payment for remaining (school/bus split shown only)
      toast.success(`${formatCurrency(amt - remaining)} paid, ${formatCurrency(remaining)} excess — adjusted`, { description: `${payCategory === "BUS" ? "Bus" : payCategory === "SCHOOL" ? "School" : "Combined"} fee payment recorded` });
    } else {
      toast.success(`${formatCurrency(amt)} paid for ${payStudent.name}`, { description: `${payCategory === "BUS" ? "Bus Fee" : payCategory === "SCHOOL" ? "School Fee" : "School + Bus Fee"} — ${payMethod}` });
    }
    setPayDialogOpen(false);
    setPayAmount("");
    refresh();
  };

  const handleReminder = useCallback((studentName: string) => {
    toast.info(`Reminder sent to ${studentName}`, { description: "SMS + Email dues reminder dispatched." });
  }, []);

  const openPayDialog = (studentId: string, studentName: string, studentRoll: string, category: "SCHOOL" | "BUS" | "BOTH" = "BOTH") => {
    setPayStudent({ id: studentId, name: studentName, roll: studentRoll });
    const summary = getStudentFeeSummary(studentId);
    const suggested = category === "SCHOOL" ? summary.schoolPending : category === "BUS" ? summary.busPending : summary.totalPending;
    setPayAmount(String(suggested > 0 ? suggested : ""));
    setPayCategory(category);
    setPayDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="lookup" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="lookup" className="gap-1.5 text-xs"><Search className="h-3.5 w-3.5" /> Student Fee Lookup</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5 text-xs"><Receipt className="h-3.5 w-3.5" /> Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="dues" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Dues ({defaulters.length})</TabsTrigger>
          <TabsTrigger value="structures" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" /> Fee Heads ({structures.length})</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Ledger ({payments.length})</TabsTrigger>
        </TabsList>

        {/* Lookup Tab — college reference */}
        <TabsContent value="lookup" className="space-y-4">
          <Card className="p-4 border-border/80">
            <h3 className="font-bold text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /> Fee Lookup — Name / Roll No / Class / Student ID</h3>
            <p className="text-xs text-muted-foreground mt-1">College reference: Enter any identifier — name, roll number, class or student ID — to view pending vs paid, school fee vs bus fee split, and pay instantly.</p>
            <div className="flex flex-col md:flex-row gap-3 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)} placeholder="Search by name, roll no, class, student ID..." className="pl-9 h-9 text-xs" />
              </div>
              <Select value={lookupClass} onValueChange={setLookupClass}>
                <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {lookupQuery.trim() === "" && lookupClass === "ALL" ? (
            <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">Type name / roll / class / student ID above to view fee status. Example: <strong>STU-1042</strong>, <strong>Aarav</strong>, <strong>Grade 10</strong></div>
          ) : lookupStudents.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No student found for “{lookupQuery}”. Try roll no or admission number.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lookupStudents.map((stu) => {
                const summary = getStudentFeeSummary(stu.id);
                return (
                  <Card key={stu.id} className="border-border/80 hover:border-primary/30 transition-colors">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex gap-3">
                          <img src={stu.avatar} alt={stu.fullName} className="h-12 w-12 rounded-xl object-cover" />
                          <div>
                            <div className="font-bold text-sm flex items-center gap-2">{stu.fullName} <Badge variant="outline" className="text-[10px] font-mono">{stu.rollNumber}</Badge></div>
                            <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                              <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {stu.admissionNumber}</span>
                              <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {stu.className} — {stu.sectionName}</span>
                              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {stu.branchName}</span>
                            </div>
                            {summary.assigns && (
                              <div className="flex gap-2 mt-2">
                                <Badge variant={summary.assigns.status === "PAID" ? "success" : summary.assigns.status === "OVERDUE" ? "destructive" : "warning"} className="text-[10px]">{summary.assigns.status}</Badge>
                                <span className="text-[11px] text-muted-foreground">Due {summary.assigns.dueDate ? formatDate(summary.assigns.dueDate) : "—"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 self-start">
                          <Button size="sm" className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openPayDialog(stu.id, stu.fullName, stu.rollNumber, "SCHOOL")}><School className="h-3.5 w-3.5" /> Pay School Fee</Button>
                          <Button size="sm" className="h-8 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => openPayDialog(stu.id, stu.fullName, stu.rollNumber, "BUS")}><Bus className="h-3.5 w-3.5" /> Pay Bus Fee</Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-muted/40 border text-center">
                          <div className="text-muted-foreground text-[11px]">Total Assigned</div>
                          <div className="font-bold text-sm">{formatCurrency(summary.totalAssigned)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                          <div className="text-muted-foreground text-[11px]">Total Paid</div>
                          <div className="font-bold text-sm text-emerald-600">{formatCurrency(summary.totalPaid)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                          <div className="text-muted-foreground text-[11px]">Pending (Current)</div>
                          <div className="font-bold text-sm text-amber-600">{formatCurrency(summary.totalPending)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                          <div className="text-muted-foreground text-[11px]">Overdue</div>
                          <div className="font-bold text-sm text-rose-600">{formatCurrency(summary.assigns?.totalOverdue ?? 0)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold flex items-center gap-1"><School className="h-3.5 w-3.5" /> School Fee (Tuition, Lab, Library, Exam...)</span>
                            <Badge variant="outline" className="text-[10px]">Pending {formatCurrency(summary.schoolPending)}</Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">Paid: {formatCurrency(summary.schoolPaid)} • Pending: {formatCurrency(summary.schoolPending)}</div>
                          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px] w-full" onClick={() => openPayDialog(stu.id, stu.fullName, stu.rollNumber, "SCHOOL")} disabled={summary.schoolPending <= 0}>{summary.schoolPending > 0 ? `Pay ${formatCurrency(summary.schoolPending)} School Fee` : "School Fee Clear"}</Button>
                        </div>
                        <div className="p-3 rounded-xl border bg-amber-500/5 border-amber-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold flex items-center gap-1"><Bus className="h-3.5 w-3.5" /> Bus / Transport Fee</span>
                            <Badge variant="outline" className="text-[10px]">Pending {formatCurrency(summary.busPending)}</Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">Paid: {formatCurrency(summary.busPaid)} • Pending: {formatCurrency(summary.busPending)}</div>
                          <Button size="sm" variant="outline" className="mt-2 h-7 text-[11px] w-full" onClick={() => openPayDialog(stu.id, stu.fullName, stu.rollNumber, "BUS")} disabled={summary.busPending <= 0}>{summary.busPending > 0 ? `Pay ${formatCurrency(summary.busPending)} Bus Fee` : "No Bus Fee / Clear"}</Button>
                        </div>
                      </div>

                      {summary.invs.length > 0 && (
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px]">Invoice</TableHead>
                                <TableHead className="text-[11px]">Period</TableHead>
                                <TableHead className="text-right text-[11px]">Amount</TableHead>
                                <TableHead className="text-right text-[11px]">Balance</TableHead>
                                <TableHead className="text-[11px]">Due</TableHead>
                                <TableHead className="text-[11px]">Status</TableHead>
                                <TableHead className="text-right text-[11px]">Pay</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {summary.invs.slice(0, 3).map((inv) => (
                                <TableRow key={inv.id}>
                                  <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                                  <TableCell className="text-xs">{inv.period}</TableCell>
                                  <TableCell className="text-right text-xs">{formatCurrency(inv.totalAmount)}</TableCell>
                                  <TableCell className="text-right text-xs font-bold text-rose-600">{inv.balanceAmount > 0 ? formatCurrency(inv.balanceAmount) : "—"}</TableCell>
                                  <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                                  <TableCell><Badge variant={inv.status === "PAID" ? "success" : inv.status === "PARTIAL" ? "warning" : "destructive"} className="text-[10px]">{inv.status}</Badge></TableCell>
                                  <TableCell className="text-right">{inv.balanceAmount > 0 ? <Button size="sm" className="h-6 text-[11px] gap-1" onClick={() => handlePay(inv.id)}><CreditCard className="h-3 w-3" /> Pay</Button> : <Badge variant="success" className="text-[10px]">Paid</Badge>}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm flex items-center gap-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice #, student name..." className="pl-9 h-9 text-xs flex-1" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
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
                  <TableHead className="text-right tabular-nums">Total Bill</TableHead>
                  <TableHead className="text-right tabular-nums">Paid</TableHead>
                  <TableHead className="text-right tabular-nums">Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicePageItems.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell><span className="font-semibold text-sm block">{inv.studentName}</span><span className="text-[11px] text-muted-foreground block font-mono">{inv.studentRoll}</span></TableCell>
                    <TableCell className="text-xs">{inv.className}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-bold text-rose-600">{inv.balanceAmount > 0 ? formatCurrency(inv.balanceAmount) : "—"}</TableCell>
                    <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell><Badge variant={inv.status === "PAID" ? "success" : inv.status === "PARTIAL" ? "warning" : inv.status === "OVERDUE" ? "destructive" : "secondary"} className="text-[10px]">{inv.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== "PAID" && <Button size="sm" className="h-7 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handlePay(inv.id)}><CreditCard className="h-3 w-3" /> Pay Online</Button>}
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => handleReminder(inv.studentName)}><Send className="h-3 w-3" /> Remind</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredInvoices.length > 0 && <ListPagination page={invoicePage} totalPages={invoiceTotalPages} totalItems={invoiceTotalItems} pageSize={10} onPageChange={setInvoicePage} label="invoices" />}
        </TabsContent>

        <TabsContent value="dues" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right tabular-nums">Assigned</TableHead>
                  <TableHead className="text-right tabular-nums">Paid</TableHead>
                  <TableHead className="text-right tabular-nums">Pending</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell><span className="font-semibold text-sm">{a.studentName}</span><span className="block text-[11px] text-muted-foreground font-mono">{a.studentRoll}</span></TableCell>
                    <TableCell className="text-xs">{a.className}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-semibold">{formatCurrency(a.totalAssigned)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-emerald-600">{formatCurrency(a.totalPaid)}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-bold text-amber-600">{formatCurrency(a.totalPending)}</TableCell>
                    <TableCell><Badge variant={a.status === "OVERDUE" ? "destructive" : "warning"} className="text-[10px]">{a.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => openPayDialog(a.studentId, a.studentName, a.studentRoll)}><CreditCard className="h-3 w-3" /> Pay Now</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.map((s) => (
              <Card key={s.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div><h3 className="font-bold text-sm">{s.name}</h3><p className="text-xs text-muted-foreground">{s.academicYear} • {s.branchName}</p></div>
                    <Badge variant="outline" className="text-[10px]">{s.applicableClasses?.join(", ")}</Badge>
                  </div>
                  <div className="space-y-1 pt-2 border-t text-xs">
                    {(s.items ?? []).map((h, idx) => (
                      <div key={h.feeHeadId || idx} className="flex justify-between text-muted-foreground"><span>{h.feeHeadName} ({h.frequency})</span><span className="font-mono font-medium text-foreground">{formatCurrency(h.amount)}</span></div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t text-xs"><span className="font-semibold text-foreground">Annual Total:</span><span className="font-bold text-sm text-primary">{formatCurrency(s.totalAmount)}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right tabular-nums">Amount</TableHead>
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
                    <TableCell className="text-right tabular-nums text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.method}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(p.date)}</TableCell>
                    <TableCell><Badge variant="success" className="text-[10px]">SUCCESS</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Fee — {payStudent?.name}</DialogTitle>
            <DialogDescription>Roll {payStudent?.roll} • Choose School Fee / Bus Fee or both — college ERP pattern</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-3 gap-2">
              <Button variant={payCategory === "SCHOOL" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1" onClick={() => setPayCategory("SCHOOL")}><School className="h-3.5 w-3.5" /> School</Button>
              <Button variant={payCategory === "BUS" ? "default" : "outline"} size="sm" className="h-8 text-xs gap-1" onClick={() => setPayCategory("BUS")}><Bus className="h-3.5 w-3.5" /> Bus</Button>
              <Button variant={payCategory === "BOTH" ? "default" : "outline"} size="sm" className="h-8 text-xs" onClick={() => setPayCategory("BOTH")}>Both</Button>
            </div>
            {payStudent && (() => { const s = getStudentFeeSummary(payStudent.id); return (
              <div className="p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                <div className="flex justify-between"><span>School Pending:</span><strong className="text-blue-600">{formatCurrency(s.schoolPending)}</strong></div>
                <div className="flex justify-between"><span>Bus Pending:</span><strong className="text-amber-600">{formatCurrency(s.busPending)}</strong></div>
                <div className="flex justify-between border-t pt-1"><span>Total Pending:</span><strong>{formatCurrency(s.totalPending)}</strong></div>
              </div>
            )})()}
            <div>
              <label className="text-xs font-medium block mb-1">Amount (₹)</label>
              <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Enter amount" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Payment Method</label>
              <Select value={payMethod} onValueChange={(v) => setPayMethod(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePayForStudent} variant="gradient" className="gap-1"><CreditCard className="h-3.5 w-3.5" /> Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
