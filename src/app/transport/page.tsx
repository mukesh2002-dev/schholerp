"use client";

import Link from "next/link";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportSubnav } from "@/components/layout/transport-subnav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { fetchVehicles, fetchDrivers, fetchRoutes } from "@/lib/api/transport";
import { Bus, UserCog, MapPin, ArrowRight, Clock, Wrench, ShieldAlert, Users, Receipt, BarChart3, Ban, FlaskConical } from "lucide-react";

const PENDING = [
  { title: "Student Assignments", desc: "Assign students to routes/stops, discontinue, suspend", Icon: Users },
  { title: "Daily Trips & Boarding", desc: "Conductor marks boarding; not-picked safety list", Icon: Clock },
  { title: "Fee Slabs & Billing", desc: "Zone-based monthly transport fee, linked to invoices", Icon: Receipt },
  { title: "Compliance Expiry", desc: "License/insurance/permit alerts 30/15/7 days", Icon: ShieldAlert },
  { title: "Incidents", desc: "Breakdown / accident / complaint log", Icon: Ban },
  { title: "Maintenance & Reports", desc: "Service log, utilization, revenue by zone", Icon: BarChart3 },
];

export default function TransportOverviewPage() {
  const { activeBranchId } = useERP();

  const { data: vehicles } = useCampusData({
    fetcher: (cid) => fetchVehicles({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-vehicles-all",
  });
  const { data: drivers } = useCampusData({
    fetcher: (cid) => fetchDrivers({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-drivers-all",
  });
  const { data: routes } = useCampusData({
    fetcher: (cid) => fetchRoutes({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-routes-all",
  });

  const vs = vehicles.data as any[];
  const active = vs.filter((v) => v.status === "ACTIVE").length;
  const maintenance = vs.filter((v) => v.status === "UNDER_MAINTENANCE").length;
  const stopsTotal = (routes.data as any[]).reduce((a, r) => a + (r.stops?.length ?? 0), 0);
  const seats = vs.filter((v) => v.status === "ACTIVE").reduce((a, v) => a + Number(v.capacity ?? 0), 0);

  return (
    <SectionGuard>
      <div className="space-y-4 animate-in fade-in duration-300">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Transport & Fleet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Vehicle registry, drivers and routes — the foundation before student assignments and daily trips.</p>
        </div>
        <TransportSubnav />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Vehicles", val: `${active}/${vs.length} active`, sub: maintenance > 0 ? `${maintenance} in maintenance` : undefined, href: "/transport/fleet", Icon: Bus },
            { label: "Drivers", val: String(drivers.total), sub: `${(drivers.data as any[]).filter((d) => d.assignedVehicle).length} assigned to buses`, href: "/transport/drivers", Icon: UserCog },
            { label: "Routes", val: String(routes.total), sub: `${stopsTotal} stops total`, href: "/transport/routes", Icon: MapPin },
            { label: "Active Seats", val: String(seats), sub: "capacity across active fleet", href: "/transport/fleet", Icon: Wrench },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="border-border/70 hover:border-primary/40 transition-colors">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><s.Icon className="h-3.5 w-3.5" /> {s.label}</div>
                  <div className="text-base font-bold font-mono">{s.val}</div>
                  {s.sub && <div className="text-[10px] text-muted-foreground">{s.sub}</div>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: "/transport/fleet", title: "Fleet (Vehicles)", desc: "Register buses/vans, status, insurance & fitness expiry", Icon: Bus },
            { href: "/transport/drivers", title: "Drivers", desc: "License + expiry compliance, vehicle assignment", Icon: UserCog },
            { href: "/transport/routes", title: "Routes & Stops", desc: "Ordered stops with distance and timing", Icon: MapPin },
          ].map(({ href, title, desc, Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="border-border/70 hover:border-primary/40 transition-colors h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                    <span className="font-semibold text-sm">{title}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-border/60">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-bold">Coming after backend module ships</h3>
              <Badge variant="outline" className="text-[10px] ml-auto">transport_fleet.md parts 5–11</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">These pages appear automatically once the backend endpoints exist — the UI plan is already mapped:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {PENDING.map(({ title, desc, Icon }) => (
                <div key={title} className="flex items-start gap-2 p-2 rounded-lg border bg-muted/20">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold">{title}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="gradient" className="h-8 text-xs gap-1"><Link href="/transport/fleet/new"><Bus className="h-3.5 w-3.5" /> Add Vehicle</Link></Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1"><Link href="/transport/routes/new"><MapPin className="h-3.5 w-3.5" /> Add Route</Link></Button>
        </div>
      </div>
    </SectionGuard>
  );
}