"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Receipt, Printer, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

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
  invoice?: { invoiceNumber?: string } | null;
  studentName?: string;
  student?: { firstName?: string; lastName?: string } | null;
}

export function ReceiptDialog({
  open,
  onOpenChange,
  receipt,
  studentName,
  onViewStudent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  receipt: ReceiptData | null;
  studentName?: string;
  onViewStudent?: (studentId: string, receipt: ReceiptData) => void;
}) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md print:shadow-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Payment Receipt</DialogTitle>
          <DialogDescription>Printable • Downloadable receipt</DialogDescription>
        </DialogHeader>
        {receipt && (
          <div className="space-y-4 mt-2" id="fee-receipt-card">
            <Card className="border-primary/20 bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm">Fee Receipt</div>
                    <div className="text-xs text-muted-foreground">School Fee Collection</div>
                  </div>
                  <Badge variant="success" className="font-mono text-xs">{receipt.receiptNumber}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                  <div><span className="text-muted-foreground block">Student</span><strong>{studentName ?? receipt.studentName ?? `${receipt.student?.firstName ?? ""} ${receipt.student?.lastName ?? ""}`.trim() ?? "—"}</strong></div>
                  <div><span className="text-muted-foreground block">Date</span><strong>{formatDate(receipt.paidAt ?? receipt.date ?? new Date().toISOString())}</strong></div>
                  <div><span className="text-muted-foreground block">Invoice</span><strong className="font-mono">{receipt.invoiceNumber ?? receipt.invoice?.invoiceNumber ?? "—"}</strong></div>
                  <div><span className="text-muted-foreground block">Method</span><Badge variant="outline" className="text-[10px] mt-0.5">{receipt.paymentMethod ?? receipt.method ?? "—"}</Badge></div>
                  {(receipt.transactionRef ?? receipt.transactionId) && (
                    <div className="col-span-2"><span className="text-muted-foreground block">Transaction Ref</span><strong className="font-mono">{receipt.transactionRef ?? receipt.transactionId}</strong></div>
                  )}
                    <div className="col-span-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-muted-foreground text-[11px] block">Amount Paid</span>
                      <span className="text-xl font-bold text-emerald-600">{formatCurrency(Number(receipt.amount ?? 0))}</span>
                    </div>
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
