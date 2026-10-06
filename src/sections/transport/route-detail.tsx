"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, Save, Pencil } from "lucide-react";
import {
  fetchRouteDetail,
  fetchVehicleDetail,
  updateRouteApi,
  updateRouteCrewApi,
  assignVehicleCrewApi,
  fetchVehicles,
  fetchDrivers,
  fetchHelpers,
  addRouteStopApi,
  updateRouteStopApi,
  deleteRouteStopApi,
  reorderRouteStopsApi,
  type TransportStop,
} from "@/lib/api/transport";
import { useERP } from "@/components/providers/erp-provider";

export function RouteDetail({ uuid }: { uuid: string }) {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));
  const [route, setRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Meta edit
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  // Stop add/edit
  const [showAdd, setShowAdd] = useState(false);
  const [nName, setNName] = useState("");
  const [nDist, setNDist] = useState("");
  const [nArrival, setNArrival] = useState("");
  const [nZone, setNZone] = useState("");
  const [nDrop, setNDrop] = useState("");
  const [nLandmark, setNLandmark] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<TransportStop | null>(null);
  const [eName, setEName] = useState("");
  const [eDist, setEDist] = useState("");
  const [eArrival, setEArrival] = useState("");
  const [eZone, setEZone] = useState("");
  const [eDrop, setEDrop] = useState("");
  const [eLandmark, setELandmark] = useState("");
  const [savingStop, setSavingStop] = useState(false);

  // Crew assignment
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [helpers, setHelpers] = useState<any[]>([]);
  const [selVehicle, setSelVehicle] = useState("");
  const [selDriver, setSelDriver] = useState("");
  const [selConductor, setSelConductor] = useState("");
  const [savingCrew, setSavingCrew] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchRouteDetail(uuid);
      setRoute(d);
      setName(d.name ?? "");
      setDescription(d.description ?? "");
      setStartTime(d.startTime ?? "");
      setEndTime(d.endTime ?? "");
      setSelVehicle(d.vehicle?.uuid ?? "");
      setSelDriver(d.driver?.uuid ?? "");
      const [v, dr, hp] = await Promise.all([
        fetchVehicles({ campusId: activeBranchId, limit: 100 }).catch(() => ({ data: [] })),
        fetchDrivers({ campusId: activeBranchId, limit: 100 }).catch(() => ({ data: [] })),
        fetchHelpers({ campusId: activeBranchId, limit: 100 }).catch(() => ({ data: [] })),
      ]);
      setVehicles(v.data as any[]);
      setDrivers(dr.data as any[]);
      setHelpers(hp.data as any[]);
      // Conductor bus par hota hai — route ki bus ka current conductor lao
      if (d.vehicle?.uuid) {
        try {
          const vd = await fetchVehicleDetail(d.vehicle.uuid);
          setSelConductor(vd?.conductor?.uuid ?? "");
        } catch {
          setSelConductor("");
        }
      } else {
        setSelConductor("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Load failed");
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [uuid]);

  const handleSaveCrew = async () => {
    setSavingCrew(true);
    try {
      const d = await updateRouteCrewApi(uuid, {
        vehicleId: selVehicle || null,
        driverId: selDriver || null,
      });
      setRoute((p: any) => ({ ...p, ...d }));
      // Conductor bus par lagta hai — route ki bus par set karo
      const busUuid = d.vehicle?.uuid ?? selVehicle;
      if (busUuid) {
        await assignVehicleCrewApi(busUuid, { conductorUuid: selConductor || null });
      } else if (selConductor) {
        toast.error("Conductor ke liye pehle bus select karo");
        return;
      }
      toast.success("Bus + Driver + Conductor assign ho gaye");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Crew update failed");
    } finally {
      setSavingCrew(false);
    }
  };

  const handleSaveMeta = async () => {
    if (!name.trim()) { toast.error("Route name is required"); return; }
    setSavingMeta(true);
    try {
      const d = await updateRouteApi(uuid, {
        name: name.trim(), description: description || undefined,
        startTime: startTime || undefined, endTime: endTime || undefined,
      });
      setRoute((p: any) => ({ ...p, ...d }));
      toast.success("Route updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingMeta(false);
    }
  };

  const handleAdd = async () => {
    if (!nName.trim()) { toast.error("Stop name is required"); return; }
    setAdding(true);
    try {
      await addRouteStopApi(uuid, {
        name: nName.trim(),
        distanceKm: nDist ? Number(nDist) : undefined,
        arrivalTime: nArrival || undefined,
        zoneCode: nZone || undefined,
        dropTime: nDrop || undefined,
        landmark: nLandmark || undefined,
      });
      toast.success(`Stop "${nName.trim()}" added`);
      setShowAdd(false);
      setNName(""); setNDist(""); setNArrival(""); setNZone(""); setNDrop(""); setNLandmark("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add failed");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (s: TransportStop) => {
    setEditing(s);
    setEName(s.name ?? "");
    setEDist(s.distanceKm != null ? String(s.distanceKm) : "");
    setEArrival(s.arrivalTime ?? "");
    setEZone((s as any).zoneCode ?? "");
    setEDrop((s as any).dropTime ?? "");
    setELandmark((s as any).landmark ?? "");
  };

  const handleEditSave = async () => {
    if (!editing || !eName.trim()) { toast.error("Stop name is required"); return; }
    setSavingStop(true);
    try {
      await updateRouteStopApi(uuid, editing.uuid, {
        name: eName.trim(),
        distanceKm: eDist ? Number(eDist) : null,
        arrivalTime: eArrival || null,
        zoneCode: eZone || null,
        dropTime: eDrop || null,
        landmark: eLandmark || null,
      } as any);
      toast.success("Stop updated");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingStop(false);
    }
  };

  const handleDelete = async (s: TransportStop) => {
    if (!window.confirm(`Remove stop "${s.name}"? Blocked if students actively ride here. Sequences renumber automatically.`)) return;
    try {
      await deleteRouteStopApi(uuid, s.uuid);
      toast.success("Stop removed, sequence renumbered");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const stops: TransportStop[] = [...(route?.stops ?? [])].sort((a, b) => a.sequence - b.sequence);
    const j = idx + dir;
    if (j < 0 || j >= stops.length) return;
    [stops[idx], stops[j]] = [stops[j], stops[idx]];
    try {
      await reorderRouteStopsApi(uuid, stops.map((s) => s.uuid));
      toast.success("Stops reordered");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed");
    }
  };

  if (loading) return <Card className="p-8 text-center text-xs text-muted-foreground">Loading route…</Card>;
  if (!route) return (
    <Card className="border-dashed p-10 text-center">
      <h3 className="font-semibold text-sm">Route not found</h3>
      <Button asChild variant="outline" size="sm" className="mt-3 h-8 text-xs"><Link href="/transport/routes">Back to routes</Link></Button>
    </Card>
  );

  const stops: TransportStop[] = [...(route.stops ?? [])].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/transport/routes"><ArrowLeft className="h-3.5 w-3.5" /> Routes</Link></Button>
        <Badge variant={route.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{route.status}</Badge>
        {(route.totalStudents != null) && (
          <span className="text-[11px] text-muted-foreground ml-auto">
            {route.activeStudents ?? 0} active / {route.totalStudents} total riders
            {route.capacityUtilization != null && ` • ${route.capacityUtilization}% full`}
          </span>
        )}
      </div>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">Route details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
          </div>
          <div><label className="text-xs font-medium">Start Time</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" /></div>
          <div><label className="text-xs font-medium">End Time</label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" /></div>
        </div>
        <div className="text-xs text-muted-foreground">
          Bus: <strong className="font-mono">{route.vehicle?.registrationNumber ?? "unassigned"}</strong> • Driver: <strong>{route.driver?.name ?? "unassigned"}</strong>
        </div>
        <Button size="sm" onClick={() => void handleSaveMeta()} disabled={savingMeta} className="h-8 text-xs gap-1 w-fit">
          <Save className="h-3.5 w-3.5" /> {savingMeta ? "Saving…" : "Save details"}
        </Button>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">Crew — Bus + Driver + Conductor</h3>
        {!canManage ? (
          <p className="text-xs text-muted-foreground">
            Bus: <strong className="font-mono">{route.vehicle?.registrationNumber ?? "—"}</strong> • Driver: <strong>{route.driver?.name ?? "—"}</strong>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium">Bus</label>
              <Select value={selVehicle || "none"} onValueChange={(v) => setSelVehicle(v === "none" ? "" : v)}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select bus" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No bus</SelectItem>
                  {vehicles.map((v: any) => <SelectItem key={v.uuid} value={v.uuid}>{v.registrationNumber} · {v.capacity} seats</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Driver</label>
              <Select value={selDriver || "none"} onValueChange={(v) => setSelDriver(v === "none" ? "" : v)}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select driver" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No driver</SelectItem>
                  {drivers.map((d: any) => <SelectItem key={d.uuid} value={d.uuid}>{d.name}{d.employeeId ? ` · ${d.employeeId}` : ""}{d.phone ? ` · ${d.phone}` : ""}{d.assignedVehicle ? ` · ${d.assignedVehicle.registrationNumber}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Conductor</label>
              <Select value={selConductor || "none"} onValueChange={(v) => setSelConductor(v === "none" ? "" : v)}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select conductor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No conductor</SelectItem>
                  {helpers.map((h: any) => <SelectItem key={h.uuid} value={h.uuid}>{h.name} · {h.role}{h.phone ? ` · ${h.phone}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button size="sm" variant="gradient" className="h-9 text-xs" disabled={savingCrew} onClick={() => void handleSaveCrew()}>
                {savingCrew ? "Saving…" : "Assign Crew"}
              </Button>
            </div>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">Conductor bus par save hota hai — route ki bus select hone par wahi conductor yaha dikhega aur manifest/parent portal me aayega.</p>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Stops ({stops.length}) — in pickup order</h3>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="h-3.5 w-3.5" /> Add Stop
          </Button>
        </div>

        {showAdd && (
          <div className="p-3 rounded-lg border bg-muted/20 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div><label className="text-xs font-medium">Name *</label><Input value={nName} onChange={(e) => setNName(e.target.value)} placeholder="Sector 14 Market" className="mt-1" /></div>
              <div><label className="text-xs font-medium">Distance (km)</label><Input type="number" step="0.1" value={nDist} onChange={(e) => setNDist(e.target.value)} className="mt-1" /></div>
              <div><label className="text-xs font-medium">Arrival</label><Input type="time" value={nArrival} onChange={(e) => setNArrival(e.target.value)} className="mt-1" /></div>
              <div><label className="text-xs font-medium">Zone (A/B/C)</label><Input value={nZone} onChange={(e) => setNZone(e.target.value)} placeholder="A" className="mt-1" /></div>
              <div><label className="text-xs font-medium">Drop time</label><Input type="time" value={nDrop} onChange={(e) => setNDrop(e.target.value)} className="mt-1" /></div>
              <div><label className="text-xs font-medium">Landmark</label><Input value={nLandmark} onChange={(e) => setNLandmark(e.target.value)} placeholder="Near SBI ATM" className="mt-1" /></div>
            </div>
            <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleAdd()} disabled={adding}>
              {adding ? "Adding…" : "Add stop at end"}
            </Button>
          </div>
        )}

        {stops.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">No stops yet — add the first pickup point above.</p>
        ) : (
          <div className="space-y-1.5">
            {stops.map((s, idx) => (
              <div key={s.uuid}>
                <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">{s.sequence}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {[s.distanceKm != null ? `${s.distanceKm} km` : null, s.arrivalTime, (s as any).zoneCode ? `Zone ${(s as any).zoneCode}` : null, (s as any).landmark].filter(Boolean).join(" • ") || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => void move(idx, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === stops.length - 1} onClick={() => void move(idx, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void handleDelete(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
                {editing?.uuid === s.uuid && (
                  <div className="ml-8 p-3 rounded-lg border bg-muted/20 space-y-2 mt-1">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div><label className="text-xs font-medium">Name *</label><Input value={eName} onChange={(e) => setEName(e.target.value)} className="mt-1" /></div>
                      <div><label className="text-xs font-medium">Distance (km)</label><Input type="number" step="0.1" value={eDist} onChange={(e) => setEDist(e.target.value)} className="mt-1" /></div>
                      <div><label className="text-xs font-medium">Arrival</label><Input type="time" value={eArrival} onChange={(e) => setEArrival(e.target.value)} className="mt-1" /></div>
                      <div><label className="text-xs font-medium">Zone</label><Input value={eZone} onChange={(e) => setEZone(e.target.value)} className="mt-1" /></div>
                      <div><label className="text-xs font-medium">Drop time</label><Input type="time" value={eDrop} onChange={(e) => setEDrop(e.target.value)} className="mt-1" /></div>
                      <div><label className="text-xs font-medium">Landmark</label><Input value={eLandmark} onChange={(e) => setELandmark(e.target.value)} className="mt-1" /></div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleEditSave()} disabled={savingStop}>
                        {savingStop ? "Saving…" : "Save stop"}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}