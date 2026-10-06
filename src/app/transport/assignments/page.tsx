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
import { Plus, Search } from "lucide-react";
import {
  fetchAssignments, createAssignmentApi, suspendAssignmentApi, reinstateAssignmentApi,
  discontinueAssignmentApi, fetchRoutes, fetchRouteDetail,
} from "@/lib/api/transport";

const STATUSES = ["all", "ACTIVE", "SUSPENDED", "DISCONTINUED", "TRANSFERRED"];

export default function AssignmentsPage() {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));
  const [status, setStatus] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [routeUuid, setRouteUuid] = useState("");
  const [stopUuid, setStopUuid] = useState("");
  const [studentUuid, setStudentUuid] = useState("");
  const [stops, setStops] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: assignments, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchAssignments({ campusId: cid, status: status === "all" ? undefined : status, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-assignments-${status}`,
  });

  const { data: routes } = useCampusData({
    fetcher: (cid) => fetchRoutes({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-routes-for-assign",
  });

  const onRouteChange = async (uuid: string) => {
    setRouteUuid(uuid);
    setStopUuid("");
    try {
      const detail = await fetchRouteDetail(uuid);
      setStops(detail.stops ?? []);
    } catch {
      setStops([]);
    }
  };

  const save = async () => {
    if (!studentUuid.trim() || !routeUuid || !stopUuid) {
      toast.error("Student, route and stop are required");
      return;
    }
    setSaving(true);
    try {
      await createAssignmentApi({ studentUuid: studentUuid.trim(), routeUuid, stopUuid }, activeBranchId);
      toast.success("Student assigned to transport");
      setStudentUuid("");
      setShowForm(false);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Assignment failed");
    } finally {
      setSaving(false);
    }
  };

  const act = async (fn: () => Promise<any>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    }
  };

  const filtered = (assignments.data as any[]).filter((a) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return `${a.student?.name ?? ""} ${a.student?.admissionNo ?? ""} ${a.route?.name ?? ""}`.toLowerCase().includes(s);
  });

  return (
    <SectionGuard>
      <TransportPageShell
        title="Student Transport Allocation"
        subtitle="Assign students to a route + stop. Zone and monthly fee snapshot from the stop; suspend, reinstate, transfer or discontinue from here."
      >
        <Card className="p-3 border-border/70">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student / route…" className="pl-9 h-9 text-xs" />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>)}</SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground">{filtered.length} of {assignments.total} assignments</span>
            {canManage && (
              <Button size="sm" variant="gradient" className="h-9 text-xs gap-1 ml-auto" onClick={() => setShowForm((v) => !v)}>
                <Plus className="h-4 w-4" /> Assign Student
              </Button>
            )}
          </div>
          {showForm && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t">
              <Input value={studentUuid} onChange={(e) => setStudentUuid(e.target.value)} placeholder="Student UUID *" className="h-9 text-xs font-mono" />
              <Select value={routeUuid} onValueChange={onRouteChange}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Route *" /></SelectTrigger>
                <SelectContent>{(routes.data as any[]).map((r: any) => <SelectItem key={r.uuid} value={r.uuid}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={stopUuid} onValueChange={setStopUuid}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Stop *" /></SelectTrigger>
                <SelectContent>{stops.map((s: any) => <SelectItem key={s.uuid} value={s.uuid}>{s.sequence}. {s.name}{s.zoneCode ? ` · Zone ${s.zoneCode}` : ""}</SelectItem>)}</SelectContent>
              </Select>
              <div className="text-[11px] text-muted-foreground self-center">Fee auto-resolved from stop zone.</div>
              <Button size="sm" className="h-9 text-xs" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          )}
        </Card>

        {isLoading && filtered.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">Loading assignments…</Card>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">No assignments in this view.</Card>
        ) : (
          <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Route / Stop</TableHead>
                  <TableHead>Times</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a: any) => (
                  <TableRow key={a.uuid}>
                    <TableCell className="text-xs">
                      <div className="font-medium">{a.student?.name}</div>
                      <div className="text-muted-foreground text-[11px]">{a.student?.admissionNo} · {a.student?.class ?? "—"}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium">{a.route?.name}</div>
                      <div className="text-muted-foreground text-[11px]">{a.stopName ?? "—"}</div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{a.pickupTime ?? "—"} / {a.dropTime ?? "—"}</TableCell>
                    <TableCell className="text-xs">{a.feePerMonth != null ? `₹${a.feePerMonth}/mo${a.zoneCode ? ` · ${a.zoneCode}` : ""}` : "—"}</TableCell>
                    <TableCell><Badge variant={a.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">{a.status}</Badge></TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {a.status === "ACTIVE" && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => act(() => suspendAssignmentApi(a.uuid, "Suspended from portal"), "Suspended")}>Suspend</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-[11px] text-destructive" onClick={() => act(() => discontinueAssignmentApi(a.uuid, {}), "Discontinued")}>Stop</Button>
                            </>
                          )}
                          {a.status === "SUSPENDED" && (
                            <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => act(() => reinstateAssignmentApi(a.uuid), "Reinstated")}>Reinstate</Button>
                          )}
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
