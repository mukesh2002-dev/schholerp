"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Ban } from "lucide-react";
import { fetchAssignments, discontinueAssignmentApi } from "@/lib/api/fees";

const STATUS_OPTIONS = ["all", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"];

export function AssignmentsList() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [disc, setDisc] = useState<any | null>(null);
  const [discReason, setDiscReason] = useState("");
  const [waive, setWaive] = useState(false);

  const { data: assignments, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchAssignments({ campusId: cid, status: status === "all" ? undefined : status }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAssignments>>,
    queryKeyPrefix: `fee-assignments-${status}`,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assignments;
    return (assignments as any[]).filter((a) =>
      `${a.student?.firstName ?? ""} ${a.student?.lastName ?? ""} ${a.student?.admissionNo ?? ""} ${a.structure?.name ?? ""}`.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  const handleDiscontinue = async () => {
    if (!disc || !discReason.trim()) { toast.error("Reason is required"); return; }
    try {
      await discontinueAssignmentApi(disc.uuid, { discontinuedReason: discReason.trim(), waiveOutstanding: waive });
      toast.success(waive ? "Discontinued — open invoices cancelled" : "Discontinued — dues still owed");
      setDisc(null);
      setDiscReason("");
      setWaive(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Discontinue failed");
    }
  };

  return (
    <div className="space-y-3">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student / structure…" className="h-9 text-xs w-56" />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button asChild size="sm" variant="gradient" className="h-8 text-xs gap-1 ml-auto">
            <Link href="/fees/assignments/new"><Plus className="h-3.5 w-3.5" /> Assign / Bulk Assign</Link>
          </Button>
        </div>
      </Card>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead className="text-right tabular-nums">Assigned</TableHead>
              <TableHead className="text-right tabular-nums">Discount</TableHead>
              <TableHead className="text-right tabular-nums">Paid</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-8">Loading assignments…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-xs text-muted-foreground py-8">No assignments. Assign students to a fee structure to start billing.</TableCell></TableRow>
            ) : filtered.map((a: any) => (
              <TableRow key={a.uuid} className="hover:bg-muted/40">
                <TableCell className="text-sm font-semibold">
                  <Link href={`/fees/${a.student?.uuid ?? ""}`} className="hover:text-primary transition-colors">
                    {a.student ? `${a.student.firstName} ${a.student.lastName ?? ""}` : a.uuid.slice(0, 8)}
                  </Link>
                  <span className="block text-[11px] text-muted-foreground font-mono">{a.student?.admissionNo ?? ""}</span>
                </TableCell>
                <TableCell className="text-xs">{a.structure?.name ?? "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCurrency(a.totalAssigned)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{Number(a.discount ?? 0) > 0 ? `−${formatCurrency(a.discount)}` : "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(a.totalPaid ?? 0)}</TableCell>
                <TableCell className="text-xs">{a.dueDate ? formatDate(a.dueDate) : "—"}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{a.discontinuedAt ? "DISCONTINUED" : a.status}</Badge></TableCell>
                <TableCell className="text-right">
                  {!a.discontinuedAt && disc?.uuid !== a.uuid && (
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive" onClick={() => { setDisc(a); setDiscReason(""); setWaive(false); }}>
                      <Ban className="h-3 w-3" /> Discontinue
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {disc && (
        <Card className="p-3 border-destructive/40 bg-destructive/5 space-y-2">
          <p className="text-xs font-semibold text-destructive">
            Discontinue billing for {disc.student ? `${disc.student.firstName} ${disc.student.lastName ?? ""}` : "this student"}? Stops future invoices — history stays untouched.
          </p>
          <Input value={discReason} onChange={(e) => setDiscReason(e.target.value)} placeholder="Reason (e.g. TC issued — transferred…)…" className="h-9 text-xs" />
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={waive} onChange={(e) => setWaive(e.target.checked)} className="h-3.5 w-3.5 rounded border" />
            Also cancel all unpaid invoices (waive outstanding)
          </label>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => void handleDiscontinue()}>Confirm Discontinue</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setDisc(null)}>Back</Button>
          </div>
        </Card>
      )}
    </div>
  );
}