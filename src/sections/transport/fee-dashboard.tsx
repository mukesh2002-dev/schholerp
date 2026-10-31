"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarDays, IndianRupee, RefreshCw, Route, Search, TriangleAlert, Users } from "lucide-react";
import {
  fetchPendingTransportBills,
  fetchRoutes,
  fetchTransportCollectionReport,
  type TransportCollectionGroup,
  type TransportPendingBill,
  type TransportRoute,
} from "@/lib/api/transport";

const money = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

const pad = (n: number) => String(n).padStart(2, "0");
const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function prettyDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function FeeDashboard({ onCollect }: { onCollect: (bill: TransportPendingBill) => void }) {
  const now = new Date();
  const [from, setFrom] = useState(dateStr(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(dateStr(now));
  const [routeFilter, setRouteFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [pending, setPending] = useState<TransportPendingBill[]>([]);
  const [outstanding, setOutstanding] = useState(0);
  const [groups, setGroups] = useState<TransportCollectionGroup[]>([]);
  const [totals, setTotals] = useState({ receipts: 0, collected: 0, byMode: {} as Record<string, number> });
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, r] = await Promise.all([
        fetchPendingTransportBills({
          routeUuid: routeFilter !== "all" ? routeFilter : undefined,
          limit: 200,
        }),
        fetchTransportCollectionReport({ from, to, groupBy: "day" }),
        fetchRoutes({ limit: 100 }),
      ]);
      setPending(p.data);
      setOutstanding(Number(p.meta.outstanding ?? p.data.reduce((s, b) => s + Number(b.balance), 0)));
      setGroups(c.groups);
      setTotals(c.totals);
      setRoutes(r.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Report load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [from, to, routeFilter]);

  const setThisMonth = () => {
    const d = new Date();
    setFrom(dateStr(new Date(d.getFullYear(), d.getMonth(), 1)));
    setTo(dateStr(d));
  };

  const overdueAmount = useMemo(
    () => pending.filter((b) => b.effectiveStatus === "OVERDUE").reduce((s, b) => s + Number(b.balance), 0),
    [pending]
  );

  const byRoute = useMemo(() => {
    const map = new Map<string, { name: string; students: Set<string>; bills: number; amount: number }>();
    for (const b of pending) {
      const key = b.assignment?.route?.uuid ?? "none";
      const row = map.get(key) ?? {
        name: b.assignment?.route?.name ?? "No route",
        students: new Set<string>(),
        bills: 0,
        amount: 0,
      };
      row.students.add(b.student?.uuid ?? b.uuid);
      row.bills += 1;
      row.amount += Number(b.balance);
      map.set(key, row);
    }
    return [...map.entries()]
      .map(([uuid, r]) => ({ uuid, ...r, amount: Math.round(r.amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);
  }, [pending]);

  const byStudent = useMemo(() => {
    const map = new Map<string, {
      studentUuid: string;
      name: string;
      admissionNo?: string | null;
      route?: string | null;
      stop?: string | null;
      bills: TransportPendingBill[];
      total: number;
      overdue: number;
      oldestDue?: string | null;
    }>();
    for (const b of pending) {
      const key = b.student?.uuid ?? b.uuid;
      const row = map.get(key) ?? {
        studentUuid: key,
        name: b.student?.name ?? "Student",
        admissionNo: b.student?.admissionNo,
        route: b.assignment?.route?.name ?? null,
        stop: b.assignment?.stopName ?? null,
        bills: [],
        total: 0,
        overdue: 0,
        oldestDue: b.dueDate ?? null,
      };
      row.bills.push(b);
      row.total += Number(b.balance);
      if (b.effectiveStatus === "OVERDUE") row.overdue += Number(b.balance);
      if (b.dueDate && (!row.oldestDue || new Date(b.dueDate) < new Date(row.oldestDue))) row.oldestDue = b.dueDate;
      map.set(key, row);
    }
    return [...map.values()]
      .map((r) => ({ ...r, total: Math.round(r.total * 100) / 100, overdue: Math.round(r.overdue * 100) / 100 }))
      .sort((a, b) => b.total - a.total);
  }, [pending]);

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return byStudent;
    return byStudent.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        String(s.admissionNo ?? "").toLowerCase().includes(term)
    );
  }, [byStudent, search]);

  const dayRows = useMemo(
    () => [...groups].sort((a, b) => a.key.localeCompare(b.key)),
    [groups]
  );
  const maxDay = Math.max(1, ...dayRows.map((g) => Number(g.collected)));

  return (
    <div className="space-y-4 max-w-6xl">
      <Card className="p-3 border-border/70 flex flex-wrap items-end gap-2">
        <div>
          <label className="text-[11px] font-medium">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-8 text-xs" />
        </div>
        <div>
          <label className="text-[11px] font-medium">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-8 text-xs" />
        </div>
        <div className="min-w-52">
          <label className="text-[11px] font-medium">Route</label>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All routes</SelectItem>
              {routes.map((r) => <SelectItem key={r.uuid} value={r.uuid}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={setThisMonth}>This month</Button>
        <Button size="sm" className="h-8 text-xs gap-1" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="h-3.5 w-3.5" /> {loading ? "Loading…" : "Refresh"}
        </Button>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <IndianRupee className="h-3 w-3" /> Total pending
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">{money(outstanding)}</div>
          <div className="text-[10px] text-muted-foreground">{byStudent.length} students</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <TriangleAlert className="h-3 w-3" /> Overdue
          </div>
          <div className="text-xl font-bold text-amber-600 mt-1">{money(overdueAmount)}</div>
          <div className="text-[10px] text-muted-foreground">
            {pending.filter((b) => b.effectiveStatus === "OVERDUE").length} bills
          </div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> Collected (period)
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{money(totals.collected)}</div>
          <div className="text-[10px] text-muted-foreground">{totals.receipts} receipts</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> Students on transport
          </div>
          <div className="text-xl font-bold mt-1">
            {new Set(pending.map((b) => b.assignment?.uuid).filter(Boolean)).size}
          </div>
          <div className="text-[10px] text-muted-foreground">with pending bills</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Date-wise collection</h3>
            <span className="text-[10px] text-muted-foreground">{prettyDate(from)} – {prettyDate(to)}</span>
          </div>
          {dayRows.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">
              Is period me koi transport payment nahi aaya.
            </p>
          ) : (
            <div className="space-y-1">
              {dayRows.map((g) => (
                <div key={g.key} className="flex items-center gap-2 text-xs rounded-md border bg-card p-2">
                  <span className="w-24 shrink-0 font-medium">{prettyDate(g.key)}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(Number(g.collected) / maxDay) * 100}%` }} />
                  </div>
                  <span className="w-20 text-right font-semibold">{money(g.collected)}</span>
                  <span className="w-14 text-right text-muted-foreground">{g.receipts} rcpt</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-xs font-bold">
                <span>Total</span>
                <span>{money(totals.collected)} • {totals.receipts} receipts</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4 border-border/70 space-y-2">
          <h3 className="text-sm font-bold flex items-center gap-1"><Route className="h-4 w-4" /> Pending by route</h3>
          {byRoute.length === 0 ? (
            <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">Koi pending nahi.</p>
          ) : (
            <div className="space-y-1">
              {byRoute.map((r) => (
                <div key={r.uuid} className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-xs">
                  <span className="font-medium flex-1 min-w-32">{r.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{r.students.size} students</Badge>
                  <span className="text-muted-foreground">{r.bills} bills</span>
                  <span className="font-semibold text-rose-600 ml-auto">{money(r.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 border-border/70 space-y-2">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <h3 className="text-sm font-bold">Pending students ({visibleStudents.length})</h3>
          <div className="flex items-center gap-1">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / admission no"
              className="h-8 text-xs w-56"
            />
          </div>
        </div>
        {visibleStudents.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">
            Koi pending student nahi mila.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-1.5 pr-2">Student</th>
                  <th className="py-1.5 pr-2">Admission</th>
                  <th className="py-1.5 pr-2">Route / Stop</th>
                  <th className="py-1.5 pr-2">Bills</th>
                  <th className="py-1.5 pr-2">Oldest due</th>
                  <th className="py-1.5 pr-2 text-right">Pending</th>
                  <th className="py-1.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s) => (
                  <tr key={s.studentUuid} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 font-medium">
                      {s.name}
                      {s.overdue > 0 && <Badge variant="warning" className="ml-1.5 text-[9px]">overdue</Badge>}
                    </td>
                    <td className="py-1.5 pr-2 text-muted-foreground">{s.admissionNo ?? "—"}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {s.route ?? "—"}{s.stop ? ` • ${s.stop}` : ""}
                    </td>
                    <td className="py-1.5 pr-2">{s.bills.length}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">{prettyDate(s.oldestDue)}</td>
                    <td className="py-1.5 pr-2 text-right font-semibold text-rose-600">{money(s.total)}</td>
                    <td className="py-1.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => onCollect(s.bills[0])}
                      >
                        Collect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
