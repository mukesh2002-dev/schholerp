"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { createRefundApi } from "@/lib/api/fees";

export function RefundNew() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [studentId, setStudentId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [reason, setReason] = useState("WITHDRAWAL");
  const [withdrawalDate, setWithdrawalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

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
      toast.success(`Refund request created — calculated ${res?.calculatedAmount ?? 0} (PENDING)`);
      router.push("/fees/refunds");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/fees/refunds"><ArrowLeft className="h-3.5 w-3.5" /> Refunds</Link></Button>
      </div>
      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">New refund request</h3>
        <p className="text-[11px] text-muted-foreground">
          Pro-rata is auto-calculated from paid invoices (future periods fully refundable). Admission/one-time fees are excluded. Lifecycle: PENDING → APPROVED → PAID.
        </p>
        <div>
          <label className="text-xs font-medium">Student (UUID / admission no)</label>
          <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Student UUID" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium">Assignment UUID (optional)</label>
          <Input value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} placeholder="Assignment UUID" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WITHDRAWAL">Withdrawal / TC</SelectItem>
                <SelectItem value="OVERPAYMENT">Overpayment</SelectItem>
                <SelectItem value="ERROR">Error correction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Withdrawal Date</label>
            <Input type="date" value={withdrawalDate} onChange={(e) => setWithdrawalDate(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium">Notes</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Family relocating…" className="mt-1" />
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={() => void handleCreate()} disabled={saving} variant="gradient" className="gap-1">
            <Plus className="h-4 w-4" /> {saving ? "Creating…" : "Create Request"}
          </Button>
          <Button asChild variant="outline"><Link href="/fees/refunds">Cancel</Link></Button>
        </div>
      </Card>
    </div>
  );
}