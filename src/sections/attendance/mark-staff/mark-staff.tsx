"use client";

import { useEffect, useMemo, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AppImage } from "@/components/ui/app-image";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2, Save, ShieldAlert } from "lucide-react";
import { fetchStaffList } from "@/lib/api/staff";
import {
  fetchStaffAttendance,
  bulkMarkStaffAttendanceApi,
  staffDirectoryCategory,
} from "@/lib/api/attendance";
import type { AttendanceCategory } from "@/types";

const todayISO = () => new Date().toISOString().split("T")[0];
const CATS: AttendanceCategory[] = ["TEACHER", "STAFF"];
const CAN_MARK: string[] = ["ADMIN", "PRINCIPAL", "HR_MANAGER"];

const userKeyOf = (s: any) => String(s?.user?.uuid ?? s?.user?.id ?? "");
const displayNameOf = (s: any) =>
  [s?.firstName, s?.lastName].filter(Boolean).join(" ").trim() ||
  s?.user?.name ||
  s?.employeeId ||
  "Staff";

export function MarkStaff() {
  const { activeBranchId, session } = useERP();
  const branch = activeBranchId !== "all" ? activeBranchId : undefined;
  const canMark = CAN_MARK.includes(String(session?.role ?? ""));

  const [category, setCategory] = useState<AttendanceCategory>("TEACHER");
  const [date, setDate] = useState(todayISO());
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Server-side filter for teachers (roster is 800+ rows but API pages at max
  // 100). Staff pill loads unfiltered — everyone who isn't a teacher counts
  // as staff (support/workers included) via the shared category mapper.
  const staffTypeParam = category === "TEACHER" ? "TEACHING" : undefined;

  const { data: staffData, isLoading } = useCampusData({
    fetcher: (cid) =>
      fetchStaffList({
        campusId: cid,
        staffType: staffTypeParam,
        search: debouncedSearch.trim() || undefined,
        limit: 100,
      }).then((r) => ({
        list: r.data as any[],
        total: r.total,
      })),
    campusId: activeBranchId,
    fallback: { list: [], total: 0 },
    queryKeyPrefix: `staff-roster-${category}-${debouncedSearch.trim()}`,
  });

  const { data: existing, refresh: refreshExisting } = useCampusData({
    fetcher: (cid) => fetchStaffAttendance({ campusId: cid, date }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchStaffAttendance>>,
    queryKeyPrefix: `staff-attendance-${date}`,
  });

  const roster = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (staffData.list as any[]).filter((s) => {
      if (staffDirectoryCategory({ staffType: s.staffType, role: (s as any)?.role }) !== category) return false;
      if (!q) return true;
      return (
        displayNameOf(s).toLowerCase().includes(q) ||
        (s.employeeId ?? "").toLowerCase().includes(q) ||
        (s.designation ?? "").toLowerCase().includes(q)
      );
    });
  }, [staffData, category, search]);

  // Prefill: switch ON only for already-PRESENT rows; everyone else defaults ON (new marking).
  useEffect(() => {
    const byUser = new Map<string, string>();
    for (const r of existing as any[]) {
      const key = String(r.user?.uuid ?? r.userId ?? "");
      if (key) byUser.set(key, String(r.status ?? "").toUpperCase());
    }
    const next: Record<string, boolean> = {};
    for (const s of roster) {
      const key = userKeyOf(s);
      if (!key) continue;
      next[key] = byUser.has(key) ? byUser.get(key) === "PRESENT" : true;
    }
    setPresent(next);
    setTouched(false);
    setSavedAt(byUser.size > 0 ? date : null);
  }, [existing, roster, category, date]);

  const markable = useMemo(() => roster.filter((s) => !!userKeyOf(s)), [roster]);
  const presentCount = useMemo(
    () => markable.filter((s) => present[userKeyOf(s)] !== false).length,
    [markable, present]
  );

  const markAll = (v: boolean) => {
    const next: Record<string, boolean> = {};
    for (const s of markable) next[userKeyOf(s)] = v;
    setPresent(next);
    setTouched(true);
  };

  const handleSubmit = async () => {
    if (date > todayISO()) { toast.error("Future dates not allowed — today or past only"); return; }
    if (markable.length === 0) { toast.error("No markable staff in this category"); return; }
    if (!touched && savedAt === date) {
      toast.info("Already saved for this date — toggle a switch to update, then Submit.");
      return;
    }
    setSaving(true);
    try {
      const records = markable.map((s) => ({
        userId: userKeyOf(s),
        status: present[userKeyOf(s)] !== false ? "PRESENT" : "ABSENT",
      }));
      const res = await bulkMarkStaffAttendanceApi({ campusId: branch, date, records });
      const failed = res.errors?.length ?? 0;
      toast.success(
        `Saved ${res.saved} record(s) for ${formatDate(date)}` + (failed > 0 ? ` (${failed} failed)` : "")
      );
      setSavedAt(date);
      setTouched(false);
      void refreshExisting();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!canMark) {
    return (
      <Card className="border-dashed p-10 text-center">
        <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto" />
        <h3 className="font-semibold text-sm mt-2">Restricted</h3>
        <p className="text-xs text-muted-foreground mt-1">Only Admin, Principal or HR can mark staff attendance.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/70">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex items-center gap-1.5">
            {CATS.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="text-xs h-9 capitalize"
              >
                {c.toLowerCase()}s
              </Button>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Date (today or past)</label>
            <Input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => {
                const v = e.target.value;
                if (v && v > todayISO()) {
                  toast.error("Future dates not allowed — reset to today");
                  setDate(todayISO());
                } else {
                  setDate(v);
                }
              }}
              className="h-9 text-xs w-40"
            />
          </div>
          <div className="relative flex-1 min-w-44">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / ID / designation…"
              className="h-9 text-xs"
            />
          </div>
          <Button size="sm" variant="outline" className="h-9 text-xs gap-1 text-emerald-600" onClick={() => markAll(true)} disabled={markable.length === 0}>
            <CheckCircle2 className="h-3.5 w-3.5" /> All Present
          </Button>
          <Button size="sm" variant="gradient" className="h-9 text-xs gap-1" onClick={() => void handleSubmit()} disabled={saving || markable.length === 0}>
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : `Submit (${presentCount}/${markable.length})`}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
          <span>Switch ON = Present • OFF = Absent</span>
          <span>• Showing {roster.length} of {staffData.total}</span>
          {savedAt && <Badge variant="success" className="text-[10px] ml-auto">Saved {formatDate(savedAt)}</Badge>}
        </div>
      </Card>

      {isLoading && roster.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading roster…</Card>
      ) : roster.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <h3 className="font-semibold text-sm">No {category.toLowerCase()}s found</h3>
          <p className="text-xs text-muted-foreground mt-1">Add staff first (HR → Staff Directory).</p>
        </Card>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Mark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((s: any) => {
                const key = userKeyOf(s);
                const on = key ? present[key] !== false : true;
                return (
                  <TableRow key={s.uuid ?? s.id ?? s.employeeId} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <AppImage src={s.avatar} alt={displayNameOf(s)} className="h-7 w-7 rounded-full ring-1 ring-border" />
                        <div>
                          <div className="text-sm font-semibold">{displayNameOf(s)}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{s.employeeId ?? ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.designation ?? s.staffType ?? "—"}
                      {!key && <span className="block text-[10px] text-amber-600">No login account — cannot mark</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        disabled={!key}
                        onClick={() => { setPresent((p) => ({ ...p, [key]: !on })); setTouched(true); }}
                        className={`inline-flex items-center gap-2 ${!key ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                        aria-label={on ? "Present" : "Absent"}
                      >
                        <span className={`text-[11px] font-bold w-14 text-right ${on ? "text-emerald-600" : "text-rose-500"}`}>
                          {on ? "Present" : "Absent"}
                        </span>
                        <span className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-muted-foreground/30"}`}>
                          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
                        </span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {touched && markable.length > 0 && (
        <p className="text-center text-[11px] text-amber-600">Unsaved changes — press Submit to save.</p>
      )}
    </div>
  );
}
