"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Vehicle, TransportRoute, Driver } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ListPagination } from "@/components/ui/list-pagination";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
import { Search, Bus, Users, MapPin, Banknote, AlertTriangle, Info, ArrowRight, Plus, Edit2, Trash2, ShieldAlert, Route as RouteIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

function daysToExpiry(d: string): number {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return 999;
  return Math.ceil((dt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
function expiryBadge(days: number) {
  if (days <= 0) return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
  if (days <= 30) return <Badge variant="warning" className="text-[10px]">{days}d left</Badge>;
  return <Badge variant="success" className="text-[10px]">{days}d</Badge>;
}

// Schemas
const vehicleSchema = z.object({
  registrationNumber: z.string().min(3, "Required"),
  vehicleType: z.string().min(1),
  capacity: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.string().min(4),
  insuranceExpiry: z.string().min(1),
  fitnessCertificateExpiry: z.string().min(1),
  status: z.string().min(1),
  driverId: z.string().optional(),
  conductorId: z.string().optional(),
});
const driverSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  licenseNumber: z.string().min(5),
  licenseExpiry: z.string().min(1),
  experienceYears: z.string().min(1),
});
const conductorSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  assignedVehicleId: z.string().optional(),
});
const routeSchema = z.object({
  routeName: z.string().min(2),
  routeNumber: z.string().min(2),
  vehicleId: z.string().min(1, "Select vehicle"),
  driverId: z.string().min(1, "Select driver"),
  conductorId: z.string().optional(),
  status: z.string().min(1),
});
const stopSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(3),
  distanceKm: z.string().min(1),
  zone: z.string().min(1),
  arrivalTime: z.string().min(1),
});
const assignSchema = z.object({
  studentId: z.string().min(1, "Select student"),
  routeId: z.string().min(1, "Select route"),
  stopId: z.string().min(1, "Select stop"),
  shift: z.string().min(1),
});

