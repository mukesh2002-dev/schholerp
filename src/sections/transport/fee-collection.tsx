"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, IndianRupee, Printer, Receipt, Search, UserRound } from "lucide-react";
import {
  collectTransportPaymentApi,
  fetchTransportBills,
  fetchTransportPaymentReceipt,
  fetchTransportPayments,
  searchTransportStudentsApi,
  type TransportBill,
  type TransportPendingBill,
  type TransportStudentSearchRow,
} from "@/lib/api/transport";

const money = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const PAYMENT_MODES = ["CASH", "UPI", "CARD", "BANK_TRANSFER", "CHEQUE", "ONLINE"];

const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] ?? ch)
  );

const receiptHtml = (r: any) => {
  const date = r.paymentDate || r.createdAt
    ? new Date(r.paymentDate || r.createdAt).toLocaleString("en-IN")
    : "—";
  const period = r.billing ? `${MONTHS[Number(r.billing.month) - 1]} ${r.billing.year}` : "—";
  const route = r.bill?.assignment?.route?.name ?? "—";
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Receipt ${esc(r.receiptNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: #111; margin: 0; padding: 24px; }
  .receipt { max-width: 420px; margin: 0 auto; }
  .head { text-align: center; border-bottom: 1px dashed #999; padding-bottom: 10px; margin-bottom: 14px; }
  .head h1 { font-size: 16px; margin: 0 0 4px; }
  .muted { color: #666; font-size: 11px; }
  .row { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; padding: 5px 0; border-bottom: 1px solid #eee; }
  .label { color: #666; }
  .value { font-weight: 600; text-align: right; }
  .amount { font-size: 22px; font-weight: 800; text-align: center; margin: 16px 0; }
  .foot { margin-top: 18px; display: flex; justify-content: space-between; font-size: 11px; color: #666; }
  .note { margin-top: 12px; font-size: 10px; color: #777; text-align: center; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <div class="receipt">
    <div class="head">
      <h1>${esc(r.campus?.name || "School ERP")}</h1>
      <div class="muted">Transport Fee Receipt</div>
    </div>
    <div class="row"><span class="label">Receipt No.</span><span class="value">${esc(r.receiptNumber)}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${esc(date)}</span></div>
    <div class="row"><span class="label">Student</span><span class="value">${esc(r.student?.name)}</span></div>
    <div class="row"><span class="label">Admission No.</span><span class="value">${esc(r.student?.admissionNo || "—")}</span></div>
    <div class="row"><span class="label">Route</span><span class="value">${esc(route)}</span></div>
    <div class="row"><span class="label">Billing period</span><span class="value">${esc(period)}</span></div>
    <div class="row"><span class="label">Payment mode</span><span class="value">${esc(r.paymentMode)}</span></div>
    ${r.transactionRef ? `<div class="row"><span class="label">Transaction ref</span><span class="value">${esc(r.transactionRef)}</span></div>` : ""}
    <div class="amount">${money(r.amount)}</div>
    <div class="row"><span class="label">Bill total</span><span class="value">${money(r.bill?.amountDue)}</span></div>
    <div class="row"><span class="label">Total paid</span><span class="value">${money(r.bill?.amountPaid)}</span></div>
    <div class="row"><span class="label">Balance</span><span class="value">${money(r.bill?.balance)}</span></div>
    <div class="row"><span class="label">Received by</span><span class="value">${esc(r.receivedBy?.name || "—")}</span></div>
    ${r.remarks ? `<div class="row"><span class="label">Remarks</span><span class="value">${esc(r.remarks)}</span></div>` : ""}
    <div class="foot"><span>Thank you</span><span>${esc(r.campus?.name || "")}</span></div>
    <div class="note">Computer generated receipt</div>
  </div>
  <script>
    window.onload = function () { window.focus(); window.print(); };
    window.onafterprint = function () { window.close(); };
  </script>
</body></html>`;
};

export function FeeCollection({ focusBill }: { focusBill?: TransportPendingBill | null } = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TransportStudentSearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<TransportStudentSearchRow | null>(null);

  const [bills, setBills] = useState<TransportBill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [selectedBill, setSelectedBill] = useState<TransportBill | null>(null);

  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [remarks, setRemarks] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  const [recent, setRecent] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const loadRecent = async () => {
    setLoadingRecent(true);
    try {
      const r = await fetchTransportPayments({ limit: 8 });
      setRecent(r.data);
    } catch {
      setRecent([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => { void loadRecent(); }, []);

  const printReceipt = async (paymentUuid?: string) => {
    if (!paymentUuid) {
      toast.error("Receipt not available");
      return;
    }
    const win = window.open("", "_blank", "width=520,height=760");
    if (!win) {
      toast.error("Print popup blocked — allow popups for this site");
      return;
    }
    win.document.write("<p style='font-family:sans-serif;padding:24px'>Loading receipt…</p>");
    try {
      const full = await fetchTransportPaymentReceipt(paymentUuid);
      win.document.open();
      win.document.write(receiptHtml(full));
      win.document.close();
    } catch (err) {
      win.close();
      toast.error(err instanceof Error ? err.message : "Could not load receipt");
    }
  };

  const searchStudents = async () => {
    const q = query.trim();
    if (q.length < 2) { toast.error("Type at least 2 characters (name or admission no)"); return; }
    setSearching(true);
    try {
      const rows = await searchTransportStudentsApi(q);
      setResults(rows);
      if (rows.length === 0) toast.info("No matching students found");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Student search failed");
    } finally {
      setSearching(false);
    }
  };

  const pickBill = (bill: TransportBill) => {
    setSelectedBill(bill);
    setAmount(String(bill.balance));
    setReceipt(null);
  };

  const loadBills = async (studentUuid: string, preferredBillUuid?: string) => {
    setLoadingBills(true);
    try {
      const r = await fetchTransportBills({ studentUuid, limit: 50 });
      setBills(r.data);
      const preferred = preferredBillUuid
        ? r.data.find((b) => b.uuid === preferredBillUuid && Number(b.balance) > 0)
        : null;
      const firstPayable = preferred ?? r.data.find((b) => Number(b.balance) > 0);
      if (firstPayable) pickBill(firstPayable);
      else { setSelectedBill(null); setAmount(""); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load transport bills");
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    if (!focusBill?.student) return;
    const row: TransportStudentSearchRow = {
      student: {
        uuid: focusBill.student.uuid,
        name: focusBill.student.name,
        admissionNo: focusBill.student.admissionNo,
        class: null,
      },
      onTransport: Boolean(focusBill.assignment),
      assignment: focusBill.assignment
        ? {
            uuid: focusBill.assignment.uuid,
            status: focusBill.assignment.status,
            route: focusBill.assignment.route ?? null,
            stop: focusBill.assignment.stopName ?? null,
          }
        : null,
    };
    setStudent(row);
    setQuery(row.student.name);
    setResults([]);
    setReceipt(null);
    setSelectedBill(null);
    void loadBills(row.student.uuid, focusBill.uuid);
  }, [focusBill?.uuid]);

  const chooseStudent = async (row: TransportStudentSearchRow) => {
    setStudent(row);
    setReceipt(null);
    setSelectedBill(null);
    setResults([]);
    setQuery(row.student.name);
    await loadBills(row.student.uuid);
  };

  const collect = async () => {
    if (!selectedBill) { toast.error("Select a bill first"); return; }
    const value = Number(amount);
    if (!value || value <= 0) { toast.error("Enter a valid amount"); return; }
    if (value > Number(selectedBill.balance) + 0.009) {
      toast.error(`Amount cannot exceed pending balance ${money(selectedBill.balance)}`);
      return;
    }
    setPaying(true);
    try {
      const res = await collectTransportPaymentApi(selectedBill.uuid, {
        amount: value,
        paymentMode,
        transactionRef: transactionRef || undefined,
        paymentDate: paymentDate || undefined,
        remarks: remarks || undefined,
      });
      setReceipt(res.receipt);
      toast.success(`Payment collected — receipt ${res.receipt?.receiptNumber ?? ""}`);
      setTransactionRef("");
      setRemarks("");
      if (student) await loadBills(student.student.uuid);
      await loadRecent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const pendingTotal = bills.reduce((sum, b) => sum + Math.max(0, Number(b.balance)), 0);

  return (
    <div className="space-y-4 max-w-5xl">
      <Card className="p-4 border-border/70 space-y-3">
        <div>
          <h3 className="text-sm font-bold">Parent aaya? Student search karo</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Naam ya admission number se student dhundo, pending transport bills dekho aur payment collect karo.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void searchStudents(); }}
            placeholder="Student name or admission no"
            className="h-9 text-xs"
          />
          <Button size="sm" className="h-9 text-xs gap-1" onClick={() => void searchStudents()} disabled={searching}>
            <Search className="h-3.5 w-3.5" /> {searching ? "Searching…" : "Search"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="max-h-56 overflow-auto space-y-1">
            {results.map((r) => (
              <button
                key={r.student.uuid}
                type="button"
                onClick={() => void chooseStudent(r)}
                className="w-full flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-left text-xs hover:bg-muted/40"
              >
                <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold">{r.student.name}</span>
                <span className="text-muted-foreground">{r.student.admissionNo ?? ""}</span>
                <span className="text-muted-foreground">{r.student.class ?? ""}</span>
                {r.assignment?.route && (
                  <span className="ml-auto text-[10px] text-muted-foreground">{r.assignment.route.name}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>

      {student && (
        <Card className="p-4 border-border/70 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold">{student.student.name}</h3>
              <p className="text-[11px] text-muted-foreground">
                {student.student.admissionNo ?? "—"} {student.student.class ? `• ${student.student.class}` : ""}
                {student.assignment?.route ? ` • ${student.assignment.route.name}` : " • No active route"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Pending</div>
              <div className="text-lg font-bold text-rose-600">{money(pendingTotal)}</div>
            </div>
          </div>

          {loadingBills ? (
            <p className="text-xs text-muted-foreground p-4 text-center">Loading bills…</p>
          ) : bills.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">
              Is student ka koi transport bill nahi mila. Pehle bill generate karna padega.
            </p>
          ) : (
            <div className="space-y-1.5">
              {bills.map((b) => {
                const payable = Number(b.balance) > 0;
                return (
                  <div
                    key={b.uuid}
                    className={`flex flex-wrap items-center gap-2 rounded-lg border p-2 text-xs ${
                      selectedBill?.uuid === b.uuid ? "border-primary bg-primary/5" : "bg-card"
                    }`}
                  >
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold">{MONTHS[b.month - 1]} {b.year}</span>
                    <span className="text-muted-foreground">{b.planType}</span>
                    <span className="text-muted-foreground">Due {money(b.amountDue)}</span>
                    <span className="text-muted-foreground">Paid {money(b.amountPaid)}</span>
                    <span className="font-semibold text-rose-600">Balance {money(b.balance)}</span>
                    <Badge variant={payable ? "outline" : "success"} className="text-[10px]">
                      {b.effectiveStatus || b.status}
                    </Badge>
                    {payable && (
                      <Button
                        size="sm"
                        variant={selectedBill?.uuid === b.uuid ? "gradient" : "outline"}
                        className="h-7 text-xs ml-auto"
                        onClick={() => pickBill(b)}
                      >
                        Collect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedBill && (
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <div className="text-xs font-semibold flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" />
                Payment for {MONTHS[selectedBill.month - 1]} {selectedBill.year} — balance {money(selectedBill.balance)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-medium">Amount *</label>
                  <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-medium">Payment mode</label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-medium">Payment date</label>
                  <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-medium">Transaction ref</label>
                  <Input value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="UPI / cheque no" className="mt-1 h-8 text-xs" />
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="text-[11px] font-medium">Remarks</label>
                  <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional note" className="mt-1 h-8 text-xs" />
                </div>
              </div>
              <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void collect()} disabled={paying}>
                {paying ? "Collecting…" : `Collect ${money(amount || 0)}`}
              </Button>
            </div>
          )}

          {receipt && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Payment received
              </div>
              <div>Receipt: <strong>{receipt.receiptNumber}</strong></div>
              <div>Amount: <strong>{money(receipt.amount)}</strong> • Mode: {receipt.paymentMode}</div>
              {receipt.transactionRef && <div>Ref: {receipt.transactionRef}</div>}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 mt-1"
                onClick={() => void printReceipt(receipt.uuid)}
              >
                <Printer className="h-3.5 w-3.5" /> Print receipt
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card className="p-4 border-border/70 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Recent transport payments</h3>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => void loadRecent()}>Refresh</Button>
        </div>
        {loadingRecent ? (
          <p className="text-xs text-muted-foreground p-3 text-center">Loading…</p>
        ) : recent.length === 0 ? (
          <p className="text-xs text-muted-foreground p-3 text-center">Abhi koi transport payment nahi hua.</p>
        ) : (
          <div className="space-y-1">
            {recent.map((p) => (
              <div key={p.uuid} className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-xs">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-[11px]">{p.receiptNumber}</span>
                <span className="font-semibold">{p.student?.name ?? "Student"}</span>
                <span className="text-muted-foreground">{p.student?.admissionNo ?? ""}</span>
                <span className="ml-auto font-semibold">{money(p.amount)}</span>
                <span className="text-muted-foreground">{p.paymentMode}</span>
                <span className="text-[10px] text-muted-foreground">
                  {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("en-IN") : ""}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] gap-1"
                  onClick={() => void printReceipt(p.uuid)}
                >
                  <Printer className="h-3 w-3" /> Print
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
