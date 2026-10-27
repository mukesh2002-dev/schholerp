"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Phone, RefreshCw, Search, ShieldCheck, UserCog, Users } from "lucide-react";
import {
  fetchDrivers,
  fetchRoutes,
  fetchTransportHelpers,
  fetchVehicles,
  type TransportDriver,
  type TransportHelper,
  type TransportRoute,
  type TransportVehicle,
} from "@/lib/api/transport";

type CrewRow = {
  key: string;
  role: string;
  name: string;
  phone?: string | null;
  status?: string | null;
  vehicle?: { uuid: string; registrationNumber: string } | null;
  route?: { uuid: string; name: string } | null;
};

const statusVariant = (status?: string | null) => {
  if (status === "ACTIVE") return "success" as const;
  if (status === "ON_LEAVE") return "warning" as const;
  if (status === "INACTIVE") return "rose" as const;
  return "outline" as const;
};

export function TransportCrew() {
  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [helpers, setHelpers] = useState<TransportHelper[]>([]);
  const [vehicles, setVehicles] = useState<TransportVehicle[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [d, h, v, r] = await Promise.all([
        fetchDrivers({ limit: 200 }),
        fetchTransportHelpers({ limit: 200 }),
        fetchVehicles({ limit: 200 }),
        fetchRoutes({ limit: 100 }),
      ]);
      setDrivers(d.data);
      setHelpers(h.data);
      setVehicles(v.data);
      setRoutes(r.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Crew load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const routeByVehicle = useMemo(() => {
    const map = new Map<string, { uuid: string; name: string }>();
    for (const v of vehicles) {
      if (v.assignedRoute) map.set(v.uuid, v.assignedRoute);
    }
    return map;
  }, [vehicles]);

  const rows = useMemo<CrewRow[]>(() => {
    const driverRows: CrewRow[] = drivers.map((d) => ({
      key: `driver-${d.uuid}`,
      role: "DRIVER",
      name: d.name,
      phone: d.phone,
      status: d.status,
      vehicle: d.assignedVehicle ?? null,
      route: d.assignedVehicle ? routeByVehicle.get(d.assignedVehicle.uuid) ?? null : null,
    }));
    const helperRows: CrewRow[] = helpers.map((h) => ({
      key: `helper-${h.uuid}`,
      role: h.role ?? "CONDUCTOR",
      name: h.name,
      phone: h.phone,
      status: h.status,
      vehicle: h.assignedVehicle ?? null,
      route: h.assignedVehicle ? routeByVehicle.get(h.assignedVehicle.uuid) ?? null : null,
    }));
    return [...driverRows, ...helperRows];
  }, [drivers, helpers, routeByVehicle]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter !== "all" && r.role !== roleFilter) return false;
      if (!term) return true;
      return (
        r.name.toLowerCase().includes(term) ||
        String(r.phone ?? "").toLowerCase().includes(term) ||
        String(r.vehicle?.registrationNumber ?? "").toLowerCase().includes(term) ||
        String(r.route?.name ?? "").toLowerCase().includes(term)
      );
    });
  }, [rows, search, roleFilter]);

  const unassigned = rows.filter((r) => !r.vehicle).length;
  const active = rows.filter((r) => r.status === "ACTIVE").length;

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> Total crew
          </div>
          <div className="text-xl font-bold mt-1">{rows.length}</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Active
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{active}</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <UserCog className="h-3 w-3" /> Drivers
          </div>
          <div className="text-xl font-bold mt-1">{drivers.length}</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Unassigned</div>
          <div className="text-xl font-bold text-amber-600 mt-1">{unassigned}</div>
        </Card>
      </div>

      <Card className="p-3 border-border/70 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / phone / vehicle / route"
            className="h-8 text-xs pl-7 w-72"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-8 text-xs w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="DRIVER">Driver</SelectItem>
            <SelectItem value="CONDUCTOR">Conductor</SelectItem>
            <SelectItem value="ATTENDANT">Attendant</SelectItem>
            <SelectItem value="AYAH">Ayah</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
        <div className="ml-auto flex gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
            <Link href="/transport/drivers">Manage drivers</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs">
            <Link href="/transport/fleet">Manage fleet</Link>
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-border/70 space-y-2">
        <h3 className="text-sm font-bold">Crew directory ({visible.length})</h3>
        {loading ? (
          <p className="text-xs text-muted-foreground p-4 text-center">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">
            Koi crew member nahi mila.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-1.5 pr-2">Name</th>
                  <th className="py-1.5 pr-2">Role</th>
                  <th className="py-1.5 pr-2">Phone</th>
                  <th className="py-1.5 pr-2">Vehicle</th>
                  <th className="py-1.5 pr-2">Route</th>
                  <th className="py-1.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.key} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 font-medium">{r.name}</td>
                    <td className="py-1.5 pr-2">
                      <Badge variant={r.role === "DRIVER" ? "info" : "secondary"} className="text-[9px]">
                        {r.role}
                      </Badge>
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {r.phone ? (
                        <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:underline">
                          <Phone className="h-3 w-3" /> {r.phone}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-[11px]">{r.vehicle?.registrationNumber ?? "—"}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">{r.route?.name ?? "—"}</td>
                    <td className="py-1.5">
                      <Badge variant={statusVariant(r.status)} className="text-[9px]">{r.status ?? "—"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
