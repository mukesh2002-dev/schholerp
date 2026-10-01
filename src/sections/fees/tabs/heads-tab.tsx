"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchFeeHeads, createFeeHeadApi, updateFeeHeadApi, deleteFeeHeadApi } from "@/lib/api/fees";

const CATEGORIES = ["ADMISSION", "TUITION", "ACADEMIC", "EXAMINATION", "TRANSPORT", "HOSTEL", "ACTIVITY", "LIBRARY", "LABORATORY", "SPORTS", "OTHER"];

export function HeadsTab() {
  const { activeBranchId } = useERP();
  const { data: heads, isLoading, refresh } = useCampusData({
    fetcher: () => fetchFeeHeads(),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeHeads>>,
    queryKeyPrefix: "fee-heads",
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("TUITION");
  const [description, setDescription] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);
  const [isRecurring, setIsRecurring] = useState(true);
  const [color, setColor] = useState("#3b82f6");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null); setName(""); setCategory("TUITION"); setDescription("");
    setIsMandatory(true); setIsRecurring(true); setColor("#3b82f6");
    setOpen(true);
  };

  const openEdit = (h: any) => {
    setEditing(h); setName(h.name ?? ""); setCategory(h.category ?? "TUITION");
    setDescription(h.description ?? ""); setIsMandatory(h.isMandatory ?? true);
    setIsRecurring(h.isRecurring ?? true); setColor(h.color ?? "#3b82f6");
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const payload = { name: name.trim(), category, description: description || undefined, isMandatory, isRecurring, color };
      if (editing) {
        await updateFeeHeadApi(editing.uuid, payload);
        toast.success("Fee head updated");
      } else {
        await createFeeHeadApi(payload);
        toast.success("Fee head created");
      }
      setOpen(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uuid: string, hname: string) => {
    if (!window.confirm(`Delete fee head "${hname}"? Blocked if used in structure items.`)) return;
    try {
      await deleteFeeHeadApi(uuid);
      toast.success("Fee head deleted");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} className="gap-1 h-8 text-xs"><Plus className="h-4 w-4" /> Add Fee Head</Button>
      </div>
      {isLoading && heads.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading fee heads…</Card>
      ) : heads.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">No fee heads</h3>
          <p className="text-xs text-muted-foreground mt-1">Create heads first (Tuition, Exam, Transport…) — structures are built from these.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heads.map((h) => (
            <Card key={h.uuid} className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: h.color ?? "#3b82f6" }} />
                  <h3 className="font-bold text-sm line-clamp-1">{h.name}</h3>
                  <Badge variant={h.isRecurring ? "secondary" : "outline"} className="text-[10px] ml-auto shrink-0">{h.isRecurring ? "Recurring" : "One-time"}</Badge>
                </div>
                {h.description && <p className="text-xs text-muted-foreground line-clamp-2">{h.description}</p>}
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{h.category}</Badge>
                  {h.isMandatory && <Badge variant="outline" className="text-[10px]">Mandatory</Badge>}
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => openEdit(h)}><Pencil className="h-3 w-3" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => void handleDelete(h.uuid, h.name)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "Add"} Fee Head</DialogTitle>
            <DialogDescription>Heads are the building blocks of every fee structure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium">Name *</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuition Fee" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-xs font-medium">Color</label><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 p-1" /></div>
            </div>
            <div><label className="text-xs font-medium">Description</label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={isMandatory} onChange={(e) => setIsMandatory(e.target.checked)} className="h-3.5 w-3.5 rounded border" /> Mandatory
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-3.5 w-3.5 rounded border" /> Recurring
              </label>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void handleSave()} disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
