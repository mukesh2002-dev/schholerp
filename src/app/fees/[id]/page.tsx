"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AppImage } from "@/components/ui/app-image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateDueAmount, isOverdue, daysOverdue } from "@/lib/fees/fee-utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet,
  GraduationCap,
  Printer,
  Download,
  Calendar,
  Bus,
  MapPin,
} from "lucide-react";
import type { PaymentRecord } from "@/types";

export default function FeeStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { activeBranchId } = useERP();

  const [student] = useState(() => mockDb.getStudentById(studentId));
  const [assignment, setAssignment] = useState(() => mockDb.getFeeAssignmentByStudentId(studentId));
  const [invoices, setInvoices] = useState(() => mockDb.getInvoices().filter((i) => i.studentId === studentId));
  const [payments, setPayments] = useState(() => mockDb.getPayments().filter((p) => p.studentId === studentId));
  const feeHeads = mockDb.getFeeHeads();
  const transportAssignment = mockDb.getStudentTransportAssignmentByStudentId(studentId);

  const [payOpen, setPayOpen] = useState(false);
  const [payHeadIds, setPayHeadIds] = useState<string[]>(() => assignment?.feeHeads?.filter((h) => h.dueAmount > 0).map((h) => h.feeHeadId) ?? ["fh-01"]);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentRecord["method"]>("UPI");
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const due = assignment ? calculateDueAmount(assignment.totalAssigned, assignment.discount ?? 0, assignment.totalPaid) + (assignment.lateFee ?? 0) : 0;
  const overdue = assignment ? isOverdue(assignment.dueDate) && due > 0 : false;
  const daysOver = assignment ? daysOverdue(assignment.dueDate) : 0;

  const refresh = () => {
    setAssignment(mockDb.getFeeAssignmentByStudentId(studentId) ?? undefined);
    setInvoices(mockDb.getInvoices().filter((i) => i.studentId === studentId));
    setPayments(mockDb.getPayments().filter((p) => p.studentId === studentId));
  };

  const handlePay = () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    if (assignment && amt > due) { toast.error(`Amount exceeds due ${formatCurrency(due)}`); return; }
    const pendingInv = invoices.find((i) => i.balanceAmount > 0);
    let rec: PaymentRecord | null = null;
    if (pendingInv) rec = mockDb.recordPayment(pendingInv.id, Math.min(amt, pendingInv.balanceAmount), payMethod, payHeadIds);
    else rec = mockDb.recordDirectPayment(studentId, amt, payMethod, payHeadIds);
    if (rec) {
      setLastReceipt(rec);
      setReceiptOpen(true);
      toast.success(`Payment recorded — ${formatCurrency(amt)}`, { description: `Receipt ${rec.receiptNumber}` });
      setPayOpen(false);
      setPayAmount("");
      refresh();
    } else toast.error("Payment failed");
  };

  const transportFee = transportAssignment?.feePerMonth ?? 0;

  if (!student) {
    return (
      <div className="py-16 text-center space-y-4">
        <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-bold">Student not found</h2>
        <p className="text-sm text-muted-foreground">No student record for id {studentId}</p>
        <Button asChild variant="outline"><Link href="/fees">Back to Fees</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4">
          <AppImage src={student.avatar} alt={student.fullName} className="h-16 w-16 rounded-2xl ring-2 ring-primary/20" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{student.fullName}</h1>
              <Badge variant="outline" className="font-mono text-xs">{student.rollNumber}</Badge>
              {assignment && (
                <Badge variant={assignment.status === "PAID" ? "success" : assignment.status === "OVERDUE" ? "destructive" : assignment.status === "PARTIAL" ? "warning" : "secondary"} className="text-xs">
                  {assignment.status}
                </Badge>
              )}
              {overdue && <Badge variant="destructive" className="text-[11px] gap-1"><AlertTriangle className="h-3 w-3" /> Overdue {daysOver}d</Badge>}
              {transportAssignment && <Badge variant="outline" className="text-[11px] gap-1 border-sky-300 text-sky-700"><Bus className="h-3 w-3" /> Zone {transportAssignment.zone} • {formatCurrency(transportFee)}/mo</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {student.className} — {student.sectionName} • {student.branchName} • Adm {student.admissionNumber}
            </p>
            {assignment && <p className="text-xs text-muted-foreground">Due date {formatDate(assignment.dueDate)} • {assignment.structureName}</p>}
            {transportAssignment && (
              <p className="text-[11px] text-sky-700 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Transport: {transportAssignment.routeName} → {transportAssignment.stopName} ({transportAssignment.distanceKm}km) {transportAssignment.isProrated ? `• Prorated ${formatCurrency(transportAssignment.proratedFee!)} first month` : ""} • via Transport module <Link href="/transport" className="underline">manage</Link></p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild><Link href="/fees" className="gap-1"><ArrowLeft className="h-4 w-4" /> Back to Fees</Link></Button>
          <Button size="sm" variant="gradient" className="gap-1" disabled={due <= 0} onClick={() => { setPayAmount(due > 0 ? String(due) : ""); setPayOpen(true); }}><CreditCard className="h-4 w-4" /> Collect Payment</Button>
        </div>
      </div>

      {/* Summary ribbon */}
      {assignment && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-border/70">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> Assigned</span>
              <span className="text-xl font-bold mt-1 block">{formatCurrency(assignment.totalAssigned)}</span>
              {assignment.discount > 0 && <span className="text-[11px] text-emerald-600">Discount −{formatCurrency(assignment.discount)} {assignment.discountReason ? `(${assignment.discountReason})` : ""}</span>}
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Total Paid</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">{formatCurrency(assignment.totalPaid)}</span>
              <span className="text-[11px] text-muted-foreground">Sum of partial payments per head</span>
            </CardContent>
          </Card>
          <Card className={`border-border/70 ${overdue ? "bg-rose-500/5 border-rose-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
            <CardContent className="p-4">
              <span className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 ${overdue ? "text-rose-600" : "text-amber-600"}`}><Clock className="h-3.5 w-3.5" /> Due Amount</span>
              <span className={`text-xl font-bold mt-1 block ${overdue ? "text-rose-600" : "text-amber-600"}`}>{formatCurrency(due)}</span>
              <span className="text-[11px] text-muted-foreground">Assigned − Discount − Paid {assignment.lateFee > 0 ? `+ Late ${formatCurrency(assignment.lateFee)}` : ""}</span>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardContent className="p-4">
              <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Last Payment</span>
              <span className="text-sm font-bold mt-1 block">{assignment.lastPaymentDate ? formatDate(assignment.lastPaymentDate) : "—"}</span>
              <span className="text-[11px] text-muted-foreground">{overdue ? `Overdue by ${daysOver} days (>15)` : "On schedule"}</span>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="heads" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="heads" className="gap-1.5 text-xs"><Wallet className="h-3.5 w-3.5" /> Fee Heads & Due</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1.5 text-xs"><Receipt className="h-3.5 w-3.5" /> Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Payment History ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="heads">
          {transportAssignment ? (
            <div className="rounded-lg border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-900 p-3 text-xs flex gap-2">
              <Bus className="h-4 w-4 text-sky-600 shrink-0" />
              <div>
                <span className="font-semibold text-sky-800 dark:text-sky-200">Transport Fee auto-added from Transport module</span>
                <span className="text-sky-700 dark:text-sky-300"> — {transportAssignment.routeName} → {transportAssignment.stopName} • Zone {transportAssignment.zone} ({transportAssignment.distanceKm}km) → {formatCurrency(transportAssignment.feePerMonth)}/mo {transportAssignment.isProrated ? `• Prorated ${formatCurrency(transportAssignment.proratedFee!)}` : ""} {transportAssignment.discount ? `• Sibling disc −${formatCurrency(transportAssignment.discount)}` : ""}.</span>
                <Link href="/transport" className="ml-2 font-medium underline text-sky-700">Manage in Transport</Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">No transport assignment — Transport Fee head not added. Assign in <Link href="/transport" className="underline text-primary">Transport module</Link> to auto-add zone-based fee here.</div>
          )}
          <Card className="border-border/70 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm">Fee Heads — recurring / one-time breakdown</CardTitle>
              <CardDescription className="text-xs">Discount applied before due • Multiple partials summed per head • Transport as conditional head</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {assignment?.feeHeads && assignment.feeHeads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Head</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignment.feeHeads.map((fh) => (
                      <TableRow key={fh.feeHeadId} className={fh.feeHeadId === "fh-04" ? "bg-sky-50/50 dark:bg-sky-950/10" : ""}>
                        <TableCell className="font-medium text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: feeHeads.find((h) => h.id === fh.feeHeadId)?.color ?? "#999" }} />
                          {fh.feeHeadName}
                          {fh.feeHeadId === "fh-04" && <Badge variant="outline" className="text-[9px] border-sky-300 text-sky-700 ml-1">Via Transport</Badge>}
                        </TableCell>
                        <TableCell className="text-xs"><Badge variant={fh.isRecurring ? "secondary" : "outline"} className="text-[10px]">{fh.frequency}</Badge></TableCell>
                        <TableCell className="text-right font-mono text-xs">{formatCurrency(fh.amount)}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600">{fh.discount > 0 ? `−${formatCurrency(fh.discount)}` : "—"}</TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(fh.paidAmount)}</TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-rose-600">{fh.dueAmount > 0 ? formatCurrency(fh.dueAmount) : "—"}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/40 font-bold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(assignment.totalAssigned)}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">−{formatCurrency(assignment.discount ?? 0)}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">{formatCurrency(assignment.totalPaid)}</TableCell>
                      <TableCell className="text-right font-mono text-rose-600">{formatCurrency(due)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">No detailed fee heads for this student — using assignment totals.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-border/70 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{inv.period}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(inv.paidAmount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-rose-600">{inv.balanceAmount > 0 ? formatCurrency(inv.balanceAmount) : "—"}</TableCell>
                    <TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell><Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "destructive" : inv.status === "PARTIAL" ? "warning" : "secondary"} className="text-[10px]">{inv.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-border/70 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Heads</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-bold">{p.receiptNumber}</TableCell>
                    <TableCell className="text-xs">{formatDate(p.date)}</TableCell>
                    <TableCell className="font-mono text-xs">{p.invoiceNumber}</TableCell>
                    <TableCell className="text-right font-mono text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="text-xs">{p.feeHeadNames?.join(", ") ?? p.notes ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.method}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collect Payment */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Payment — {student.fullName}</DialogTitle>
            <DialogDescription>Select fee head(s) → amount → mode → receipt RCP-YYYY-XXXXX</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="p-3 rounded-lg bg-muted/30 border text-xs">
              <div className="flex justify-between"><span>Due:</span><strong className="text-rose-600">{formatCurrency(due)}</strong></div>
              {assignment?.lateFee ? <div className="flex justify-between text-rose-600"><span>Late fee included:</span><span>{formatCurrency(assignment.lateFee)}</span></div> : null}
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Fee Head(s)</label>
              <div className="grid grid-cols-2 gap-2 p-2 border rounded-lg bg-card max-h-28 overflow-auto">
                {feeHeads.map((h) => (
                  <label key={h.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={payHeadIds.includes(h.id)} onChange={() => setPayHeadIds((prev) => prev.includes(h.id) ? prev.filter((x) => x !== h.id) : [...prev, h.id])} className="h-3.5 w-3.5" />
                    {h.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Amount (₹)</label><Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} type="number" placeholder={String(due)} /></div>
              <div><label className="text-xs font-medium block mb-1">Mode</label>
                <Select value={payMethod} onValueChange={(v) => setPayMethod(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem><SelectItem value="UPI">UPI</SelectItem><SelectItem value="CARD">Card</SelectItem><SelectItem value="CHEQUE">Cheque</SelectItem><SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={handlePay} className="gap-1"><CreditCard className="h-4 w-4" /> Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Receipt</DialogTitle><DialogDescription>Printable card — {lastReceipt?.receiptNumber}</DialogDescription></DialogHeader>
          {lastReceipt && (
            <Card className="border-primary/20">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between"><strong className="text-sm">Apex ERP</strong><Badge variant="success" className="font-mono">{lastReceipt.receiptNumber}</Badge></div>
                <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3">
                  <div><span className="text-muted-foreground block">Student</span><strong>{lastReceipt.studentName}</strong><span className="block font-mono text-[11px]">{lastReceipt.studentId}</span></div>
                  <div><span className="text-muted-foreground block">Date</span><strong>{formatDate(lastReceipt.date)}</strong></div>
                  <div><span className="text-muted-foreground block">Invoice</span><strong className="font-mono">{lastReceipt.invoiceNumber}</strong></div>
                  <div><span className="text-muted-foreground block">Method</span><Badge variant="outline" className="text-[10px]">{lastReceipt.method}</Badge></div>
                  <div className="col-span-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[11px] text-muted-foreground block">Amount</span><span className="text-xl font-bold text-emerald-600">{formatCurrency(lastReceipt.amount)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => window.print()}><Printer className="h-3.5 w-3.5" /> Print</Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => {
                    const el = document.createElement("a");
                    el.href = "data:text/html," + encodeURIComponent(document.documentElement.outerHTML);
                    el.download = `${lastReceipt.receiptNumber}.html`;
                    el.click();
                  }}><Download className="h-3.5 w-3.5" /> Download</Button>
                </div>
              </CardContent>
            </Card>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setReceiptOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
