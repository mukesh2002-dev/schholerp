"use client";

import Link from "next/link";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportSubnav } from "@/components/layout/transport-subnav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { fetchTransportDashboard, fetchCompliance, type TransportDashboard } from "@/lib/api/transport";
import { Bus, UserCog, MapPin, ArrowRight, Clock, ShieldAlert, Users, Receipt, Ban, HeartHandshake } from "lucide-react";

const EMPTY_DASH: TransportDashboard = {
  fleet: { total: 0, active: 0, underMaintenance: 0, retired: 0 },
  routes: { total: 0, active: 0 },
  students: { totalAssigned: 0, active: 0, discontinued: 0, suspended: 0 },
  staff: { drivers: { total: 0, active: 0, onLeave: 0 }, helpers: { total: 0, active: 0 } },
  todayBoarding: { expected: 0, boarded: 0, notBoarded: 0, notMarked: 0 },
  pendingTransportFee: 0,
  compliance: { expired: 0, danger: 0, warning: 0, caution: 0 },
  incidents: { open: 0, resolvedThisMonth: 0 },
};

export default function TransportOverviewPage() {
  const { activeBranchId } = useERP();

  const { data: dash, isLoading } = useCampusData({
    fetcher: (cid) => fetchTransportDashboard(cid),
    campusId: activeBranchId,
    fallback: EMPTY_DASH,
    queryKeyPrefix: "transport-dashboard",
  });
  const { data: compliance } = useCampusData({
    fetcher: (cid) => fetchCompliance({ campusId: cid, withinDays: 30, limit: 5 }),
    campusId: activeBranchId,
    fallback: { data: [], summary: {}, total: 0 },
    queryKeyPrefix: "transport-compliance-top",
  });

  const d = (dash ?? EMPTY_DASH) as TransportDashboard;
  const alerts = (compliance as any)?.data ?? [];

  const levelColor = (level: string) =>
    level === "EXPIRED" ? "destructive" : level === "DANGER" ? "destructive" : level === "WARNING" ? "secondary" : "outline";

  return (
    <SectionGuard>
      <div className="space-y-4 animate-in fade-in duration-300">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Transport & Fleet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Live fleet, boarding, compliance and fee position for this campus.</p>
        </div>
        <TransportSubnav />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => <Card key={i} className="h-20 animate-pulse bg-muted/30" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Vehicles", val: `${d.fleet.active}/${d.fleet.total} active`, sub: d.fleet.underMaintenance > 0 ? `${d.fleet.underMaintenance} in maintenance` : "fleet healthy", href: "/transport/fleet", Icon: Bus },
              { label: "Transport Students", val: String(d.students.active), sub: `${d.students.totalAssigned} ever assigned`, href: "/transport/assignments", Icon: Users },
              { label: "Today's Boarding", val: `${d.todayBoarding.boarded}/${d.todayBoarding.expected}`, sub: d.todayBoarding.notBoarded > 0 ? `${d.todayBoarding.notBoarded} not boarded` : "all marked", href: "/transport/trips", Icon: Clock },
              { label: "Pending Transport Fee", val: `₹${Number(d.pendingTransportFee ?? 0).toLocaleString("en-IN")}`, sub: "unpaid + partial", href: "/transport/fees", Icon: Receipt },
              { label: "Routes", val: `${d.routes.active}/${d.routes.total} active`, sub: "with ordered stops", href: "/transport/routes", Icon: MapPin },
              { label: "Drivers / Helpers", val: `${d.staff.drivers.active + d.staff.helpers.active}`, sub: `${d.staff.drivers.total} drivers · ${d.staff.helpers.total} helpers`, href: "/transport/drivers", Icon: UserCog },
              { label: "Compliance Alerts", val: String(d.compliance.expired + d.compliance.danger + d.compliance.warning + d.compliance.caution), sub: d.compliance.expired > 0 ? `${d.compliance.expired} expired` : "nothing expired", href: "/transport/fees", Icon: ShieldAlert },
              { label: "Open Incidents", val: String(d.incidents.open), sub: `${d.incidents.resolvedThisMonth} resolved this month`, href: "/transport/incidents", Icon: Ban },
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold">Top compliance alerts</h3>
                <Badge variant="outline" className="text-[10px] ml-auto">{(compliance as any)?.total ?? 0} within 30 days</Badge>
              </div>
              {alerts.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No expiring documents. All RC, insurance, fitness, permit, PUC and licenses are current.</p>
              ) : (
                <div className="space-y-1.5">
                  {alerts.map((a: any) => (
                    <div key={`${a.entity}-${a.uuid}-${a.docType}`} className="flex items-center gap-2 text-xs p-2 rounded-lg border bg-muted/20">
                      <Badge variant={levelColor(a.level) as any} className="text-[10px] shrink-0">{a.level}</Badge>
                      <span className="font-medium truncate">{a.label}</span>
                      <span className="text-muted-foreground text-[11px] truncate">{a.docType}</span>
                      <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{a.daysLeft < 0 ? `${-a.daysLeft}d overdue` : `${a.daysLeft}d left`}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold">Daily operations</h3>
              </div>
              <p className="text-[11px] text-muted-foreground">Conductors mark boarding from a mobile-friendly screen; parents see only their own child.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { href: "/transport/trips", title: "Boarding Attendance", desc: "PICKUP / DROP manifest + not-picked list" },
                  { href: "/transport/parent", title: "Parent Transport", desc: "Child bus, times, history, fee" },
                  { href: "/transport/assignments", title: "Student Allocation", desc: "Assign, suspend, transfer, discontinue" },
                  { href: "/transport/incidents", title: "Incidents & Maintenance", desc: "Breakdown log + service history" },
                ].map(({ href, title, desc }) => (
                  <Link key={href} href={href} className="group">
                    <div className="flex items-start gap-2 p-2 rounded-lg border bg-muted/20 hover:border-primary/40 transition-colors">
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold">{title}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">{desc}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="gradient" className="h-8 text-xs gap-1"><Link href="/transport/fleet/new"><Bus className="h-3.5 w-3.5" /> Add Vehicle</Link></Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1"><Link href="/transport/routes/new"><MapPin className="h-3.5 w-3.5" /> Add Route</Link></Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1"><Link href="/transport/assignments"><Users className="h-3.5 w-3.5" /> Assign Student</Link></Button>
        </div>
      </div>
    </SectionGuard>
  );
}
