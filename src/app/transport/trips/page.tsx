"use client";

import { useState } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Check, X, Phone } from "lucide-react";
import { fetchRoutes, fetchTripManifest, fetchNotPicked, markBoardingApi } from "@/lib/api/transport";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TripsPage() {
  const { activeBranchId } = useERP();
  const [routeUuid, setRouteUuid] = useState("");
  const [tripType, setTripType] = useState("PICKUP");
  const [marks, setMarks] = useState<Record<string, { boarded: boolean; reason?: string }>>({});
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { data: routes } = useCampusData({
    fetcher: (cid) => fetchRoutes({ campusId: cid, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "transport-routes-for-trips",
  });

  const { data: manifest, isLoading } = useCampusData({
    fetcher: () => (routeUuid ? fetchTripManifest({ routeUuid, date: todayStr(), tripType }) : Promise.resolve(null)),
    campusId: activeBranchId,
    fallback: null,
    enabled: !!routeUuid,
    queryKeyPrefix: `transport-manifest-${routeUuid}-${tripType}-${reloadKey}`,
  });

  const { data: notPicked } = useCampusData({
    fetcher: () => (routeUuid ? fetchNotPicked({ routeUuid, date: todayStr(), tripType }) : Promise.resolve(null)),
    campusId: activeBranchId,
    fallback: null,
    enabled: !!routeUuid,
    queryKeyPrefix: `transport-notpicked-${routeUuid}-${tripType}-${reloadKey}`,
  });

  const students: any[] = (manifest as any)?.students ?? [];
  const summary = (manifest as any)?.summary ?? { expected: 0, boarded: 0, notBoarded: 0, notMarked: 0 };

  const setMark = (uuid: string, boarded: boolean) =>
    setMarks((m) => ({ ...m, [uuid]: boarded ? { boarded: true } : { boarded: false, reason: m[uuid]?.reason ?? "NO_SHOW" } }));

  const save = async () => {
    const entries = Object.entries(marks);
    if (entries.length === 0) {
      toast.error("Mark at least one student first");
      return;
    }
    setSaving(true);
    try {
      const boarded = entries.filter(([, v]) => v.boarded).map(([k]) => k);
      const notBoarded = entries.filter(([, v]) => !v.boarded).map(([k, v]) => ({ studentUuid: k, reason: v.reason ?? "NO_SHOW" }));
      const res = await markBoardingApi({ routeUuid, tripDate: todayStr(), tripType, boardedStudentUuids: boarded, notBoardedStudents: notBoarded });
      toast.success(`Saved — ${res.boarded} boarded, ${res.notBoarded} not boarded`);
      setMarks({});
      setReloadKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionGuard>
      <TransportPageShell
        title="Boarding Attendance"
        subtitle="Did the student actually board the bus? Large touch buttons for conductors — works on phones."
        actions={
          <div className="flex gap-2">
            <Select value={tripType} onValueChange={(v) => { setTripType(v); setMarks({}); }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PICKUP">PICKUP</SelectItem>
                <SelectItem value="DROP">DROP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={routeUuid} onValueChange={(v) => { setRouteUuid(v); setMarks({}); }}>
              <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="Select route" /></SelectTrigger>
              <SelectContent>{(routes.data as any[]).map((r: any) => <SelectItem key={r.uuid} value={r.uuid}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }
      >
        {!routeUuid ? (
          <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">Select a route and trip to load today&apos;s manifest.</Card>
        ) : isLoading && students.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">Loading manifest…</Card>
        ) : (
          <Tabs defaultValue="manifest">
            <TabsList className="h-9">
              <TabsTrigger value="manifest" className="text-xs">Manifest ({summary.expected})</TabsTrigger>
              <TabsTrigger value="notpicked" className="text-xs">Not picked ({(notPicked as any)?.notPickedCount ?? 0})</TabsTrigger>
            </TabsList>
            <TabsContent value="manifest" className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">Expected {summary.expected}</Badge>
                <Badge variant="default">Boarded {summary.boarded}</Badge>
                <Badge variant="destructive">Not boarded {summary.notBoarded}</Badge>
                <Badge variant="secondary">Not marked {summary.notMarked}</Badge>
                <Button size="sm" className="ml-auto h-9 text-sm px-6" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Trip"}</Button>
              </div>
              {students.map((s: any) => {
                const local = marks[s.uuid];
                const st = local ? (local.boarded ? true : false) : s.boarding?.boarded;
                return (
                  <Card key={s.uuid} className="border-border/70">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{s.student?.name}</div>
                        <div className="text-[11px] text-muted-foreground">{s.student?.admissionNo} · {s.student?.class ?? "—"} · {s.stopName ?? "—"} {s.pickupTime ? `· ${s.pickupTime}` : ""}</div>
                      </div>
                      {st === true && <Badge variant="default" className="text-[10px] shrink-0">BOARDED</Badge>}
                      {st === false && <Badge variant="destructive" className="text-[10px] shrink-0">{local?.reason ?? s.boarding?.reason ?? "NOT BOARDED"}</Badge>}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="lg"
                          variant={st === true ? "default" : "outline"}
                          className="h-12 px-4 text-sm font-bold touch-manipulation"
                          onClick={() => setMark(s.uuid, true)}
                        >
                          <Check className="h-5 w-5 mr-1" /> BOARDED
                        </Button>
                        <Button
                          size="lg"
                          variant={st === false ? "destructive" : "outline"}
                          className="h-12 px-4 text-sm font-bold touch-manipulation"
                          onClick={() => setMark(s.uuid, false)}
                        >
                          <X className="h-5 w-5 mr-1" /> NOT
                        </Button>
                      </div>
                    </CardContent>
                    {marks[s.uuid] && !marks[s.uuid].boarded && (
                      <CardContent className="pt-0 pb-3 pl-3">
                        <Select value={marks[s.uuid].reason ?? "NO_SHOW"} onValueChange={(v) => setMarks((m) => ({ ...m, [s.uuid]: { boarded: false, reason: v } }))}>
                          <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["ABSENT", "SELF_ARRANGED", "NO_SHOW", "HOLIDAY"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </TabsContent>
            <TabsContent value="notpicked" className="mt-3 space-y-2">
              {((notPicked as any)?.students ?? []).length === 0 ? (
                <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">Everyone boarded — no safety follow-ups.</Card>
              ) : (
                ((notPicked as any)?.students ?? []).map((s: any) => (
                  <Card key={s.uuid} className="border-destructive/40">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{s.name} <Badge variant="destructive" className="text-[10px] ml-1">{s.reason}</Badge></div>
                        <div className="text-[11px] text-muted-foreground">{s.admissionNo} · {s.class ?? "—"} · {s.stop ?? "—"}</div>
                        <div className="text-[11px]">Parent: {s.parentName ?? "—"} · <span className="inline-flex items-center gap-1 font-mono"><Phone className="h-3 w-3" />{s.parentPhone ?? "—"}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </TransportPageShell>
    </SectionGuard>
  );
}
