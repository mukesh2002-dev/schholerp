"use client";

import { useState } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { fetchFeeSlabs, upsertFeeSlabsApi, fetchBilling, generateBillingApi, updateBillingApi } from "@/lib/api/transport";

export default function TransportFeesPage() {
  const { activeBranchId, session } = useERP();
  const canManage = ["ADMIN", "PRINCIPAL", "ACCOUNTANT"].includes(String(session?.role ?? ""));
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [billStatus, setBillStatus] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);

  const { data: slabs, refresh: refreshSlabs } = useCampusData({
    fetcher: (cid) => fetchFeeSlabs({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "transport-fee-slabs",
  });

  const { data: billing, isLoading } = useCampusData({
    fetcher: (cid) => fetchBilling({ campusId: cid, month: Number(month), year: Number(year), status: billStatus === "all" ? undefined : billStatus, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-billing-${month}-${year}-${billStatus}-${reloadKey}`,
  });

  const [slabRows, setSlabRows] = useState("");
  const seedSlabs = () => {
    if ((slabs as any[]).length > 0) {
      setSlabRows(JSON.stringify((slabs as any[]).map((s) => ({ zone: s.zone, label: s.label, minDistance: s.minDistance, maxDistance: s.maxDistance, feePerMonth: s.feePerMonth })), null, 1));
    } else {
      setSlabRows(JSON.stringify([
        { zone: "A", label: "0–5 km", minDistance: 0, maxDistance: 5, feePerMonth: 800 },
        { zone: "B", label: "5–10 km", minDistance: 5, maxDistance: 10, feePerMonth: 1200 },
        { zone: "C", label: "10–15 km", minDistance: 10, maxDistance: 15, feePerMonth: 1500 },
      ], null, 1));
    }
  };

  const saveSlabs = async () => {
    try {
      const parsed = JSON.parse(slabRows);
      await upsertFeeSlabsApi({ academicYear: `${now.getFullYear()}-${now.getFullYear() + 1}`, slabs: parsed }, activeBranchId);
      toast.success("Fee slabs saved");
      refreshSlabs();
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid slab JSON");
    }
  };

  const generate = async () => {
    try {
      const res = await generateBillingApi({ month: Number(month), year: Number(year) }, activeBranchId);
      toast.success(`Billed ${res.billed}, skipped ${res.skipped}`);
      setReloadKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    }
  };

  const waive = async (uuid: string) => {
    try {
      await updateBillingApi(uuid, { status: "WAIVED" });
      toast.success("Waived");
      setReloadKey((k) => k + 1);
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    }
  };

  const rows = (billing as any)?.data ?? [];

  return (
    <SectionGuard>
      <TransportPageShell
        title="Transport Fees"
        subtitle="Zone slabs (0–5 / 5–10 / 10–15 km) snapshot onto each assignment. Monthly billing links to fee-module invoices — payments stay in the fee module."
      >
        <Tabs defaultValue="billing">
          <TabsList className="h-9">
            <TabsTrigger value="billing" className="text-xs">Monthly Billing</TabsTrigger>
            <TabsTrigger value="slabs" className="text-xs">Zone Slabs</TabsTrigger>
          </TabsList>
          <TabsContent value="billing" className="mt-3 space-y-3">
            <Card className="p-3 border-border/70">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => <SelectItem key={m} value={m}>Month {m}</SelectItem>)}</SelectContent>
                </Select>
                <Input value={year} onChange={(e) => setYear(e.target.value)} className="w-24 h-9 text-xs" placeholder="Year" />
                <Select value={billStatus} onValueChange={setBillStatus}>
                  <SelectTrigger className="w-36 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{["all", "UNPAID", "PARTIAL", "PAID", "WAIVED"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground">Pending ₹{Number((billing as any)?.pending ?? 0).toLocaleString("en-IN")}</span>
                {canManage && <Button size="sm" variant="gradient" className="h-9 text-xs ml-auto" onClick={generate}>Generate {month}/{year}</Button>}
              </div>
            </Card>
            {isLoading && rows.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">Loading billing…</Card>
            ) : rows.length === 0 ? (
              <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">No billing rows — generate the month to bill all active assignments.</Card>
            ) : (
              <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                      {canManage && <TableHead className="text-right">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((b: any) => (
                      <TableRow key={b.uuid}>
                        <TableCell className="text-xs"><div className="font-medium">{b.student?.name}</div><div className="text-muted-foreground text-[11px]">{b.student?.admissionNo}</div></TableCell>
                        <TableCell className="text-xs font-mono">{b.zoneCode}</TableCell>
                        <TableCell className="text-xs font-mono">₹{b.amountDue}</TableCell>
                        <TableCell className="text-xs font-mono">₹{b.amountPaid}</TableCell>
                        <TableCell><Badge variant={b.status === "PAID" ? "default" : b.status === "WAIVED" ? "secondary" : "destructive"} className="text-[10px]">{b.status}</Badge></TableCell>
                        <TableCell className="text-xs font-mono">{b.feeInvoice?.invoiceNumber ?? "—"}</TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            {b.status !== "PAID" && b.status !== "WAIVED" && (
                              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => waive(b.uuid)}>Waive</Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          <TabsContent value="slabs" className="mt-3">
            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(slabs as any[]).map((s: any) => (
                    <Badge key={s.uuid} variant="outline" className="text-[11px]">Zone {s.zone} · {s.label} · ₹{s.feePerMonth}/mo</Badge>
                  ))}
                  {canManage && <Button size="sm" variant="outline" className="h-7 text-[11px] ml-auto" onClick={seedSlabs}>Edit slabs (JSON)</Button>}
                </div>
                {canManage && slabRows && (
                  <div className="space-y-2">
                    <textarea value={slabRows} onChange={(e) => setSlabRows(e.target.value)} rows={8} className="w-full text-xs font-mono rounded-lg border bg-muted/20 p-2" />
                    <Button size="sm" className="h-8 text-xs" onClick={saveSlabs}>Save Slabs</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TransportPageShell>
    </SectionGuard>
  );
}
