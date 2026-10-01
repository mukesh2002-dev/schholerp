"use client";

import { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { fetchStudentLedger } from "@/lib/api/fees";

export function LedgerTab() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [studentId, setStudentId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ledger, setLedger] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!studentId.trim()) { toast.error("Enter a student UUID"); return; }
    setLoading(true);
    try {
      const data = await fetchStudentLedger({
        studentId: studentId.trim(),
        campusId: branch,
        from: from || undefined,
        to: to || undefined,
      });
      setLedger(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ledger failed");
      setLedger(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = ledger?.summary;
  const invoices: any[] = ledger?.invoices ?? [];
  const headWise: any[] = ledger?.headWise ?? [];

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-52">
            <label className="text-xs font-medium block mb-1">Student (UUID / admission no)</label>
            <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Paste student UUID" className="h-9 text-xs"
              onKeyDown={(e) => { if (e.key === "Enter") void load(); }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 text-xs" />
          </div>
          <Button size="sm" variant="gradient" className="h-9 text-xs gap-1" onClick={() => void load()} disabled={loading}>
            <Receipt className="h-3.5 w-3.5" /> {loading ? "Loading…" : "View Ledger"}
          </Button>
        </div>
      </Card>

      {ledger && (
        <>
          <Card className="border-border/70">
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-bold text-sm">{ledger.student?.name ?? `${ledger.student?.firstName ?? ""} ${ledger.student?.lastName ?? ""}`}</div>
                <span className="text-[11px] text-muted-foreground font-mono">Adm {ledger.student?.admissionNo ?? ""}{ledger.student?.class ? ` • ${typeof ledger.student.class === "string" ? ledger.student.class : ledger.student.class?.name ?? ""}` : ""}</span>
                <Badge variant={Number(summary?.balance ?? 0) > 0 ? "destructive" : "success"} className="ml-auto font-mono">Balance {formatCurrency(summary?.balance ?? 0)}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {[["Billed", summary?.totalBilled], ["Paid", summary?.totalPaid], ["Discount", summary?.totalDiscount], ["Late Fee", summary?.totalLateFee], ["Balance", summary?.balance]].map(([label, val]) => (
                  <div key={label as string} className="p-2 rounded-lg bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    <div className="font-bold font-mono">{formatCurrency(val ?? 0)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
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
                  <TableHead className="text-right tabular-nums">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-6">No invoices in range.</TableCell></TableRow>
                ) : invoices.map((inv: any) => (
                  <TableRow key={inv.uuid}>
                    <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-xs">{inv.billingPeriod ?? "—"}</TableCell>
                    <TableCell className="text-xs">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(inv.paidAmount ?? 0)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">{formatCurrency(inv.balance ?? Number(inv.amount ?? 0) - Number(inv.paidAmount ?? 0))}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{inv.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {headWise.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
              <div className="px-4 py-2 text-xs font-bold border-b">Head-wise breakup</div>
              <Table>
                <TableHeader><TableRow><TableHead>Head</TableHead><TableHead className="text-right tabular-nums">Billed</TableHead></TableRow></TableHeader>
                <TableBody>
                  {headWise.map((h: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-semibold">{h.headName ?? h.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatCurrency(h.billed ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
