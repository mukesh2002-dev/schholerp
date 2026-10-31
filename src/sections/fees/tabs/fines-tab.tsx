"use client";

import { useEffect, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, ShieldOff, X } from "lucide-react";
import {
  fetchAdjustments,
  fetchFines,
  createAdjustmentApi,
  waiveFineApi,
  searchStudentsForCollection,
} from "@/lib/api/fees";

function studentName(s: any) {
  if (!s) return "—";
  return `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "—";
}

export function FinesTab() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 400);
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<any | null>(null);

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [saving, setSaving] = useState(false);

  const [waiveTarget, setWaiveTarget] = useState<any | null>(null);
  const [waiveAmount, setWaiveAmount] = useState("");
  const [waiveReason, setWaiveReason] = useState("");
  const [waiving, setWaiving] = useState(false);

  const { data: adjustments, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchAdjustments({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAdjustments>>,
    queryKeyPrefix: "fee-adjustments",
  });

  const { data: fines, refresh: refreshFines } = useCampusData({
    fetcher: (cid) => fetchFines({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFines>>,
    queryKeyPrefix: "fee-fines",
  });

  useEffect(() => {
    const text = debounced.trim();
    if (text.length < 2) { setResults([]); return; }
    let cancelled = false;
    (async () => {
      setSearching(true);
      try {
        const list = await searchStudentsForCollection({ query: text, campusId: branch });
        if (!cancelled) setResults(list);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, branch]);

  const manualFines = adjustments.filter((a: any) => a.adjustmentType === "FINE");
  const waivers = fines.filter((f: any) => f.fineType === "WAIVER");

  const pickStudent = (s: any) => {
    setStudent(s);
    setResults([]);
    setQuery("");
  };

  const handleAddFine = async () => {
    if (!student?.uuid) { toast.error("Select a student"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!reason.trim()) { toast.error("Reason is required"); return; }
    setSaving(true);
    try {
      await createAdjustmentApi(
        {
          studentId: student.uuid,
          invoiceId: invoiceId.trim() || undefined,
          amount: Number(amount),
          adjustmentType: "FINE",
          reason: reason.trim(),
        },
        branch
      );
      toast.success("Fine added");
      setStudent(null);
      setAmount("");
      setReason("");
      setInvoiceId("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add fine failed");
    } finally {
      setSaving(false);
    }
  };

  const startWaive = (adjustment: any) => {
    setWaiveTarget(adjustment);
    setWaiveAmount(String(adjustment.amount ?? ""));
    setWaiveReason("");
  };

  const handleWaive = async () => {
    if (!waiveTarget?.student?.uuid) { toast.error("Student missing on this fine"); return; }
    if (!waiveAmount || Number(waiveAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!waiveReason.trim()) { toast.error("Waive reason is required"); return; }
    setWaiving(true);
    try {
      await waiveFineApi(
        {
          studentId: waiveTarget.student.uuid,
          invoiceId: waiveTarget.invoice?.uuid,
          amount: Number(waiveAmount),
          reason: waiveReason.trim(),
        },
        branch
      );
      toast.success("Fine waived");
      setWaiveTarget(null);
      setWaiveAmount("");
      setWaiveReason("");
      void refresh();
      void refreshFines();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Waive failed");
    } finally {
      setWaiving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Plus className="h-4 w-4" /> Add Manual Fine</h3>
        <p className="text-[11px] text-muted-foreground">One-off fine (late library book, damage, discipline, exam malpractice). For automatic late-payment fines, set Late Fine on the Fee Structure.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <label className="text-xs font-medium">Student *</label>
            {student ? (
              <div className="mt-1 flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/30">
                <span className="text-xs font-semibold">{studentName(student)}</span>
                <span className="text-[11px] text-muted-foreground font-mono">{student.admissionNo ?? student.uuid}</span>
                <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => setStudent(null)}><X className="h-3.5 w-3.5" /></Button>
              </div>
            ) : (
              <>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student by name / admission no…" className="pl-9 h-9 text-xs" />
                </div>
                {(searching || results.length > 0) && (
                  <div className="mt-1 rounded-md border bg-card max-h-48 overflow-y-auto">
                    {searching && <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>}
                    {results.map((s) => (
                      <button key={s.uuid} type="button" onClick={() => pickStudent(s)} className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center justify-between">
                        <span className="font-semibold">{studentName(s)}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{s.admissionNo ?? ""}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div>
            <label className="text-xs font-medium">Amount (₹) *</label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-9" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium">Reason *</label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Late library return" className="mt-1 h-9" />
          </div>
          <div>
            <label className="text-xs font-medium">Invoice (optional)</label>
            <Input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="Invoice UUID" className="mt-1 h-9" />
          </div>
        </div>

        <Button size="sm" variant="gradient" className="h-8 text-xs gap-1 w-fit" disabled={saving} onClick={() => void handleAddFine()}>
          <Plus className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Add Fine"}
        </Button>
      </Card>

      {waiveTarget && (
        <Card className="p-4 border-amber-500/40 bg-amber-500/5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Waive Fine — {studentName(waiveTarget.student)}</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWaiveTarget(null)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium">Amount (₹) *</label>
              <Input type="number" min={0} value={waiveAmount} onChange={(e) => setWaiveAmount(e.target.value)} className="mt-1 h-9" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium">Waive Reason *</label>
              <Input value={waiveReason} onChange={(e) => setWaiveReason(e.target.value)} placeholder="Why is this fine being waived?" className="mt-1 h-9" />
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1" disabled={waiving} onClick={() => void handleWaive()}>
            <ShieldOff className="h-3.5 w-3.5" /> {waiving ? "Saving…" : "Confirm Waive"}
          </Button>
        </Card>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-bold">Manual Fines</h3>
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right tabular-nums">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && manualFines.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">Loading fines…</TableCell></TableRow>
              ) : manualFines.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">No manual fines yet.</TableCell></TableRow>
              ) : manualFines.map((a: any) => (
                <TableRow key={a.uuid}>
                  <TableCell className="text-xs font-semibold">
                    {studentName(a.student)}
                    <span className="block text-[11px] text-muted-foreground font-mono">{a.student?.admissionNo ?? ""}</span>
                  </TableCell>
                  <TableCell className="text-xs max-w-64 truncate">{a.reason ?? "—"}</TableCell>
                  <TableCell className="text-xs font-mono">{a.invoice?.invoiceNumber ?? "—"}</TableCell>
                  <TableCell className="text-xs">{a.createdAt ? formatDate(a.createdAt) : "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-rose-600">{formatCurrency(a.amount ?? 0)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => startWaive(a)}>
                      <ShieldOff className="h-3 w-3" /> Waive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold">Waived Fines</h3>
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Waived On</TableHead>
                <TableHead className="text-right tabular-nums">Waived</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waivers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">No waivers yet.</TableCell></TableRow>
              ) : waivers.map((f: any) => (
                <TableRow key={f.uuid}>
                  <TableCell className="text-xs font-semibold">
                    {studentName(f.student)}
                    <span className="block text-[11px] text-muted-foreground font-mono">{f.student?.admissionNo ?? ""}</span>
                  </TableCell>
                  <TableCell className="text-xs max-w-64 truncate">{f.waiveReason ?? "—"}</TableCell>
                  <TableCell className="text-xs font-mono">{f.invoice?.invoiceNumber ?? "—"}</TableCell>
                  <TableCell className="text-xs">{f.waivedAt ? formatDate(f.waivedAt) : "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(f.waivedAmount ?? 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
