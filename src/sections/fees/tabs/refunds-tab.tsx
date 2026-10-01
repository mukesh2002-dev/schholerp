"use client";

import { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Check, Wallet } from "lucide-react";
import {
  fetchRefunds,
  createRefundApi,
  approveRefundApi,
  markRefundPaidApi,
} from "@/lib/api/fees";

const REFUND_MODES = ["cash", "upi", "bank_transfer", "cheque", "adjustment"];

export function RefundsTab() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [status, setStatus] = useState("all");
  const { data: refunds, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchRefunds({ campusId: cid, status: status === "all" ? undefined : status }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchRefunds>>,
    queryKeyPrefix: "fee-refunds",
  });

  // Create
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [reason, setReason] = useState("WITHDRAWAL");
  const [withdrawalDate, setWithdrawalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Approve
  const [approve, setApprove] = useState<any | null>(null);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  // Mark paid
  const [paying, setPaying] = useState<any | null>(null);
  const [refundMode, setRefundMode] = useState("bank_transfer");
  const [txnRef, setTxnRef] = useState("");
  const [processedAt, setProcessedAt] = useState("");

  const handleCreate = async () => {
    if (!studentId.trim() && !assignmentId.trim()) { toast.error("Student or assignment is required"); return; }
    setSaving(true);
    try {
      const res = await createRefundApi({
        studentId: studentId.trim() || undefined,
        assignmentId: assignmentId.trim() || undefined,
        reason,
        withdrawalDate: withdrawalDate || undefined,
        notes: notes || undefined,
      }, branch);
      toast.success(`Refund request created — calculated ${formatCurrency(res?.calculatedAmount ?? 0)} (PENDING)`);
      setOpen(false);
      setStudentId(""); setAssignmentId(""); setNotes("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!approve) return;
    try {
      await approveRefundApi(approve.uuid, {
        approvedAmount: approvedAmount ? Number(approvedAmount) : undefined,
        notes: approveNotes || undefined,
      });
      toast.success("Refund approved");
      setApprove(null); setApprovedAmount(""); setApproveNotes("");
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
      setPaying(null); setTxnRef(""); setProcessedAt("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mark-paid failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v); setTimeout(() => void refresh(), 50); }}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1 ml-auto" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> New Refund</Button>
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
              <TableRow key={r.uuid}>
                <TableCell className="text-sm font-semibold">{r.student ? `${r.student.firstName} ${r.student.lastName ?? ""}` : (r.studentName ?? "—")}<span className="block text-[11px] text-muted-foreground font-mono">{r.student?.admissionNo ?? ""}</span></TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{r.reason}</Badge></TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCurrency(r.calculatedAmount ?? 0)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{r.approvedAmount != null ? formatCurrency(r.approvedAmount) : "—"}</TableCell>
                <TableCell><Badge variant={r.status === "PAID" ? "success" : r.status === "APPROVED" ? "secondary" : "warning"} className="text-[10px]">{r.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {r.status === "PENDING" && (
                      <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => { setApprove(r); setApprovedAmount(r.calculatedAmount != null ? String(r.calculatedAmount) : ""); }}><Check className="h-3 w-3" /> Approve</Button>
                    )}
                    {r.status === "APPROVED" && (
                      <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => setPaying(r)}><Wallet className="h-3 w-3" /> Mark Paid</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Refund Request</DialogTitle><DialogDescription>Pro-rata is auto-calculated. Admission fees are excluded. Status → PENDING.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium">Student (UUID / admission no)</label><Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student UUID" /></div>
            <div><label className="text-xs font-medium">Assignment UUID (optional)</label><Input value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} placeholder="Assignment UUID" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Reason</label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="WITHDRAWAL">Withdrawal / TC</SelectItem><SelectItem value="OVERPAYMENT">Overpayment</SelectItem><SelectItem value="ERROR">Error correction</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Withdrawal Date</label><Input type="date" value={withdrawalDate} onChange={(e) => setWithdrawalDate(e.target.value)} /></div>
            </div>
            <div><label className="text-xs font-medium">Notes</label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Family relocating…" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void handleCreate()} disabled={saving}>{saving ? "Creating…" : "Create Request"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve */}
      <Dialog open={approve !== null} onOpenChange={(v) => { if (!v) setApprove(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Approve Refund</DialogTitle><DialogDescription>Calculated: {approve ? formatCurrency(approve.calculatedAmount ?? 0) : ""} — adjust if policy requires.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium">Approved Amount (₹)</label><Input type="number" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} /></div>
            <div><label className="text-xs font-medium">Notes</label><Input value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} placeholder="Admission fee non-refundable per policy" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setApprove(null)}>Back</Button><Button variant="gradient" onClick={() => void handleApprove()}>Approve</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark paid */}
      <Dialog open={paying !== null} onOpenChange={(v) => { if (!v) setPaying(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Mark Refund Paid</DialogTitle><DialogDescription>Final step — record how the money went out.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium">Refund Mode</label>
              <Select value={refundMode} onValueChange={setRefundMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REFUND_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Transaction Ref</label><Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} /></div>
              <div><label className="text-xs font-medium">Processed On</label><Input type="date" value={processedAt} onChange={(e) => setProcessedAt(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPaying(null)}>Back</Button><Button variant="gradient" onClick={() => void handleMarkPaid()}>Mark Paid</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
