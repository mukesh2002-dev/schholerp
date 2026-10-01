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
import { Plus, Zap, Users, Ban } from "lucide-react";
import { fetchClasses } from "@/lib/api/classes";
import { fetchAcademicYears } from "@/lib/api/academics";
import {
  fetchInvoices,
  fetchAssignments,
  generateMonthlyInvoiceApi,
  generateMonthlyBulkInvoicesApi,
  createInvoiceApi,
  cancelInvoiceApi,
  fetchPayments,
  cancelReceiptApi,
} from "@/lib/api/fees";

const STATUSES = ["all", "unpaid", "partially_paid", "paid", "overdue", "cancelled"];
const CURRENT_YEAR = new Date().getFullYear();

export function InvoicesTab() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: invoices, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchInvoices({ campusId: cid, status: status === "all" ? undefined : status }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchInvoices>>,
    queryKeyPrefix: "fee-invoices",
  });

  const { data: classes } = useCampusData({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchClasses>>,
    queryKeyPrefix: "classes",
  });

  const { data: years } = useCampusData({
    fetcher: (cid) => fetchAcademicYears({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAcademicYears>>,
    queryKeyPrefix: "academic-years",
  });

  const { data: paymentsData, refresh: refreshPayments } = useCampusData({
    fetcher: (cid) => fetchPayments({ campusId: cid, limit: 50 }).then((r) => r.data),
    campusId: activeBranchId,
    fallback: [] as any[],
    queryKeyPrefix: "fee-payments",
  });

  // Single generate
  const [genOpen, setGenOpen] = useState(false);
  const [genStudentId, setGenStudentId] = useState("");
  const [genAssignments, setGenAssignments] = useState<any[]>([]);
  const [genAssignmentId, setGenAssignmentId] = useState("");
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1));
  const [genYear, setGenYear] = useState(String(CURRENT_YEAR));
  const [genBusy, setGenBusy] = useState(false);

  // Bulk generate
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkYearId, setBulkYearId] = useState("");
  const [bulkMonth, setBulkMonth] = useState(String(new Date().getMonth() + 1));
  const [bulkYear, setBulkYear] = useState(String(CURRENT_YEAR));
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);

  // Create manual invoice
  const [createOpen, setCreateOpen] = useState(false);
  const [cStudentId, setCStudentId] = useState("");
  const [cAmount, setCAmount] = useState("");
  const [cDueDate, setCDueDate] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

  // Cancel
  const [cancelUuid, setCancelUuid] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const filtered = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return inv.invoiceNumber.toLowerCase().includes(q);
  });

  const loadStudentAssignments = async (studentId: string) => {
    setGenStudentId(studentId);
    setGenAssignmentId("");
    if (!studentId.trim()) { setGenAssignments([]); return; }
    try {
      const list = await fetchAssignments({ campusId: branch, studentId: studentId.trim() });
      setGenAssignments(list);
      if (list.length === 1) setGenAssignmentId(list[0].uuid);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load assignments");
    }
  };

  const handleGenerate = async () => {
    if (!genAssignmentId) { toast.error("Select an assignment"); return; }
    setGenBusy(true);
    try {
      const inv = await generateMonthlyInvoiceApi({ assignmentId: genAssignmentId, month: Number(genMonth), year: Number(genYear) }, branch);
      toast.success(`Invoice ${inv.invoiceNumber} generated`);
      setGenOpen(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenBusy(false);
    }
  };

  const handleBulk = async () => {
    setBulkBusy(true);
    setBulkResult(null);
    try {
      const res = await generateMonthlyBulkInvoicesApi({
        campusId: branch,
        classId: bulkClassId || undefined,
        academicYearId: bulkYearId || undefined,
        month: Number(bulkMonth),
        year: Number(bulkYear),
      }, branch);
      setBulkResult(res);
      toast.success(`Generated ${res.generated}, skipped ${res.skipped}`);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk generation failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!cStudentId.trim() || !cAmount || !cDueDate) { toast.error("Student, amount and due date are required"); return; }
    setCreateBusy(true);
    try {
      const inv = await createInvoiceApi({ studentId: cStudentId.trim(), amount: Number(cAmount), dueDate: cDueDate }, branch);
      toast.success(`Invoice ${inv.invoiceNumber} created`);
      setCreateOpen(false);
      setCStudentId(""); setCAmount(""); setCDueDate("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreateBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelUuid || !cancelReason.trim()) { toast.error("Reason is required"); return; }
    try {
      await cancelInvoiceApi(cancelUuid, cancelReason.trim());
      toast.success("Invoice cancelled");
      setCancelUuid(null); setCancelReason("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  const handleCancelReceipt = async (uuid: string) => {
    const reason = window.prompt("Cancel reason for this receipt?");
    if (!reason) return;
    try {
      await cancelReceiptApi(uuid, reason);
      toast.success("Receipt cancelled");
      void refreshPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice no…" className="h-9 text-xs w-56" />
          <Select value={status} onValueChange={(v) => { setStatus(v); setTimeout(() => void refresh(), 50); }}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> Manual Invoice</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setGenOpen(true)}><Zap className="h-3.5 w-3.5" /> Generate Monthly</Button>
            <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" onClick={() => setBulkOpen(true)}><Users className="h-3.5 w-3.5" /> Bulk Generate</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right tabular-nums">Amount</TableHead>
              <TableHead className="text-right tabular-nums">Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">Loading invoices…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">No invoices. Generate monthly or bulk invoices to begin.</TableCell></TableRow>
            ) : filtered.map((inv: any) => (
              <TableRow key={inv.uuid}>
                <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-xs">{inv.billingPeriod ?? "—"}</TableCell>
                <TableCell className="text-xs">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCurrency(inv.amount)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(inv.paidAmount ?? 0)}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{inv.status}</Badge></TableCell>
                <TableCell className="text-right">
                  {!["paid", "cancelled"].includes(String(inv.status)) && (
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive" onClick={() => setCancelUuid(inv.uuid)}><Ban className="h-3 w-3" /> Cancel</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-2">Recent Receipts ({paymentsData.length})</h3>
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right tabular-nums">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">No receipts yet.</TableCell></TableRow>
              ) : paymentsData.slice(0, 20).map((p: any) => (
                <TableRow key={p.uuid}>
                  <TableCell className="font-mono text-xs font-bold">{p.receiptNumber}</TableCell>
                  <TableCell className="font-mono text-xs">{p.invoice?.invoiceNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{p.paymentMethod}</Badge></TableCell>
                  <TableCell className="text-xs">{p.paidAt ? formatDate(p.paidAt) : "—"}</TableCell>
                  <TableCell className="text-right">
                    {p.status === "ACTIVE" && (
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] text-destructive" onClick={() => void handleCancelReceipt(p.uuid)}>Cancel</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Generate monthly */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Generate Monthly Invoice</DialogTitle><DialogDescription>One student, one month. Duplicate periods return 409.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Student (UUID or admission no)</label>
              <div className="flex gap-2">
                <Input value={genStudentId} onChange={(e) => setGenStudentId(e.target.value)} placeholder="Paste student UUID / admission no" />
                <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => void loadStudentAssignments(genStudentId)}>Load</Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Assignment ({genAssignments.length})</label>
              <Select value={genAssignmentId} onValueChange={setGenAssignmentId}>
                <SelectTrigger><SelectValue placeholder="Select assignment" /></SelectTrigger>
                <SelectContent>{genAssignments.map((a: any) => <SelectItem key={a.uuid} value={a.uuid}>{a.structure?.name ?? a.uuid} • {formatCurrency(a.totalAssigned)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Month (1–12)</label>
                <Input type="number" min={1} max={12} value={genMonth} onChange={(e) => setGenMonth(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Year</label>
                <Input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button><Button onClick={() => void handleGenerate()} disabled={genBusy}>{genBusy ? "Generating…" : "Generate"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk generate */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bulk Generate — Whole Class</DialogTitle><DialogDescription>Skips discontinued students and already-generated periods.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Class</label>
              <Select value={bulkClassId} onValueChange={setBulkClassId}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map((c: any) => <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Academic Year (optional)</label>
              <Select value={bulkYearId} onValueChange={setBulkYearId}>
                <SelectTrigger><SelectValue placeholder="All years" /></SelectTrigger>
                <SelectContent><SelectItem value="">All years</SelectItem>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Month (1–12)</label>
                <Input type="number" min={1} max={12} value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Year</label>
                <Input type="number" value={bulkYear} onChange={(e) => setBulkYear(e.target.value)} />
              </div>
            </div>
            {bulkResult && (
              <div className="p-3 rounded-lg bg-muted/40 border text-xs">
                Generated: <strong className="text-emerald-600">{bulkResult.generated}</strong> • Skipped: <strong>{bulkResult.skipped}</strong> • Errors: <strong className={bulkResult.errors?.length ? "text-destructive" : ""}>{bulkResult.errors?.length ?? 0}</strong>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBulkOpen(false)}>Close</Button><Button variant="gradient" onClick={() => void handleBulk()} disabled={bulkBusy || !bulkClassId}>{bulkBusy ? "Generating…" : "Run Bulk"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual invoice */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Manual Invoice</DialogTitle><DialogDescription>One-off invoice outside the monthly engine.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Student (UUID / admission no) *</label><Input value={cStudentId} onChange={(e) => setCStudentId(e.target.value)} placeholder="Student UUID" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Amount (₹) *</label><Input type="number" value={cAmount} onChange={(e) => setCAmount(e.target.value)} /></div>
              <div><label className="text-xs font-medium block mb-1">Due Date *</label><Input type="date" value={cDueDate} onChange={(e) => setCDueDate(e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => void handleCreate()} disabled={createBusy}>{createBusy ? "Creating…" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel */}
      <Dialog open={cancelUuid !== null} onOpenChange={(v) => { if (!v) { setCancelUuid(null); setCancelReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Cancel Invoice</DialogTitle><DialogDescription>Blocked on paid invoices. This cannot be undone.</DialogDescription></DialogHeader>
          <div className="mt-2"><label className="text-xs font-medium block mb-1">Reason *</label><Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="e.g. Duplicate — replaced by INV-2026-0045" /></div>
          <DialogFooter><Button variant="outline" onClick={() => { setCancelUuid(null); setCancelReason(""); }}>Back</Button><Button variant="destructive" onClick={() => void handleCancel()}>Cancel Invoice</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
