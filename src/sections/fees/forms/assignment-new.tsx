"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { createAssignmentApi, bulkCreateAssignmentsApi, fetchFeeStructures } from "@/lib/api/fees";
import { fetchClasses } from "@/lib/api/classes";
import { fetchAcademicYears } from "@/lib/api/academics";

export function AssignmentNew() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  // Single
  const [studentId, setStudentId] = useState(searchParams.get("student") ?? "");
  const [structureId, setStructureId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("FLAT");
  const [discountReason, setDiscountReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Bulk (class-wide: backend fetches all active students of the class)
  const [bStructureId, setBStructureId] = useState("");
  const [bClassId, setBClassId] = useState("");
  const [bYearId, setBYearId] = useState("");
  const [bDueDate, setBDueDate] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

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

  const handleCreate = async () => {
    if (!studentId.trim() || !structureId || !dueDate) { toast.error("Student, structure and due date are required"); return; }
    setSaving(true);
    try {
      await createAssignmentApi({
        studentId: studentId.trim(),
        structureId,
        discount: discount ? Number(discount) : 0,
        discountType,
        discountReason: discountReason || undefined,
        dueDate,
      }, branch);
      toast.success("Assignment created");
      router.push("/fees/assignments");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBulk = async () => {
    if (!bStructureId || !bClassId || !bDueDate) { toast.error("Structure, class and due date are required"); return; }
    setBulkBusy(true);
    try {
      const res = await bulkCreateAssignmentsApi({
        campusId: branch,
        classId: bClassId,
        academicYearId: bYearId || undefined,
        structureId: bStructureId,
        dueDate: bDueDate,
        // studentIds omitted → backend assigns ALL active students of the class
      }, branch);
      toast.success(`Created ${res.created}, skipped ${res.skipped}`);
      router.push("/fees/assignments");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk failed");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs gap-1"><Link href="/fees/assignments"><ArrowLeft className="h-3.5 w-3.5" /> Assignments</Link></Button>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold">Assign one student</h3>
          <p className="text-[11px] text-muted-foreground">Links a student to a fee structure. Duplicates (same student + structure) are rejected with 409.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Student (UUID / admission no) *</label>
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Paste student UUID" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Structure *</label>
              <Select value={structureId} onValueChange={setStructureId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>{structures.map((s: any) => <SelectItem key={s.uuid} value={s.uuid}>{s.name} • {formatCurrency(s.amount)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium">Due Date *</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Discount</label>
              <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium">Type</label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="FLAT">Flat ₹</SelectItem><SelectItem value="PERCENT">Percent %</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Reason</label>
              <Input value={discountReason} onChange={(e) => setDiscountReason(e.target.value)} placeholder="BPL / sibling…" className="mt-1" />
            </div>
          </div>
          <Button size="sm" onClick={() => void handleCreate()} disabled={saving} className="h-8 text-xs gap-1 w-fit">
            <Plus className="h-3.5 w-3.5" /> {saving ? "Assigning…" : "Assign"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Users className="h-4 w-4" /> Bulk assign — whole class (promotion flow)</h3>
          <p className="text-[11px] text-muted-foreground">
            Pick a class — the backend automatically assigns <strong>every active student of that class</strong> to the structure. Already-assigned students are skipped, never duplicated.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium">Structure *</label>
              <Select value={bStructureId} onValueChange={setBStructureId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select structure" /></SelectTrigger>
                <SelectContent>{structures.map((s: any) => <SelectItem key={s.uuid} value={s.uuid}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Class *</label>
              <Select value={bClassId} onValueChange={setBClassId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map((c: any) => <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium">Academic Year</label>
              <Select value={bYearId} onValueChange={setBYearId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent><SelectItem value="">None</SelectItem>{years.map((y) => <SelectItem key={y.uuid} value={y.uuid}>{y.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="sm:w-1/3">
            <label className="text-xs font-medium">Due Date *</label>
            <Input type="date" value={bDueDate} onChange={(e) => setBDueDate(e.target.value)} className="mt-1" />
          </div>
          <Button size="sm" variant="gradient" onClick={() => void handleBulk()} disabled={bulkBusy} className="h-8 text-xs gap-1 w-fit">
            <Users className="h-3.5 w-3.5" /> {bulkBusy ? "Assigning whole class…" : "Assign to Entire Class"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}