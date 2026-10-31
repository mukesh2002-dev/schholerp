"use client";

import { useCallback, useMemo, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Bus, CreditCard, FileText, Search, UserRound, Wallet } from "lucide-react";
import { fetchStudents } from "@/lib/api/students";
import {
  fetchParentTransportChild,
  fetchParentTransportFees,
  fetchParentTransportPayments,
  fetchParentTransportInvoices,
  fetchParentTransportAttendance,
  type BoardingStatus,
  type ParentChildTransport,
} from "@/lib/api/transport";

const money = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

const statusBadge = (status: BoardingStatus) => {
  if (status === "BOARDED") return <Badge variant="success" className="text-[10px]">BOARDED</Badge>;
  if (status === "NOT_BOARDED") return <Badge variant="destructive" className="text-[10px]">NOT BOARDED</Badge>;
  return <Badge variant="outline" className="text-[10px]">NOT MARKED</Badge>;
};

export function ParentTransportView() {
  const { activeBranchId } = useERP();
  const { data: students } = useCampusData({
    fetcher: (cid) => fetchStudents({ campusId: cid, limit: 200 }),
    campusId: activeBranchId,
    fallback: { data: [], total: 0 },
    queryKeyPrefix: "students",
  });

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: string; name: string; className: string; admissionNumber: string } | null>(null);
  const [child, setChild] = useState<ParentChildTransport | null>(null);
  const [fees, setFees] = useState<any | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const list = (students.data as any[]) ?? [];
    if (!search.trim()) return list.slice(0, 40);
    const s = search.toLowerCase();
    return list
      .filter((st) =>
        `${st.fullName ?? `${st.firstName ?? ""} ${st.lastName ?? ""}`} ${st.admissionNumber ?? ""} ${st.className ?? ""}`
          .toLowerCase()
          .includes(s)
      )
      .slice(0, 40);
  }, [students.data, search]);

  const loadStudent = useCallback(async (studentUuid: string) => {
    setLoading(true);
    try {
      const [childRes, feesRes, paymentsRes, invoicesRes, attendanceRes] = await Promise.all([
        fetchParentTransportChild(studentUuid),
        fetchParentTransportFees(studentUuid),
        fetchParentTransportPayments(studentUuid, { limit: 100 }),
        fetchParentTransportInvoices(studentUuid, { limit: 100 }),
        fetchParentTransportAttendance(studentUuid, { limit: 100 }),
      ]);
      setChild(childRes);
      setFees(feesRes);
      setPayments(paymentsRes.data ?? []);
      setInvoices(invoicesRes.data ?? []);
      setAttendance(attendanceRes.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load parent transport data");
      setChild(null);
      setFees(null);
      setPayments([]);
      setInvoices([]);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const pick = (st: any) => {
    const picked = {
      id: st.id,
      name: st.fullName ?? `${st.firstName ?? ""} ${st.lastName ?? ""}`.trim(),
      className: st.className ?? "—",
      admissionNumber: st.admissionNumber ?? st.admissionNo ?? "—",
    };
    setSelected(picked);
    void loadStudent(picked.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-3">
      <Card className="p-3 border-border/70 h-fit">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student / admission no…"
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="mt-2 max-h-[520px] overflow-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center">No students found.</p>
          ) : (
            filtered.map((st: any) => {
              const active = selected?.id === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => pick(st)}
                  className={`w-full text-left rounded-lg border p-2 transition-colors ${
                    active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="text-xs font-semibold truncate">
                    {st.fullName ?? `${st.firstName ?? ""} ${st.lastName ?? ""}`}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {st.admissionNumber ?? "—"} • {st.className ?? "—"}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      <div className="space-y-3">
        {!selected ? (
          <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">
            Select a student to preview their parent-facing transport dashboard.
          </Card>
        ) : loading ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">Loading transport dashboard…</Card>
        ) : !child ? (
          <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">
            Could not load transport data for this student.
          </Card>
        ) : (
          <>
            <Card className="p-4 border-border/70">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    {child.child.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {selected.admissionNumber} • {child.child.class ?? selected.className}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Monthly transport fee</div>
                  <div className="text-lg font-bold">{money(child.transport?.feePerMonth ?? 0)}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                <Info label="Route" value={child.transport?.route?.name ?? "—"} icon={<Bus className="h-3.5 w-3.5" />} />
                <Info label="Bus" value={child.transport?.vehicle?.registrationNumber ?? "—"} icon={<Bus className="h-3.5 w-3.5" />} />
                <Info label="Stop" value={child.transport?.stop ?? "—"} />
                <Info label="Pickup" value={child.transport?.pickupTime ?? "—"} />
                <Info label="Drop" value={child.transport?.dropTime ?? "—"} />
                <Info label="Zone" value={child.transport?.zoneCode ?? "—"} />
                <Info label="Driver" value={child.transport?.driver?.name ?? "—"} />
                <Info label="Conductor" value={child.transport?.conductor?.name ?? "—"} />
              </div>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MoneyCard label="Billed" value={fees?.total ?? child.fee.total} icon={<FileText className="h-3.5 w-3.5" />} />
              <MoneyCard label="Paid" value={fees?.paid ?? child.fee.paid} tone="emerald" icon={<Wallet className="h-3.5 w-3.5" />} />
              <MoneyCard label="Pending" value={fees?.pending ?? child.fee.pending} tone="amber" icon={<CreditCard className="h-3.5 w-3.5" />} />
              <MoneyCard label="Overdue" value={fees?.overdue ?? child.fee.overdue} tone="rose" icon={<CreditCard className="h-3.5 w-3.5" />} />
            </div>

            <Tabs defaultValue="fees">
              <TabsList className="h-9">
                <TabsTrigger value="fees" className="text-xs">Fee records</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs">Payments ({payments.length})</TabsTrigger>
                <TabsTrigger value="invoices" className="text-xs">Invoices ({invoices.length})</TabsTrigger>
                <TabsTrigger value="attendance" className="text-xs">Attendance ({attendance.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="fees">
                <Card className="border-border/70">
                  <CardContent className="p-3 space-y-1.5">
                    {!fees?.records?.length ? (
                      <p className="text-xs text-muted-foreground p-4 text-center">No transport fee records.</p>
                    ) : (
                      fees.records.map((r: any) => (
                        <div key={r.uuid} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-xs">
                          <span className="font-semibold">{r.invoiceNumber}</span>
                          <span className="text-muted-foreground">{r.month}/{r.year}</span>
                          <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                          <span className="ml-auto">Due {money(r.amountDue)}</span>
                          <span className="text-emerald-600">Paid {money(r.amountPaid)}</span>
                          <span className="text-amber-600">Pending {money(r.pending)}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="border-border/70">
                  <CardContent className="p-3 space-y-1.5">
                    {payments.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-4 text-center">No payments.</p>
                    ) : (
                      payments.map((p: any) => (
                        <div key={p.uuid} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-xs">
                          <span className="font-mono text-[11px]">{p.receiptNumber}</span>
                          <span>{money(p.amount)}</span>
                          <Badge variant="outline" className="text-[10px]">{p.paymentMethod}</Badge>
                          <span className="text-muted-foreground">{new Date(p.paidAt).toLocaleDateString()}</span>
                          <span className="ml-auto text-muted-foreground">{p.invoice?.invoiceNumber ?? ""}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invoices">
                <Card className="border-border/70">
                  <CardContent className="p-3 space-y-1.5">
                    {invoices.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-4 text-center">No invoices.</p>
                    ) : (
                      invoices.map((inv: any) => (
                        <div key={inv.uuid} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-xs">
                          <span className="font-semibold">{inv.invoiceNumber}</span>
                          <Badge variant="outline" className="text-[10px]">{inv.status}</Badge>
                          <span>Due {money(inv.amountDue)}</span>
                          <span className="text-emerald-600">Paid {money(inv.amountPaid)}</span>
                          <span className="text-amber-600">Pending {money(inv.pending)}</span>
                          <span className="ml-auto text-muted-foreground">
                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : ""}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card className="border-border/70">
                  <CardContent className="p-3 space-y-1.5">
                    {attendance.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-4 text-center">No attendance history.</p>
                    ) : (
                      attendance.map((a: any, i: number) => (
                        <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2 text-xs">
                          <span className="font-mono text-[11px]">{a.date ? new Date(a.date).toLocaleDateString() : "—"}</span>
                          <Badge variant="outline" className="text-[10px]">{a.tripType}</Badge>
                          {statusBadge(a.boardingStatus)}
                          {a.reason && <span className="text-muted-foreground">{a.reason}</span>}
                          <span className="ml-auto text-muted-foreground">{a.route?.name ?? ""}</span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </div>
      <div className="text-xs font-semibold truncate">{value}</div>
    </div>
  );
}

function MoneyCard({ label, value, tone = "default", icon }: { label: string; value: number; tone?: "default" | "emerald" | "amber" | "rose"; icon?: React.ReactNode }) {
  const toneClass = {
    default: "text-foreground",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  }[tone];
  return (
    <Card className="p-3 border-border/70">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
        {icon} {label}
      </div>
      <div className={`text-lg font-bold ${toneClass}`}>{money(value)}</div>
    </Card>
  );
}
