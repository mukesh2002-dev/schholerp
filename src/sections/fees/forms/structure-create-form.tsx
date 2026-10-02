"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import { fetchFeeHeads, createFeeStructureApi } from "@/lib/api/fees";
import { fetchClasses } from "@/lib/api/classes";
import { fetchAcademicYears } from "@/lib/api/academics";

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

export function StructureCreateForm() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [yearId, setYearId] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [saving, setSaving] = useState(false);

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

  // Start with one empty row once heads are loaded
  useMemo(() => {
    if (items.length === 0 && heads.length > 0) setItems([emptyItem(heads[0].uuid)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heads.length]);

  const patchItem = (idx: number, patch: Partial<ItemDraft>) =>
    setItems((p) => p.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const toggleItemMonth = (idx: number, m: number) =>
    patchItem(idx, { billingMonths: items[idx].billingMonths.includes(m) ? items[idx].billingMonths.filter((x) => x !== m) : [...items[idx].billingMonths, m] });

  const total = items.reduce((a, b) => a + Number(b.amount || 0), 0);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    const list = items.filter((x) => x.feeHeadId && Number(x.amount) > 0);
    if (list.length === 0) { toast.error("Add at least one fee head with amount"); return; }
    setSaving(true);
    try {
      const created = await createFeeStructureApi({
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
      router.push(`/fees/structures/${created.uuid}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <Card className="p-4 border-border/70 space-y-3">
        <div>
          <label className="text-xs font-medium">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class 1 — 2026-2027" className="mt-1" />
          <p className="text-[11px] text-muted-foreground mt-1">Convention: Class — Academic Year. One active plan per class per year.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Class</label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="All classes" /></SelectTrigger>
              <SelectContent><SelectItem value="">All classes</SelectItem>{classes.map((c: any) => <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Academic Year</label>
            <Select value={yearId} onValueChange={setYearId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select year" /></SelectTrigger>
              <SelectContent><SelectItem value="">None</SelectItem>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Due Day (1–31)</label>
            <Input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="mt-1" />
          </div>
        </div>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Fee Heads *</h3>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setItems((p) => [...p, emptyItem(heads[0]?.uuid ?? "")])} disabled={heads.length === 0}>
            <Plus className="h-3 w-3" /> Add Head {heads.length === 0 && "(create heads first)"}
          </Button>
        </div>
        {heads.length === 0 && (
          <p className="text-xs text-amber-600">No fee heads yet — <Link href="/fees/heads/new" className="underline">create a head first</Link>.</p>
        )}
        {items.map((it, idx) => (
          <div key={idx} className="p-3 rounded-lg border space-y-2 bg-muted/30">
            <div className="flex gap-2">
              <Select value={it.feeHeadId} onValueChange={(v) => patchItem(idx, { feeHeadId: v })}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select head" /></SelectTrigger>
                <SelectContent>{heads.map((h) => <SelectItem key={h.uuid} value={h.uuid}>{h.name} ({h.category})</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" value={it.amount} onChange={(e) => patchItem(idx, { amount: e.target.value })} placeholder="₹ amount" className="w-32" />
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
                New students only (admission fee)
              </label>
            </div>
          </div>
        ))}
        <div className="text-sm font-mono text-right pt-2 border-t">Total: <strong>{formatCurrency(total)}</strong></div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => void handleSave()} disabled={saving} variant="gradient" className="gap-1">
          <Save className="h-4 w-4" /> {saving ? "Creating…" : "Create Structure"}
        </Button>
        <Button asChild variant="outline"><Link href="/fees/structures">Cancel</Link></Button>
      </div>
    </div>
  );
}