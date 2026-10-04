"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Bus } from "lucide-react";
import { createVehicleApi } from "@/lib/api/transport";

const VEHICLE_TYPES = ["BUS", "MINI_BUS", "VAN", "AUTO"];
const FUEL_TYPES = ["DIESEL", "CNG", "ELECTRIC", "PETROL"];

export function VehicleForm() {
  const router = useRouter();
  const { activeBranchId, branches, session } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;
  // rules.md: campus-scoped roles (principal/hr/…) create only in OWN campus.
  const isGlobal = session?.rawRole === "super_admin" || session?.rawRole === "admin" || session?.role === "ADMIN";
  const ownCampus = (session as any)?.campusUuid as string | undefined;

  const [campusId, setCampusId] = useState(branch ?? ownCampus ?? "");

  useEffect(() => {
    if (!isGlobal && ownCampus) setCampusId(ownCampus);
  }, [isGlobal, ownCampus]);

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("BUS");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [capacity, setCapacity] = useState("");
  const [fuelType, setFuelType] = useState("DIESEL");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [fitnessExpiry, setFitnessExpiry] = useState("");
  const [gpsDeviceId, setGpsDeviceId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!campusId) { toast.error("Select a campus"); return; }
    if (!registrationNumber.trim() || !capacity) { toast.error("Registration number and capacity are required"); return; }
    if (!insuranceExpiry || !fitnessExpiry) { toast.error("Insurance and fitness certificate expiry dates are required"); return; }
    setSaving(true);
    try {
      const v = await createVehicleApi({
        registrationNumber: registrationNumber.trim().toUpperCase(),
        vehicleType,
        brand: brand || undefined,
        model: model || undefined,
        year: year ? Number(year) : undefined,
        color: color || undefined,
        capacity: Number(capacity),
        fuelType,
        insuranceExpiry,
        fitnessCertificateExpiry: fitnessExpiry,
        gpsDeviceId: gpsDeviceId || undefined,
        campusUuid: campusId,
      }, branch);
      toast.success(`${v.registrationNumber} added to fleet`);
      router.push("/transport/fleet");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/transport/fleet"><ArrowLeft className="h-3.5 w-3.5" /> Fleet</Link></Button>
      </div>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Bus className="h-4 w-4" /> Vehicle details</h3>
        <div>
          <label className="text-xs font-medium">Campus *</label>
          <Select value={campusId} onValueChange={setCampusId} disabled={!isGlobal}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select campus" /></SelectTrigger>
            <SelectContent>{(branches as any[]).map((b: any) => <SelectItem key={b.id ?? b.uuid} value={b.id ?? b.uuid}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          {!isGlobal && <p className="text-[10px] text-muted-foreground mt-1">Locked to your campus ({(session as any)?.campusName ?? "assigned campus"}) — cross-campus creates are blocked by policy.</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Registration Number *</label>
            <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="HR-26-AB-1234" className="mt-1 font-mono" />
          </div>
          <div>
            <label className="text-xs font-medium">Type *</label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Capacity (seats) *</label>
            <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div><label className="text-xs font-medium">Brand</label><Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Tata" className="mt-1" /></div>
          <div><label className="text-xs font-medium">Model</label><Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Starbus" className="mt-1" /></div>
          <div><label className="text-xs font-medium">Year</label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020" className="mt-1" /></div>
          <div><label className="text-xs font-medium">Color</label><Input value={color} onChange={(e) => setColor(e.target.value)} className="mt-1" /></div>
        </div>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">Fuel & compliance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium">Fuel Type</label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{FUEL_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Insurance Expiry *</label>
            <Input type="date" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium">Fitness Cert Expiry *</label>
            <Input type="date" value={fitnessExpiry} onChange={(e) => setFitnessExpiry(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="sm:w-1/2">
          <label className="text-xs font-medium">GPS Device ID</label>
          <Input value={gpsDeviceId} onChange={(e) => setGpsDeviceId(e.target.value)} placeholder="Optional tracker ID" className="mt-1 font-mono" />
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => void handleSave()} disabled={saving} variant="gradient" className="gap-1">
          <Save className="h-4 w-4" /> {saving ? "Adding…" : "Add Vehicle"}
        </Button>
        <Button asChild variant="outline"><Link href="/transport/fleet">Cancel</Link></Button>
      </div>
    </div>
  );
}