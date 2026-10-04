"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, MapPin } from "lucide-react";
import { createRouteApi } from "@/lib/api/transport";
import { useERP } from "@/components/providers/erp-provider";

interface StopDraft {
  name: string;
  distanceKm: string;
  arrivalTime: string;
}

export function RouteForm() {
  const router = useRouter();
  const { activeBranchId, branches, session } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;
  // rules.md: campus-scoped roles create only in OWN campus.
  const isGlobal = session?.rawRole === "super_admin" || session?.rawRole === "admin" || session?.role === "ADMIN";
  const ownCampus = (session as any)?.campusUuid as string | undefined;

  const [campusId, setCampusId] = useState(branch ?? ownCampus ?? "");

  useEffect(() => {
    if (!isGlobal && ownCampus) setCampusId(ownCampus);
  }, [isGlobal, ownCampus]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalKm, setTotalKm] = useState("");
  const [stops, setStops] = useState<StopDraft[]>([{ name: "", distanceKm: "", arrivalTime: "" }]);
  const [saving, setSaving] = useState(false);

  const patchStop = (idx: number, patch: Partial<StopDraft>) =>
    setStops((p) => p.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const handleSave = async () => {
    if (!campusId) { toast.error("Select a campus"); return; }
    if (!name.trim()) { toast.error("Route name is required"); return; }
    const list = stops.filter((s) => s.name.trim());
    if (list.length === 0) { toast.error("Add at least one stop with a name"); return; }
    setSaving(true);
    try {
      await createRouteApi({
        name: name.trim(),        description: description || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        totalKm: totalKm ? Number(totalKm) : undefined,
        stops: list.map((s, idx) => ({
          name: s.name.trim(),
          sequence: idx + 1,
          distanceKm: s.distanceKm ? Number(s.distanceKm) : undefined,
          arrivalTime: s.arrivalTime || undefined,
        })),
        campusUuid: campusId,
      }, branch);
      toast.success(`Route "${name.trim()}" created with ${list.length} stops`);
      router.push("/transport/routes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/transport/routes"><ArrowLeft className="h-3.5 w-3.5" /> Routes</Link></Button>
      </div>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">Route details</h3>
        <div>
          <label className="text-xs font-medium">Campus *</label>
          <Select value={campusId} onValueChange={setCampusId} disabled={!isGlobal}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select campus" /></SelectTrigger>
            <SelectContent>{(branches as any[]).map((b: any) => <SelectItem key={b.id ?? b.uuid} value={b.id ?? b.uuid}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          {!isGlobal && <p className="text-[10px] text-muted-foreground mt-1">Locked to your campus ({(session as any)?.campusName ?? "assigned campus"}) — cross-campus creates are blocked by policy.</p>}
        </div>
        <div>
          <label className="text-xs font-medium">Route Name *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Route 4 — Sector 14 to School" className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Covers Sector 14, 15, 16…" className="mt-1" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-xs font-medium">Start Time</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" /></div>
          <div><label className="text-xs font-medium">End Time</label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" /></div>
          <div><label className="text-xs font-medium">Total KM</label><Input type="number" step="0.1" value={totalKm} onChange={(e) => setTotalKm(e.target.value)} className="mt-1" /></div>
        </div>
        <p className="text-[11px] text-muted-foreground">Vehicle and driver are assigned later from Fleet / crew management once backend crew endpoints are live.</p>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Stops (in order)</h3>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setStops((p) => [...p, { name: "", distanceKm: "", arrivalTime: "" }])}>
            <Plus className="h-3 w-3" /> Add Stop
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Stops are numbered automatically top-to-bottom. Distance later maps the stop to a fee zone.</p>
        {stops.map((st, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">{idx + 1}</span>
            <Input value={st.name} onChange={(e) => patchStop(idx, { name: e.target.value })} placeholder="Stop name (e.g. Sector 14 Market)" className="flex-1" />
            <Input type="number" step="0.1" value={st.distanceKm} onChange={(e) => patchStop(idx, { distanceKm: e.target.value })} placeholder="km" className="w-20" />
            <Input type="time" value={st.arrivalTime} onChange={(e) => patchStop(idx, { arrivalTime: e.target.value })} className="w-28" />
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setStops((p) => p.filter((_, i) => i !== idx))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => void handleSave()} disabled={saving} variant="gradient" className="gap-1">
          <Save className="h-4 w-4" /> {saving ? "Creating…" : "Create Route"}
        </Button>
        <Button asChild variant="outline"><Link href="/transport/routes">Cancel</Link></Button>
      </div>
    </div>
  );
}