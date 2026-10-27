"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MoreHorizontal, PauseCircle, PlayCircle, Plus, RefreshCw, Search, UserRound, Users, XCircle } from "lucide-react";
import {
  createTransportAssignmentApi,
  discontinueTransportAssignmentApi,
  fetchRouteDetail,
  fetchRoutes,
  fetchTransportAssignments,
  reinstateTransportAssignmentApi,
  searchTransportStudentsApi,
  suspendTransportAssignmentApi,
  type TransportAssignment,
  type TransportRoute,
  type TransportStop,
  type TransportStudentSearchRow,
} from "@/lib/api/transport";

const money = (v: number | string | null | undefined) =>
  `₹${Number(v ?? 0).toLocaleString("en-IN")}`;

const prettyDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
};

const statusVariant = (status: string) => {
  if (status === "ACTIVE") return "success" as const;
  if (status === "SUSPENDED") return "warning" as const;
  if (status === "DISCONTINUED" || status === "TRANSFERRED") return "rose" as const;
  return "outline" as const;
};

export function TransportStudents() {
  const [rows, setRows] = useState<TransportAssignment[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [routeFilter, setRouteFilter] = useState("all");

  const [showAdd, setShowAdd] = useState(false);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<TransportStudentSearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TransportStudentSearchRow | null>(null);
  const [routeUuid, setRouteUuid] = useState("");
  const [stopUuid, setStopUuid] = useState("");
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [plan, setPlan] = useState<"MONTHLY" | "HALF_YEARLY" | "YEARLY">("MONTHLY");
  const [fee, setFee] = useState("");
  const [adding, setAdding] = useState(false);

  const [actionRow, setActionRow] = useState<TransportAssignment | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "DISCONTINUE" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionDate, setActionDate] = useState("");
  const [acting, setActing] = useState(false);

  const today = () => new Date().toISOString().slice(0, 10);

  const load = async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([
        fetchTransportAssignments({
          status: statusFilter !== "all" ? statusFilter : undefined,
          routeUuid: routeFilter !== "all" ? routeFilter : undefined,
          limit: 200,
        }),
        fetchRoutes({ limit: 100 }),
      ]);
      setRows(a.data);
      setRoutes(r.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Students load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [statusFilter, routeFilter]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (a) =>
        String(a.student?.name ?? "").toLowerCase().includes(term) ||
        String(a.student?.admissionNo ?? "").toLowerCase().includes(term) ||
        String(a.route?.name ?? "").toLowerCase().includes(term)
    );
  }, [rows, search]);

  const activeCount = rows.filter((a) => a.status === "ACTIVE").length;

  const resetAdd = () => {
    setStudentQuery("");
    setStudentResults([]);
    setSelectedStudent(null);
    setRouteUuid("");
    setStopUuid("");
    setStops([]);
    setStartDate("");
    setPlan("MONTHLY");
    setFee("");
  };

  const searchStudent = async () => {
    const term = studentQuery.trim();
    if (term.length < 2) { toast.error("Type at least 2 characters (name or admission no)"); return; }
    setSearching(true);
    try {
      const found = await searchTransportStudentsApi(term);
      setStudentResults(found);
      if (found.length === 0) toast.info("No matching students found");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Student search failed");
    } finally {
      setSearching(false);
    }
  };

  const chooseRoute = async (value: string) => {
    setRouteUuid(value);
    setStopUuid("");
    setStops([]);
    if (!value) return;
    setLoadingStops(true);
    try {
      const detail = await fetchRouteDetail(value);
      setStops(detail.stops ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Route stops load failed");
    } finally {
      setLoadingStops(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedStudent) { toast.error("Select a student first"); return; }
    if (!routeUuid) { toast.error("Select a route"); return; }
    if (!stopUuid) { toast.error("Select a stop"); return; }
    setAdding(true);
    try {
      await createTransportAssignmentApi({
        studentUuid: selectedStudent.student.uuid,
        routeUuid,
        stopUuid,
        startDate: startDate || undefined,
        billingPlan: plan,
        feePerMonth: fee ? Number(fee) : undefined,
      });
      toast.success(`${selectedStudent.student.name} added to transport`);
      setShowAdd(false);
      resetAdd();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Add student failed");
    } finally {
      setAdding(false);
    }
  };

  const openAction = (row: TransportAssignment, type: "SUSPEND" | "DISCONTINUE") => {
    setActionRow(row);
    setActionType(type);
    setActionReason("");
    setActionDate(today());
  };

  const closeAction = () => {
    if (acting) return;
    setActionRow(null);
    setActionType(null);
    setActionReason("");
    setActionDate("");
  };

  const handleReinstate = async (row: TransportAssignment) => {
    setActing(true);
    try {
      const res = await reinstateTransportAssignmentApi(row.uuid);
      toast.success(res.message ?? `${row.student?.name ?? "Student"} reinstated`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reinstate failed");
    } finally {
      setActing(false);
    }
  };

  const handleActionConfirm = async () => {
    if (!actionRow || !actionType) return;
    if (actionType === "DISCONTINUE" && !actionReason.trim()) {
      toast.error("Discontinue ke liye reason likho");
      return;
    }
    setActing(true);
    try {
      const res =
        actionType === "SUSPEND"
          ? await suspendTransportAssignmentApi(actionRow.uuid, {
              reason: actionReason.trim() || undefined,
              effectiveFrom: actionDate || undefined,
            })
          : await discontinueTransportAssignmentApi(actionRow.uuid, {
              reason: actionReason.trim(),
              endDate: actionDate || undefined,
            });
      toast.success(
        res.message ??
          `${actionRow.student?.name ?? "Student"} ${
            actionType === "SUSPEND" ? "suspended" : "discontinued"
          }`
      );
      setActionRow(null);
      setActionType(null);
      setActionReason("");
      setActionDate("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> Active students
          </div>
          <div className="text-xl font-bold mt-1">{activeCount}</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Routes</div>
          <div className="text-xl font-bold mt-1">{routes.length}</div>
        </Card>
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Showing</div>
          <div className="text-xl font-bold mt-1">{visible.length}</div>
        </Card>
      </div>

      <Card className="p-3 border-border/70 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2 top-2.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student / admission / route"
            className="h-8 text-xs pl-7 w-64"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
            <SelectItem value="TRANSFERRED">Transferred</SelectItem>
          </SelectContent>
        </Select>
        <Select value={routeFilter} onValueChange={setRouteFilter}>
          <SelectTrigger className="h-8 text-xs w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All routes</SelectItem>
            {routes.map((r) => <SelectItem key={r.uuid} value={r.uuid}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
        <Button
          size="sm"
          variant="gradient"
          className="h-8 text-xs gap-1 ml-auto"
          onClick={() => { setShowAdd((v) => !v); if (showAdd) resetAdd(); }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Student
        </Button>
      </Card>

      {showAdd && (
        <Card className="p-4 border-border/70 space-y-3">
          <h3 className="text-sm font-bold">Add student to transport</h3>
          <div className="flex gap-2">
            <Input
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void searchStudent(); }}
              placeholder="Student name or admission no"
              className="h-8 text-xs"
            />
            <Button size="sm" className="h-8 text-xs" onClick={() => void searchStudent()} disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </div>

          {studentResults.length > 0 && (
            <div className="max-h-48 overflow-auto space-y-1">
              {studentResults.map((r) => (
                <button
                  key={r.student.uuid}
                  type="button"
                  disabled={r.onTransport}
                  onClick={() => { setSelectedStudent(r); setStudentResults([]); setStudentQuery(r.student.name); }}
                  className="w-full flex flex-wrap items-center gap-2 rounded-md border bg-card p-2 text-left text-xs hover:bg-muted/40 disabled:opacity-50"
                >
                  <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">{r.student.name}</span>
                  <span className="text-muted-foreground">{r.student.admissionNo ?? ""}</span>
                  <span className="text-muted-foreground">{r.student.class ?? ""}</span>
                  {r.onTransport && <Badge variant="warning" className="ml-auto text-[9px]">already on transport</Badge>}
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="rounded-md border bg-muted/20 p-2 text-xs flex flex-wrap items-center gap-2">
              <UserRound className="h-3.5 w-3.5" />
              <span className="font-semibold">{selectedStudent.student.name}</span>
              <span className="text-muted-foreground">{selectedStudent.student.admissionNo ?? ""}</span>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] ml-auto" onClick={() => { setSelectedStudent(null); setStudentQuery(""); }}>
                Clear
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-[11px] font-medium">Route *</label>
              <Select value={routeUuid} onValueChange={(v) => void chooseRoute(v)}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select route" /></SelectTrigger>
                <SelectContent>
                  {routes.map((r) => <SelectItem key={r.uuid} value={r.uuid}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium">Stop *</label>
              <Select value={stopUuid} onValueChange={setStopUuid} disabled={!routeUuid || loadingStops}>
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder={loadingStops ? "Loading stops…" : "Select stop"} />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((s) => <SelectItem key={s.uuid} value={s.uuid}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium">Start date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-8 text-xs" />
            </div>
            <div>
              <label className="text-[11px] font-medium">Billing plan</label>
              <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="HALF_YEARLY">Half yearly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium">Monthly fee (optional)</label>
              <Input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Route default" className="mt-1 h-8 text-xs" />
            </div>
          </div>

          <Button size="sm" variant="gradient" className="h-8 text-xs" onClick={() => void handleAdd()} disabled={adding}>
            {adding ? "Adding…" : "Add to route"}
          </Button>
        </Card>
      )}

      <Card className="p-4 border-border/70 space-y-2">
        <h3 className="text-sm font-bold">Transport students ({visible.length})</h3>
        {loading ? (
          <p className="text-xs text-muted-foreground p-4 text-center">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center border border-dashed rounded-lg">
            Koi student nahi mila.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground border-b">
                  <th className="py-1.5 pr-2">Student</th>
                  <th className="py-1.5 pr-2">Admission</th>
                  <th className="py-1.5 pr-2">Class</th>
                  <th className="py-1.5 pr-2">Route / Stop</th>
                  <th className="py-1.5 pr-2">Plan</th>
                  <th className="py-1.5 pr-2 text-right">Monthly fee</th>
                  <th className="py-1.5 pr-2">Status</th>
                  <th className="py-1.5 pr-2">Since</th>
                  <th className="py-1.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.uuid} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 font-medium">{a.student?.name ?? "—"}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">{a.student?.admissionNo ?? "—"}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">{a.student?.class ?? "—"}</td>
                    <td className="py-1.5 pr-2 text-muted-foreground">
                      {a.route?.name ?? "—"}
                      {a.stop?.name || a.stopName ? ` • ${a.stop?.name ?? a.stopName}` : ""}
                    </td>
                    <td className="py-1.5 pr-2">{a.billingPlan}</td>
                    <td className="py-1.5 pr-2 text-right">{money(a.feePerMonth ?? a.route?.feePerMonth ?? 0)}</td>
                    <td className="py-1.5 pr-2"><Badge variant={statusVariant(a.status)} className="text-[9px]">{a.status}</Badge></td>
                    <td className="py-1.5 pr-2 text-muted-foreground">{prettyDate(a.startDate)}</td>
                    <td className="py-1.5 text-right">
                      {a.status === "ACTIVE" || a.status === "SUSPENDED" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Student actions">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            {a.status === "ACTIVE" ? (
                              <>
                                <DropdownMenuItem onClick={() => openAction(a, "SUSPEND")} className="text-xs gap-2">
                                  <PauseCircle className="h-3.5 w-3.5" /> Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAction(a, "DISCONTINUE")} className="text-xs gap-2 text-rose-600">
                                  <XCircle className="h-3.5 w-3.5" /> Discontinue
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => void handleReinstate(a)} disabled={acting} className="text-xs gap-2">
                                  <PlayCircle className="h-3.5 w-3.5" /> Reinstate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAction(a, "DISCONTINUE")} className="text-xs gap-2 text-rose-600">
                                  <XCircle className="h-3.5 w-3.5" /> Discontinue
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={Boolean(actionRow && actionType)} onOpenChange={(open) => { if (!open) closeAction(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "SUSPEND" ? "Suspend transport" : "Discontinue transport"}
            </DialogTitle>
            <DialogDescription>
              {actionRow?.student?.name ?? "Student"} —{" "}
              {actionType === "SUSPEND"
                ? "billing effective date se rukega; purane bills aur dues safe rahenge."
                : "service band ho jayegi; next billing cycle se charge nahi lagega."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-medium">
                {actionType === "SUSPEND" ? "Effective from" : "End date"}
              </label>
              <Input
                type="date"
                value={actionDate}
                min={today()}
                onChange={(e) => setActionDate(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium">
                Reason {actionType === "DISCONTINUE" ? "*" : "(optional)"}
              </label>
              <Input
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={
                  actionType === "SUSPEND"
                    ? "e.g. Fee pending / temporary break"
                    : "e.g. Shifted to own vehicle"
                }
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={closeAction} disabled={acting}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={actionType === "DISCONTINUE" ? "destructive" : "gradient"}
              className="h-8 text-xs"
              onClick={() => void handleActionConfirm()}
              disabled={acting}
            >
              {acting ? "Saving…" : actionType === "SUSPEND" ? "Suspend" : "Discontinue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
