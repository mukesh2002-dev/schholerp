"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CalendarCheck,
  IndianRupee,
  Plus,
  Trash2,
  Save,
  Pencil,
  Users,
} from "lucide-react";
import {
  fetchRouteDetail,
  updateRouteApi,
  addRouteStopApi,
  updateRouteStopApi,
  deleteRouteStopApi,
  reorderRouteStopsApi,
  searchTransportStudentsApi,
  createTransportAssignmentApi,
  type TransportStop,
  type TransportStudentSearchRow,
} from "@/lib/api/transport";

const money = (v: number | string | null | undefined) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

export function RouteDetail({ uuid }: { uuid: string }) {
  const [route, setRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [tabData, setTabData] = useState<any | null>(null);
  const [tabLoading, setTabLoading] = useState(false);

  // Meta edit
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  // Stop add/edit
  const [showAdd, setShowAdd] = useState(false);
  const [nName, setNName] = useState("");
  const [nDist, setNDist] = useState("");
  const [nArrival, setNArrival] = useState("");
  const [nZone, setNZone] = useState("");
  const [nDrop, setNDrop] = useState("");
  const [nLandmark, setNLandmark] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<TransportStop | null>(null);
  const [eName, setEName] = useState("");
  const [eDist, setEDist] = useState("");
  const [eArrival, setEArrival] = useState("");
  const [eZone, setEZone] = useState("");
  const [eDrop, setEDrop] = useState("");
  const [eLandmark, setELandmark] = useState("");
  const [savingStop, setSavingStop] = useState(false);

  // Add student (transport assignment)
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<TransportStudentSearchRow[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TransportStudentSearchRow | null>(null);
  const [selectedStopUuid, setSelectedStopUuid] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignPlan, setAssignPlan] = useState<"MONTHLY" | "HALF_YEARLY" | "YEARLY">("MONTHLY");
  const [assignFee, setAssignFee] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchRouteDetail(uuid);
      setRoute(d);
      setName(d.name ?? "");
      setDescription(d.description ?? "");
      setStartTime(d.startTime ?? "");
      setEndTime(d.endTime ?? "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Load failed");
      setRoute(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [uuid]);

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "stops") {
      setTabData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setTabLoading(true);
      try {
        const d = await fetchRouteDetail(uuid, activeTab);
        if (!cancelled) setTabData(d);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load tab");
          setTabData(null);
        }
      } finally {
        if (!cancelled) setTabLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uuid, activeTab]);

  const handleSaveMeta = async () => {
    if (!name.trim()) { toast.error("Route name is required"); return; }
    setSavingMeta(true);
    try {
      const d = await updateRouteApi(uuid, {
        name: name.trim(), description: description || undefined,
        startTime: startTime || undefined, endTime: endTime || undefined,
      });
      setRoute((p: any) => ({ ...p, ...d }));
      toast.success("Route updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingMeta(false);
    }
  };

  const handleAdd = async () => {
    if (!nName.trim()) { toast.error("Stop name is required"); return; }
    setAdding(true);
    try {
      await addRouteStopApi(uuid, {
        name: nName.trim(),
        distanceKm: nDist ? Number(nDist) : undefined,
        arrivalTime: nArrival || undefined,
        zoneCode: nZone || undefined,
        dropTime: nDrop || undefined,
        landmark: nLandmark || undefined,
      });
      toast.success(`Stop "${nName.trim()}" added`);
      setShowAdd(false);
      setNName(""); setNDist(""); setNArrival(""); setNZone(""); setNDrop(""); setNLandmark("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add failed");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (s: TransportStop) => {
    setEditing(s);
    setEName(s.name ?? "");
    setEDist(s.distanceKm != null ? String(s.distanceKm) : "");
    setEArrival(s.arrivalTime ?? "");
    setEZone((s as any).zoneCode ?? "");
    setEDrop((s as any).dropTime ?? "");
    setELandmark((s as any).landmark ?? "");
  };

  const handleEditSave = async () => {
    if (!editing || !eName.trim()) { toast.error("Stop name is required"); return; }
    setSavingStop(true);
    try {
      await updateRouteStopApi(uuid, editing.uuid, {
        name: eName.trim(),
        distanceKm: eDist ? Number(eDist) : null,
        arrivalTime: eArrival || null,
        zoneCode: eZone || null,
        dropTime: eDrop || null,
        landmark: eLandmark || null,
      } as any);
      toast.success("Stop updated");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSavingStop(false);
    }
  };

  const handleDelete = async (s: TransportStop) => {
    if (!window.confirm(`Remove stop "${s.name}"? Blocked if students actively ride here. Sequences renumber automatically.`)) return;
    try {
      await deleteRouteStopApi(uuid, s.uuid);
      toast.success("Stop removed, sequence renumbered");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const stops: TransportStop[] = [...(route?.stops ?? [])].sort((a, b) => a.sequence - b.sequence);
    const j = idx + dir;
    if (j < 0 || j >= stops.length) return;
    [stops[idx], stops[j]] = [stops[j], stops[idx]];
    try {
      await reorderRouteStopsApi(uuid, stops.map((s) => s.uuid));
      toast.success("Stops reordered");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reorder failed");
    }
  };

  const toggleAddStudent = () => {
    const next = !showAddStudent;
    setShowAddStudent(next);
    if (next) {
      const firstStop = [...(route?.stops ?? [])].sort((a: any, b: any) => a.sequence - b.sequence)[0];
      if (!selectedStopUuid && firstStop) setSelectedStopUuid(firstStop.uuid);
      if (!assignStartDate) setAssignStartDate(new Date().toISOString().slice(0, 10));
    }
  };

  const searchStudents = async () => {
    const q = studentQuery.trim();
    if (q.length < 2) { toast.error("Type at least 2 characters (name or admission no)"); return; }
    setSearchingStudents(true);
    try {
      const rows = await searchTransportStudentsApi(q);
      setStudentResults(rows);
      if (rows.length === 0) toast.info("No matching students found");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Student search failed");
    } finally {
      setSearchingStudents(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudent) { toast.error("Select a student first"); return; }
    if (!selectedStopUuid) { toast.error("Select a stop"); return; }
    setAddingStudent(true);
    try {
      await createTransportAssignmentApi({
        studentUuid: selectedStudent.student.uuid,
        routeUuid: uuid,
        stopUuid: selectedStopUuid,
        startDate: assignStartDate || undefined,
        billingPlan: assignPlan,
        feePerMonth: assignFee ? Number(assignFee) : undefined,
      });
      toast.success(`${selectedStudent.student.name} added to this route`);
      setShowAddStudent(false);
      setStudentQuery("");
      setStudentResults([]);
      setSelectedStudent(null);
      setAssignFee("");
      setRoute((p: any) => ({
        ...p,
        totalStudents: (p?.totalStudents ?? 0) + 1,
        activeStudents: (p?.activeStudents ?? 0) + 1,
      }));
      setTabLoading(true);
      const d = await fetchRouteDetail(uuid, "students");
      setTabData(d);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add student");
    } finally {
      setAddingStudent(false);
      setTabLoading(false);
    }
  };

  if (loading) return <Card className="p-8 text-center text-xs text-muted-foreground">Loading route…</Card>;
  if (!route) return (
    <Card className="border-dashed p-10 text-center">
      <h3 className="font-semibold text-sm">Route not found</h3>
      <Button asChild variant="outline" size="sm" className="mt-3 h-8 text-xs"><Link href="/transport/routes">Back to routes</Link></Button>
    </Card>
  );

  const stops: TransportStop[] = [...(route.stops ?? [])].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/transport/routes"><ArrowLeft className="h-3.5 w-3.5" /> Routes</Link></Button>
        <Badge variant={route.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{route.status}</Badge>
        {(route.totalStudents != null) && (
          <span className="text-[11px] text-muted-foreground ml-auto">
            {route.activeStudents ?? 0} active / {route.totalStudents} total riders
            {route.capacityUtilization != null && ` • ${route.capacityUtilization}% full`}
          </span>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="stops" className="text-xs">Stops &amp; Timings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Active riders" value={String(route.activeStudents ?? 0)} />
              <Stat label="Total riders" value={String(route.totalStudents ?? 0)} />
              <Stat label="Stops" value={String(stops.length)} />
              <Stat label="Capacity used" value={route.capacityUtilization != null ? `${route.capacityUtilization}%` : "—"} />
            </div>
            <Card className="p-4 border-border/70 space-y-3">
              <h3 className="text-sm font-bold">Route details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium">Name *</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
                </div>
                <div><label className="text-xs font-medium">Start Time</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" /></div>
                <div><label className="text-xs font-medium">End Time</label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" /></div>
              </div>
              <div className="text-xs text-muted-foreground">
                Bus: <strong className="font-mono">{route.vehicle?.registrationNumber ?? "unassigned"}</strong> • Driver: <strong>{route.driver?.name ?? "unassigned"}</strong> • Conductor: <strong>{(route.vehicle as any)?.conductor?.name ?? "unassigned"}</strong>
                <span className="block text-[11px]">Crew assignment needs vehicle/driver pickers (backend crew endpoint is live — UI picker coming next).</span>
              </div>
              <Button size="sm" onClick={() => void handleSaveMeta()} disabled={savingMeta} className="h-8 text-xs gap-1 w-fit">
                <Save className="h-3.5 w-3.5" /> {savingMeta ? "Saving…" : "Save details"}
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stops">
          <Card className="p-4 border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Stops ({stops.length}) — in pickup order</h3>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setShowAdd((v) => !v)}>
                <Plus className="h-3.5 w-3.5" /> Add Stop
              </Button>
            </div>

            {showAdd && (
              <div className="p-3 rounded-lg border bg-muted/20 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div><label className="text-xs font-medium">Name *</label><Input value={nName} onChange={(e) => setNName(e.target.value)} placeholder="Sector 14 Market" className="mt-1" /></div>
                  <div><label className="text-xs font-medium">Distance (km)</label><Input type="number" step="0.1" value={nDist} onChange={(e) => setNDist(e.target.value)} className="mt-1" /></div>
                  <div><label className="text-xs font-medium">Arrival</label><Input type="time" value={nArrival} onChange={(e) => setNArrival(e.target.value)} className="mt-1" /></div>
                  <div><label className="text-xs font-medium">Zone (A/B/C)</label><Input value={nZone} onChange={(e) => setNZone(e.target.value)} placeholder="A" className="mt-1" /></div>
                  <div><label className="text-xs font-medium">Drop time</label><Input type="time" value={nDrop} onChange={(e) => setNDrop(e.target.value)} className="mt-1" /></div>
                  <div><label className="text-xs font-medium">Landmark</label><Input value={nLandmark} onChange={(e) => setNLandmark(e.target.value)} placeholder="Near SBI ATM" className="mt-1" /></div>
                </div>
                <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleAdd()} disabled={adding}>
                  {adding ? "Adding…" : "Add stop at end"}
                </Button>
              </div>
            )}

            {stops.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">No stops yet — add the first pickup point above.</p>
            ) : (
              <div className="space-y-1.5">
                {stops.map((s, idx) => (
                  <div key={s.uuid}>
                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">{s.sequence}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {[s.distanceKm != null ? `${s.distanceKm} km` : null, s.arrivalTime, (s as any).zoneCode ? `Zone ${(s as any).zoneCode}` : null, (s as any).landmark].filter(Boolean).join(" • ") || "—"}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => void move(idx, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === stops.length - 1} onClick={() => void move(idx, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void handleDelete(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                    {editing?.uuid === s.uuid && (
                      <div className="ml-8 p-3 rounded-lg border bg-muted/20 space-y-2 mt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div><label className="text-xs font-medium">Name *</label><Input value={eName} onChange={(e) => setEName(e.target.value)} className="mt-1" /></div>
                          <div><label className="text-xs font-medium">Distance (km)</label><Input type="number" step="0.1" value={eDist} onChange={(e) => setEDist(e.target.value)} className="mt-1" /></div>
                          <div><label className="text-xs font-medium">Arrival</label><Input type="time" value={eArrival} onChange={(e) => setEArrival(e.target.value)} className="mt-1" /></div>
                          <div><label className="text-xs font-medium">Zone</label><Input value={eZone} onChange={(e) => setEZone(e.target.value)} className="mt-1" /></div>
                          <div><label className="text-xs font-medium">Drop time</label><Input type="time" value={eDrop} onChange={(e) => setEDrop(e.target.value)} className="mt-1" /></div>
                          <div><label className="text-xs font-medium">Landmark</label><Input value={eLandmark} onChange={(e) => setELandmark(e.target.value)} className="mt-1" /></div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleEditSave()} disabled={savingStop}>
                            {savingStop ? "Saving…" : "Save stop"}
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setEditing(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <TabShell loading={tabLoading} data={tabData}>
            <Card className="border-border/70">
              <CardContent className="p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold">
                    Assigned students ({tabData?.students?.meta?.total ?? tabData?.students?.data?.length ?? 0})
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={toggleAddStudent}>
                    <Plus className="h-3.5 w-3.5" /> Add Student
                  </Button>
                </div>

                {showAddStudent && (
                  <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                    <div className="text-[11px] font-semibold">Find student</div>
                    <div className="flex gap-2">
                      <Input
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void searchStudents(); }}
                        placeholder="Student name or admission no"
                        className="h-8 text-xs"
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={() => void searchStudents()} disabled={searchingStudents}>
                        {searchingStudents ? "Searching…" : "Search"}
                      </Button>
                    </div>

                    {studentResults.length > 0 && (
                      <div className="max-h-44 overflow-auto space-y-1">
                        {studentResults.map((r) => {
                          const disabled = r.onTransport;
                          const selected = selectedStudent?.student.uuid === r.student.uuid;
                          return (
                            <button
                              key={r.student.uuid}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedStudent(r)}
                              className={`w-full flex flex-wrap items-center gap-2 rounded-md border p-2 text-left text-xs transition ${
                                selected ? "border-primary bg-primary/10" : "bg-card hover:bg-muted/40"
                              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <span className="font-semibold">{r.student.name}</span>
                              <span className="text-muted-foreground">{r.student.admissionNo ?? ""}</span>
                              <span className="text-muted-foreground">{r.student.class ?? ""}</span>
                              {disabled && (
                                <span className="ml-auto text-[10px] text-amber-600">
                                  Already on {r.assignment?.route?.name ?? "a route"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedStudent && (
                      <div className="text-[11px] text-muted-foreground">
                        Selected: <strong>{selectedStudent.student.name}</strong>
                        {selectedStudent.student.admissionNo ? ` (${selectedStudent.student.admissionNo})` : ""}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <label className="text-[11px] font-medium">Stop *</label>
                        <Select value={selectedStopUuid} onValueChange={setSelectedStopUuid}>
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select stop" /></SelectTrigger>
                          <SelectContent>
                            {stops.map((s) => (
                              <SelectItem key={s.uuid} value={s.uuid}>{s.sequence}. {s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium">Start date</label>
                        <Input type="date" value={assignStartDate} onChange={(e) => setAssignStartDate(e.target.value)} className="mt-1 h-8 text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium">Billing plan</label>
                        <Select value={assignPlan} onValueChange={(v) => setAssignPlan(v as typeof assignPlan)}>
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="HALF_YEARLY">Half yearly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium">Monthly fee (optional)</label>
                        <Input
                          type="number"
                          min="0"
                          value={assignFee}
                          onChange={(e) => setAssignFee(e.target.value)}
                          placeholder={route.feePerMonth != null ? String(route.feePerMonth) : "Route default"}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleAddStudent()} disabled={addingStudent || !selectedStudent || !selectedStopUuid}>
                        {addingStudent ? "Adding…" : "Add to route"}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowAddStudent(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {!(tabData?.students?.data?.length) ? (
                  <p className="text-xs text-muted-foreground p-4 text-center">No students assigned to this route.</p>
                ) : (
                  <div className="space-y-1.5">
                    {tabData.students.data.map((a: any) => (
                      <div key={a.uuid} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-xs">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-semibold">{a.student?.name ?? "Student"}</span>
                        <span className="text-muted-foreground">{a.student?.admissionNo ?? ""}</span>
                        <span className="text-muted-foreground">{a.student?.class ?? ""}</span>
                        <span className="ml-auto text-muted-foreground">{a.stop?.name ?? a.stopName ?? "No stop"}</span>
                        <Badge variant={a.status === "ACTIVE" ? "success" : "outline"} className="text-[10px]">{a.status}</Badge>
                      </div>
                    ))}
                    {tabData.students.meta && (
                      <div className="text-[11px] text-muted-foreground text-right">
                        {tabData.students.meta.total} total
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabShell>
        </TabsContent>

        <TabsContent value="crew">
          <TabShell loading={tabLoading} data={tabData}>
            {!tabData?.vehicle ? (
              <Card className="border-dashed p-8 text-center text-xs text-muted-foreground">No vehicle assigned to this route.</Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Card className="p-3 border-border/70">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Vehicle</div>
                  <div className="text-sm font-bold font-mono">{tabData.vehicle.registrationNumber}</div>
                  <div className="text-[11px] text-muted-foreground">{tabData.vehicle.vehicleType} • {tabData.vehicle.capacity} seats</div>
                </Card>
                <Card className="p-3 border-border/70">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Driver</div>
                  <div className="text-sm font-bold">{tabData.vehicle.driver?.name ?? "Unassigned"}</div>
                  <div className="text-[11px] text-muted-foreground">{tabData.vehicle.driver?.phone ?? "—"}</div>
                  {tabData.vehicle.driver?.licenseNumber && <div className="text-[10px] text-muted-foreground">Lic: {tabData.vehicle.driver.licenseNumber}</div>}
                </Card>
                <Card className="p-3 border-border/70">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Conductor</div>
                  <div className="text-sm font-bold">{tabData.vehicle.conductor?.name ?? "Unassigned"}</div>
                  <div className="text-[11px] text-muted-foreground">{tabData.vehicle.conductor?.phone ?? "—"}</div>
                  {tabData.vehicle.conductor?.role && <div className="text-[10px] text-muted-foreground">{tabData.vehicle.conductor.role}</div>}
                </Card>
              </div>
            )}
          </TabShell>
        </TabsContent>

        <TabsContent value="attendance">
          <TabShell loading={tabLoading} data={tabData}>
            <div className="space-y-3">
              <Card className="p-3 border-border/70 flex flex-wrap items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Recent boarding summary</span>
                <Button asChild size="sm" variant="gradient" className="h-8 text-xs ml-auto">
                  <Link href={`/transport/attendance?route=${uuid}`}>Open trip attendance</Link>
                </Button>
              </Card>
              {["today", "yesterday"].map((day) => {
                const d = tabData?.attendance?.[day];
                if (!d) return null;
                return (
                  <Card key={day} className="p-3 border-border/70">
                    <div className="text-xs font-semibold capitalize mb-2">{day}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["PICKUP", "DROP"] as const).map((t) => (
                        <div key={t} className="rounded-lg border p-2">
                          <div className="text-[10px] uppercase text-muted-foreground">{t}</div>
                          <div className="flex flex-wrap gap-2 text-[11px] mt-1">
                            <span className="text-emerald-600">Boarded {d[t]?.boarded ?? 0}</span>
                            <span className="text-rose-600">Not {d[t]?.notBoarded ?? 0}</span>
                            <span className="text-amber-600">Unmarked {d[t]?.notMarked ?? 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabShell>
        </TabsContent>

        <TabsContent value="fee">
          <TabShell loading={tabLoading} data={tabData}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Card className="p-3 border-border/70">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Current month</div>
                <div className="text-lg font-bold">{money(tabData?.fee?.currentMonth?.billed ?? 0)}</div>
                <div className="text-[11px] text-muted-foreground">
                  Paid {money(tabData?.fee?.currentMonth?.paid ?? 0)} • Pending {money(tabData?.fee?.currentMonth?.pending ?? 0)} • {tabData?.fee?.currentMonth?.count ?? 0} students
                </div>
              </Card>
              <Card className="p-3 border-border/70">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Academic year {tabData?.fee?.academicYear ?? ""}</div>
                <div className="text-lg font-bold">{money(tabData?.fee?.yearly?.totalBilled ?? 0)}</div>
                <div className="text-[11px] text-muted-foreground">
                  Paid {money(tabData?.fee?.yearly?.totalPaid ?? 0)} • Pending {money(tabData?.fee?.yearly?.totalPending ?? 0)} • {tabData?.fee?.yearly?.count ?? 0} bills
                </div>
              </Card>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2">
              <IndianRupee className="h-3 w-3" /> Transport billing is independent of the main fee module (separate transport bills &amp; receipts).
            </div>
          </TabShell>
        </TabsContent>

        <TabsContent value="incidents">
          <TabShell loading={tabLoading} data={tabData}>
            <Card className="border-border/70">
              <CardContent className="p-3 space-y-1.5">
                {!(tabData?.incidents?.length) ? (
                  <p className="text-xs text-muted-foreground p-4 text-center">No incidents recorded for this route.</p>
                ) : (
                  tabData.incidents.map((inc: any) => (
                    <div key={inc.uuid} className="rounded-lg border bg-card p-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        <span className="font-semibold">{inc.incidentType}</span>
                        <Badge variant="outline" className="text-[10px]">{inc.severity}</Badge>
                        <Badge variant="outline" className="text-[10px]">{inc.status}</Badge>
                        <span className="ml-auto text-muted-foreground">{new Date(inc.occurredAt).toLocaleString()}</span>
                      </div>
                      <div className="text-muted-foreground mt-1">{inc.description}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3 border-border/70">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </Card>
  );
}

function TabShell({ loading, data, children }: { loading: boolean; data: any | null; children: React.ReactNode }) {
  if (loading) return <Card className="p-8 text-center text-xs text-muted-foreground">Loading…</Card>;
  if (!data) return <Card className="border-dashed p-8 text-center text-xs text-muted-foreground">No data.</Card>;
  return <div className="space-y-2">{children}</div>;
}
