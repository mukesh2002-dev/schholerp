"use client";

import { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Edit3, Copy, Search } from "lucide-react";
import { fetchClasses } from "@/lib/api/classes";
import { fetchAcademicYears } from "@/lib/api/academics";
import {
  fetchFeeStructures,
  fetchFeeHeads,
  createFeeStructureApi,
  deleteFeeStructureApi,
  rolloverFeeStructureApi,
  type BackendFeeStructureDetail,
} from "@/lib/api/fees";

const FREQUENCIES = ["one_time", "monthly", "quarterly", "annual", "custom"];
const MONTHS = [
  { v: 1, n: "Jan" }, { v: 2, n: "Feb" }, { v: 3, n: "Mar" }, { v: 4, n: "Apr" },
  { v: 5, n: "May" }, { v: 6, n: "Jun" }, { v: 7, n: "Jul" }, { v: 8, n: "Aug" },
  { v: 9, n: "Sep" }, { v: 10, n: "Oct" }, { v: 11, n: "Nov" }, { v: 12, n: "Dec" },
];

interface ItemDraft {
  feeHeadId: string;
  amount: string;
  frequency: string;
  billingMonths: number[];
  isNewStudentOnly: boolean;
}

const emptyItem = (headId = ""): ItemDraft => ({ feeHeadId: headId, amount: "", frequency: "monthly", billingMonths: [], isNewStudentOnly: false });

