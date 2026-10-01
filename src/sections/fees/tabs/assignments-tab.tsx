"use client";

import { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Users, Ban } from "lucide-react";
import { fetchClasses } from "@/lib/api/classes";
import { fetchAcademicYears } from "@/lib/api/academics";
import {
  fetchAssignments,
  fetchFeeStructures,
  createAssignmentApi,
  bulkCreateAssignmentsApi,
  discontinueAssignmentApi,
} from "@/lib/api/fees";

export function AssignmentsTab() {
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [status, setStatus] = useState("all");
  const { data: assignments, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchAssignments({ campusId: cid, status: status === "all" ? undefined : status }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAssignments>>,
    queryKeyPrefix: "fee-assignments",
  });

  const { data: structures } = useCampusData({
    fetcher: (cid) => fetchFeeStructures({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeStructures>>,
    queryKeyPrefix: "fee-structures",
  });

  const { data: classes } = useCampusData({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchClasses>>,
    queryKeyPrefix: "classes",
  });

  const { data: years } = useCampusData({
    fetcher: (cid) => fetchAcademicYears({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAcademicYears>>,
    queryKeyPrefix: "academic-years",
  });

  // Single create
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [structureId, setStructureId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("FLAT");
  const [saving, setSaving] = useState(false);

  // Bulk
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStructureId, setBulkStructureId] = useState("");
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkYearId, setBulkYearId] = useState("");
  const [bulkDueDate, setBulkDueDate] = useState("");
  const [bulkIds, setBulkIds] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  // Discontinue
  const [disc, setDisc] = useState<any | null>(null);
  const [discReason, setDiscReason] = useState("");
  const [waive, setWaive] = useState(false);

  const handleCreate = async () => {
    if (!studentId.trim() || !structureId || !dueDate) { toast.error("Student, structure and due date are required"); return; }
    setSaving(true);
    try {
      await createAssignmentApi({
        studentId: studentId.trim(),
        structureId,
        discount: discount ? Number(discount) : 0,
        discountType,
        dueDate,
      }, branch);
      toast.success("Assignment created");
      setOpen(false);
      setStudentId(""); setStructureId(""); setDueDate(""); setDiscount("");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulk = async () => {
    const ids = bulkIds.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (!bulkStructureId || !bulkDueDate || ids.length === 0) { toast.error("Structure, due date and at least one student UUID required"); return; }
    setBulkBusy(true);
    try {
      const res = await bulkCreateAssignmentsApi({
        campusId: branch,
        classId: bulkClassId || undefined,
        academicYearId: bulkYearId || undefined,
        structureId: bulkStructureId,
        dueDate: bulkDueDate,
        studentIds: ids,
      }, branch);
      toast.success(`Created ${res.created}, skipped ${res.skipped}`);
      setBulkOpen(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDiscontinue = async () => {
    if (!disc || !discReason.trim()) { toast.error("Reason is required"); return; }
    try {
      await discontinueAssignmentApi(disc.uuid, { discontinuedReason: discReason.trim(), waiveOutstanding: waive });
      toast.success(waive ? "Discontinued — open invoices cancelled" : "Discontinued — dues still owed");
      setDisc(null); setDiscReason(""); setWaive(false);
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Discontinue failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v); setTimeout(() => void refresh(), 50); }}>
            <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially paid</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setOpen(true)}><Plus className="h-3.5 w-3.5" /> Assign</Button>
            <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" onClick={() => setBulkOpen(true)}><Users className="h-3.5 w-3.5" /> Bulk Assign</Button>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Structure</TableHead>
              <TableHead className="text-right tabular-nums">Assigned</TableHead>
              <TableHead className="text-right tabular-nums">Paid</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && assignments.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">Loading assignments…</TableCell></TableRow>
            ) : assignments.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">No assignments. Link students to a fee structure to start billing.</TableCell></TableRow>
            ) : assignments.map((a: any) => (
              <TableRow key={a.uuid}>
                <TableCell className="text-sm font-semibold">{a.student ? `${a.student.firstName} ${a.student.lastName ?? ""}` : a.uuid.slice(0, 8)}<span className="block text-[11px] text-muted-foreground font-mono">{a.student?.admissionNo ?? ""}</span></TableCell>
                <TableCell className="text-xs">{a.structure?.name ?? "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatCurrency(a.totalAssigned)}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(a.totalPaid ?? 0)}</TableCell>
                <TableCell className="text-xs">{a.dueDate ? formatDate(a.dueDate) : "—"}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{a.discontinuedAt ? "DISCONTINUED" : a.status}</Badge></TableCell>
                <TableCell className="text-right">
                  {!a.discontinuedAt && (
                    <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive" onClick={() => setDisc(a)}><Ban className="h-3 w-3" /> Discontinue</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Single assign */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Fee Structure</DialogTitle><DialogDescription>Link one student to a structure. Duplicates return 409.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium">Student (UUID / admission no) *</label><Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Paste student UUID" /></div>
            <div>
              <label className="text-xs font-medium">Structure *</label>
              <Select value={structureId} onValueChange={setStructureId}>
                <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>{structures.map((s: any) => <SelectItem key={s.uuid} value={s.uuid}>{s.name} • {formatCurrency(s.amount)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="text-xs font-medium">Due Date *</label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              <div><label className="text-xs font-medium">Discount</label><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" /></div>
              <div>
                <label className="text-xs font-medium">Type</label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="FLAT">Flat ₹</SelectItem><SelectItem value="PERCENT">Percent %</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void handleCreate()} disabled={saving}>{saving ? "Assigning…" : "Assign"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk assign */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bulk Assign — Promotion Flow</DialogTitle><DialogDescription>Assign many promoted students at once. Existing links are skipped.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium">Structure *</label>
              <Select value={bulkStructureId} onValueChange={setBulkStructureId}>
                <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>{structures.map((s: any) => <SelectItem key={s.uuid} value={s.uuid}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Class</label>
                <Select value={bulkClassId} onValueChange={setBulkClassId}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent><SelectItem value="">None</SelectItem>{classes.map((c: any) => <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Academic Year</label>
                <Select value={bulkYearId} onValueChange={setBulkYearId}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent><SelectItem value="">None</SelectItem>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium">Due Date *</label><Input type="date" value={bulkDueDate} onChange={(e) => setBulkDueDate(e.target.value)} /></div>
            <div><label className="text-xs font-medium">Student UUIDs (comma / space / newline separated) *</label><Input value={bulkIds} onChange={(e) => setBulkIds(e.target.value)} placeholder="uuid1, uuid2, …" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button><Button variant="gradient" onClick={() => void handleBulk()} disabled={bulkBusy}>{bulkBusy ? "Assigning…" : "Bulk Assign"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discontinue */}
      <Dialog open={disc !== null} onOpenChange={(v) => { if (!v) setDisc(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Discontinue Billing</DialogTitle><DialogDescription>Stops all future invoices. History stays untouched.</DialogDescription></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium">Reason *</label><Input value={discReason} onChange={(e) => setDiscReason(e.target.value)} placeholder="TC issued — transferred…" /></div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={waive} onChange={(e) => setWaive(e.target.checked)} className="h-3.5 w-3.5 rounded border" />
              Also cancel all unpaid invoices (waive outstanding)
            </label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDisc(null)}>Back</Button><Button variant="destructive" onClick={() => void handleDiscontinue()}>Discontinue</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
