"use client";

import { useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Bus, Search, UserCog, Wrench, ArrowRight } from "lucide-react";
import { fetchVehicles, updateVehicleApi } from "@/lib/api/transport";
import { fetchDrivers } from "@/lib/api/transport";
import { fetchRoutes } from "@/lib/api/transport";

const STATUSES = ["all", "ACTIVE", "UNDER_MAINTENANCE", "RETIRED"];
const todayISO = () => new Date().toISOString().split("T")[0];

function daysLeft(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function ExpiryBadge({ label, date }: { label: string; date?: string | null }) {
  const dl = daysLeft(date);
  if (dl === null) return <Badge variant="outline" className="text-[10px]">{label}: —</Badge>;
  const variant = dl < 0 ? "destructive" : dl <= 30 ? "warning" : "success";
  return (
    <Badge variant={variant} className="text-[10px]">
      {label}: {dl < 0 ? `expired ${-dl}d ago` : `${dl}d left`}
    </Badge>
  );
}

export function VehiclesList() {
  const { activeBranchId, session } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const { data: vehicles, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchVehicles({ campusId: cid, status: status === "all" ? undefined : status, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-vehicles-${status}`,
  });

  const filtered = (vehicles.data as any[]).filter((v) => {
    if (!debouncedSearch.trim()) return true;
    const s = debouncedSearch.toLowerCase();
    return `${v.registrationNumber} ${v.brand ?? ""} ${v.model ?? ""}`.toLowerCase().includes(s);
  });

  // Inline status/maintenance panel
  const [edit, setEdit] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editInsurance, setEditInsurance] = useState("");
  const [editFitness, setEditFitness] = useState("");
  const [editNextService, setEditNextService] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = (v: any) => {
    setEdit(v);
    setEditStatus(v.status ?? "ACTIVE");
    setEditInsurance(v.insuranceExpiry ? String(v.insuranceExpiry).split("T")[0] : "");
    setEditFitness(v.fitnessCertificateExpiry ? String(v.fitnessCertificateExpiry).split("T")[0] : "");
    setEditNextService(v.nextServiceDate ? String(v.nextServiceDate).split("T")[0] : "");
  };

  const handleSave = async () => {
    if (!edit) return;
    setSaving(true);
    try {
      await updateVehicleApi(edit.uuid, {
        status: editStatus,
        insuranceExpiry: editInsurance || undefined,
        fitnessCertificateExpiry: editFitness || undefined,
        nextServiceDate: editNextService || undefined,
      });
      toast.success(`${edit.registrationNumber} updated`);
      setEdit(null);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reg no / brand…" className="pl-9 h-9 text-xs" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[11px] text-muted-foreground">{filtered.length} of {vehicles.total} vehicles</span>
          {canManage && (
            <Button asChild size="sm" variant="gradient" className="h-9 text-xs gap-1 ml-auto">
              <Link href="/transport/fleet/new"><Plus className="h-4 w-4" /> Add Vehicle</Link>
            </Button>
          )}
        </div>
      </Card>

      {isLoading && filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading fleet…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <Bus className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-sm">No vehicles</h3>
            <p className="text-xs text-muted-foreground mt-1">Register buses/vans with capacity + insurance + fitness dates.</p>
          </div>
          {canManage && <Button asChild size="sm" className="h-8 text-xs gap-1"><Link href="/transport/fleet/new"><Plus className="h-3.5 w-3.5" /> Add the first vehicle</Link></Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((v: any) => (
            <Card key={v.uuid} className="border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm font-mono">{v.registrationNumber}</div>
                    <div className="text-xs text-muted-foreground">{[v.brand, v.model, v.year].filter(Boolean).join(" • ") || v.vehicleType}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={v.status === "ACTIVE" ? "success" : v.status === "UNDER_MAINTENANCE" ? "warning" : "destructive"} className="text-[10px]">
                      {v.status === "UNDER_MAINTENANCE" ? "MAINTENANCE" : v.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{v.vehicleType} • {v.capacity} seats</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 border-t pt-2">
                  <ExpiryBadge label="Insurance" date={v.insuranceExpiry} />
                  <ExpiryBadge label="Fitness" date={v.fitnessCertificateExpiry} />
                  {v.nextServiceDate && <ExpiryBadge label="Service" date={v.nextServiceDate} />}
                </div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 border-t pt-2">
                  <span className="flex items-center gap-1"><UserCog className="h-3 w-3" /> {v.driver?.name ?? "No driver"}</span>
                  <span className="flex items-center gap-1"><Bus className="h-3 w-3" /> {v.assignedRoute?.name ?? "No route"}</span>
                  {v.gpsDeviceId && <span className="font-mono">GPS {v.gpsDeviceId}</span>}
                </div>
                {canManage && (
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1" onClick={() => openEdit(v)}>
                    <Wrench className="h-3 w-3" /> Status & compliance
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {edit && (
        <Card className="p-4 border-primary/40 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">{edit.registrationNumber} — status & compliance</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEdit(null)}>Close</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">Status</label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</SelectItem>
                  <SelectItem value="RETIRED">RETIRED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Insurance expiry</label>
              <Input type="date" value={editInsurance} onChange={(e) => setEditInsurance(e.target.value)} className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Fitness cert expiry</label>
              <Input type="date" value={editFitness} onChange={(e) => setEditFitness(e.target.value)} className="h-9 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Next service date</label>
              <Input type="date" value={editNextService} onChange={(e) => setEditNextService(e.target.value)} className="h-9 text-xs" />
            </div>
          </div>
          <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Card>
      )}
    </div>
  );
}