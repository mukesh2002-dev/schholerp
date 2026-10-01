"use client";

import { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowUpDown, Bell } from "lucide-react";
import { fetchDefaulters, markOverdueApi } from "@/lib/api/fees";

export function DefaultersTab({ onCollect }: { onCollect?: (studentUuid: string) => void }) {
  const { activeBranchId } = useERP();
  const [asOf, setAsOf] = useState("");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [overdueBusy, setOverdueBusy] = useState(false);

  const { data: defaulters, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchDefaulters({ campusId: cid, asOf: asOf || undefined }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchDefaulters>>,
    queryKeyPrefix: "fee-defaulters",
  });

  const sorted = [...defaulters].sort((a: any, b: any) => {
    const da = Number(a.balance ?? 0);
    const db = Number(b.balance ?? 0);
    return dir === "desc" ? db - da : da - db;
  });

  const handleMarkOverdue = async () => {
    setOverdueBusy(true);
    try {
      const res = await markOverdueApi();
      toast.success(`Marked ${res.marked} invoice(s) overdue`);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Overdue job failed");
    } finally {
      setOverdueBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium">As of</label>
            <Input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="h-9 text-xs w-40" />
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => void refresh()}>Apply</Button>
          </div>
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => setDir((d) => (d === "desc" ? "asc" : "desc"))}>
            <ArrowUpDown className="h-3.5 w-3.5" /> Due {dir === "desc" ? "High→Low" : "Low→High"}
          </Button>
          <Button variant="gradient" size="sm" className="h-9 text-xs ml-auto" onClick={() => void handleMarkOverdue()} disabled={overdueBusy}>
            {overdueBusy ? "Running…" : "Run Overdue Job"}
          </Button>
        </div>
      </Card>

      {isLoading && sorted.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading defaulters…</Card>
      ) : sorted.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">No defaulters 🎉</h3>
          <p className="text-xs text-muted-foreground mt-1">All dues are clear. Discontinued students are excluded by default.</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Overdue By</TableHead>
                <TableHead className="text-right tabular-nums">Balance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((d: any, i: number) => {
                const s = d.student ?? {};
                const sName = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "—";
                return (
                <TableRow key={d.uuid ?? i}>
                  <TableCell className="text-sm font-semibold">
                    {sName}
                    <span className="block text-[11px] text-muted-foreground font-mono">Adm {s.admissionNo ?? ""}{d.invoiceNumber ? ` • ${d.invoiceNumber}` : ""}</span>
                  </TableCell>
                  <TableCell className="text-xs">{s.class ? `${s.class.name ?? ""} ${s.class.section ?? ""}`.trim() : "—"}</TableCell>
                  <TableCell className="text-xs">{d.overdueDays != null ? `${d.overdueDays} days` : d.dueDate ? formatDate(d.dueDate) : "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-rose-600">{formatCurrency(d.balance ?? 0)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onCollect && s.uuid && (
                        <Button size="sm" className="h-7 text-[11px]" onClick={() => onCollect(s.uuid)}>Collect</Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => toast.info(`Reminder noted for ${sName}`, { description: s.guardianPhone ? `Call ${s.guardianPhone}. Send via SMS/Email from Messages module.` : "Send via SMS/Email from Messages module." })}>
                        <Bell className="h-3 w-3" /> Remind
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
