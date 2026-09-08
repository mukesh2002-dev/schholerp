"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ListPagination } from "@/components/ui/list-pagination";
import { AppImage } from "@/components/ui/app-image";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import { calculateDueAmount, detectFeeSearchKind } from "@/lib/fees/fee-utils";
import { toast } from "sonner";
import {
  CreditCard,
  Receipt,
  AlertTriangle,
  Search,
  Send,
  CheckCircle2,
  Users,
  ArrowUpDown,
  Printer,
  Download,
  X,
} from "lucide-react";
import type { PaymentRecord } from "@/types";

function statusBadge(status: string) {
  if (status === "PAID") return "success" as const;
  if (status === "PARTIAL") return "warning" as const;
  if (status === "OVERDUE") return "destructive" as const;
  return "secondary" as const;
}

function FeeStatusBadge({ status }: { status: string }) {
  return <Badge variant={statusBadge(status)} className="text-[10px]">{status}</Badge>;
}

export function FeesDirectoryView() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const [students] = useState(() => mockDb.getStudents(activeBranchId));
  const [assignments, setAssignments] = useState(() => mockDb.getFeeAssignments(activeBranchId));
  const [invoices, setInvoices] = useState(() => mockDb.getInvoices(activeBranchId));
  const [payments, setPayments] = useState(() => mockDb.getPayments(activeBranchId));
  const feeHeads = mockDb.getFeeHeads();
  const classes = mockDb.getClasses(activeBranchId);

  // Search spec §4
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  // Defaulters controls
  const [defaulterClass, setDefaulterClass] = useState<string>("ALL");
  const [defaulterSortDir, setDefaulterSortDir] = useState<"asc" | "desc">("desc");

  // Collect Payment dialog
  const [payOpen, setPayOpen] = useState(false);
  const [payStudentId, setPayStudentId] = useState<string>("");
  const [payFeeHeadIds, setPayFeeHeadIds] = useState<string[]>([]);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<PaymentRecord["method"]>("CASH");
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const refresh = useCallback(() => {
    setAssignments([...mockDb.getFeeAssignments(activeBranchId)]);
    setInvoices([...mockDb.getInvoices(activeBranchId)]);
    setPayments([...mockDb.getPayments(activeBranchId)]);
  }, [activeBranchId]);

  // Map studentId -> assignment/payment helpers
  const assignmentByStudent = useMemo(() => {
    const m = new Map<string, (typeof assignments)[number]>();
    assignments.forEach((a) => m.set(a.studentId, a));
    return m;
  }, [assignments]);

  const transportByStudent = useMemo(() => {
    const m = new Map<string, ReturnType<typeof mockDb.getStudentTransportAssignmentByStudentId>>();
    students.forEach((s) => {
      const t = mockDb.getStudentTransportAssignmentByStudentId(s.id);
      if (t) m.set(s.id, t);
    });
    return m;
  }, [students, assignments]);

  // Student List filtering per spec
  const filteredStudents = useMemo(() => {
    const q = debouncedSearch.trim();
    if (q.length < 2) return students;
    const kind = detectFeeSearchKind(q);
    const lower = q.toLowerCase();
    return students.filter((s) => {
      const adm = (s.admissionNumber ?? "").toLowerCase();
      const roll = (s.rollNumber ?? "").toLowerCase();
      const name = (s.fullName ?? "").toLowerCase();
      const className = (s.className ?? "").toLowerCase();
      const sectionName = (s.sectionName ?? "").toLowerCase();
      const classSection = `${className} ${sectionName}`.trim();
      const classSectionDash = `${className}-${sectionName}`.trim();

      if (kind === "ADMISSION_NUMBER") {
        // pure numbers or ADM/STU pattern -> match admissionNumber / rollNumber
        const digits = lower.replace(/\D/g, "");
        return adm.includes(lower) || roll.includes(lower) || (digits.length > 0 && (adm.includes(digits) || roll.includes(digits)));
      }
      if (kind === "CLASS_SECTION") {
        // "10-A" / "10 A" style -> match class + section
        const norm = lower.replace(/\s+/g, " ").replace(/\s*-\s*/g, "-");
        const normSpace = lower.replace(/-/g, " ").replace(/\s+/g, " ").trim();
        return (
          classSection.includes(normSpace) ||
          classSectionDash.includes(norm) ||
          classSection.replace(/\s+/g, "-").includes(norm) ||
          // split parts must all appear
          normSpace.split(" ").every((part) => classSection.includes(part))
        );
      }
      // NAME partial
      return name.includes(lower);
    });
  }, [students, debouncedSearch]);

  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(filteredStudents, 9);

  // Defaulters derived: pending >0 or overdue
  const defaulters = useMemo(() => {
    let list = assignments.filter((a) => a.status === "OVERDUE" || (a.totalPending > 0 && a.status !== "PAID"));
    if (defaulterClass !== "ALL") list = list.filter((a) => a.classId === defaulterClass || a.className === defaulterClass);
    list.sort((a, b) => {
      const dueA = calculateDueAmount(a.totalAssigned, a.discount ?? 0, a.totalPaid) + (a.lateFee ?? 0);
      const dueB = calculateDueAmount(b.totalAssigned, b.discount ?? 0, b.totalPaid) + (b.lateFee ?? 0);
      return defaulterSortDir === "desc" ? dueB - dueA : dueA - dueB;
    });
    return list;
  }, [assignments, defaulterClass, defaulterSortDir]);

  const { page: defPage, totalPages: defTotalPages, totalItems: defTotalItems, pageItems: defPageItems, setPage: setDefPage } = usePagination(defaulters, 10);

  const openCollectFor = (studentId: string) => {
    setPayStudentId(studentId);
    const a = assignmentByStudent.get(studentId);
    const due = a ? calculateDueAmount(a.totalAssigned, a.discount ?? 0, a.totalPaid) + (a.lateFee ?? 0) : 0;
    setPayAmount(due > 0 ? String(due) : "");
    // default fee heads: select all pending heads or first tuition
    if (a?.feeHeads && a.feeHeads.length > 0) {
      const pendingIds = a.feeHeads.filter((h) => h.dueAmount > 0).map((h) => h.feeHeadId);
      setPayFeeHeadIds(pendingIds.length > 0 ? pendingIds : [a.feeHeads[0].feeHeadId]);
    } else {
      setPayFeeHeadIds(["fh-01"]);
    }
    setPayOpen(true);
  };

  const handleCollectSubmit = () => {
    if (!payStudentId) { toast.error("Select a student"); return; }
    const amt = Number(payAmount);
    if (!amt || amt <= 0) { toast.error("Enter valid amount"); return; }
    const a = assignmentByStudent.get(payStudentId);
    const due = a ? calculateDueAmount(a.totalAssigned, a.discount ?? 0, a.totalPaid) + (a.lateFee ?? 0) : Infinity;
    if (amt > due) { toast.error(`Amount exceeds due ${formatCurrency(due)}`); return; }
    // try invoice first, fallback to direct
    const pendingInv = invoices.find((i) => i.studentId === payStudentId && i.balanceAmount > 0);
    let rec: PaymentRecord | null = null;
    if (pendingInv) {
      rec = mockDb.recordPayment(pendingInv.id, Math.min(amt, pendingInv.balanceAmount), payMethod, payFeeHeadIds);
      // if amount larger than first invoice, apply remainder to next
      let remaining = amt - (pendingInv.balanceAmount < amt ? pendingInv.balanceAmount : amt);
      let idx = 0;
      while (remaining > 0) {
        const nextInv = invoices.filter((i) => i.studentId === payStudentId && i.balanceAmount > 0)[idx];
        if (!nextInv) break;
        // already paid first, find next pending after refresh? simplified use direct
        const extra = mockDb.recordDirectPayment(payStudentId, remaining, payMethod, payFeeHeadIds);
        if (extra) rec = extra;
        break;
      }
    } else {
      rec = mockDb.recordDirectPayment(payStudentId, amt, payMethod, payFeeHeadIds);
    }
    if (rec) {
      setLastReceipt(rec);
      setReceiptOpen(true);
      toast.success(`Payment recorded — ${formatCurrency(amt)}`, { description: `Receipt ${rec.receiptNumber} • ${payMethod}` });
      setPayOpen(false);
      setPayAmount("");
      refresh();
    } else {
      toast.error("Payment failed — student not found");
    }
  };

  const toggleFeeHead = (id: string) => {
    setPayFeeHeadIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedStudent = students.find((s) => s.id === payStudentId);
  const selectedAssignment = payStudentId ? assignmentByStudent.get(payStudentId) : null;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="students" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="students" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Student List ({filteredStudents.length})</TabsTrigger>
            <TabsTrigger value="defaulters" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Defaulters ({defaulters.length})</TabsTrigger>
            <TabsTrigger value="ledger" className="gap-1.5 text-xs"><Receipt className="h-3.5 w-3.5" /> Ledger ({payments.length})</TabsTrigger>
            <TabsTrigger value="heads" className="gap-1.5 text-xs"><CreditCard className="h-3.5 w-3.5" /> Fee Heads</TabsTrigger>
          </TabsList>
          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" onClick={() => { setPayStudentId(students[0]?.id ?? ""); setPayOpen(true); }}>
            <CreditCard className="h-3.5 w-3.5" /> Collect Payment
          </Button>
        </div>

        {/* Student List */}
        <TabsContent value="students" className="space-y-4">
          <Card className="p-3 border-border/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search — numbers → admission no, e.g. 10-A → class+section, else name… (min 2 chars, 350ms debounce)"
                    className="pl-9 h-9 text-xs"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] hidden sm:flex gap-1">
                  <Search className="h-3 w-3" />
                  {detectFeeSearchKind(search || "name") === "ADMISSION_NUMBER" ? "Admission" : detectFeeSearchKind(search || "name") === "CLASS_SECTION" ? "Class-Section" : "Name"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {search.trim().length > 0 && search.trim().length < 2 ? "Type at least 2 characters to search." : filteredStudents.length === students.length && search.trim().length >= 2 ? `Found ${filteredStudents.length} match${filteredStudents.length === 1 ? "" : "es"} for “${debouncedSearch}”` : `${filteredStudents.length} students • Due = Assigned − Discount − Paid`}
              </p>
            </div>
          </Card>

          {filteredStudents.length === 0 ? (
            <Card className="border-dashed p-10 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">No results</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  No student found for “{debouncedSearch}”. Try admission number (e.g. 1042), class-section (e.g. 10-A or Grade 10 A), or partial name.
                </p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSearch("")}>Clear search</Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pageItems.map((stu) => {
                  const a = assignmentByStudent.get(stu.id);
                  const due = a ? calculateDueAmount(a.totalAssigned, a.discount ?? 0, a.totalPaid) + (a.lateFee ?? 0) : 0;
                  const status = a?.status ?? "PENDING";
                  return (
                    <Card key={stu.id} className="border-border/70 hover:border-primary/30 transition-colors group">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex gap-3">
                          <AppImage src={stu.avatar} alt={stu.fullName} className="h-11 w-11 rounded-xl ring-1 ring-border" />
                          <div className="flex-1 min-w-0">
                            <Link href={`/fees/${stu.id}`} className="font-bold text-sm hover:text-primary transition-colors line-clamp-1">
                              {stu.fullName}
                            </Link>
                            <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                              <span className="font-mono">{stu.rollNumber}</span>
                              <span>• {stu.className}</span>
                              {stu.sectionName && <span>— {stu.sectionName}</span>}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">Adm {stu.admissionNumber}</div>
                          </div>
                          <FeeStatusBadge status={status} />
                        </div>

                        {a && (
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 rounded-lg bg-muted/40 border">
                              <div className="text-[10px] text-muted-foreground">Assigned</div>
                              <div className="font-bold font-mono text-xs">{formatCurrency(a.totalAssigned)}</div>
                              {a.discount > 0 && <div className="text-[10px] text-emerald-600">−{formatCurrency(a.discount)} disc</div>}
                              {(() => { const t = transportByStudent.get(stu.id); return t ? <div className="text-[10px] text-sky-700">Bus Zone {t.zone} {formatCurrency(t.feePerMonth)}/mo</div> : null; })()}
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                              <div className="text-[10px] text-muted-foreground">Paid</div>
                              <div className="font-bold font-mono text-xs text-emerald-600">{formatCurrency(a.totalPaid)}</div>
                              <div className="text-[10px] text-muted-foreground">{a.lastPaymentDate ? formatDate(a.lastPaymentDate) : "—"}</div>
                            </div>
                            <div className={`p-2 rounded-lg border ${status === "OVERDUE" ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                              <div className="text-[10px] text-muted-foreground">Due</div>
                              <div className={`font-bold font-mono text-xs ${status === "OVERDUE" ? "text-rose-600" : "text-amber-600"}`}>{formatCurrency(due)}</div>
                              {a.lateFee > 0 && <div className="text-[10px] text-rose-600">+{formatCurrency(a.lateFee)} late</div>}
                              {(() => { const t = transportByStudent.get(stu.id); return t?.isProrated ? <div className="text-[10px] text-sky-600">prorated {formatCurrency(t.proratedFee!)}</div> : null; })()}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 h-7 text-[11px]">
                            <Link href={`/fees/${stu.id}`}>View Detail</Link>
                          </Button>
                          <Button size="sm" className="flex-1 h-7 text-[11px] gap-1" disabled={a ? due <= 0 : false} onClick={() => openCollectFor(stu.id)}>
                            <CreditCard className="h-3 w-3" /> Pay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <ListPagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={9} onPageChange={setPage} label="students" />
            </>
          )}
        </TabsContent>

        {/* Defaulters */}
        <TabsContent value="defaulters" className="space-y-4">
          <Card className="p-3 border-border/70">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={defaulterClass} onValueChange={setDefaulterClass}>
                <SelectTrigger className="w-[200px] h-9 text-xs"><SelectValue placeholder="Filter by class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => setDefaulterSortDir((d) => (d === "desc" ? "asc" : "desc"))}>
                <ArrowUpDown className="h-3.5 w-3.5" /> Due {defaulterSortDir === "desc" ? "High→Low" : "Low→High"}
              </Button>
              <span className="text-xs text-muted-foreground self-center">Sortable by due amount • Overdue = due date &gt;15 days + late fee</span>
            </div>
          </Card>

          {defaulters.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h3 className="font-semibold text-sm mt-3">No defaulters</h3>
              <p className="text-xs text-muted-foreground mt-1">All dues are clear for the selected filter. Green badges = Paid.</p>
            </Card>
          ) : (
            <>
              <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right tabular-nums">Assigned</TableHead>
                      <TableHead className="text-right tabular-nums">Discount</TableHead>
                      <TableHead className="text-right tabular-nums">Paid</TableHead>
                      <TableHead className="text-right tabular-nums"><button onClick={() => setDefaulterSortDir((d) => (d === "desc" ? "asc" : "desc"))} className="inline-flex items-center gap-1 hover:text-foreground">Due <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defPageItems.map((a) => {
                      const due = calculateDueAmount(a.totalAssigned, a.discount ?? 0, a.totalPaid) + (a.lateFee ?? 0);
                      return (
                        <TableRow key={a.id} className="hover:bg-muted/40">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const s = students.find((x) => x.id === a.studentId);
                                return s ? <AppImage src={s.avatar} alt={a.studentName} className="h-7 w-7 rounded-full ring-1 ring-border" /> : null;
                              })()}
                              <div>
                                <div className="font-semibold text-sm">{a.studentName}</div>
                                <div className="text-[11px] text-muted-foreground font-mono">{a.studentRoll} • {a.studentId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{a.className}<span className="text-muted-foreground block text-[11px]">{a.sectionName ?? ""}</span></TableCell>
                          <TableCell className="text-right tabular-nums text-xs font-mono">{formatCurrency(a.totalAssigned)}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs font-mono text-emerald-600">{a.discount > 0 ? `−${formatCurrency(a.discount)}` : "—"}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs font-mono text-emerald-600">{formatCurrency(a.totalPaid)}</TableCell>
                          <TableCell className="text-right tabular-nums text-xs font-mono font-bold text-rose-600">{formatCurrency(due)}{a.lateFee > 0 && <span className="block text-[10px] text-rose-500">inc. {formatCurrency(a.lateFee)} late</span>}</TableCell>
                          <TableCell><FeeStatusBadge status={a.status} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button asChild variant="outline" size="sm" className="h-7 text-[11px]"><Link href={`/fees/${a.studentId}`}>Detail</Link></Button>
                              <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => openCollectFor(a.studentId)}><CreditCard className="h-3 w-3" /> Pay</Button>
                              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={() => toast.info(`Reminder sent to ${a.studentName}`, { description: "SMS + Email dispatched." })}><Send className="h-3 w-3" /> Remind</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <ListPagination page={defPage} totalPages={defTotalPages} totalItems={defTotalItems} pageSize={10} onPageChange={setDefPage} label="defaulters" />
            </>
          )}
        </TabsContent>

        {/* Ledger / Receipts */}
        <TabsContent value="ledger" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="text-right tabular-nums">Amount</TableHead>
                  <TableHead>Heads</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 50).map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-xs">{p.receiptNumber}</TableCell>
                    <TableCell className="text-sm font-semibold">{p.studentName}<span className="block text-[11px] text-muted-foreground font-mono">{p.studentId}</span></TableCell>
                    <TableCell className="font-mono text-xs">{p.invoiceNumber}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                    <TableCell className="text-xs">{p.feeHeadNames?.join(", ") ?? p.notes ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.method}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(p.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-[11px] text-muted-foreground">Receipt format: RCP-{"{year}"}-{"{5-digit}"} sequential unique • {payments.length} total receipts</p>
        </TabsContent>

        {/* Fee Heads */}
        <TabsContent value="heads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feeHeads.map((h) => (
              <Card key={h.id} className="border-border/70">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: h.color }} />
                    <h3 className="font-bold text-sm">{h.name}</h3>
                    <Badge variant={h.isRecurring ? "secondary" : "outline"} className="text-[10px] ml-auto">{h.isRecurring ? "Recurring" : "One-time"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{h.description}</p>
                  <Badge variant="outline" className="text-[10px]">{h.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Collect Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
            <DialogDescription>Select student → fee head(s) → amount → payment mode → receipt RCP-YYYY-XXXXX</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Student</label>
              <Select value={payStudentId} onValueChange={setPayStudentId}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) => {
                    const a = assignmentByStudent.get(s.id);
                    const due = a ? calculateDueAmount(a.totalAssigned, a.discount ?? 0, a.totalPaid) + (a.lateFee ?? 0) : 0;
                    return (
                      <SelectItem key={s.id} value={s.id}>{s.fullName} — {s.rollNumber} • {s.className} {due > 0 ? `• Due ${formatCurrency(due)}` : "• Paid"}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedStudent && selectedAssignment && (
                <div className="mt-2 p-3 rounded-lg bg-muted/40 border text-xs space-y-1">
                  <div className="flex justify-between"><span>Assigned:</span><strong>{formatCurrency(selectedAssignment.totalAssigned)}</strong></div>
                  <div className="flex justify-between text-emerald-600"><span>Discount:</span><strong>−{formatCurrency(selectedAssignment.discount ?? 0)}</strong></div>
                  <div className="flex justify-between"><span>Paid (sum partials):</span><strong className="text-emerald-600">{formatCurrency(selectedAssignment.totalPaid)}</strong></div>
                  {selectedAssignment.lateFee > 0 && <div className="flex justify-between text-rose-600"><span>Late fee:</span><strong>+{formatCurrency(selectedAssignment.lateFee)}</strong></div>}
                  <div className="flex justify-between border-t pt-1 font-bold"><span>Due:</span><span>{formatCurrency(calculateDueAmount(selectedAssignment.totalAssigned, selectedAssignment.discount ?? 0, selectedAssignment.totalPaid) + (selectedAssignment.lateFee ?? 0))}</span></div>
                  <div className="text-[11px] text-muted-foreground">Status: <FeeStatusBadge status={selectedAssignment.status} /> • Due {formatDate(selectedAssignment.dueDate)}</div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium block mb-1">Fee Head(s)</label>
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg border bg-card max-h-32 overflow-y-auto">
                {feeHeads.map((h) => (
                  <label key={h.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={payFeeHeadIds.includes(h.id)} onChange={() => toggleFeeHead(h.id)} className="h-3.5 w-3.5 rounded border" />
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: h.color }} /> {h.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Multiple partial payments per fee head sum into Total Paid</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Amount (₹)</label>
                <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="Enter amount" type="number" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Payment Mode</label>
                <Select value={payMethod} onValueChange={(v) => setPayMethod(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={handleCollectSubmit} variant="gradient" className="gap-1"><CreditCard className="h-3.5 w-3.5" /> Record & Generate Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md print:shadow-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Payment Receipt</DialogTitle>
            <DialogDescription>Printable • Downloadable card</DialogDescription>
          </DialogHeader>
          {lastReceipt && (
            <div className="space-y-4 mt-2" id="fee-receipt-card">
              <Card className="border-primary/20 bg-card">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-sm">Apex ERP — Fee Receipt</div>
                      <div className="text-xs text-muted-foreground">Multi-Campus Group</div>
                    </div>
                    <Badge variant="success" className="font-mono text-xs">{lastReceipt.receiptNumber}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                    <div><span className="text-muted-foreground block">Student</span><strong>{lastReceipt.studentName}</strong><span className="block font-mono text-[11px]">{lastReceipt.studentId}</span></div>
                    <div><span className="text-muted-foreground block">Date</span><strong>{formatDate(lastReceipt.date)}</strong><span className="block text-[11px]">{lastReceipt.branchName}</span></div>
                    <div><span className="text-muted-foreground block">Invoice</span><strong className="font-mono">{lastReceipt.invoiceNumber}</strong></div>
                    <div><span className="text-muted-foreground block">Method</span><Badge variant="outline" className="text-[10px] mt-0.5">{lastReceipt.method}</Badge></div>
                    {lastReceipt.feeHeadNames && <div className="col-span-2"><span className="text-muted-foreground block">Fee Heads</span><strong>{lastReceipt.feeHeadNames.join(", ")}</strong></div>}
                    <div className="col-span-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-muted-foreground text-[11px] block">Amount Paid</span>
                      <span className="text-xl font-bold text-emerald-600">{formatCurrency(lastReceipt.amount)}</span>
                      <span className="text-[11px] text-muted-foreground block">Txn {lastReceipt.transactionId}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handlePrintReceipt}><Printer className="h-3.5 w-3.5" /> Print</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1" onClick={() => {
                      const blob = new Blob([document.getElementById("fee-receipt-card")?.outerHTML ?? ""], { type: "text/html" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${lastReceipt.receiptNumber}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}><Download className="h-3.5 w-3.5" /> Download</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptOpen(false)}>Close</Button>
            {lastReceipt && (
              <Button variant="gradient" onClick={() => router.push(`/fees/${lastReceipt.studentId}`)}>View Student Detail</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
