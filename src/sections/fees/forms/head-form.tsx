"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import { fetchFeeHeads, createFeeHeadApi, updateFeeHeadApi } from "@/lib/api/fees";

const CATEGORIES = ["ADMISSION", "TUITION", "ACADEMIC", "EXAMINATION", "TRANSPORT", "HOSTEL", "ACTIVITY", "LIBRARY", "LABORATORY", "SPORTS", "OTHER"];

export function HeadForm({ uuid }: { uuid?: string }) {
  const router = useRouter();
  const isEdit = Boolean(uuid);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("TUITION");
  const [description, setDescription] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);
  const [isRecurring, setIsRecurring] = useState(true);
  const [color, setColor] = useState("#3b82f6");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!uuid) return;
    let cancelled = false;
    (async () => {
      try {
        // Backend exposes heads as a flat list (no GET by uuid) — resolve from list.
        const list = await fetchFeeHeads();
        const h = list.find((x) => x.uuid === uuid);
        if (!cancelled && h) {
          setName(h.name ?? "");
          setCategory(h.category ?? "TUITION");
          setDescription(h.description ?? "");
          setIsMandatory(h.isMandatory ?? true);
          setIsRecurring(h.isRecurring ?? true);
          setColor(h.color ?? "#3b82f6");
        }
        if (!cancelled && !h) toast.error("Fee head not found");
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uuid]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), category, description: description || undefined, isMandatory, isRecurring, color };
      if (isEdit && uuid) {
        await updateFeeHeadApi(uuid, payload);
        toast.success("Fee head updated");
        router.push("/fees/heads");
      } else {
        await createFeeHeadApi(payload);
        toast.success("Fee head created");
        router.push("/fees/heads");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card className="p-8 text-center text-xs text-muted-foreground">Loading head…</Card>;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/fees/heads"><ArrowLeft className="h-3.5 w-3.5" /> Fee Heads</Link></Button>
      </div>
      <Card className="p-4 border-border/70 space-y-3">
        <div>
          <label className="text-xs font-medium">Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuition Fee" className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Category *</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Color</label>
            <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-9 p-1" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" className="mt-1" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={isMandatory} onChange={(e) => setIsMandatory(e.target.checked)} className="h-3.5 w-3.5 rounded border" /> Mandatory
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-3.5 w-3.5 rounded border" /> Recurring
          </label>
        </div>
        <div className="flex gap-2 pt-1">
          <Button onClick={() => void handleSave()} disabled={saving} variant="gradient" className="gap-1">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : isEdit ? "Update Head" : "Create Head"}
          </Button>
          <Button asChild variant="outline"><Link href="/fees/heads">Cancel</Link></Button>
        </div>
      </Card>
    </div>
  );
}