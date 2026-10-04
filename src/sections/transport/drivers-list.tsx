"use client";

import { useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, Phone, Car } from "lucide-react";
import { fetchDrivers } from "@/lib/api/transport";

const STATUSES = ["all", "ACTIVE", "ON_LEAVE", "INACTIVE"];

export function DriversList() {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data: drivers, isLoading } = useCampusData({
    fetcher: (cid) => fetchDrivers({ campusId: cid, status: status === "all" ? undefined : status, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-drivers-${status}`,
  });

  const filtered = (drivers.data as any[]).filter((d) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return `${d.name} ${d.employeeId ?? ""} ${d.phone ?? ""} ${d.licenseNumber ?? ""}`.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / ID / license…" className="pl-9 h-9 text-xs" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[11px] text-muted-foreground">{filtered.length} of {drivers.total} drivers</span>
          {canManage && (
            <Button asChild size="sm" variant="gradient" className="h-9 text-xs gap-1 ml-auto">
              <Link href="/transport/drivers/new"><Plus className="h-4 w-4" /> Add Driver</Link>
            </Button>
          )}
        </div>
      </Card>

      {isLoading && filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading drivers…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <Car className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-sm">No drivers</h3>
            <p className="text-xs text-muted-foreground mt-1">Add drivers with license number + expiry for compliance tracking.</p>
          </div>
          {canManage && <Button asChild size="sm" className="h-8 text-xs gap-1"><Link href="/transport/drivers/new"><Plus className="h-3.5 w-3.5" /> Add the first driver</Link></Button>}
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License</TableHead>
                <TableHead>License Expiry</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Assigned Vehicle</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d: any) => (
                <TableRow key={d.uuid} className="hover:bg-muted/40">
                  <TableCell className="text-sm font-semibold">{d.name}</TableCell>
                  <TableCell className="font-mono text-xs">{d.employeeId ?? "—"}</TableCell>
                  <TableCell className="text-xs"><span className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{d.phone ?? "—"}</span></TableCell>
                  <TableCell className="font-mono text-xs">{d.licenseNumber ?? "—"}</TableCell>
                  <TableCell>
                    {d.licenseExpiry ? (
                      (() => {
                        const dl = Math.ceil((new Date(d.licenseExpiry).getTime() - Date.now()) / 86400000);
                        return <Badge variant={dl < 0 ? "destructive" : dl <= 30 ? "warning" : "success"} className="text-[10px]">{dl < 0 ? `expired ${-dl}d ago` : `${dl}d left`}</Badge>;
                      })()
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-xs">{d.experienceYears != null ? `${d.experienceYears} yrs` : "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{d.assignedVehicle?.registrationNumber ?? "Unassigned"}</TableCell>
                  <TableCell><Badge variant={d.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{d.status ?? "—"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}