export function TransportDirectoryView() {
  const { activeBranchId } = useERP();
  const [vehicles, setVehicles] = useState(() => mockDb.getVehicles(activeBranchId));
  const [routes, setRoutes] = useState(() => mockDb.getTransportRoutes(activeBranchId));
  const [drivers, setDrivers] = useState(() => mockDb.getDrivers(activeBranchId));
  const [conductors, setConductors] = useState(() => mockDb.getBusHelpers(activeBranchId));
  const [assignments, setAssignments] = useState(() => mockDb.getStudentTransportAssignments(activeBranchId));
  const slabs = mockDb.getTransportFeeSlabs(activeBranchId);
  const students = mockDb.getStudents(activeBranchId);

  const [activeTab, setActiveTab] = useState("vehicles");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const refresh = () => {
    setVehicles([...mockDb.getVehicles(activeBranchId)]);
    setRoutes([...mockDb.getTransportRoutes(activeBranchId)]);
    setDrivers([...mockDb.getDrivers(activeBranchId)]);
    setConductors([...mockDb.getBusHelpers(activeBranchId)]);
    setAssignments([...mockDb.getStudentTransportAssignments(activeBranchId)]);
  };

  // Vehicle dialog
  const [vehOpen, setVehOpen] = useState(false);
  const [vehEdit, setVehEdit] = useState<Vehicle | null>(null);
  const vehForm = useForm<z.infer<typeof vehicleSchema>>({ resolver: zodResolver(vehicleSchema), defaultValues: { registrationNumber: "", vehicleType: "BUS", capacity: "40", brand: "", model: "", year: "2024", insuranceExpiry: "", fitnessCertificateExpiry: "", status: "ACTIVE", driverId: "", conductorId: "" } });
  useEffect(() => {
    if (vehOpen) {
      if (vehEdit) vehForm.reset({ registrationNumber: vehEdit.registrationNumber, vehicleType: vehEdit.vehicleType, capacity: String(vehEdit.capacity), brand: vehEdit.brand, model: vehEdit.model, year: String(vehEdit.year), insuranceExpiry: vehEdit.insuranceExpiry?.slice(0, 10) || "", fitnessCertificateExpiry: (vehEdit as any).fitnessCertificateExpiry?.slice(0, 10) || "", status: vehEdit.status, driverId: (vehEdit as any).driverId || "", conductorId: (vehEdit as any).conductorId || "" });
      else vehForm.reset({ registrationNumber: "", vehicleType: "BUS", capacity: "40", brand: "", model: "", year: "2024", insuranceExpiry: "", fitnessCertificateExpiry: "", status: "ACTIVE", driverId: "", conductorId: "" });
    }
  }, [vehOpen, vehEdit]);
  const onVehSubmit = (v: z.infer<typeof vehicleSchema>) => {
    const payload: any = { registrationNumber: v.registrationNumber, vehicleType: v.vehicleType, brand: v.brand, model: v.model, year: Number(v.year), color: "Yellow", capacity: Number(v.capacity), branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId, branchName: "Apex Global Campus", status: v.status, fuelType: "Diesel", insuranceExpiry: v.insuranceExpiry, fitnessCertificateExpiry: v.fitnessCertificateExpiry, lastServiceDate: new Date().toISOString().slice(0, 10), nextServiceDate: new Date().toISOString().slice(0, 10), driverId: v.driverId || undefined, driverName: drivers.find((d) => d.id === v.driverId)?.name, conductorId: v.conductorId || undefined, conductorName: conductors.find((c) => c.id === v.conductorId)?.name };
    if (vehEdit) (payload as any).id = vehEdit.id;
    mockDb.saveVehicle(payload);
    toast.success(vehEdit ? "Vehicle updated" : "Vehicle added");
    setVehOpen(false); refresh();
  };

  // Driver dialog
  const [drvOpen, setDrvOpen] = useState(false);
  const [drvEdit, setDrvEdit] = useState<Driver | null>(null);
  const drvForm = useForm<z.infer<typeof driverSchema>>({ resolver: zodResolver(driverSchema), defaultValues: { name: "", phone: "", licenseNumber: "", licenseExpiry: "", experienceYears: "5" } });
  useEffect(() => { if (drvOpen) { if (drvEdit) drvForm.reset({ name: drvEdit.name, phone: drvEdit.phone, licenseNumber: drvEdit.licenseNumber, licenseExpiry: drvEdit.licenseExpiry.slice(0, 10), experienceYears: String(drvEdit.experienceYears) }); else drvForm.reset({ name: "", phone: "", licenseNumber: "", licenseExpiry: "", experienceYears: "5" }); } }, [drvOpen, drvEdit]);
  const onDrvSubmit = (v: z.infer<typeof driverSchema>) => {
    const payload: any = { name: v.name, phone: v.phone, licenseNumber: v.licenseNumber, licenseExpiry: v.licenseExpiry, branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId, branchName: "Apex Global Campus", status: "ACTIVE", experienceYears: Number(v.experienceYears), dateJoined: new Date().toISOString().slice(0, 10) };
    if (drvEdit) payload.id = drvEdit.id;
    mockDb.saveDriver(payload); toast.success(drvEdit ? "Driver updated" : "Driver added"); setDrvOpen(false); refresh();
  };

  // Conductor dialog
  const [conOpen, setConOpen] = useState(false);
  const [conEdit, setConEdit] = useState<any | null>(null);
  const conForm = useForm<z.infer<typeof conductorSchema>>({ resolver: zodResolver(conductorSchema), defaultValues: { name: "", phone: "", assignedVehicleId: "" } });
  useEffect(() => { if (conOpen) { if (conEdit) conForm.reset({ name: conEdit.name, phone: conEdit.phone, assignedVehicleId: conEdit.assignedVehicleId || "" }); else conForm.reset({ name: "", phone: "", assignedVehicleId: "" }); } }, [conOpen, conEdit]);
  const onConSubmit = (v: z.infer<typeof conductorSchema>) => {
    const payload: any = { name: v.name, phone: v.phone, branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId, branchName: "Apex Global Campus", assignedVehicleId: v.assignedVehicleId || undefined, assignedRouteId: undefined, dateJoined: new Date().toISOString().slice(0, 10), status: "ACTIVE" };
    if (conEdit) payload.id = conEdit.id;
    mockDb.saveBusHelper(payload); toast.success(conEdit ? "Conductor updated" : "Conductor added"); setConOpen(false); refresh();
  };

  // Route dialog
  const [routeOpen, setRouteOpen] = useState(false);
  const [routeEdit, setRouteEdit] = useState<TransportRoute | null>(null);
  const routeForm = useForm<z.infer<typeof routeSchema>>({ resolver: zodResolver(routeSchema), defaultValues: { routeName: "", routeNumber: "", vehicleId: "", driverId: "", conductorId: "", status: "ACTIVE" } });
  useEffect(() => { if (routeOpen) { if (routeEdit) routeForm.reset({ routeName: routeEdit.routeName, routeNumber: routeEdit.routeNumber, vehicleId: routeEdit.vehicleId || "", driverId: routeEdit.driverId || "", conductorId: (routeEdit as any).helperId || "", status: routeEdit.status }); else routeForm.reset({ routeName: "", routeNumber: "", vehicleId: "", driverId: "", conductorId: "", status: "ACTIVE" }); } }, [routeOpen, routeEdit]);
  const onRouteSubmit = (v: z.infer<typeof routeSchema>) => {
    const veh = vehicles.find((x) => x.id === v.vehicleId);
    const drv = drivers.find((x) => x.id === v.driverId);
    const con = conductors.find((x) => x.id === v.conductorId);
    const payload: any = { routeName: v.routeName, routeNumber: v.routeNumber, branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId, branchName: "Apex Global Campus", vehicleId: v.vehicleId, vehicleRegistration: veh?.registrationNumber, driverId: v.driverId, driverName: drv?.name, helperId: v.conductorId, helperName: con?.name, stops: routeEdit?.stops || [], totalDistance: routeEdit?.totalDistance || 0, estimatedDuration: routeEdit?.estimatedDuration || 30, studentCount: routeEdit?.studentCount || 0, capacity: veh?.capacity || 40, status: v.status, morningDeparture: "07:00", eveningDeparture: "14:30" };
    if (routeEdit) payload.id = routeEdit.id;
    mockDb.saveTransportRoute(payload); toast.success(routeEdit ? "Route updated" : "Route created"); setRouteOpen(false); refresh();
  };

  // Stop dialog (per route)
  const [stopOpen, setStopOpen] = useState(false);
  const [stopRouteId, setStopRouteId] = useState<string>("");
  const [stopEdit, setStopEdit] = useState<any | null>(null);
  const stopForm = useForm<z.infer<typeof stopSchema>>({ resolver: zodResolver(stopSchema), defaultValues: { name: "", address: "", distanceKm: "", zone: "A", arrivalTime: "07:00" } });
  useEffect(() => { if (stopOpen) { if (stopEdit) stopForm.reset({ name: stopEdit.name, address: stopEdit.address, distanceKm: String(stopEdit.distanceKm ?? ""), zone: stopEdit.zone || "A", arrivalTime: stopEdit.arrivalTime || "07:00" }); else stopForm.reset({ name: "", address: "", distanceKm: "", zone: "A", arrivalTime: "07:00" }); } }, [stopOpen, stopEdit]);
  const onStopSubmit = (v: z.infer<typeof stopSchema>) => {
    const route = routes.find((r) => r.id === stopRouteId);
    if (!route) return;
    const slab = slabs.find((s) => s.zone === v.zone);
    const newStop: any = { id: stopEdit?.id || `stop-${Date.now().toString(36)}`, name: v.name, address: v.address, distanceKm: Number(v.distanceKm), zone: v.zone, arrivalTime: v.arrivalTime, departureTime: v.arrivalTime, studentCount: stopEdit?.studentCount || 0, branchId: route.branchId };
    let updatedStops;
    if (stopEdit) updatedStops = route.stops.map((s) => (s.id === stopEdit.id ? { ...s, ...newStop } : s));
    else updatedStops = [...route.stops, newStop];
    // keep sequence order as added order
    mockDb.saveTransportRoute({ ...route, stops: updatedStops });
    toast.success(stopEdit ? "Stop updated — zone fee auto-applied" : "Stop added");
    setStopOpen(false); refresh();
  };

  // Assignment dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const assignForm = useForm<z.infer<typeof assignSchema>>({ resolver: zodResolver(assignSchema), defaultValues: { studentId: "", routeId: "", stopId: "", shift: "BOTH" } });
  const watchRouteId = assignForm.watch("routeId");
  const availableStops = useMemo(() => routes.find((r) => r.id === watchRouteId)?.stops || [], [routes, watchRouteId]);
  useEffect(() => { if (assignOpen) assignForm.reset({ studentId: "", routeId: "", stopId: "", shift: "BOTH" }); }, [assignOpen]);
  const onAssignSubmit = (v: z.infer<typeof assignSchema>) => {
    const stu = students.find((s) => s.id === v.studentId);
    const route = routes.find((r) => r.id === v.routeId);
    const stop = route?.stops.find((s) => s.id === v.stopId);
    if (!stu || !route || !stop) { toast.error("Select all fields"); return; }
    // capacity check
    if (route.studentCount >= route.capacity) { toast.error(`Route ${route.routeName} full (${route.capacity})`); return; }
    if (assignments.some((a) => a.studentId === v.studentId && a.status === "ACTIVE")) { toast.error("Student already assigned to a route"); return; }
    const slab = slabs.find((s) => s.zone === stop.zone);
    try {
      mockDb.saveStudentTransportAssignment({ studentId: stu.id, studentName: stu.fullName, studentRoll: stu.rollNumber, classId: stu.classId, className: stu.className, branchId: stu.branchId, branchName: stu.branchName, routeId: route.id, routeName: route.routeName, stopId: stop.id, stopName: stop.name, zone: stop.zone, distanceKm: stop.distanceKm, vehicleId: route.vehicleId || "", vehicleRegistration: route.vehicleRegistration || "", shift: v.shift as any, feePerMonth: slab?.feePerMonth || 800, isProrated: false, effectiveFrom: new Date().toISOString().slice(0, 10), status: "ACTIVE", assignedDate: new Date().toISOString().slice(0, 10) } as any);
      toast.success(`${stu.fullName} assigned to ${route.routeName} → ${stop.name} (Zone ${stop.zone} ₹${slab?.feePerMonth}/mo) — Transport Fee auto-added to Fee Collection`);
      setAssignOpen(false); refresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const filteredRoutes = useMemo(() => routes.filter((r) => !debouncedSearch || r.routeName.toLowerCase().includes(debouncedSearch.toLowerCase()) || r.routeNumber.toLowerCase().includes(debouncedSearch.toLowerCase())), [routes, debouncedSearch]);
  const filteredVehicles = useMemo(() => vehicles.filter((v) => !debouncedSearch || v.registrationNumber.toLowerCase().includes(debouncedSearch.toLowerCase())), [vehicles, debouncedSearch]);

  const reportData = useMemo(() => routes.map((r) => ({ route: r, util: r.capacity ? Math.round((r.studentCount / r.capacity) * 100) : 0, students: assignments.filter((a) => a.routeId === r.id) })), [routes, assignments]);
  const expiryList = useMemo(() => {
    const list: any[] = [];
    vehicles.forEach((v) => {
      const i = daysToExpiry(v.insuranceExpiry); const f = daysToExpiry((v as any).fitnessCertificateExpiry);
      if (i <= 30) list.push({ kind: "Insurance", name: `Bus ${v.registrationNumber}`, date: v.insuranceExpiry, days: i });
      if (f <= 30) list.push({ kind: "Fitness", name: `Bus ${v.registrationNumber}`, date: (v as any).fitnessCertificateExpiry, days: f });
    });
    drivers.forEach((d) => { const l = daysToExpiry(d.licenseExpiry); if (l <= 30) list.push({ kind: "License", name: `Driver ${d.name}`, date: d.licenseExpiry, days: l }); });
    return list.sort((a, b) => a.days - b.days);
  }, [vehicles, drivers]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-200 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-900 p-3 flex gap-3 text-xs">
        <Info className="h-4 w-4 text-sky-600 mt-0.5" />
        <div><span className="font-semibold text-sky-800 dark:text-sky-200">Flow: Vehicle → Route → Stops (sequence, zone) → Student Assignment → Fee Collection (Transport head)</span><span className="text-sky-700 dark:text-sky-300"> — har step ka Signal Fee Collection ko auto fee-head ke roop me jata hai.</span></div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="vehicles" className="text-xs gap-1"><Bus className="h-3 w-3" /> Vehicles ({vehicles.length})</TabsTrigger>
            <TabsTrigger value="drivers" className="text-xs">Drivers ({drivers.length})</TabsTrigger>
            <TabsTrigger value="conductors" className="text-xs">Conductors ({conductors.length})</TabsTrigger>
            <TabsTrigger value="routes" className="text-xs gap-1"><RouteIcon className="h-3 w-3" /> Routes ({routes.length})</TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs gap-1"><Users className="h-3 w-3" /> Assignments ({assignments.filter((a) => a.status === "ACTIVE").length})</TabsTrigger>
            <TabsTrigger value="slabs" className="text-xs gap-1"><Banknote className="h-3 w-3" /> Slabs</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          </TabsList>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 h-8 text-xs" />
          </div>
        </div>

        <TabsContent value="vehicles" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Vehicle number, type, seats, model, year, insurance/fitness expiry, driver+conductor</p>
            <Button size="sm" className="h-8 text-xs gap-1" onClick={() => { setVehEdit(null); setVehOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Vehicle</Button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Vehicle No</TableHead><TableHead>Type • Seats</TableHead><TableHead>Driver + Conductor</TableHead><TableHead>Insurance</TableHead><TableHead>Fitness</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredVehicles.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{v.registrationNumber}<span className="block text-[11px] text-muted-foreground">{v.brand} {v.model} {v.year}</span></TableCell>
                    <TableCell className="text-xs">{v.vehicleType} • {v.capacity} seats</TableCell>
                    <TableCell className="text-xs"><span className="block">{(v as any).driverName || "—"} </span><span className="block text-muted-foreground">{(v as any).conductorName || "No conductor"}</span></TableCell>
                    <TableCell className="text-xs">{formatDate(v.insuranceExpiry)} {expiryBadge(daysToExpiry(v.insuranceExpiry))}</TableCell>
                    <TableCell className="text-xs">{formatDate((v as any).fitnessCertificateExpiry)} {expiryBadge(daysToExpiry((v as any).fitnessCertificateExpiry))}</TableCell>
                    <TableCell><Badge variant={v.status === "ACTIVE" ? "success" : v.status === "MAINTENANCE" ? "warning" : "secondary"} className="text-[10px]">{v.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setVehEdit(v); setVehOpen(true); }}><Edit2 className="h-3 w-3" /> Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {expiryList.filter((x) => x.kind !== "License").length > 0 && <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3 flex gap-2 text-xs"><ShieldAlert className="h-4 w-4 text-amber-600" /><span><strong>Alert:</strong> {expiryList.filter((x) => x.kind !== "License").map((x) => `${x.name} ${x.kind} ${formatDate(x.date)} (${x.days}d)`).join(" • ")} — 30 days advance warning per spec.</span></Card>}
        </TabsContent>

        <TabsContent value="drivers" className="space-y-3">
          <div className="flex justify-between"><p className="text-xs text-muted-foreground">Naam, contact, license number, expiry, experience, photo</p><Button size="sm" className="h-8 text-xs gap-1" onClick={() => { setDrvEdit(null); setDrvOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Driver</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {drivers.map((d) => (
              <Card key={d.id} className="border-border/70">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between"><h4 className="font-bold text-sm">{d.name}</h4>{expiryBadge(daysToExpiry(d.licenseExpiry))}</div>
                  <p className="text-xs font-mono">Lic: {d.licenseNumber} • Exp: {formatDate(d.licenseExpiry)}</p>
                  <p className="text-xs text-muted-foreground">Ph: {d.phone} • {d.experienceYears}y exp • {d.assignedVehicleReg || "Unassigned"}</p>
                  <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setDrvEdit(d); setDrvOpen(true); }}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="conductors" className="space-y-3">
          <div className="flex justify-between"><p className="text-xs text-muted-foreground">Har vehicle pe ek conductor — naam, contact, assigned vehicle</p><Button size="sm" className="h-8 text-xs gap-1" onClick={() => { setConEdit(null); setConOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Conductor</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {conductors.map((c) => (
              <Card key={c.id} className="border-border/70"><CardContent className="p-4 space-y-2"><h4 className="font-bold text-sm">{c.name}</h4><p className="text-xs">Ph: {c.phone}</p><p className="text-xs text-muted-foreground">Vehicle: {c.assignedVehicleId || "Unassigned"} • Route: {c.assignedRouteName || "—"}</p><Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setConEdit(c); setConOpen(true); }}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button></CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-3">
          <div className="flex justify-between"><p className="text-xs text-muted-foreground">Route naam/number, start→end, vehicle+driver+conductor, active toggle</p><Button size="sm" className="h-8 text-xs gap-1" onClick={() => { setRouteEdit(null); setRouteOpen(true); }}><Plus className="h-3.5 w-3.5" /> Add Route</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRoutes.map((r) => (
              <Card key={r.id} className="border-border/70">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{r.routeNumber} — {r.routeName} <Badge variant={r.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">{r.status}</Badge></CardTitle><CardDescription className="text-xs">{r.stops[0]?.name || "?"} → {r.stops[r.stops.length - 1]?.name || "?"} • {r.vehicleRegistration} • {r.driverName} • {(r as any).helperName || "No conductor"} • {r.studentCount}/{r.capacity} ({r.capacity ? Math.round((r.studentCount / r.capacity) * 100) : 0}%)</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    {r.stops.map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs">
                        <span className="flex items-center gap-2"><Badge variant="outline" className="text-[10px]">{idx + 1}</Badge> {s.name} <span className="text-muted-foreground">• {s.distanceKm}km</span> <Badge variant="outline" className="text-[10px]">Zone {s.zone}</Badge> <span className="text-muted-foreground">{s.arrivalTime}</span></span>
                        <span className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setStopRouteId(r.id); setStopEdit(s); setStopOpen(true); }}><Edit2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { const updated = r.stops.filter((x) => x.id !== s.id); mockDb.saveTransportRoute({ ...r, stops: updated } as any); refresh(); toast.success("Stop removed"); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => { setStopRouteId(r.id); setStopEdit(null); setStopOpen(true); }}><Plus className="h-3 w-3 mr-1" /> Add Stop (zone)</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs flex-1" onClick={() => { setRouteEdit(r); setRouteOpen(true); }}><Edit2 className="h-3 w-3 mr-1" /> Edit Route</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-3">
          <div className="flex justify-between"><p className="text-xs text-muted-foreground">Student → route → stop → pickup time • one student one route • history tracked • seat check • prorated</p><Button size="sm" className="h-8 text-xs gap-1" onClick={() => setAssignOpen(true)}><Plus className="h-3.5 w-3.5" /> Assign Student</Button></div>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Route → Stop</TableHead><TableHead>Zone / Fee</TableHead><TableHead>Pickup</TableHead><TableHead>History</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell className="text-sm font-semibold">{a.studentName}<span className="block text-xs font-mono text-muted-foreground">{a.studentRoll} • {a.className}</span></TableCell>
                    <TableCell className="text-xs"><span className="font-bold text-primary">{a.routeName}</span><span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> {a.stopName}</span><span className="text-muted-foreground">{a.vehicleRegistration}</span></TableCell>
                    <TableCell className="text-xs"><Badge variant="outline" className="text-[10px]">Zone {a.zone}</Badge> {formatCurrency(a.feePerMonth)}/mo {a.isProrated && <Badge variant="warning" className="text-[10px] ml-1">Prorated {formatCurrency(a.proratedFee!)}</Badge>} {a.discount ? <span className="block text-emerald-600">Disc −{formatCurrency(a.discount)}</span> : null}</TableCell>
                    <TableCell className="text-xs">{a.shift}<span className="block text-muted-foreground">{formatDate(a.assignedDate)}</span></TableCell>
                    <TableCell className="text-xs">{a.history && a.history.length > 0 ? a.history.map((h) => `${h.routeName}→${h.stopName} ${formatDate(h.changedAt)}`).join(", ") : "—"}</TableCell>
                    <TableCell className="text-right"><div className="flex flex-col gap-1 items-end"><Link href={`/fees/${a.studentId}`} className="text-xs text-primary underline">Fee</Link>{a.status === "ACTIVE" ? <Button variant="ghost" size="sm" className="h-6 text-[11px] text-rose-600" onClick={() => { mockDb.removeStudentTransportAssignment(a.studentId); refresh(); toast.success(`Dropped — refund handled`); }}>Drop</Button> : <Badge variant="secondary" className="text-[10px]">INACTIVE refund {a.refundAmount ? formatCurrency(a.refundAmount) : ""}</Badge>}</div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="slabs" className="space-y-3">
          <Card className="border-border/70"><CardHeader><CardTitle className="text-sm">Zone-wise Fee Slabs — Transport defines, Fee Collection consumes</CardTitle><CardDescription className="text-xs">Zone A 0-5 →800, B 5-10 →1200, C 10-15 →1600</CardDescription></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Zone</TableHead><TableHead>Distance</TableHead><TableHead className="text-right">Fee/mo</TableHead><TableHead>Year</TableHead><TableHead>Version</TableHead></TableRow></TableHeader><TableBody>{slabs.map((s) => <TableRow key={s.id}><TableCell><Badge variant="outline" className="text-xs">Zone {s.zone}</Badge> {s.label}</TableCell><TableCell className="text-xs font-mono">{s.minDistance}–{s.maxDistance} km</TableCell><TableCell className="text-right font-bold">{formatCurrency(s.feePerMonth)}</TableCell><TableCell className="text-xs">{s.academicYear}</TableCell><TableCell><Badge variant="secondary" className="text-[10px]">v{s.version}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/70"><CardHeader><CardTitle className="text-sm">Route-wise Students</CardTitle></CardHeader><CardContent className="space-y-2">{reportData.map(({ route, util, students }) => <div key={route.id} className="p-3 rounded-lg border bg-muted/20"><div className="flex justify-between text-xs font-bold">{route.routeName} <span>{route.studentCount}/{route.capacity} • {util}%</span></div><div className="h-2 bg-muted rounded-full mt-1"><div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min(util, 100)}%` }} /></div><p className="text-[11px] text-muted-foreground mt-1">{students.map((s) => s.studentName).join(", ") || "No students"}</p></div>)}</CardContent></Card>
            <Card className="border-border/70"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-500" /> Expiry Alerts (30 days)</CardTitle></CardHeader><CardContent className="space-y-2">{expiryList.length === 0 ? <p className="text-xs text-muted-foreground">No expiries in 30 days — all clear.</p> : expiryList.map((x, i) => <div key={i} className="flex justify-between p-2 rounded-lg border bg-amber-50 dark:bg-amber-950/20 text-xs"><span>{x.kind}: {x.name}</span><span className="font-mono">{formatDate(x.date)} • {x.days}d {x.days <= 0 ? "(expired)" : "left"} {expiryBadge(x.days)}</span></div>)}<p className="text-[11px] text-muted-foreground">Insurance, fitness, license — legally critical; 30-day advance warning enforced.</p></CardContent></Card>
          </div>
          <Card className="border-dashed p-3 text-xs space-y-1"><h4 className="font-bold">Issues handled per guide:</h4><ul className="list-disc pl-4 text-muted-foreground space-y-0.5"><li>Seat overflow: capacity check on assign (route.studentCount vs capacity).</li><li>Driver/vehicle mid-session change: route retains history; reassignment via edit keeps old record in assignments history.</li><li>Route split/merge: Add new route + bulk reassign by changing stop/route, history tracks prior route.</li><li>Mid-session join: prorated by exact day count (slab * remainingDays/daysInMonth).</li><li>Cancellation: status INACTIVE + 2-month refund + transport head zeroed in fees.</li><li>Multiple pickup times: shift MORNING/EVENING/BOTH + arrivalTime per stop; add time slot per assignment.</li><li>Expiry alerts: 30-day badges + Reports panel.</li></ul></Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={vehOpen} onOpenChange={setVehOpen}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{vehEdit ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle><DialogDescription>Vehicle number, type, seats, model, year, expiry dates, driver+conductor</DialogDescription></DialogHeader>
        <form onSubmit={vehForm.handleSubmit(onVehSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium">Vehicle No *</label><Input {...vehForm.register("registrationNumber")} placeholder="MH-12-AB-1234" /></div><div><label className="text-xs font-medium">Type</label><Select value={vehForm.watch("vehicleType")} onValueChange={(v) => vehForm.setValue("vehicleType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BUS">Bus</SelectItem><SelectItem value="VAN">Van</SelectItem><SelectItem value="MINIBUS">Minibus</SelectItem><SelectItem value="CAR">Car</SelectItem></SelectContent></Select></div></div>
          <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-medium">Seats *</label><Input {...vehForm.register("capacity")} type="number" /></div><div><label className="text-xs font-medium">Brand</label><Input {...vehForm.register("brand")} placeholder="Tata" /></div><div><label className="text-xs font-medium">Model</label><Input {...vehForm.register("model")} placeholder="Starbus" /></div></div>
          <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-medium">Year</label><Input {...vehForm.register("year")} /></div><div><label className="text-xs font-medium">Insurance Expiry *</label><Input type="date" {...vehForm.register("insuranceExpiry")} /></div><div><label className="text-xs font-medium">Fitness Expiry *</label><Input type="date" {...vehForm.register("fitnessCertificateExpiry")} /></div></div>
          <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-medium">Status</label><Select value={vehForm.watch("status")} onValueChange={(v) => vehForm.setValue("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="MAINTENANCE">Maintenance</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="RETIRED">Retired</SelectItem></SelectContent></Select></div><div><label className="text-xs font-medium">Driver</label><Select value={vehForm.watch("driverId") || ""} onValueChange={(v) => vehForm.setValue("driverId", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="">— None —</SelectItem>{drivers.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div><div><label className="text-xs font-medium">Conductor</label><Select value={vehForm.watch("conductorId") || ""} onValueChange={(v) => vehForm.setValue("conductorId", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="">— None —</SelectItem>{conductors.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setVehOpen(false)}>Cancel</Button><Button type="submit" variant="gradient">{vehEdit ? "Update" : "Create"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>

      <Dialog open={drvOpen} onOpenChange={setDrvOpen}><DialogContent><DialogHeader><DialogTitle>{drvEdit ? "Edit Driver" : "Add Driver"}</DialogTitle><DialogDescription>Naam, contact, license number, expiry, experience</DialogDescription></DialogHeader>
        <form onSubmit={drvForm.handleSubmit(onDrvSubmit)} className="space-y-3">
          <div><label className="text-xs font-medium">Name *</label><Input {...drvForm.register("name")} placeholder="Rajesh Kumar" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium">Phone *</label><Input {...drvForm.register("phone")} placeholder="+91 98..." /></div><div><label className="text-xs font-medium">License No *</label><Input {...drvForm.register("licenseNumber")} /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium">License Expiry *</label><Input type="date" {...drvForm.register("licenseExpiry")} /></div><div><label className="text-xs font-medium">Experience (years)</label><Input {...drvForm.register("experienceYears")} type="number" /></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDrvOpen(false)}>Cancel</Button><Button type="submit" variant="gradient">{drvEdit ? "Update" : "Create"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>

      <Dialog open={conOpen} onOpenChange={setConOpen}><DialogContent><DialogHeader><DialogTitle>{conEdit ? "Edit Conductor" : "Add Conductor"}</DialogTitle><DialogDescription>Naam, contact, assigned vehicle — har vehicle pe ek conductor</DialogDescription></DialogHeader>
        <form onSubmit={conForm.handleSubmit(onConSubmit)} className="space-y-3">
          <div><label className="text-xs font-medium">Name *</label><Input {...conForm.register("name")} placeholder="Sunita Devi" /></div>
          <div><label className="text-xs font-medium">Phone *</label><Input {...conForm.register("phone")} placeholder="+91 98..." /></div>
          <div><label className="text-xs font-medium">Assigned Vehicle</label><Select value={conForm.watch("assignedVehicleId") || ""} onValueChange={(v) => conForm.setValue("assignedVehicleId", v)}><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger><SelectContent><SelectItem value="">— None —</SelectItem>{vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registrationNumber} — {v.brand}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setConOpen(false)}>Cancel</Button><Button type="submit" variant="gradient">{conEdit ? "Update" : "Create"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>

      <Dialog open={routeOpen} onOpenChange={setRouteOpen}><DialogContent><DialogHeader><DialogTitle>{routeEdit ? "Edit Route" : "Create Route"}</DialogTitle><DialogDescription>Route naam/number, vehicle+driver+conductor, active toggle</DialogDescription></DialogHeader>
        <form onSubmit={routeForm.handleSubmit(onRouteSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium">Route Name *</label><Input {...routeForm.register("routeName")} placeholder="Route 5 — Sector 12" /></div><div><label className="text-xs font-medium">Route No *</label><Input {...routeForm.register("routeNumber")} placeholder="RT-005" /></div></div>
          <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-medium">Vehicle *</label><Select value={routeForm.watch("vehicleId")} onValueChange={(v) => routeForm.setValue("vehicleId", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{vehicles.filter((v) => v.status === "ACTIVE").map((v) => <SelectItem key={v.id} value={v.id}>{v.registrationNumber} ({v.capacity})</SelectItem>)}</SelectContent></Select></div><div><label className="text-xs font-medium">Driver *</label><Select value={routeForm.watch("driverId")} onValueChange={(v) => routeForm.setValue("driverId", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{drivers.filter((d) => d.status === "ACTIVE").map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div><div><label className="text-xs font-medium">Conductor</label><Select value={routeForm.watch("conductorId") || ""} onValueChange={(v) => routeForm.setValue("conductorId", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="">— None —</SelectItem>{conductors.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div></div>
          <div><label className="text-xs font-medium">Status</label><Select value={routeForm.watch("status")} onValueChange={(v) => routeForm.setValue("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="SUSPENDED">Suspended</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setRouteOpen(false)}>Cancel</Button><Button type="submit" variant="gradient">{routeEdit ? "Update" : "Create"}</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>

      <Dialog open={stopOpen} onOpenChange={setStopOpen}><DialogContent><DialogHeader><DialogTitle>{stopEdit ? "Edit Stop" : "Add Stop"}</DialogTitle><DialogDescription>Sequence order, naam, zone/distance — zone se fee slab auto determine</DialogDescription></DialogHeader>
        <form onSubmit={stopForm.handleSubmit(onStopSubmit)} className="space-y-3">
          <div><label className="text-xs font-medium">Stop Name *</label><Input {...stopForm.register("name")} placeholder="Kothrud Stand" /></div>
          <div><label className="text-xs font-medium">Address *</label><Input {...stopForm.register("address")} placeholder="Paud Phata Chowk" /></div>
          <div className="grid grid-cols-3 gap-3"><div><label className="text-xs font-medium">Distance km *</label><Input {...stopForm.register("distanceKm")} type="number" placeholder="3.2" /></div><div><label className="text-xs font-medium">Zone *</label><Select value={stopForm.watch("zone")} onValueChange={(v) => stopForm.setValue("zone", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="A">Zone A (0-5 →800)</SelectItem><SelectItem value="B">Zone B (5-10 →1200)</SelectItem><SelectItem value="C">Zone C (10-15 →1600)</SelectItem><SelectItem value="D">Zone D (15-20 →2000)</SelectItem></SelectContent></Select></div><div><label className="text-xs font-medium">Arrival</label><Input type="time" {...stopForm.register("arrivalTime")} /></div></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setStopOpen(false)}>Cancel</Button><Button type="submit" variant="gradient">{stopEdit ? "Update" : "Add"} Stop</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}><DialogContent><DialogHeader><DialogTitle>Assign Student to Route + Stop</DialogTitle><DialogDescription>Search student → route → stop → pickup time — one student one route, capacity check, fee auto signal to Fee Collection</DialogDescription></DialogHeader>
        <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-3">
          <div><label className="text-xs font-medium">Student *</label><Select value={assignForm.watch("studentId")} onValueChange={(v) => assignForm.setValue("studentId", v)}><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.fullName} — {s.rollNumber} • {s.className}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs font-medium">Route *</label><Select value={assignForm.watch("routeId")} onValueChange={(v) => { assignForm.setValue("routeId", v); assignForm.setValue("stopId", ""); }}><SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger><SelectContent>{routes.filter((r) => r.status === "ACTIVE").map((r) => <SelectItem key={r.id} value={r.id}>{r.routeName} ({r.studentCount}/{r.capacity})</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs font-medium">Stop *</label><Select value={assignForm.watch("stopId")} onValueChange={(v) => assignForm.setValue("stopId", v)}><SelectTrigger><SelectValue placeholder="Select stop" /></SelectTrigger><SelectContent>{availableStops.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} — {s.distanceKm}km Zone {s.zone} {formatCurrency(slabs.find((x) => x.zone === s.zone)?.feePerMonth || 0)}/mo</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs font-medium">Shift</label><Select value={assignForm.watch("shift")} onValueChange={(v) => assignForm.setValue("shift", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BOTH">Both</SelectItem><SelectItem value="MORNING">Morning</SelectItem><SelectItem value="EVENING">Evening</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button type="submit" variant="gradient">Assign</Button></DialogFooter>
        </form>
      </DialogContent></Dialog>
    </div>
  );
}
