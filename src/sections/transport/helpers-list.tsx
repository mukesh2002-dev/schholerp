"use client";

import { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Plus, Search, Phone } from "lucide-react";
import { fetchHelpers, createHelperApi, updateHelperApi } from "@/lib/api/transport";

const ROLES = ["all", "CONDUCTOR", "ATTENDANT", "AYAH"];

export function HelpersList() {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL"].includes(String(session?.role ?? ""));
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newRole, setNewRole] = useState("CONDUCTOR");
  const [saving, setSaving] = useState(false);

  const { data: helpers, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchHelpers({ campusId: cid, role: role === "all" ? undefined : role, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-helpers-${role}`,
  });

  const filtered = (helpers.data as any[]).filter((h) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return `${h.name} ${h.phone ?? ""} ${h.role ?? ""}`.toLowerCase().includes(s);
  });

  const save = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    setSaving(true);
    try {
      await createHelperApi({ name: name.trim(), phone: phone.trim(), role: newRole }, activeBranchId);
      toast.success("Helper added");
      setName("");
      setPhone("");
      setShowForm(false);
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add helper");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (h: any) => {
    try {
      await updateHelperApi(h.uuid, { status: h.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" });
      toast.success("Status updated");
      refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Update failed");
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conductor / attendant…" className="pl-9 h-9 text-xs" />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r === "all" ? "All roles" : r}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[11px] text-muted-foreground">{filtered.length} of {helpers.total} helpers</span>
          {canManage && (
            <Button size="sm" variant="gradient" className="h-9 text-xs gap-1 ml-auto" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> Add Helper
            </Button>
          )}
        </div>
        {showForm && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name *" className="h-9 text-xs" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone *" className="h-9 text-xs" />
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{["CONDUCTOR", "ATTENDANT", "AYAH"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" className="h-9 text-xs" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Helper"}</Button>
          </div>
        )}
      </Card>

      {isLoading && filtered.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading helpers…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">No conductors / attendants yet.</Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h: any) => (
                <TableRow key={h.uuid}>
                  <TableCell className="font-medium text-xs">{h.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{h.role}</Badge></TableCell>
                  <TableCell className="text-xs"><span className="inline-flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{h.phone ?? "—"}</span></TableCell>
                  <TableCell className="text-xs font-mono">{h.assignedVehicle?.registrationNumber ?? "—"}</TableCell>
                  <TableCell><Badge variant={h.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">{h.status}</Badge></TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => toggleStatus(h)}>
                        {h.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
