"use client";

import { useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Plus, Bus, Search, MapPin, Users } from "lucide-react";
import { fetchRoutes } from "@/lib/api/transport";

export function RoutesList() {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));
  const [search, setSearch] = useState("");

  const { data: routes, isLoading } = useCampusData({
    fetcher: (cid) => fetchRoutes({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-routes",
  });

  const filtered = (routes.data as any[]).filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return `${r.name} ${r.description ?? ""} ${r.vehicle?.registrationNumber ?? ""} ${r.driver?.name ?? ""} ${r.vehicle?.conductor?.name ?? ""}`.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route / bus / driver…" className="pl-9 h-9 text-xs" />
          </div>
          <span className="text-[11px] text-muted-foreground">{filtered.length} of {routes.total} routes</span>
          {canManage && (
            <Button asChild size="sm" variant="gradient" className="h-9 text-xs gap-1 ml-auto">
              <Link href="/transport/routes/new"><Plus className="h-4 w-4" /> Add Route</Link>
            </Button>
          )}
        </div>
      </Card>

      {isLoading && filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading routes…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <Bus className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-sm">No routes</h3>
            <p className="text-xs text-muted-foreground mt-1">Create routes with ordered stops — each stop later maps to a fee zone.</p>
          </div>
          {canManage && <Button asChild size="sm" className="h-8 text-xs gap-1"><Link href="/transport/routes/new"><Plus className="h-3.5 w-3.5" /> Add the first route</Link></Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((r: any) => (
            <Card key={r.uuid} className="border-border/60">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/transport/routes/${r.uuid}`} className="font-bold text-sm line-clamp-1 hover:text-primary transition-colors">{r.name}</Link>
                    {r.description && <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>}
                  </div>
                  <Badge variant={r.status === "ACTIVE" ? "success" : "outline"} className="text-[10px] shrink-0">{r.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground border-t pt-2">
                  <span className="flex items-center gap-1"><Bus className="h-3 w-3" /> {r.vehicle?.registrationNumber ?? "No bus"}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.driver?.name ?? "No driver"}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.vehicle?.conductor?.name ?? "No conductor"}</span>
                  {r.startTime && <span className="font-mono">{r.startTime}{r.endTime ? ` → ${r.endTime}` : ""}</span>}
                  {r.totalKm != null && <span>{r.totalKm} km</span>}
                </div>
                {(r.stops ?? []).length > 0 && (
                  <div className="border-t pt-2 space-y-1">
                    {(r.stops as any[]).slice(0, 6).map((st: any) => (
                      <div key={st.uuid} className="flex items-center gap-2 text-xs">
                        <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{st.sequence}</span>
                        <span className="flex-1 min-w-0 truncate">{st.name}</span>
                        {st.distanceKm != null && <span className="text-muted-foreground shrink-0">{st.distanceKm} km</span>}
                        {st.arrivalTime && <span className="font-mono text-muted-foreground shrink-0">{st.arrivalTime}</span>}
                      </div>
                    ))}
                    {(r.stops ?? []).length > 6 && <div className="text-[11px] text-muted-foreground">+{(r.stops ?? []).length - 6} more stops</div>}
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {(r.stops ?? []).length} stops</div>
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs mt-1 w-fit"><Link href={`/transport/routes/${r.uuid}`}>Manage stops →</Link></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}