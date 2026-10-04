"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Copy, Save, Trash2 } from "lucide-react";
import {
  fetchFeeStructureDetail,
  updateFeeStructureApi,
  deleteFeeStructureApi,
  rolloverFeeStructureApi,
} from "@/lib/api/fees";
import { fetchAcademicYears } from "@/lib/api/academics";

export function StructureDetail({ uuid }: { uuid: string }) {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [s, setS] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [savingBasic, setSavingBasic] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Rollover
  const [rollYearId, setRollYearId] = useState("");
  const [rollPct, setRollPct] = useState("");
  const [rollBusy, setRollBusy] = useState(false);

  const { data: years } = useCampusData({
    fetcher: (cid) => fetchAcademicYears({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAcademicYears>>,
    queryKeyPrefix: "academic-years",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await fetchFeeStructureDetail(uuid);
        if (!cancelled) {
          setS(d);
          setName(d.name ?? "");
          setDueDay(String(d.dueDay ?? 10));
        }
      } catch (err) {
        if (!cancelled) { toast.error(err instanceof Error ? err.message : "Load failed"); setS(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uuid]);

  const handleSaveBasic = async () => {
    setSavingBasic(true);
    try {
      await updateFeeStructureApi(uuid, { name: name.trim(), dueDay: Number(dueDay) || 10 });
      toast.success("Structure updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingBasic(false);
    }
  };

  const handleRollover = async () => {
    if (!rollYearId) { toast.error("Pick target academic year"); return; }
    setRollBusy(true);
    try {
      const created = await rolloverFeeStructureApi({
        fromStructureId: uuid,
        toAcademicYearId: rollYearId,
        incrementPercent: rollPct ? Number(rollPct) : undefined,
        copyItems: true,
      });
      toast.success(`Rollover created: ${(created as any)?.name ?? "new structure"} (DRAFT)`);
      router.push(`/fees/structures/${(created as any).uuid}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rollover failed");
    } finally {
      setRollBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${s?.name}"? Blocked if invoices exist.`)) return;
    setDeleting(true);
    try {
      await deleteFeeStructureApi(uuid);
      toast.success("Structure deleted");
      router.push("/fees/structures");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Card className="p-8 text-center text-xs text-muted-foreground">Loading structure…</Card>;
  if (!s) return (
    <Card className="border-dashed p-10 text-center">
      <h3 className="font-semibold text-sm">Structure not found</h3>
      <Button asChild variant="outline" size="sm" className="mt-3 h-8 text-xs"><Link href="/fees/structures">Back to list</Link></Button>
    </Card>
  );

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/fees/structures"><ArrowLeft className="h-3.5 w-3.5" /> Structures</Link></Button>
        <Badge variant="outline" className="text-[11px] font-mono">{formatCurrency(s.amount)}</Badge>
      </div>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">Basics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Due Day</label>
            <Input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {[s.class?.name, s.section?.name, s.academicYear?.name].filter(Boolean).join(" • ") || "All classes"}
        </div>
        <Button size="sm" onClick={() => void handleSaveBasic()} disabled={savingBasic} className="h-8 text-xs gap-1 w-fit">
          <Save className="h-3.5 w-3.5" /> {savingBasic ? "Saving…" : "Save changes"}
        </Button>
      </Card>

      <Card className="p-4 border-border/70 space-y-2">
        <h3 className="text-sm font-bold">Fee Heads ({(s.structureItems ?? []).length})</h3>
        <div className="rounded-xl border border-border/80 overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Head</TableHead><TableHead>Frequency</TableHead><TableHead>Billing Months</TableHead><TableHead className="text-right tabular-nums">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              {(s.structureItems ?? []).map((it: any) => (
                <TableRow key={it.uuid}>
                  <TableCell className="text-xs font-semibold">{it.feeHead?.name ?? "—"}{it.isNewStudentOnly && <Badge variant="outline" className="text-[9px] ml-1">New-only</Badge>}</TableCell>
                  <TableCell className="text-xs">{it.frequency}</TableCell>
                  <TableCell className="text-xs">{(it.billingMonths ?? []).length ? (it.billingMonths as number[]).sort().join(", ") : "every month"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(it.amount)}</TableCell>
                </TableRow>
              ))}
              {(s.structureItems ?? []).length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">No items</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <p className="text-[11px] text-muted-foreground">Amounts are frozen once invoices exist — change fees via Rollover below (year isolation guarantee).</p>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Copy className="h-4 w-4" /> Rollover to next year</h3>
        <p className="text-xs text-muted-foreground">Creates a NEW DRAFT structure for the target year with these items copied (+ optional % hike). This structure and every old invoice stay untouched.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Target Academic Year *</label>
            <Select value={rollYearId} onValueChange={setRollYearId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Fee Hike % (optional)</label>
            <Input type="number" value={rollPct} onChange={(e) => setRollPct(e.target.value)} placeholder="e.g. 10" className="mt-1" />
          </div>
        </div>
        <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" onClick={() => void handleRollover()} disabled={rollBusy}>
          <Copy className="h-3.5 w-3.5" /> {rollBusy ? "Copying…" : "Create DRAFT Copy"}
        </Button>
      </Card>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-destructive" onClick={() => void handleDelete()} disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting…" : "Delete structure"}
        </Button>
      </div>
    </div>
  );
}