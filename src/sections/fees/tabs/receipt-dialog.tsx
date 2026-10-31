"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Receipt, Printer, Download, GraduationCap } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RECEIPT_BRANDING } from "@/lib/school-data";

export interface ReceiptLineItem {
  feeHeadName?: string;
  amount?: string | number;
}

export interface ReceiptStudent {
  firstName?: string;
  lastName?: string;
  admissionNo?: string;
  rollNo?: string;
  class?: { name?: string; section?: string | null } | null;
}

export interface ReceiptInvoice {
  invoiceNumber?: string;
  amount?: string | number;
  paidAmount?: string | number;
  discountAmount?: string | number;
  fineAmount?: string | number;
  advanceAdjusted?: string | number;
  lineItems?: ReceiptLineItem[];
  student?: ReceiptStudent | null;
  feeStructure?: { name?: string } | null;
  periodType?: string | null;
  billingPeriod?: string | null;
}

export interface ReceiptData {
  uuid?: string;
  receiptNumber: string;
  amount: string | number;
  paymentMethod?: string;
  method?: string;
  paidAt?: string;
  date?: string;
  transactionRef?: string;
  transactionId?: string;
  invoiceNumber?: string;
  invoice?: ReceiptInvoice | null;
  studentName?: string;
  student?: ReceiptStudent | null;
  className?: string;
  receivedBy?: { name?: string } | null;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  receipt,
  studentName,
  student,
  onViewStudent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  receipt: ReceiptData | null;
  studentName?: string;
  student?: ReceiptStudent | null;
  onViewStudent?: (studentId: string, receipt: ReceiptData) => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = !logoFailed && Boolean(RECEIPT_BRANDING.logoPath);

