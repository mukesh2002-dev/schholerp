"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Printer } from "lucide-react";
import {
  fetchFeeSlabs, upsertFeeSlabsApi, generateBillingApi, updateBillingApi,
  fetchTransportBills, collectTransportPaymentApi, fetchTransportPayments,
  fetchTransportReceipt, grantConcessionApi, fetchTransportLedger,
  fetchFeeCollectionReport, fetchFeePendingReport, fetchFeeOverdueReport,
  type TransportBill,
} from "@/lib/api/transport";

const MODES = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE", "ONLINE"];

function statusBadge(s: string) {
  const v = s === "default" ? "default" : s === "PAID" ? "default" : s === "WAIVED" ? "secondary" : s === "OVERDUE" ? "destructive" : s === "PARTIAL" ? "secondary" : "outline";
  return <Badge variant={v as any} className="text-[10px]">{s}</Badge>;
}

function ReceiptCard({ receipt, onPrint }: { receipt: any; onPrint?: () => void }) {
  if (!receipt) return null;
  return (
    <Card className="border-border/70 print:border-black">
      <CardContent className="p-4 space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Transport Fee Receipt</h3>
          <span className="font-mono font-bold">{receipt.receiptNumber}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div>Student: <strong>{receipt.student?.name}</strong> ({receipt.student?.admissionNo})</div>
          <div>Month: <strong>{receipt.billing?.month}/{receipt.billing?.year}</strong> · Zone {receipt.billing?.zoneCode}</div>
          <div>Amount: <strong className="font-mono">₹{receipt.amount}</strong> via {receipt.paymentMode}</div>
          <div>Date: <strong>{String(receipt.paymentDate).slice(0, 10)}</strong></div>
          {receipt.transactionRef && <div>Txn: <span className="font-mono">{receipt.transactionRef}</span></div>}
          {receipt.receivedBy && <div>Received by: {receipt.receivedBy.name}</div>}
        </div>
        {onPrint && <Button size="sm" variant="outline" className="h-8 text-xs gap-1 print:hidden" onClick={onPrint}><Printer className="h-3.5 w-3.5" /> Print</Button>}
      </CardContent>
    </Card>
  );
}

