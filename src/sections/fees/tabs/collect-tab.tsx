"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AppImage } from "@/components/ui/app-image";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Search, CreditCard, User, X } from "lucide-react";
import {
  searchStudentsForCollection,
  fetchStudentCollectionProfile,
  collectFeeApi,
} from "@/lib/api/fees";
import { ReceiptDialog, type ReceiptData } from "./receipt-dialog";

const MONTHS = [
  { v: 1, n: "Jan" }, { v: 2, n: "Feb" }, { v: 3, n: "Mar" }, { v: 4, n: "Apr" },
  { v: 5, n: "May" }, { v: 6, n: "Jun" }, { v: 7, n: "Jul" }, { v: 8, n: "Aug" },
  { v: 9, n: "Sep" }, { v: 10, n: "Oct" }, { v: 11, n: "Nov" }, { v: 12, n: "Dec" },
];

const PERIOD_TYPES = ["monthly", "quarterly", "half_yearly", "yearly", "custom"];
const PAY_METHODS = ["cash", "upi", "card", "cheque", "bank_transfer", "online", "other"];

export function CollectTab() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;

  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 400);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Collect modal
  const [collectOpen, setCollectOpen] = useState(false);
  const [periodType, setPeriodType] = useState("monthly");
  const [months, setMonths] = useState<number[]>([new Date().getMonth() + 1]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [txnRef, setTxnRef] = useState("");
  const [discountType, setDiscountType] = useState("NONE");
  const [discountValue, setDiscountValue] = useState("");
  const [waiveFine, setWaiveFine] = useState("");
  const [allowExcess, setAllowExcess] = useState(false);
  const [collecting, setCollecting] = useState(false);

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const runSearch = async (q: string) => {
    const text = q.trim();
    if (text.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const list = await searchStudentsForCollection({ query: text, campusId: branch });
      setResults(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const pickStudent = async (uuid: string) => {
    setSelectedUuid(uuid);
    setLoadingProfile(true);
    try {
      const data = await fetchStudentCollectionProfile(uuid, branch);
      setProfile(data);
      const due = Number(data?.summary?.totalDue ?? 0);
      setAmount(due > 0 ? String(due) : "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load dues");
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const toggleMonth = (m: number) =>
    setMonths((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m]));

  const handleCollect = async () => {
    if (!profile?.student) { toast.error("Select a student first"); return; }
    const paid = Number(amount);
    if (!paid || paid <= 0) { toast.error("Enter a valid amount"); return; }
    if (months.length === 0) { toast.error("Select at least one month"); return; }
    setCollecting(true);
    try {
      const studentId = profile.student.uuid ?? selectedUuid;
      const data = await collectFeeApi({
        studentId,
        periodType,
        selectedMonths: [...months].sort((a, b) => a - b),
        paidAmount: paid,
        paymentMethod: method,
        transactionRef: txnRef || undefined,
        discountType: discountType === "NONE" ? undefined : discountType,
        discountValue: discountValue ? Number(discountValue) : undefined,
        waivedFineAmount: waiveFine ? Number(waiveFine) : undefined,
        allowExcess,
        idempotencyKey: `${studentId}-${periodType}-${months.sort().join(".")}-${paid}-${Date.now()}`,
        campusId: branch,
      });
      const payment = data?.payment ?? data;
      setReceipt(payment);
      setReceiptOpen(true);
      toast.success(`Collected ${formatCurrency(paid)}`, { description: `Receipt ${payment?.receiptNumber ?? ""}` });
      setCollectOpen(false);
      await pickStudent(selectedUuid); // refresh dues
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Collection failed");
    } finally {
      setCollecting(false);
    }
  };

  const student = profile?.student;
  const summary = profile?.summary;
  const monthlyStatus: any[] = profile?.monthlyStatus ?? [];
  const invoices: any[] = profile?.invoices ?? [];

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/80">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); void runSearch(e.target.value); }}
              placeholder="Type admission no, roll no, name or phone… (min 2 chars)"
              className="pl-9 h-9 text-xs"
              onKeyDown={(e) => { if (e.key === "Enter") void runSearch(query); }}
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:block">{searching ? "Searching…" : debounced.trim().length >= 2 ? `${results.length} found` : "Counter search"}</span>
        </div>
        {results.length > 0 && (
          <div className="mt-2 rounded-lg border divide-y max-h-64 overflow-y-auto">
            {results.map((s: any) => (
              <button
                key={s.uuid}
                onClick={() => { void pickStudent(s.uuid); setResults([]); setQuery(`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()); }}
                className={`w-full flex items-center gap-3 p-2 text-left hover:bg-muted/50 ${selectedUuid === s.uuid ? "bg-muted/60" : ""}`}
              >
                <AppImage src={s.avatar} alt={s.firstName} className="h-8 w-8 rounded-full ring-1 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">{s.firstName} {s.lastName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">Adm {s.admissionNo}{s.rollNo ? ` • Roll ${s.rollNo}` : ""}{s.class ? ` • ${s.class.name}` : ""}</div>
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {loadingProfile && <Card className="p-8 text-center text-xs text-muted-foreground">Loading dues…</Card>}

      {profile && student && (
        <>
          <Card className="border-border/70">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <AppImage src={student.avatar} alt={student.firstName} className="h-11 w-11 rounded-xl ring-1 ring-border" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{student.firstName} {student.lastName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">Adm {student.admissionNo}{student.rollNo ? ` • Roll ${student.rollNo}` : ""}{student.class ? ` • ${student.class.name}` : ""}</div>
                </div>
                <Badge variant={Number(summary?.totalDue ?? 0) > 0 ? "destructive" : "success"} className="text-xs font-mono">
                  Due {formatCurrency(summary?.totalDue ?? 0)}
                </Badge>
                <Button size="sm" variant="gradient" className="h-8 text-xs gap-1" disabled={Number(summary?.totalDue ?? 0) <= 0} onClick={() => setCollectOpen(true)}>
                  <CreditCard className="h-3.5 w-3.5" /> Collect
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {[
                  ["Billed", summary?.totalBilled],
                  ["Paid", summary?.totalPaid],
                  ["Discount", summary?.totalDiscount],
                  ["Advance", summary?.advanceBalance],
                ].map(([label, val]) => (
                  <div key={label as string} className="p-2 rounded-lg bg-muted/40 border">
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    <div className="font-bold font-mono">{formatCurrency(val ?? 0)}</div>
                  </div>
                ))}
              </div>
              {monthlyStatus.length > 0 && (
                <div>
                  <div className="text-xs font-semibold mb-1">Month-wise status</div>
                  <div className="flex flex-wrap gap-1.5">
                    {monthlyStatus.map((m: any, i: number) => (
                      <Badge key={i} variant={m.status === "Paid" ? "success" : m.status === "Partial" ? "warning" : m.status === "Overdue" ? "destructive" : "outline"} className="text-[10px]">
                        {m.monthName ?? `M${m.monthNumber}`}: {formatCurrency(m.due ?? 0)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {invoices.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right tabular-nums">Amount</TableHead>
                    <TableHead className="text-right tabular-nums">Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv: any) => (
                    <TableRow key={inv.uuid}>
                      <TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-xs">{inv.billingPeriod ?? "—"}</TableCell>
                      <TableCell className="text-xs">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatCurrency(inv.amount)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-emerald-600">{formatCurrency(inv.paidAmount ?? 0)}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{inv.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Collect modal */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collect Fee</DialogTitle>
            <DialogDescription>{student ? `${student.firstName} ${student.lastName ?? ""} • Due ${formatCurrency(summary?.totalDue ?? 0)}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Period Type</label>
                <Select value={periodType} onValueChange={setPeriodType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PERIOD_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Payment Mode</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAY_METHODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Months</label>
              <div className="flex flex-wrap gap-1.5">
                {MONTHS.map((m) => (
                  <button
                    key={m.v}
                    onClick={() => toggleMonth(m.v)}
                    className={`px-2.5 py-1 rounded-md border text-xs ${months.includes(m.v) ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:border-primary/40"}`}
                  >
                    {m.n}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Amount (₹) *</label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" type="number" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Transaction Ref</label>
                <Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} placeholder="UPI / cheque no…" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Discount Type</label>
                <Select value={discountType} onValueChange={setDiscountType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="FLAT">Flat ₹</SelectItem>
                    <SelectItem value="PERCENT">Percent %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Discount Value</label>
                <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder="0" type="number" disabled={discountType === "NONE"} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Waive Fine (₹)</label>
                <Input value={waiveFine} onChange={(e) => setWaiveFine(e.target.value)} placeholder="0" type="number" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={allowExcess} onChange={(e) => setAllowExcess(e.target.checked)} className="h-3.5 w-3.5 rounded border" />
              Allow excess (overpayment goes to advance balance)
            </label>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setCollectOpen(false)}>Cancel</Button>
            <Button onClick={() => void handleCollect()} variant="gradient" disabled={collecting} className="gap-1">
              <CreditCard className="h-3.5 w-3.5" /> {collecting ? "Collecting…" : `Collect ${amount ? formatCurrency(Number(amount)) : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receipt}
        studentName={student ? `${student.firstName} ${student.lastName ?? ""}`.trim() : undefined}
        onViewStudent={(sid) => { setReceiptOpen(false); router.push(`/fees/${sid}`); }}
      />
    </div>
  );
}
