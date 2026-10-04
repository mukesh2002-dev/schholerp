"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { createDriverApi } from "@/lib/api/transport";
import { useERP } from "@/components/providers/erp-provider";

export function DriverForm() {
  const router = useRouter();
  const { activeBranchId, branches, session } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;
  // rules.md: campus-scoped roles create only in OWN campus.
  const isGlobal = session?.rawRole === "super_admin" || session?.rawRole === "admin" || session?.role === "ADMIN";
  const ownCampus = (session as any)?.campusUuid as string | undefined;

  const [campusId, setCampusId] = useState(branch ?? ownCampus ?? "");

  useEffect(() => {
    if (!isGlobal && ownCampus) setCampusId(ownCampus);
  }, [isGlobal, ownCampus]);

  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [dateJoined, setDateJoined] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!campusId) { toast.error("Select a campus"); return; }
    if (!employeeId.trim() || !name.trim() || !phone.trim() || !licenseNumber.trim() || !licenseExpiry) {
      toast.error("Employee ID, name, phone, license number and expiry are required");
      return;
    }
    setSaving(true);
    try {
      await createDriverApi({
        employeeId: employeeId.trim(),
        name: name.trim(),
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseExpiry,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        dateJoined: dateJoined || undefined,
        campusUuid: campusId,
      }, branch);
      toast.success(`Driver ${name.trim()} added`);
      router.push("/transport/drivers");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/transport/drivers"><ArrowLeft className="h-3.5 w-3.5" /> Drivers</Link></Button>
      </div>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">Driver details</h3>
        <div>
          <label className="text-xs font-medium">Campus *</label>
          <Select value={campusId} onValueChange={setCampusId} disabled={!isGlobal}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select campus" /></SelectTrigger>
            <SelectContent>{(branches as any[]).map((b: any) => <SelectItem key={b.id ?? b.uuid} value={b.id ?? b.uuid}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
          {!isGlobal && <p className="text-[10px] text-muted-foreground mt-1">Locked to your campus ({(session as any)?.campusName ?? "assigned campus"}) — cross-campus creates are blocked by policy.</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs font-medium">Employee ID *</label><Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="DRV-001" className="mt-1 font-mono" /></div>
          <div><label className="text-xs font-medium">Full Name *</label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" /></div>
          <div><label className="text-xs font-medium">Phone *</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876500000" className="mt-1 font-mono" /></div>
          <div><label className="text-xs font-medium">Experience (years)</label><Input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="mt-1" /></div>
        </div>
      </Card>

      <Card className="p-4 border-border/70 space-y-3">
        <h3 className="text-sm font-bold">License (compliance)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-xs font-medium">License Number *</label><Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="mt-1 font-mono" /></div>
          <div><label className="text-xs font-medium">License Expiry *</label><Input type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} className="mt-1" /></div>
          <div><label className="text-xs font-medium">Date Joined</label><Input type="date" value={dateJoined} onChange={(e) => setDateJoined(e.target.value)} className="mt-1" /></div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => void handleSave()} disabled={saving} variant="gradient" className="gap-1">
          <Save className="h-4 w-4" /> {saving ? "Adding…" : "Add Driver"}
        </Button>
        <Button asChild variant="outline"><Link href="/transport/drivers">Cancel</Link></Button>
      </div>
    </div>
  );
}