export default function TransportFeesPage() {
  const { activeBranchId, session } = useERP();
  const canCollect = ["ADMIN", "PRINCIPAL", "ACCOUNTANT"].includes(String(session?.role ?? ""));
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [billStatus, setBillStatus] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);
  const bump = () => setReloadKey((k) => k + 1);

  // ── Billing ──
  const { data: billing, isLoading: billingLoading } = useCampusData({
    fetcher: (cid) => fetchTransportBills({ campusId: cid, month: Number(month), year: Number(year), status: billStatus === "all" ? undefined : billStatus, limit: 100 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-bills-${month}-${year}-${billStatus}-${reloadKey}`,
  });
  const bills = (billing as any)?.data ?? [];

  const generate = async () => {
    try {
      const res = await generateBillingApi({ month: Number(month), year: Number(year) }, activeBranchId);
      toast.success(`Billed ${res.billed}, skipped ${res.skipped}`);
      bump();
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    }
  };

  // ── Collect ──
  const [payBillUuid, setPayBillUuid] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("CASH");
  const [payTxn, setPayTxn] = useState("");
  const [payRemarks, setPayRemarks] = useState("");
  const [paying, setPaying] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const payBill = bills.find((b: TransportBill) => b.uuid === payBillUuid);

  const pay = async () => {
    if (!payBillUuid || !payAmount) {
      toast.error("Bill aur amount chuno");
      return;
    }
    setPaying(true);
    try {
      const res = await collectTransportPaymentApi(payBillUuid, {
        amount: Number(payAmount), paymentMode: payMode,
        transactionRef: payTxn || undefined, remarks: payRemarks || undefined,
      });
      setLastReceipt(res.receipt);
      toast.success(`Receipt ${res.receipt.receiptNumber} — balance ₹${res.bill.balance}`);
      setPayAmount("");
      setPayTxn("");
      setPayRemarks("");
      bump();
    } catch (e: any) {
      toast.error(e?.message ?? "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  // ── Discount / waiver ──
  const [concBillUuid, setConcBillUuid] = useState("");
  const [concType, setConcType] = useState("DISCOUNT_FIXED");
  const [concValue, setConcValue] = useState("");
  const [concReason, setConcReason] = useState("");
  const grant = async () => {
    if (!concBillUuid || !concReason.trim()) {
      toast.error("Bill aur reason zaruri hai");
      return;
    }
    try {
      await grantConcessionApi(concBillUuid, {
        type: concType,
        amount: concType === "DISCOUNT_FIXED" ? Number(concValue) : undefined,
        percent: concType === "DISCOUNT_PERCENT" ? Number(concValue) : undefined,
        reason: concReason,
      });
      toast.success("Concession applied");
      setConcValue("");
      setConcReason("");
      bump();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  };

  // ── Receipts ──
  const { data: payments } = useCampusData({
    fetcher: (cid) => fetchTransportPayments({ campusId: cid, limit: 50 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-receipts-${reloadKey}`,
  });
  const [viewReceipt, setViewReceipt] = useState<any>(null);
  const openReceipt = async (uuid: string) => {
    try {
      setViewReceipt(await fetchTransportReceipt(uuid));
    } catch (e: any) {
      toast.error(e?.message ?? "Receipt load failed");
    }
  };

  // ── Pending / overdue ──
  const [poTab, setPoTab] = useState("pending");
  const { data: poData } = useCampusData({
    fetcher: (cid) => (poTab === "pending" ? fetchFeePendingReport({ campusId: cid, limit: 100 }) : fetchFeeOverdueReport({ campusId: cid, limit: 100 })),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: `transport-po-${poTab}-${reloadKey}`,
  });

  // ── Ledger ──
  const [ledgerUuid, setLedgerUuid] = useState("");
  const [ledger, setLedger] = useState<any>(null);
  const loadLedger = async () => {
    if (!ledgerUuid.trim()) {
      toast.error("Student UUID dalo (Allocation page se copy karo)");
      return;
    }
    try {
      setLedger(await fetchTransportLedger(ledgerUuid.trim()));
    } catch (e: any) {
      toast.error(e?.message ?? "Ledger load failed");
    }
  };

  // ── Reports ──
  const [repGroup, setRepGroup] = useState("day");
  const { data: repData } = useCampusData({
    fetcher: (cid) => fetchFeeCollectionReport({ campusId: cid, groupBy: repGroup }),
    campusId: activeBranchId,
    fallback: null,
    queryKeyPrefix: `transport-collect-rep-${repGroup}-${reloadKey}`,
  });
  const downloadCsv = () => {
    const groups: any[] = (repData as any)?.groups ?? [];
    const csv = ["Group,Collected,Receipts", ...groups.map((g) => `"${g.label}",${g.collected},${g.receipts}`)].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `transport-collection-${repGroup}.csv`;
    a.click();
  };

  // ── Slabs ──
  const { data: slabs, refresh: refreshSlabs } = useCampusData({
    fetcher: (cid) => fetchFeeSlabs({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "transport-fee-slabs",
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
      await upsertFeeSlabsApi({ slabs: parsed }, activeBranchId);
      toast.success("Fee slabs saved");
      setSlabRows("");
      refreshSlabs();
    } catch (e: any) {
      toast.error(e?.message ?? "Invalid slab JSON");
    }
  };

  return (
    <SectionGuard>
      <TransportPageShell
        title="Transport Fee Management"
        subtitle="Independent transport fee — apna structure, billing, collection, receipts, ledger. Main school fee se alag."
      >
        <Tabs defaultValue="billing">
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="billing" className="text-xs">Billing</TabsTrigger>
            <TabsTrigger value="collect" className="text-xs">Collect Payment</TabsTrigger>
            <TabsTrigger value="receipts" className="text-xs">Receipts</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pending / Overdue</TabsTrigger>
            <TabsTrigger value="ledger" className="text-xs">Ledger</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
            <TabsTrigger value="slabs" className="text-xs">Fee Structure</TabsTrigger>
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
                  <SelectContent>{["all", "UNPAID", "PARTIAL", "PAID", "WAIVED", "OVERDUE"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-[11px] text-muted-foreground">Pending ₹{Number((billing as any)?.pending ?? 0).toLocaleString("en-IN")}</span>
                {canCollect && <Button size="sm" variant="gradient" className="h-9 text-xs ml-auto" onClick={() => void generate()}>Generate {month}/{year}</Button>}
              </div>
            </Card>
            {billingLoading && bills.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">Loading billing…</Card>
            ) : bills.length === 0 ? (
              <Card className="border-dashed p-10 text-center space-y-2">
                <p className="text-xs text-muted-foreground">No billing rows for {month}/{year}.</p>
                <p className="text-[11px] text-muted-foreground">Billing sirf <strong>ACTIVE transport students</strong> par banta hai — pehle Student Allocation me assign karo, phir Generate dabao.</p>
                <Button asChild size="sm" variant="outline" className="h-8 text-xs"><Link href="/transport/assignments">Go to Student Allocation</Link></Button>
              </Card>
            ) : (
              <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((b: TransportBill) => (
                      <TableRow key={b.uuid}>
                        <TableCell className="text-xs"><div className="font-medium">{b.student?.name}</div><div className="text-muted-foreground text-[11px]">{b.student?.admissionNo}</div></TableCell>
                        <TableCell className="text-xs font-mono">{b.zoneCode}</TableCell>
                        <TableCell className="text-xs font-mono">₹{b.amountDue}</TableCell>
                        <TableCell className="text-xs font-mono">₹{b.amountPaid}</TableCell>
                        <TableCell className="text-xs font-mono font-bold">₹{b.balance}</TableCell>
                        <TableCell>{statusBadge(b.effectiveStatus)}</TableCell>
                        <TableCell className="text-xs font-mono">{b.dueDate ? String(b.dueDate).slice(0, 10) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collect" className="mt-3 space-y-3">
            {!canCollect ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">Only Admin / Accountant / Transport In-charge can collect.</Card>
            ) : (
              <>
                <Card className="p-3 border-border/70">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <Select value={payBillUuid} onValueChange={setPayBillUuid}>
                      <SelectTrigger className="h-9 text-xs sm:col-span-2"><SelectValue placeholder="Unpaid bill chuno" /></SelectTrigger>
                      <SelectContent>
                        {bills.filter((b: TransportBill) => b.balance > 0).map((b: TransportBill) => (
                          <SelectItem key={b.uuid} value={b.uuid}>{b.student?.name} · {b.month}/{b.year} · bal ₹{b.balance}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} type="number" placeholder={`Amount (bal ₹${payBill?.balance ?? "—"})`} className="h-9 text-xs" />
                    <Select value={payMode} onValueChange={setPayMode}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="sm" className="h-9 text-xs" disabled={paying} onClick={() => void pay()}>{paying ? "Saving…" : "Collect + Receipt"}</Button>
                    <Input value={payTxn} onChange={(e) => setPayTxn(e.target.value)} placeholder="Transaction ID (UPI/cheque)" className="h-9 text-xs sm:col-span-2" />
                    <Input value={payRemarks} onChange={(e) => setPayRemarks(e.target.value)} placeholder="Remarks" className="h-9 text-xs sm:col-span-3" />
                  </div>
                </Card>
                {lastReceipt && <ReceiptCard receipt={lastReceipt} onPrint={() => window.print()} />}
                <Card className="p-3 border-border/70">
                  <h3 className="text-xs font-bold mb-2">Discount / Waiver (reason + approval logged)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <Select value={concBillUuid} onValueChange={setConcBillUuid}>
                      <SelectTrigger className="h-9 text-xs sm:col-span-2"><SelectValue placeholder="Bill chuno" /></SelectTrigger>
                      <SelectContent>
                        {bills.filter((b: TransportBill) => b.balance > 0).map((b: TransportBill) => (
                          <SelectItem key={b.uuid} value={b.uuid}>{b.student?.name} · {b.month}/{b.year} · bal ₹{b.balance}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={concType} onValueChange={setConcType}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DISCOUNT_FIXED">Fixed ₹</SelectItem>
                        <SelectItem value="DISCOUNT_PERCENT">Percent %</SelectItem>
                        <SelectItem value="WAIVER">Full waiver</SelectItem>
                      </SelectContent>
                    </Select>
                    {concType !== "WAIVER" && <Input value={concValue} onChange={(e) => setConcValue(e.target.value)} type="number" placeholder={concType === "DISCOUNT_PERCENT" ? "% (1-100)" : "₹ amount"} className="h-9 text-xs" />}
                    <Input value={concReason} onChange={(e) => setConcReason(e.target.value)} placeholder="Reason *" className="h-9 text-xs" />
                    <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => void grant()}>Apply</Button>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="receipts" className="mt-3 space-y-3">
            {viewReceipt && <ReceiptCard receipt={viewReceipt} onPrint={() => window.print()} />}
            <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((payments as any)?.data ?? []).map((p: any) => (
                    <TableRow key={p.uuid}>
                      <TableCell className="text-xs font-mono font-bold">{p.receiptNumber}</TableCell>
                      <TableCell className="text-xs">{p.student?.name}</TableCell>
                      <TableCell className="text-xs font-mono">{p.billing?.month}/{p.billing?.year}</TableCell>
                      <TableCell className="text-xs font-mono">₹{p.amount}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{p.paymentMode}</Badge></TableCell>
                      <TableCell className="text-xs font-mono">{String(p.paymentDate).slice(0, 10)}</TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => void openReceipt(p.uuid)}>Receipt</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-3 space-y-3">
            <Tabs value={poTab} onValueChange={setPoTab}>
              <TabsList className="h-9">
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="overdue" className="text-xs">Overdue</TabsTrigger>
              </TabsList>
              <TabsContent value={poTab} className="mt-3">
                <Card className="p-3 border-border/70 text-xs">
                  Outstanding: <strong className="font-mono">₹{Number((poData as any)?.outstanding ?? 0).toLocaleString("en-IN")}</strong> · {(poData as any)?.total ?? 0} bills
                </Card>
                <div className="rounded-xl border border-border/80 bg-card overflow-x-auto mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {((poData as any)?.data ?? []).map((b: TransportBill) => (
                        <TableRow key={b.uuid}>
                          <TableCell className="text-xs"><div className="font-medium">{b.student?.name}</div><div className="text-muted-foreground text-[11px]">{b.student?.admissionNo}</div></TableCell>
                          <TableCell className="text-xs font-mono">{b.month}/{b.year}</TableCell>
                          <TableCell className="text-xs font-mono font-bold">₹{b.balance}</TableCell>
                          <TableCell>{statusBadge(b.effectiveStatus)}</TableCell>
                          <TableCell className="text-xs font-mono">{b.dueDate ? String(b.dueDate).slice(0, 10) : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="ledger" className="mt-3 space-y-3">
            <Card className="p-3 border-border/70">
              <div className="flex gap-2">
                <Input value={ledgerUuid} onChange={(e) => setLedgerUuid(e.target.value)} placeholder="Student UUID (Allocation page se)" className="h-9 text-xs font-mono" />
                <Button size="sm" className="h-9 text-xs" onClick={() => void loadLedger()}>Ledger</Button>
              </div>
            </Card>
            {ledger && (
              <Card className="border-border/70">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{ledger.student?.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{ledger.student?.admissionNo}</Badge>
                    <span className="ml-auto text-xs">Outstanding: <strong className="font-mono">₹{ledger.totals?.outstanding}</strong></span>
                  </div>
                  <div className="rounded-xl border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(ledger.ledger ?? []).map((b: any) => (
                          <TableRow key={b.uuid}>
                            <TableCell className="text-xs font-mono">{b.month}/{b.year}</TableCell>
                            <TableCell className="text-xs font-mono">₹{b.amountDue}</TableCell>
                            <TableCell className="text-xs font-mono">₹{b.amountPaid}</TableCell>
                            <TableCell className="text-xs font-mono font-bold">₹{b.balance}</TableCell>
                            <TableCell>{statusBadge(b.effectiveStatus)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Paid ₹{ledger.totals?.totalPaid} · Discount ₹{ledger.totals?.totalDiscount} · Waiver ₹{ledger.totals?.totalWaiver} · Receipts: {(ledger.payments ?? []).map((p: any) => p.receiptNumber).join(", ") || "—"}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="mt-3 space-y-3">
            <Card className="p-3 border-border/70">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={repGroup} onValueChange={setRepGroup}>
                  <SelectTrigger className="w-44 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[["day", "Daily"], ["month", "Monthly"], ["mode", "Payment mode"], ["route", "Route-wise"], ["zone", "Zone-wise"], ["class", "Class-wise"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-xs">Collected: <strong className="font-mono">₹{Number((repData as any)?.totals?.collected ?? 0).toLocaleString("en-IN")}</strong> ({(repData as any)?.totals?.receipts ?? 0} receipts)</span>
                <Button size="sm" variant="outline" className="h-9 text-xs ml-auto" onClick={downloadCsv}>Download CSV</Button>
              </div>
            </Card>
            <div className="rounded-xl border border-border/80 bg-card overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Receipts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {((repData as any)?.groups ?? []).map((g: any) => (
                    <TableRow key={g.key}>
                      <TableCell className="text-xs font-medium">{g.label}</TableCell>
                      <TableCell className="text-xs font-mono">₹{g.collected}</TableCell>
                      <TableCell className="text-xs">{g.receipts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="slabs" className="mt-3">
            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(slabs as any[]).map((s: any) => (
                    <Badge key={s.uuid} variant="outline" className="text-[11px]">Zone {s.zone} · {s.label} · ₹{s.feePerMonth}/mo</Badge>
                  ))}
                  {canCollect && <Button size="sm" variant="outline" className="h-7 text-[11px] ml-auto" onClick={seedSlabs}>Edit slabs (JSON)</Button>}
                </div>
                {canCollect && slabRows && (
                  <div className="space-y-2">
                    <textarea value={slabRows} onChange={(e) => setSlabRows(e.target.value)} rows={8} className="w-full text-xs font-mono rounded-lg border bg-muted/20 p-2" />
                    <Button size="sm" className="h-8 text-xs" onClick={() => void saveSlabs()}>Save Slabs</Button>
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
