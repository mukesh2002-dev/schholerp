"use client";

import { useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Ban, Wallet, UserCheck } from "lucide-react";
import { fetchPayments, cancelReceiptApi } from "@/lib/api/fees";

export function PaymentsList() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;
  const [cancelUuid, setCancelUuid] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data: rows, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchPayments({ campusId: cid, limit: 100 }).then((r) => r.data),
    campusId: activeBranchId,
    fallback: [] as any[],
    queryKeyPrefix: "fee-payments",
  });

  const handleCancel = async () => {
    if (!cancelUuid || !reason.trim()) { toast.error("Reason is required"); return; }
    try {
      await cancelReceiptApi(cancelUuid, reason.trim());
      toast.success("Receipt cancelled");
      setCancelUuid(null);
      setReason("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild size="sm" variant="gradient" className="h-9 text-xs gap-1">
          <Link href="/fees/collect"><UserCheck className="h-4 w-4" /> Collect New Payment</Link>
        </Button>
      </div>

      {isLoading && rows.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading receipts…</Card>
      ) : rows.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <Wallet className="h-8 w-8 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-sm">No receipts yet</h3>
          <p className="text-xs text-muted-foreground">Receipts appear here after each collection.</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right tabular-nums">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p: any) => (
                <TableRow key={p.uuid} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs font-bold">{p.receiptNumber}</TableCell>
                  <TableCell className="font-mono text-xs">{p.invoice?.invoiceNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.paymentMethod}</Badge></TableCell>
                  <TableCell className="text-xs">{p.paidAt ? formatDate(p.paidAt) : "—"}</TableCell>
                  <TableCell><Badge variant={p.status === "ACTIVE" ? "success" : "destructive"} className="text-[10px]">{p.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {p.status === "ACTIVE" && cancelUuid !== p.uuid && (
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive" onClick={() => { setCancelUuid(p.uuid); setReason(""); }}>
                        <Ban className="h-3 w-3" /> Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {cancelUuid && (
        <Card className="p-3 border-destructive/40 bg-destructive/5 space-y-2">
          <p className="text-xs font-semibold text-destructive">Cancel this receipt? Invoice paid-amount is recalculated automatically.</p>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. wrong entry, duplicate)…" className="h-9 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => void handleCancel()}>Confirm Cancel</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setCancelUuid(null); setReason(""); }}>Back</Button>
          </div>
        </Card>
      )}
    </div>
  );
}