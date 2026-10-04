"use client";

import { useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Check, Wallet } from "lucide-react";
import { fetchRefunds, approveRefundApi, markRefundPaidApi } from "@/lib/api/fees";

const REFUND_MODES = ["cash", "upi", "bank_transfer", "cheque", "adjustment"];
const STATUS_OPTIONS = ["all", "PENDING", "APPROVED", "PAID", "REJECTED"];

export function RefundsList() {
  const { activeBranchId } = useERP();

  const [status, setStatus] = useState("all");
  const [approve, setApprove] = useState<any | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [paying, setPaying] = useState<any | null>(null);
  const [refundMode, setRefundMode] = useState("bank_transfer");
  const [txnRef, setTxnRef] = useState("");
  const [processedAt, setProcessedAt] = useState("");

  const { data: refunds, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchRefunds({ campusId: cid, status: status === "all" ? undefined : status }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchRefunds>>,
    queryKeyPrefix: `fee-refunds-${status}`,
  });

  const handleApprove = async () => {
    if (!approve) return;
    try {
      await approveRefundApi(approve.uuid, {
        approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
        notes: approveNotes || undefined,
      });
      toast.success("Refund approved");
      setApprove(null);
      setApprovedAmount("");
      setApproveNotes("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approve failed");
    }
  };

  const handleMarkPaid = async () => {
    if (!paying) return;
    try {
      await markRefundPaidApi(paying.uuid, {
        refundMode,
        transactionRef: txnRef || undefined,
        processedAt: processedAt || undefined,
      });
      toast.success("Refund marked PAID");
      setPaying(null);
      setTxnRef("");
      setProcessedAt("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mark-paid failed");
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button asChild size="sm" variant="gradient" className="h-8 text-xs gap-1 ml-auto">
            <Link href="/fees/refunds/new"><Plus className="h-3.5 w-3.5" /> New Refund Request</Link>
          </Button>
        </div>
      </Card>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right tabular-nums">Calculated</TableHead>
              <TableHead className="text-right tabular-nums">Approved</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && refunds.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">Loading refunds…</TableCell></TableRow>
            ) : refunds.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">No refunds. Withdrawal refunds exclude admission (one-time) fees automatically.</TableCell></TableRow>
            ) : refunds.map((r: any) => (
              <TableRow key={r.uuid} className="hover:bg-muted/40">
                <TableCell className="text-sm font-semibold">{r.student ? `${r.student.firstName} ${r.student.lastName ?? ""}` : (r.studentName ?? "—")}<span className="block text-[11px] text-muted-foreground font-mono">{r.student?.admissionNo ?? ""}</span></TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{r.reason}</Badge></TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCurrency(r.calculatedAmount ?? 0)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{r.approvedAmount != null ? formatCurrency(r.approvedAmount) : "—"}</TableCell>
                <TableCell><Badge variant={r.status === "PAID" ? "success" : r.status === "APPROVED" ? "secondary" : "warning"} className="text-[10px]">{r.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {r.status === "PENDING" && approve?.uuid !== r.uuid && (
                      <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => { setApprove(r); setApprovedAmount(r.calculatedAmount != null ? String(r.calculatedAmount) : ""); setApproveNotes(""); }}>
                        <Check className="h-3 w-3" /> Approve
                      </Button>
                    )}
                    {r.status === "APPROVED" && paying?.uuid !== r.uuid && (
                      <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => { setPaying(r); setRefundMode("bank_transfer"); setTxnRef(""); setProcessedAt(""); }}>
                        <Wallet className="h-3 w-3" /> Mark Paid
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {approve && (
        <Card className="p-3 border-border/70 bg-muted/30 space-y-2">
          <p className="text-xs font-semibold">Approve refund — calculated {formatCurrency(approve.calculatedAmount ?? 0)}. Adjust if policy requires.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} placeholder="Approved amount (₹)" className="h-9 text-xs" />
            <Input value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} placeholder="Notes (e.g. admission fee non-refundable)" className="h-9 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleApprove()}>Confirm Approve</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setApprove(null)}>Back</Button>
          </div>
        </Card>
      )}

      {paying && (
        <Card className="p-3 border-border/70 bg-muted/30 space-y-2">
          <p className="text-xs font-semibold">Mark refund PAID — record how the money went out.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Select value={refundMode} onValueChange={setRefundMode}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{REFUND_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} placeholder="Transaction ref…" className="h-9 text-xs" />
            <Input type="date" value={processedAt} onChange={(e) => setProcessedAt(e.target.value)} className="h-9 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleMarkPaid()}>Confirm Mark Paid</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPaying(null)}>Back</Button>
          </div>
        </Card>
      )}
    </div>
  );
}