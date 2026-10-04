"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Zap, Users, Plus, Receipt } from "lucide-react";
import { fetchClasses } from "@/lib/api/classes";
import { fetchAcademicYears } from "@/lib/api/academics";
import {
  fetchAssignments,
  generateMonthlyInvoiceApi,
  generateMonthlyBulkInvoicesApi,
  createInvoiceApi,
} from "@/lib/api/fees";

const CURRENT_YEAR = new Date().getFullYear();

export function InvoiceGenerate() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  // Single monthly
  const [genStudentId, setGenStudentId] = useState("");
  const [genAssignments, setGenAssignments] = useState<any[]>([]);
  const [genAssignmentId, setGenAssignmentId] = useState("");
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1));
  const [genYear, setGenYear] = useState(String(CURRENT_YEAR));
  const [genBusy, setGenBusy] = useState(false);

  // Bulk
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkYearId, setBulkYearId] = useState("");
  const [bulkMonth, setBulkMonth] = useState(String(new Date().getMonth() + 1));
  const [bulkYear, setBulkYear] = useState(String(CURRENT_YEAR));
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);

  // Manual
  const [cStudentId, setCStudentId] = useState("");
  const [cAmount, setCAmount] = useState("");
  const [cDueDate, setCDueDate] = useState("");
  const [createBusy, setCreateBusy] = useState(false);

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

  const loadStudentAssignments = async () => {
    if (!genStudentId.trim()) { toast.error("Enter a student UUID / admission no"); return; }
    try {
      const list = await fetchAssignments({ campusId: branch, studentId: genStudentId.trim() });
      setGenAssignments(list);
      setGenAssignmentId(list.length === 1 ? list[0].uuid : "");
      if (list.length === 0) toast.info("No assignments for this student — assign a structure first");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load assignments");
    }
  };

  const handleGenerate = async () => {
    if (!genAssignmentId) { toast.error("Select an assignment"); return; }
    setGenBusy(true);
    try {
      const inv = await generateMonthlyInvoiceApi({ assignmentId: genAssignmentId, month: Number(genMonth), year: Number(genYear) }, branch);
      toast.success(`Invoice ${inv.invoiceNumber} generated`);
      setGenStudentId("");
      setGenAssignments([]);
      setGenAssignmentId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenBusy(false);
    }
  };

  const handleBulk = async () => {
    setBulkBusy(true);
    setBulkResult(null);
    try {
      const res = await generateMonthlyBulkInvoicesApi({
        campusId: branch,
        classId: bulkClassId || undefined,
        academicYearId: bulkYearId || undefined,
        month: Number(bulkMonth),
        year: Number(bulkYear),
      }, branch);
      setBulkResult(res);
      toast.success(`Generated ${res.generated}, skipped ${res.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk generation failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!cStudentId.trim() || !cAmount || !cDueDate) { toast.error("Student, amount and due date are required"); return; }
    setCreateBusy(true);
    try {
      const inv = await createInvoiceApi({ studentId: cStudentId.trim(), amount: Number(cAmount), dueDate: cDueDate }, branch);
      toast.success(`Invoice ${inv.invoiceNumber} created`);
      setCStudentId("");
      setCAmount("");
      setCDueDate("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreateBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/fees/invoices"><ArrowLeft className="h-3.5 w-3.5" /> Invoices</Link></Button>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs ml-auto"><Link href="/fees/invoices">View all invoices</Link></Button>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Zap className="h-4 w-4" /> Monthly — one student</h3>
          <p className="text-[11px] text-muted-foreground">Generates from the assignment's structure items applicable to that month (billing months, new-student-only, concession). Duplicate period → 409, never duplicates.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Student (UUID / admission no)</label>
              <div className="flex gap-2 mt-1">
                <Input value={genStudentId} onChange={(e) => setGenStudentId(e.target.value)} placeholder="Paste UUID" />
                <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => void loadStudentAssignments()}>Load</Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Assignment {genAssignments.length > 0 && <Badge variant="secondary" className="text-[10px]">{genAssignments.length}</Badge>}</label>
              <Select value={genAssignmentId} onValueChange={setGenAssignmentId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={genAssignments.length ? "Select assignment" : "Load student first"} /></SelectTrigger>
                <SelectContent>{genAssignments.map((a: any) => <SelectItem key={a.uuid} value={a.uuid}>{a.structure?.name ?? a.uuid} • {formatCurrency(a.totalAssigned)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-72">
            <div>
              <label className="text-xs font-medium">Month (1–12)</label>
              <Input type="number" min={1} max={12} value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Year</label>
              <Input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1 w-fit" onClick={() => void handleGenerate()} disabled={genBusy || !genAssignmentId}>
            <Zap className="h-3.5 w-3.5" /> {genBusy ? "Generating…" : "Generate Invoice"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Users className="h-4 w-4" /> Bulk — whole class, one month</h3>
          <p className="text-[11px] text-muted-foreground">Skips discontinued students and already-generated periods. Returns generated / skipped / errors — partial failures never crash the run.</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium">Class *</label>
              <Select value={bulkClassId} onValueChange={setBulkClassId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map((c: any) => <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Academic Year</label>
              <Select value={bulkYearId} onValueChange={setBulkYearId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="All years" /></SelectTrigger>
                <SelectContent><SelectItem value="">All years</SelectItem>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Month</label>
              <Input type="number" min={1} max={12} value={bulkMonth} onChange={(e) => setBulkMonth(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Year</label>
              <Input type="number" value={bulkYear} onChange={(e) => setBulkYear(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1 w-fit" onClick={() => void handleBulk()} disabled={bulkBusy || !bulkClassId}>
            <Users className="h-3.5 w-3.5" /> {bulkBusy ? "Generating…" : "Run Bulk Generation"}
          </Button>
          {bulkResult && (
            <div className="p-3 rounded-lg bg-muted/40 border text-xs">
              Generated: <strong className="text-emerald-600">{bulkResult.generated}</strong> • Skipped: <strong>{bulkResult.skipped}</strong> • Errors: <strong className={bulkResult.errors?.length ? "text-destructive" : ""}>{bulkResult.errors?.length ?? 0}</strong>
              {bulkResult.errors?.length > 0 && (
                <div className="mt-1 text-[11px] text-muted-foreground max-h-24 overflow-y-auto">
                  {bulkResult.errors.map((e: any, i: number) => <div key={i}>• {e.studentId ?? e.student?.uuid ?? "?"}: {e.error}</div>)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Plus className="h-4 w-4" /> Manual invoice (one-off)</h3>
          <p className="text-[11px] text-muted-foreground">Outside the monthly engine — e.g. fine, special charge. Use cancel from the Invoices page if wrong.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium">Student (UUID / admission no) *</label>
              <Input value={cStudentId} onChange={(e) => setCStudentId(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Amount (₹) *</label>
              <Input type="number" value={cAmount} onChange={(e) => setCAmount(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Due Date *</label>
              <Input type="date" value={cDueDate} onChange={(e) => setCDueDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1 w-fit" onClick={() => void handleCreate()} disabled={createBusy}>
            <Receipt className="h-3.5 w-3.5" /> {createBusy ? "Creating…" : "Create Invoice"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}