  const handlePrint = () => window.print();
  const handleDownload = () => {
    if (!receipt) return;
    const blob = new Blob([document.getElementById("fee-receipt-card")?.outerHTML ?? ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.receiptNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inv = receipt?.invoice ?? {};
  const lineItems = Array.isArray(inv.lineItems) ? inv.lineItems : [];
  const stu = student ?? receipt?.student ?? inv.student ?? null;
  const cls = stu?.class;
  const fullName =
    studentName ||
    [stu?.firstName, stu?.lastName].filter(Boolean).join(" ") ||
    receipt?.studentName ||
    "—";
  const className =
    receipt?.className ||
    (cls ? [cls.name, cls.section].filter(Boolean).join(" - ") : "") ||
    "—";

  const amountPaid = Number(receipt?.amount ?? 0);
  const invoiceAmount = Number(inv.amount ?? 0);
  const discount = Number(inv.discountAmount ?? 0);
  const fine = Number(inv.fineAmount ?? 0);
  const advanceAdjusted = Number(inv.advanceAdjusted ?? 0);
  const subtotal = lineItems.reduce((sum, li) => sum + Number(li.amount ?? 0), 0);
  const totalPayable = invoiceAmount || Math.max(0, subtotal - discount + fine - advanceAdjusted);
  const balance = Math.max(0, invoiceAmount - Number(inv.paidAmount ?? amountPaid));
  const paymentDate = formatDate(receipt?.paidAt ?? receipt?.date ?? new Date().toISOString());
  const baseFee = Math.max(0, (totalPayable || amountPaid) - fine);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg print:shadow-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Payment Receipt</DialogTitle>
          <DialogDescription>Printable • Downloadable receipt</DialogDescription>
        </DialogHeader>
        {receipt && (
          <div className="space-y-4 mt-2" id="fee-receipt-card">
            <Card className="border-primary/20 bg-card">
              <CardContent className="p-5 space-y-4">
                {/* School header — logo and name are separate config values */}
                <div className="flex items-start justify-between gap-3 border-b pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {showLogo ? (
                      <img
                        src={RECEIPT_BRANDING.logoPath}
                        alt={RECEIPT_BRANDING.schoolName}
                        onError={() => setLogoFailed(true)}
                        className="h-12 w-12 shrink-0 rounded-xl object-contain bg-white ring-1 ring-border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-sm leading-tight">{RECEIPT_BRANDING.schoolName}</div>
                      {RECEIPT_BRANDING.tagline && (
                        <div className="text-[10px] text-muted-foreground">{RECEIPT_BRANDING.tagline}</div>
                      )}
                      {RECEIPT_BRANDING.address && (
                        <div className="text-[10px] text-muted-foreground">{RECEIPT_BRANDING.address}</div>
                      )}
                      {RECEIPT_BRANDING.contact && (
                        <div className="text-[10px] text-muted-foreground">{RECEIPT_BRANDING.contact}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Fee Receipt</div>
                    <Badge variant="success" className="font-mono text-[10px] mt-1">{receipt.receiptNumber}</Badge>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {paymentDate}
                    </div>
                  </div>
                </div>

                {/* Student & payment details */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
                  <div><span className="text-muted-foreground block">Student</span><strong>{fullName}</strong></div>
                  <div><span className="text-muted-foreground block">Class</span><strong>{className}</strong></div>
                  <div><span className="text-muted-foreground block">Admission No</span><strong className="font-mono">{stu?.admissionNo || "—"}</strong></div>
                  <div><span className="text-muted-foreground block">Roll No</span><strong className="font-mono">{stu?.rollNo || "—"}</strong></div>
                  <div><span className="text-muted-foreground block">Invoice</span><strong className="font-mono">{receipt.invoiceNumber ?? inv.invoiceNumber ?? "—"}</strong></div>
                  <div><span className="text-muted-foreground block">Method</span><Badge variant="outline" className="text-[10px] mt-0.5">{receipt.paymentMethod ?? receipt.method ?? "—"}</Badge></div>
                  <div><span className="text-muted-foreground block">Payment Date</span><strong>{paymentDate}</strong></div>
                  <div><span className="text-muted-foreground block">Received By</span><strong>{receipt.receivedBy?.name || "—"}</strong></div>
                  {(receipt.transactionRef ?? receipt.transactionId) && (
                    <div><span className="text-muted-foreground block">Transaction Ref</span><strong className="font-mono">{receipt.transactionRef ?? receipt.transactionId}</strong></div>
                  )}
                </div>

                {/* Fee breakdown */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="flex justify-between bg-muted/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Fee Head</span>
                    <span>Amount</span>
                  </div>
                  {lineItems.length > 0 ? (
                    <div className="divide-y">
                      {lineItems.map((li, i) => (
                        <div key={i} className="flex justify-between gap-3 px-3 py-2 text-xs">
                          <span className="min-w-0 truncate">{li.feeHeadName ?? "Fee"}</span>
                          <span className="font-mono shrink-0">{formatCurrency(Number(li.amount ?? 0))}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between gap-3 px-3 py-2 text-xs">
                      <span>{inv.feeStructure?.name || "School Fee"}</span>
                      <span className="font-mono">{formatCurrency(baseFee)}</span>
                    </div>
                  )}
                  <div className="border-t bg-muted/20 px-3 py-2 space-y-1 text-xs">
                    {lineItems.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-mono">{formatCurrency(subtotal)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span className="font-mono">- {formatCurrency(discount)}</span>
                      </div>
                    )}
                    {fine > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Late Fine</span>
                        <span className="font-mono">{formatCurrency(fine)}</span>
                      </div>
                    )}
                    {advanceAdjusted > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Advance Adjusted</span>
                        <span className="font-mono">- {formatCurrency(advanceAdjusted)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Total</span>
                      <span className="font-mono">{formatCurrency(totalPayable)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Paid</span>
                      <span className="font-mono">{formatCurrency(amountPaid)}</span>
                    </div>
                    {balance > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Balance</span>
                        <span className="font-mono">{formatCurrency(balance)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="text-muted-foreground text-[11px] block">Amount Paid</span>
                  <span className="text-xl font-bold text-emerald-600">{formatCurrency(amountPaid)}</span>
                </div>

                <div className="flex gap-2 print:hidden">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handlePrint}><Printer className="h-3.5 w-3.5" /> Print</Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleDownload}><Download className="h-3.5 w-3.5" /> Download</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {onViewStudent && receipt && (receipt as any).studentId && (
            <Button variant="gradient" onClick={() => onViewStudent(String((receipt as any).studentId), receipt)}>View Student Detail</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
