"use client";
import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AttendanceCategory, AttendanceStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CalendarCheck, Users, Search, CheckCircle2, Clock, XCircle, Calendar, Fingerprint, TrendingUp } from "lucide-react";

const statusVariant = (s: AttendanceStatus) => {
  switch (s) {
    case "PRESENT": return "success";
    case "LATE": return "warning";
    case "ABSENT": return "destructive";
    case "LEAVE": return "info";
    default: return "outline";
  }
};

export default function AttendancePage() {
  const { activeBranchId } = useERP();
  const [category, setCategory] = useState<AttendanceCategory>("STUDENT");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // records are dynamic for today; if no records for selected date, show closest
  const allRecords = useMemo(() => mockDb.getAttendanceRecords(activeBranchId, category), [activeBranchId, category]);
  const availableDates = useMemo(() => Array.from(new Set(allRecords.map((r) => r.date))).sort().reverse(), [allRecords]);
  const effectiveDate = availableDates.includes(date) ? date : (availableDates[0] || date);
  const recordsForDate = useMemo(() => allRecords.filter((r) => r.date === effectiveDate), [allRecords, effectiveDate]);
  const filtered = useMemo(() => {
    return recordsForDate.filter((r) => {
      const matchSearch = r.personName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [recordsForDate, search, statusFilter]);

  const summaries = useMemo(() => mockDb.getAttendanceDaySummaries(activeBranchId).filter((s) => s.category === category).slice(0, 10), [activeBranchId, category]);
  const report = useMemo(() => mockDb.getAttendanceReportEntries(activeBranchId, category), [activeBranchId, category]);

  const present = recordsForDate.filter((r) => r.status === "PRESENT").length;
  const late = recordsForDate.filter((r) => r.status === "LATE").length;
  const absent = recordsForDate.filter((r) => r.status === "ABSENT").length;
  const leave = recordsForDate.filter((r) => r.status === "LEAVE").length;
  const rate = recordsForDate.length ? Math.round(((present + late) / recordsForDate.length) * 100) : 0;

  const handleMarkAllPresent = () => {
    toast.success(`Marked ${filtered.length} ${category.toLowerCase()} as PRESENT for ${effectiveDate}`);
  };
  const handleBiometricSync = () => {
    const res = mockDb.triggerBiometricSync();
    toast.success(res.message);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Attendance</h1><Badge variant="outline">{recordsForDate.length} records</Badge></div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Daily attendance for students & staff, with reports & biometric sync.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleBiometricSync}><Fingerprint className="h-4 w-4 text-emerald-600" /> Biometric Sync</Button>
          <Button variant="gradient" className="gap-2" onClick={handleMarkAllPresent}><CalendarCheck className="h-4 w-4" /> Mark Present</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-card border border-border/70">
        <Select value={category} onValueChange={(v) => setCategory(v as AttendanceCategory)}><SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="STUDENT">Students</SelectItem><SelectItem value="TEACHER">Teachers</SelectItem><SelectItem value="STAFF">Staff</SelectItem><SelectItem value="WORKER">Workers</SelectItem></SelectContent></Select>
        <Select value={effectiveDate} onValueChange={setDate}><SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent>{availableDates.map((d) => <SelectItem key={d} value={d}>{formatDate(d)}</SelectItem>)}</SelectContent></Select>
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name..." className="pl-9 h-9 text-xs" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="PRESENT">Present</SelectItem><SelectItem value="LATE">Late</SelectItem><SelectItem value="ABSENT">Absent</SelectItem><SelectItem value="LEAVE">Leave</SelectItem></SelectContent></Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-border/70"><CardContent className="p-4"><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Today</span><span className="text-2xl font-bold mt-1 block">{recordsForDate.length}</span><span className="text-[11px] text-muted-foreground">{effectiveDate}</span></CardContent></Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5"><CardContent className="p-4"><span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Present</span><span className="text-2xl font-bold text-emerald-600 mt-1 block">{present}</span><span className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> On time</span></CardContent></Card>
        <Card className="border-amber-500/20 bg-amber-500/5"><CardContent className="p-4"><span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Late</span><span className="text-2xl font-bold text-amber-600 mt-1 block">{late}</span><span className="text-[11px] text-amber-600 flex items-center gap-1"><Clock className="h-3 w-3" /> Late</span></CardContent></Card>
        <Card className="border-rose-500/20 bg-rose-500/5"><CardContent className="p-4"><span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">Absent</span><span className="text-2xl font-bold text-rose-600 mt-1 block">{absent}</span><span className="text-[11px] text-rose-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Absent</span></CardContent></Card>
        <Card className="border-blue-500/20 bg-blue-500/5"><CardContent className="p-4"><span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Attendance %</span><span className="text-2xl font-bold text-blue-600 mt-1 block">{rate}%</span><span className="text-[11px] text-blue-600 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Rate</span></CardContent></Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily" className="gap-1.5"><CalendarCheck className="h-3.5 w-3.5" /> Daily Sheet</TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Reports</TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Day Summaries</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Branch/Class</TableHead><TableHead>Status</TableHead><TableHead>Check-In</TableHead><TableHead>Check-Out</TableHead><TableHead>Marked By</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell><span className="font-semibold text-sm">{r.personName}</span><span className="block text-[11px] text-muted-foreground">{r.category} • {r.personId}</span></TableCell>
                    <TableCell className="text-xs">{r.branchName}{r.className ? ` • ${r.className} ${r.sectionName || ""}` : ""}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.status) as any} className="text-[10px]">{r.status}</Badge></TableCell>
                    <TableCell className="text-xs font-mono">{r.checkIn || "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{r.checkOut || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.markedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No records for this filter.</div>}
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Total Days</TableHead><TableHead>Present</TableHead><TableHead>Late</TableHead><TableHead>Absent</TableHead><TableHead>Leave</TableHead><TableHead>Rate</TableHead></TableRow></TableHeader>
              <TableBody>
                {report.map((e) => (
                  <TableRow key={e.personId} className="hover:bg-muted/40">
                    <TableCell><span className="font-semibold text-sm">{e.personName}</span><span className="block text-[11px] text-muted-foreground">{e.category} • {e.branchName}</span></TableCell>
                    <TableCell className="text-xs font-bold">{e.totalDays}</TableCell>
                    <TableCell className="text-xs text-emerald-600 font-medium">{e.present}</TableCell>
                    <TableCell className="text-xs text-amber-600">{e.late}</TableCell>
                    <TableCell className="text-xs text-rose-600">{e.absent}</TableCell>
                    <TableCell className="text-xs text-blue-600">{e.leave}</TableCell>
                    <TableCell><Badge variant={e.rate >= 90 ? "success" : e.rate >= 75 ? "warning" : "destructive"} className="text-[10px]">{e.rate}%</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summaries.map((s) => (
              <Card key={`${s.date}-${s.category}`} className="border-border/80"><CardContent className="p-4 flex justify-between items-center"><div><span className="text-xs font-mono font-bold">{formatDate(s.date)}</span><span className="block text-[11px] text-muted-foreground">{s.category}</span></div><div className="text-right"><span className="text-sm font-bold">{s.rate}%</span><span className="block text-[11px] text-muted-foreground">{s.present + s.late}/{s.total} present</span></div></CardContent></Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
