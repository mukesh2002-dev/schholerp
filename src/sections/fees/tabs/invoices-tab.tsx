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
import { Plus, Zap, Ban } from "lucide-react";
import { fetchInvoices, cancelInvoiceApi } from "@/lib/api/fees";

const STATUSES = ["all", "unpaid", "partially_paid", "paid", "overdue", "cancelled"];

export function InvoicesList() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [cancelUuid, setCancelUuid] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: invoices, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchInvoices({ campusId: cid, status: status === "all" ? undefined : status }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchInvoices>>,
    queryKeyPrefix: `fee-invoices-${status}`,
  });

  const filtered = invoices.filter((inv) => {
    if (!search.trim()) return true;
    return inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
  });

  const handleCancel = async () => {
    if (!cancelUuid || !cancelReason.trim()) { toast.error("Reason is required"); return; }
    try {
      await cancelInvoiceApi(cancelUuid, cancelReason.trim());
      toast.success("Invoice cancelled");
      setCancelUuid(null);
      setCancelReason("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice no…" className="h-9 text-xs w-56" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
              <Link href="/fees/assignments/new"><Plus className="h-3.5 w-3.5" /> New Assignment</Link>
            </Button>
            <Button asChild size="sm" variant="gradient" className="h-8 text-xs gap-1">
              <Link href="/fees/invoices/generate"><Zap className="h-3.5 w-3.5" /> Generate Invoices</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Student</TableHead>
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
              <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-8">Loading invoices…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-8">No invoices. Assign a structure, then Generate monthly or bulk.</TableCell></TableRow>
            ) : filtered.map((inv: any) => (
              <TableRow key={inv.uuid} className="hover:bg-muted/40">
                <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-xs">{inv.student ? `${inv.student.firstName ?? ""} ${inv.student.lastName ?? ""}`.trim() : "—"}</TableCell>
                <TableCell className="text-xs">{inv.billingPeriod ?? "—"}</TableCell>
                <TableCell className="text-xs">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCurrency(inv.amount)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(inv.paidAmount ?? 0)}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{inv.status}</Badge></TableCell>
                <TableCell className="text-right">
                  {!["paid", "cancelled"].includes(String(inv.status)) && cancelUuid !== inv.uuid && (
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive" onClick={() => { setCancelUuid(inv.uuid); setCancelReason(""); }}>
                      <Ban className="h-3 w-3" /> Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {cancelUuid && (
        <Card className="p-3 border-destructive/40 bg-destructive/5 space-y-2">
          <p className="text-xs font-semibold text-destructive">Cancel invoice? Blocked on paid invoices; cannot be undone.</p>
          <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (e.g. duplicate — replaced by INV-2026-0045)…" className="h-9 text-xs" />
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => void handleCancel()}>Confirm Cancel</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setCancelUuid(null); setCancelReason(""); }}>Back</Button>
          </div>
        </Card>
      )}
    </div>
  );
}