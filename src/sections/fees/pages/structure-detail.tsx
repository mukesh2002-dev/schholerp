"use client";

import { useCallback, useEffect, useState } from "react";
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
import { ArrowLeft, Archive, CheckCircle2, Copy, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import {
  fetchFeeHeads,
  fetchFeeStructureDetail,
  updateFeeStructureApi,
  updateFeeStructureItemApi,
  addFeeStructureItemApi,
  deleteFeeStructureItemApi,
  deleteFeeStructureApi,
  rolloverFeeStructureApi,
  changeFeeStructureLifecycleApi,
} from "@/lib/api/fees";
import { fetchAcademicYears } from "@/lib/api/academics";

const FREQUENCIES = ["one_time", "monthly", "quarterly", "annual", "custom"];

export function StructureDetail({ uuid }: { uuid: string }) {
  const router = useRouter();
  const { activeBranchId } = useERP();

  const [s, setS] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [lateFineType, setLateFineType] = useState("fixed");
  const [lateFineAmount, setLateFineAmount] = useState("");
  const [gracePeriodDays, setGracePeriodDays] = useState("");
  const [maxFine, setMaxFine] = useState("");
  const [savingBasic, setSavingBasic] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lifecycleBusy, setLifecycleBusy] = useState(false);

  // Inline item edit
  const [editingItemUuid, setEditingItemUuid] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editFrequency, setEditFrequency] = useState("monthly");
  const [itemBusy, setItemBusy] = useState(false);

  // Add head
  const [newHeadId, setNewHeadId] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newFrequency, setNewFrequency] = useState("monthly");

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

  const { data: heads } = useCampusData({
    fetcher: () => fetchFeeHeads(),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeHeads>>,
    queryKeyPrefix: "fee-heads",
  });

  const loadDetail = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const d = await fetchFeeStructureDetail(uuid);
      setS(d);
      setName(d.name ?? "");
      setDueDay(String(d.dueDay ?? 10));
      setLateFineType(d.lateFineType ?? "fixed");
      setLateFineAmount(d.lateFineAmount != null ? String(d.lateFineAmount) : "");
      setGracePeriodDays(d.gracePeriodDays != null ? String(d.gracePeriodDays) : "");
      setMaxFine(d.maxFine != null ? String(d.maxFine) : "");
    } catch (err) {
      if (!silent) {
        toast.error(err instanceof Error ? err.message : "Load failed");
        setS(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleSaveBasic = async () => {
    setSavingBasic(true);
    try {
      await updateFeeStructureApi(uuid, {
        name: name.trim(),
        dueDay: Number(dueDay) || 10,
        lateFineType,
        lateFineAmount: Number(lateFineAmount) || 0,
        gracePeriodDays: Number(gracePeriodDays) || 0,
        maxFine: Number(maxFine) || 0,
      });
      toast.success("Structure updated");
      await loadDetail(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingBasic(false);
    }
  };

  const handleLifecycle = async (status: "APPROVED" | "ACTIVE" | "ARCHIVED") => {
    setLifecycleBusy(true);
    try {
      const updated = await changeFeeStructureLifecycleApi(uuid, status);
      setS(updated);
      toast.success(`Structure ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lifecycle update failed");
    } finally {
      setLifecycleBusy(false);
    }
  };

  const startEditItem = (it: any) => {
    setEditingItemUuid(it.uuid);
    setEditAmount(String(it.amount ?? ""));
    setEditFrequency(it.frequency ?? "monthly");
  };

  const saveItem = async (it: any) => {
    if (!editAmount || Number(editAmount) < 0) { toast.error("Enter a valid amount"); return; }
    setItemBusy(true);
    try {
      await updateFeeStructureItemApi(uuid, it.uuid, {
        amount: Number(editAmount),
        frequency: editFrequency,
      });
      toast.success("Amount updated");
      setEditingItemUuid(null);
      await loadDetail(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setItemBusy(false);
    }
  };

  const removeItem = async (it: any) => {
    if (!window.confirm(`Remove "${it.feeHead?.name ?? "fee head"}" from this structure?`)) return;
    setItemBusy(true);
    try {
      await deleteFeeStructureItemApi(uuid, it.uuid);
      toast.success("Fee head removed");
      await loadDetail(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setItemBusy(false);
    }
  };

  const addItem = async () => {
    if (!newHeadId) { toast.error("Select a fee head"); return; }
    if (!newAmount || Number(newAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    setItemBusy(true);
    try {
      await addFeeStructureItemApi(uuid, {
        feeHeadId: newHeadId,
        amount: Number(newAmount),
        frequency: newFrequency,
      });
      toast.success("Fee head added");
      setNewHeadId("");
      setNewAmount("");
      setNewFrequency("monthly");
      await loadDetail(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add failed");
    } finally {
      setItemBusy(false);
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

  const items = s.structureItems ?? [];
  const usedHeadIds = new Set(items.map((it: any) => String(it.feeHead?.uuid ?? "")));
  const availableHeads = heads.filter((h) => h.category !== "TRANSPORT" && !usedHeadIds.has(h.uuid));
  const archived = s.lifecycleStatus === "ARCHIVED";

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/fees/structures"><ArrowLeft className="h-3.5 w-3.5" /> Structures</Link></Button>
        <Badge variant="outline" className="text-[11px] font-mono">{formatCurrency(s.amount)}</Badge>
        <Badge variant={s.lifecycleStatus === "ACTIVE" ? "success" : s.lifecycleStatus === "ARCHIVED" ? "secondary" : "outline"} className="text-[11px] font-mono">
          {s.lifecycleStatus ?? "DRAFT"}
        </Badge>
        <div className="ml-auto flex gap-1.5">
          {s.lifecycleStatus === "DRAFT" && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" disabled={lifecycleBusy} onClick={() => void handleLifecycle("APPROVED")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
          )}
          {s.lifecycleStatus === "APPROVED" && (
            <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" disabled={lifecycleBusy} onClick={() => void handleLifecycle("ACTIVE")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Activate
            </Button>
          )}
          {s.lifecycleStatus !== "ARCHIVED" && (
            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 text-destructive" disabled={lifecycleBusy} onClick={() => void handleLifecycle("ARCHIVED")}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
          )}
        </div>
      </div>

      <Card className="p-3 border-border/70 bg-muted/20">
        <p className="text-[11px] text-muted-foreground">
          Lifecycle: <strong>DRAFT</strong> → <strong>APPROVED</strong> (reviewed, not live yet) → <strong>ACTIVE</strong> (live — assignments & invoices use it) → <strong>ARCHIVED</strong>.
          Approve requires class + academic year + at least one head with amount &gt; 0. Only one structure can be ACTIVE per class/year.
        </p>
      </Card>

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

        <div className="pt-2 border-t space-y-2">
          <h4 className="text-xs font-bold">Late Fine</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium">Fine Type</label>
              <Select value={lateFineType} onValueChange={setLateFineType}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="per_day">Per day</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Fine Amount</label>
              <Input type="number" min={0} value={lateFineAmount} onChange={(e) => setLateFineAmount(e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Grace Days</label>
              <Input type="number" min={0} value={gracePeriodDays} onChange={(e) => setGracePeriodDays(e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Max Fine</label>
              <Input type="number" min={0} value={maxFine} onChange={(e) => setMaxFine(e.target.value)} placeholder="0" className="mt-1" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Applied automatically to overdue invoices after the grace period. Use Manual Fine for one-off charges.</p>
        </div>

        <Button size="sm" onClick={() => void handleSaveBasic()} disabled={savingBasic} className="h-8 text-xs gap-1 w-fit">
          <Save className="h-3.5 w-3.5" /> {savingBasic ? "Saving…" : "Save changes"}
        </Button>
      </Card>

      <Card className="p-4 border-border/70 space-y-2">
        <h3 className="text-sm font-bold">Fee Heads ({items.length})</h3>
        <div className="rounded-xl border border-border/80 overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Head</TableHead><TableHead>Frequency</TableHead><TableHead>Billing Months</TableHead><TableHead className="text-right tabular-nums">Amount</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((it: any) => (
                <TableRow key={it.uuid}>
                  <TableCell className="text-xs font-semibold">{it.feeHead?.name ?? "—"}{it.isNewStudentOnly && <Badge variant="outline" className="text-[9px] ml-1">New-only</Badge>}</TableCell>
                  <TableCell className="text-xs">
                    {editingItemUuid === it.uuid ? (
                      <Select value={editFrequency} onValueChange={setEditFrequency}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : it.frequency}
                  </TableCell>
                  <TableCell className="text-xs">{(it.billingMonths ?? []).length ? (it.billingMonths as number[]).sort().join(", ") : "every month"}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {editingItemUuid === it.uuid ? (
                      <Input type="number" min={0} value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="h-7 w-24 ml-auto text-right" />
                    ) : formatCurrency(it.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {!archived && (
                      <div className="flex justify-end gap-1">
                        {editingItemUuid === it.uuid ? (
                          <>
                            <Button size="sm" className="h-7 text-[11px]" disabled={itemBusy} onClick={() => void saveItem(it)}>Save</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setEditingItemUuid(null)}><X className="h-3 w-3" /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] gap-1" onClick={() => startEditItem(it)}><Pencil className="h-3 w-3" /> Edit</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] text-destructive" disabled={itemBusy} onClick={() => void removeItem(it)}><Trash2 className="h-3 w-3" /></Button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">No items</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
        <p className="text-[11px] text-muted-foreground">Amounts are frozen once invoices exist — change fees via Rollover below (year isolation guarantee).</p>

        {!archived && (
          <div className="pt-2 border-t space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-1"><Plus className="h-3.5 w-3.5" /> Add Fee Head</h4>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-48">
                <label className="text-xs font-medium">Head</label>
                <Select value={newHeadId} onValueChange={setNewHeadId}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder={availableHeads.length ? "Select head" : "All heads already added"} /></SelectTrigger>
                  <SelectContent>{availableHeads.map((h) => <SelectItem key={h.uuid} value={h.uuid}>{h.name} ({h.category})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Amount</label>
                <Input type="number" min={0} value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="₹" className="mt-1 h-9 w-28" />
              </div>
              <div>
                <label className="text-xs font-medium">Frequency</label>
                <Select value={newFrequency} onValueChange={setNewFrequency}>
                  <SelectTrigger className="mt-1 h-9 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button size="sm" variant="gradient" className="h-9 text-xs gap-1" disabled={itemBusy || availableHeads.length === 0} onClick={() => void addItem()}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Use <strong>one_time</strong> for occasional fees like Exam Fee — invoice it only when needed from the Invoices page.</p>
          </div>
        )}
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