export function StructuresTab() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [q, setQ] = useState("");
  const { data: structures, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchFeeStructures({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeStructures>>,
    queryKeyPrefix: "fee-structures",
  });

  const { data: heads } = useCampusData({
    fetcher: () => fetchFeeHeads(),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeHeads>>,
    queryKeyPrefix: "fee-heads",
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

  // Create / edit
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BackendFeeStructureDetail | null>(null);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [yearId, setYearId] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [saving, setSaving] = useState(false);

  // Rollover
  const [rollOpen, setRollOpen] = useState(false);
  const [rollFrom, setRollFrom] = useState<any | null>(null);
  const [rollYearId, setRollYearId] = useState("");
  const [rollPct, setRollPct] = useState("");
  const [rollBusy, setRollBusy] = useState(false);

  const filtered = structures.filter((s: any) =>
    !q.trim() || s.name.toLowerCase().includes(q.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setClassId("");
    setYearId("");
    setDueDay("10");
    setItems([emptyItem(heads[0]?.uuid ?? "")]);
    setOpen(true);
  };

  const openEdit = (s: any) => {
    toast.info("Amount edits are blocked once invoices exist", {
      description: "Use Rollover to create next-year structure instead. Only name/dates can be edited here.",
    });
    setEditing(s);
    setName(s.name ?? "");
    setClassId(s.class?.uuid ?? "");
    setYearId(s.academicYear?.uuid ?? "");
    setDueDay(String(s.dueDay ?? 10));
    setItems(
      (s.structureItems ?? []).map((it: any) => ({
        feeHeadId: it.feeHead?.uuid ?? "",
        amount: String(it.amount ?? ""),
        frequency: it.frequency ?? "monthly",
        billingMonths: it.billingMonths ?? [],
        isNewStudentOnly: !!it.isNewStudentOnly,
      }))
    );
    setOpen(true);
  };

  const patchItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((p) => p.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const toggleItemMonth = (idx: number, m: number) =>
    patchItem(idx, { billingMonths: items[idx].billingMonths.includes(m) ? items[idx].billingMonths.filter((x) => x !== m) : [...items[idx].billingMonths, m] });

  const total = items.reduce((a, b) => a + Number(b.amount || 0), 0);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const list = items.filter((x) => x.feeHeadId && Number(x.amount) > 0);
    if (!editing && list.length === 0) { toast.error("Add at least one fee head with amount"); return; }
    setSaving(true);
    try {
      if (editing) {
        const { updateFeeStructureApi } = await import("@/lib/api/fees");
        await updateFeeStructureApi(editing.uuid, { name: name.trim(), dueDay: Number(dueDay) || 10 });
        toast.success("Structure updated");
      } else {
        await createFeeStructureApi({
          name: name.trim(),
          amount: total,
          frequency: list[0]?.frequency ?? "monthly",
          classId: classId || undefined,
          academicYearId: yearId || undefined,
          dueDay: Number(dueDay) || 10,
          items: list.map((x) => ({
            feeHeadId: x.feeHeadId,
            amount: Number(x.amount),
            frequency: x.frequency,
            billingMonths: x.billingMonths,
            billingTerms: [],
            isNewStudentOnly: x.isNewStudentOnly,
          })),
        }, branch);
        toast.success(`Structure created — ${formatCurrency(total)}`);
      }
      setOpen(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uuid: string, sname: string) => {
    if (!window.confirm(`Delete structure "${sname}"? Blocked if invoices exist.`)) return;
    try {
      await deleteFeeStructureApi(uuid);
      toast.success("Structure deleted");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleRollover = async () => {
    if (!rollFrom || !rollYearId) { toast.error("Pick target academic year"); return; }
    setRollBusy(true);
    try {
      const created = await rolloverFeeStructureApi({
        fromStructureId: rollFrom.uuid,
        toAcademicYearId: rollYearId,
        incrementPercent: rollPct ? Number(rollPct) : undefined,
        copyItems: true,
      });
      toast.success(`Rollover created: ${(created as any)?.name ?? "new structure"} (DRAFT)`);
      setRollOpen(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rollover failed");
    } finally {
      setRollBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-between flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search structures" className="pl-9 h-9 text-xs" />
        </div>
        <Button size="sm" onClick={openCreate} className="gap-1 h-8 text-xs"><Plus className="h-4 w-4" /> Add Structure</Button>
      </div>

      {isLoading && structures.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading structures…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">No fee structures</h3>
          <p className="text-xs text-muted-foreground mt-1">Create one per class per academic year: heads + amounts + billing months.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((s: any) => (
            <Card key={s.uuid} className="border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm line-clamp-1">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[s.class?.name, s.section?.name, s.academicYear?.name].filter(Boolean).join(" • ") || "All classes"}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono shrink-0">{formatCurrency(s.amount)}</Badge>
                </div>
                <div className="text-xs space-y-1 border-t pt-2">
                  {(s.structureItems ?? []).slice(0, 5).map((it: any) => (
                    <div key={it.uuid} className="flex justify-between">
                      <span className="text-muted-foreground">{it.feeHead?.name ?? "Head"} <span className="text-[10px]">({it.frequency})</span></span>
                      <span className="font-mono font-medium">{formatCurrency(it.amount)}</span>
                    </div>
                  ))}
                  {(s.structureItems ?? []).length > 5 && <div className="text-[11px] text-muted-foreground">+{(s.structureItems ?? []).length - 5} more heads</div>}
                  {(s.structureItems ?? []).length === 0 && <div className="text-[11px] text-muted-foreground">No items</div>}
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => openEdit(s)}><Edit3 className="h-3 w-3" /> Edit</Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => { setRollFrom(s); setRollYearId(""); setRollPct(""); setRollOpen(true); }}><Copy className="h-3 w-3" /> Rollover</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => void handleDelete(s.uuid, s.name)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Create"} Fee Structure</DialogTitle>
            <DialogDescription>One per class per academic year. Amounts freeze into invoices — use Rollover for next year.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Name *</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class 1 — 2026-2027" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Class</label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                  <SelectContent><SelectItem value="">All classes</SelectItem>{classes.map((c: any) => <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Academic Year</label>
                <Select value={yearId} onValueChange={setYearId}>
                  <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent><SelectItem value="">None</SelectItem>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Due Day</label><Input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} /></div>
            </div>
            {!editing && (
              <div className="space-y-2">
                <label className="text-xs font-medium">Fee Heads *</label>
                {items.map((it, idx) => (
                  <div key={idx} className="p-2 rounded-lg border space-y-2 bg-card">
                    <div className="flex gap-2">
                      <Select value={it.feeHeadId} onValueChange={(v) => patchItem(idx, { feeHeadId: v })}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select head" /></SelectTrigger>
                        <SelectContent>{heads.map((h) => <SelectItem key={h.uuid} value={h.uuid}>{h.name} ({h.category})</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={it.amount} onChange={(e) => patchItem(idx, { amount: e.target.value })} placeholder="₹" className="w-28" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setItems((p) => p.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={it.frequency} onValueChange={(v) => patchItem(idx, { frequency: v })}>
                        <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                      {it.frequency !== "monthly" && it.frequency !== "one_time" && (
                        <div className="flex flex-wrap gap-1">
                          {MONTHS.map((m) => (
                            <button key={m.v} onClick={() => toggleItemMonth(idx, m.v)} className={`px-1.5 py-0.5 rounded border text-[10px] ${it.billingMonths.includes(m.v) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40"}`}>{m.n}</button>
                          ))}
                        </div>
                      )}
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer ml-auto">
                        <input type="checkbox" checked={it.isNewStudentOnly} onChange={(e) => patchItem(idx, { isNewStudentOnly: e.target.checked })} className="h-3 w-3 rounded border" />
                        New students only
                      </label>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setItems((p) => [...p, emptyItem(heads[0]?.uuid ?? "")])} disabled={heads.length === 0}><Plus className="h-3 w-3" /> Add Head {heads.length === 0 && "(create heads first)"}</Button>
                <div className="text-xs font-mono text-right pt-1 border-t">Total: {formatCurrency(total)}</div>
              </div>
            )}
            {editing && <p className="text-[11px] text-muted-foreground">Items are locked (invoices may exist). Use Rollover for amount changes.</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void handleSave()} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rollover */}
      <Dialog open={rollOpen} onOpenChange={setRollOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Rollover to Next Year</DialogTitle><DialogDescription>{rollFrom ? `Copy "${rollFrom.name}" items into a new DRAFT structure. Old invoices never change.` : ""}</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Target Academic Year *</label>
              <Select value={rollYearId} onValueChange={setRollYearId}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium block mb-1">Fee Hike % (optional)</label><Input type="number" value={rollPct} onChange={(e) => setRollPct(e.target.value)} placeholder="e.g. 10" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRollOpen(false)}>Cancel</Button><Button variant="gradient" onClick={() => void handleRollover()} disabled={rollBusy}>{rollBusy ? "Copying…" : "Create DRAFT Copy"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
