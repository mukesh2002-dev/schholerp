"use client";

import { useState } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { fetchIncidents, createIncidentApi, updateIncidentApi, fetchVehicles } from "@/lib/api/transport";

export default function IncidentsPage() {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));
  const [status, setStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [vehicleUuid, setVehicleUuid] = useState("");
  const [incidentType, setIncidentType] = useState("BREAKDOWN");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: incidents, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchIncidents({ campusId: cid, status: status === "all" ? undefined : status, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-incidents-${status}`,
  });

  const { data: vehicles } = useCampusData({
    fetcher: (cid) => fetchVehicles({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-vehicles-for-incident",
  });

  const save = async () => {
    if (!vehicleUuid || !description.trim()) {
      toast.error("Vehicle and description are required");
      return;
    }
    setSaving(true);
    try {
      await createIncidentApi({ vehicleUuid, incidentType, severity, description: description.trim(), location: location.trim() || undefined }, activeBranchId);
      toast.success("Incident logged");
      setDescription("");
      setLocation("");
      setShowForm(false);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to log incident");
    } finally {
      setSaving(false);
    }
  };

  const advance = async (row: any, next: string) => {
    try {
      await updateIncidentApi(row.uuid, { status: next });
      toast.success(`Incident ${next}`);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  const rows = (incidents.data as any[]);

  return (
    <SectionGuard>
      <TransportPageShell
        title="Vehicle Incidents"
        subtitle="Breakdown, accident, complaint and delay log. HIGH breakdowns automatically move the bus to UNDER_MAINTENANCE."
      >
        <Card className="p-3 border-border/70">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>)}</SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground">{rows.length} of {incidents.total} incidents</span>
            {canManage && (
              <Button size="sm" variant="gradient" className="h-9 text-xs gap-1 ml-auto" onClick={() => setShowForm((v) => !v)}>
                <Plus className="h-4 w-4" /> Log Incident
              </Button>
            )}
          </div>
          {showForm && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t">
              <Select value={vehicleUuid} onValueChange={setVehicleUuid}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Vehicle *" /></SelectTrigger>
                <SelectContent>{(vehicles.data as any[]).map((v: any) => <SelectItem key={v.uuid} value={v.uuid}>{v.registrationNumber}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["BREAKDOWN", "ACCIDENT", "COMPLAINT", "DELAY", "OTHER"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened? *" className="h-9 text-xs sm:col-span-2" />
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="h-9 text-xs" />
              <div className="sm:col-span-3"><Button size="sm" className="h-9 text-xs" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Incident"}</Button></div>
            </div>
          )}
        </Card>

        {isLoading && rows.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">Loading incidents…</Card>
        ) : rows.length === 0 ? (
          <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">No incidents — the fleet is running clean.</Card>
        ) : (
          <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r: any) => (
                  <TableRow key={r.uuid}>
                    <TableCell className="text-xs font-mono">{r.vehicle?.registrationNumber ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.incidentType}</Badge></TableCell>
                    <TableCell><Badge variant={r.severity === "CRITICAL" || r.severity === "HIGH" ? "destructive" : "secondary"} className="text-[10px]">{r.severity}</Badge></TableCell>
                    <TableCell className="text-xs max-w-64 truncate">{r.description}</TableCell>
                    <TableCell><Badge variant={r.status === "OPEN" ? "destructive" : "default"} className="text-[10px]">{r.status}</Badge></TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {r.status === "OPEN" && <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => advance(r, "IN_PROGRESS")}>Start</Button>}
                          {(r.status === "OPEN" || r.status === "IN_PROGRESS") && <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => advance(r, "RESOLVED")}>Resolve</Button>}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TransportPageShell>
    </SectionGuard>
  );
}
