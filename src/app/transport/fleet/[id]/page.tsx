"use client";

import { use, useState } from "react";
import Link from "next/link";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { ArrowLeft, ShieldAlert, ShieldCheck, Wrench, Ban } from "lucide-react";
import { fetchVehicleDetail, fetchVehicleMaintenance, fetchIncidents, fetchDrivers, fetchHelpers, assignVehicleCrewApi } from "@/lib/api/transport";

function CrewAssign({ vehicleUuid, currentDriver, currentConductor, onDone }: { vehicleUuid: string; currentDriver?: string | null; currentConductor?: string | null; onDone: () => void }) {
  const { activeBranchId } = useERP();
  const [driver, setDriver] = useState(currentDriver ?? "");
  const [conductor, setConductor] = useState(currentConductor ?? "");
  const [saving, setSaving] = useState(false);

  const { data: drivers } = useCampusData({
    fetcher: (cid) => fetchDrivers({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-drivers-for-crew",
  });
  const { data: helpers } = useCampusData({
    fetcher: (cid) => fetchHelpers({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-helpers-for-crew",
  });

  const save = async () => {
    setSaving(true);
    try {
      await assignVehicleCrewApi(vehicleUuid, { driverUuid: driver || null, conductorUuid: conductor || null });
      toast.success("Driver + conductor assign ho gaye");
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Assign failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div>
        <label className="text-xs font-medium">Driver</label>
        <Select value={driver || "none"} onValueChange={(v) => setDriver(v === "none" ? "" : v)}>
          <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select driver" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No driver</SelectItem>
            {(drivers.data as any[]).map((d: any) => <SelectItem key={d.uuid} value={d.uuid}>{d.name}{d.employeeId ? ` · ${d.employeeId}` : ""}{d.phone ? ` · ${d.phone}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium">Conductor / Helper</label>
        <Select value={conductor || "none"} onValueChange={(v) => setConductor(v === "none" ? "" : v)}>
          <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select conductor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No conductor</SelectItem>
            {(helpers.data as any[]).map((h: any) => <SelectItem key={h.uuid} value={h.uuid}>{h.name} · {h.role}{h.phone ? ` · ${h.phone}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button size="sm" variant="gradient" className="h-9 text-xs" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : "Assign"}
        </Button>
      </div>
    </div>
  );
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeBranchId } = useERP();

  const { data: v, isLoading, refresh } = useCampusData({
    fetcher: () => fetchVehicleDetail(id),
    campusId: activeBranchId,
    fallback: null,
    queryKeyPrefix: `transport-vehicle-${id}`,
  });
  const { data: maintenance } = useCampusData({
    fetcher: () => fetchVehicleMaintenance(id),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: `transport-vehicle-maint-${id}`,
  });
  const { data: incidents } = useCampusData({
    fetcher: (cid) => fetchIncidents({ campusId: cid, vehicleUuid: id, limit: 20 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-vehicle-inc-${id}`,
  });

  const detail: any = v;
  const levelColor = (level: string) =>
    level === "EXPIRED" || level === "DANGER" ? "destructive" : level === "WARNING" ? "secondary" : "outline";

  return (
    <SectionGuard>
      <TransportPageShell
        title={detail?.registrationNumber ?? "Vehicle"}
        subtitle={detail ? `${detail.vehicleType} · ${detail.capacity} seats · ${detail.status}` : "Loading vehicle…"}
        actions={<Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1"><Link href="/transport/fleet"><ArrowLeft className="h-3.5 w-3.5" /> Fleet</Link></Button>}
      >
        {isLoading || !detail ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">Loading vehicle detail…</Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-sm font-bold">Vehicle information</h3>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[["Brand", detail.brand], ["Model", detail.model], ["Year", detail.year], ["Color", detail.color], ["Fuel", detail.fuelType], ["Odometer", `${detail.odometerKm ?? 0} km`], ["GPS", detail.gpsDeviceId], ["Route", detail.assignedRoute?.name]].map(([k, val]) => (
                    <div key={k} className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">{k}</div><div className="font-medium">{val ?? "—"}</div></div>
                  ))}
                </div>
                <h3 className="text-sm font-bold pt-1">Crew</h3>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">Driver</div><div className="font-medium">{detail.driver?.name ?? "—"}</div></div>
                  <div className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">Conductor</div><div className="font-medium">{detail.conductor?.name ?? "—"}</div></div>
                </div>
                <CrewAssign
                  vehicleUuid={detail.uuid}
                  currentDriver={detail.driver?.uuid}
                  currentConductor={detail.conductor?.uuid}
                  onDone={() => refresh()}
                />
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">Students {detail.currentStudentsCount ?? 0}{detail.utilizationPct != null ? ` · ${detail.utilizationPct}%` : ""}</Badge>
                  <Badge variant={detail.openIncidents > 0 ? "destructive" : "outline"} className="text-[10px]">{detail.openIncidents ?? 0} open incidents</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {(detail.compliance ?? []).every((c: any) => ["OK", "UNKNOWN"].includes(c.level)) ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                  <h3 className="text-sm font-bold">Compliance</h3>
                </div>
                {(detail.compliance ?? []).map((c: any) => (
                  <div key={c.key} className="flex items-center gap-2 text-xs p-2 rounded-lg border bg-muted/20">
                    <Badge variant={levelColor(c.level) as any} className="text-[10px] shrink-0">{c.level}</Badge>
                    <span className="font-medium">{c.label}</span>
                    <span className="ml-auto text-muted-foreground font-mono text-[11px]">{c.expiry ? String(c.expiry).slice(0, 10) : "—"}{c.daysLeft != null ? ` · ${c.daysLeft}d` : ""}</span>
                  </div>
                ))}
                <h3 className="text-sm font-bold pt-1">Safety equipment</h3>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(detail.safetyEquipment ?? {}).map(([k, val]) => (
                    <Badge key={k} variant={val ? "default" : "outline"} className="text-[10px]">{k}: {val ? "YES" : "NO"}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-bold">Maintenance</h3></div>
                {((maintenance as any[]) ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No service records.</p>
                ) : (
                  ((maintenance as any[]) ?? []).slice(0, 6).map((m: any) => (
                    <div key={m.uuid} className="flex items-center gap-2 text-xs p-2 rounded-lg border bg-muted/20">
                      <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
                      <span className="font-medium">{m.maintenanceType}</span>
                      <span className="ml-auto text-muted-foreground font-mono text-[11px]">{String(m.maintenanceDate).slice(0, 10)}{m.cost != null ? ` · ₹${m.cost}` : ""}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2"><Ban className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-bold">Incidents</h3></div>
                {(((incidents as any)?.data ?? []) as any[]).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No incidents for this vehicle.</p>
                ) : (
                  (((incidents as any)?.data ?? []) as any[]).slice(0, 6).map((r: any) => (
                    <div key={r.uuid} className="flex items-center gap-2 text-xs p-2 rounded-lg border bg-muted/20">
                      <Badge variant="outline" className="text-[10px]">{r.incidentType}</Badge>
                      <Badge variant={r.severity === "HIGH" || r.severity === "CRITICAL" ? "destructive" : "secondary"} className="text-[10px]">{r.severity}</Badge>
                      <span className="ml-auto text-muted-foreground">{r.status}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </TransportPageShell>
    </SectionGuard>
  );
}
