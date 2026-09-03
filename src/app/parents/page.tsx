"use client";
import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, GraduationCap, CalendarCheck, DollarSign, Medal, Bell, BookOpen, CreditCard } from "lucide-react";

export default function ParentsPage() {
  const { activeBranchId } = useERP();
  const [students] = useState(() => mockDb.getStudents(activeBranchId));
  const [selectedId, setSelectedId] = useState<string>(students[0]?.id || "");
  const selected = useMemo(() => students.find((s) => s.id === selectedId) || students[0], [students, selectedId]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => students.filter((s) => s.fullName.toLowerCase().includes(search.toLowerCase()) || s.rollNumber.toLowerCase().includes(search.toLowerCase())), [students, search]);

  const invoices = useMemo(() => selected ? mockDb.getInvoices().filter((i) => i.studentId === selected.id) : [], [selected]);
  const attendance = useMemo(() => selected ? mockDb.getAttendanceRecords(undefined, "STUDENT").filter((r) => r.personId === selected.id).slice(0, 8) : [], [selected]);
  const results = useMemo(() => selected ? mockDb.getResults().filter((r) => r.studentId === selected.id) : [], [selected]);
  const notices = useMemo(() => mockDb.getNotices(activeBranchId).slice(0, 5), [activeBranchId]);
  const announcements = useMemo(() => mockDb.getAnnouncements(activeBranchId).slice(0, 3), [activeBranchId]);

  if (!selected) return <div className="p-8 text-center text-muted-foreground">No students found.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Parent Portal</h1><Badge variant="outline">{students.length} Wards</Badge></div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">View ward attendance, fees, results & notices — parent-centric dashboard.</p>
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 max-w-sm w-full"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ward by name or roll..." className="pl-9 h-9 text-xs" /></div>
          <div className="flex gap-2 flex-wrap">
            {filtered.slice(0, 6).map((s) => (
              <button key={s.id} onClick={() => setSelectedId(s.id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${selectedId === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"}`}>
                <img src={s.avatar} alt={s.fullName} className="h-7 w-7 rounded-lg object-cover" /><span>{s.fullName}</span><span className="text-[10px] opacity-70">{s.rollNumber}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5">
        <CardContent className="p-5 flex flex-col md:flex-row gap-5 items-start">
          <img src={selected.avatar} alt={selected.fullName} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-border shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold">{selected.fullName} <span className="text-sm font-normal text-muted-foreground">({selected.rollNumber})</span></h3>
            <p className="text-xs text-muted-foreground">{selected.className} • {selected.sectionName} • {selected.branchName}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-[10px]">Guardian: {selected.guardian.name} ({selected.guardian.relation})</Badge>
              <Badge variant="secondary" className="text-[10px]">{selected.status}</Badge>
              <Badge variant="outline" className="text-[10px]">{selected.guardian.phone}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-card border text-center"><span className="text-xs text-muted-foreground block">Attendance</span><span className="text-lg font-bold text-emerald-600">{selected.attendanceSummary.attendanceRate}%</span><span className="text-[10px] text-muted-foreground">{selected.attendanceSummary.presentDays}/{selected.attendanceSummary.totalDays} days</span></div>
              <div className="p-3 rounded-xl bg-card border text-center"><span className="text-xs text-muted-foreground block">Fees Due</span><span className="text-lg font-bold text-amber-600">{formatCurrency(selected.feeSummary.totalPending)}</span><span className="text-[10px] text-muted-foreground">{selected.feeSummary.status}</span></div>
              <div className="p-3 rounded-xl bg-card border text-center"><span className="text-xs text-muted-foreground block">GPA</span><span className="text-lg font-bold text-blue-600">{selected.academicHistory[0]?.gpa || "—"}</span><span className="text-[10px] text-muted-foreground">{selected.academicHistory[0]?.percentage || 0}%</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance" className="gap-1.5"><CalendarCheck className="h-3.5 w-3.5" /> Attendance</TabsTrigger>
          <TabsTrigger value="fees" className="gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Fees</TabsTrigger>
          <TabsTrigger value="results" className="gap-1.5"><Medal className="h-3.5 w-3.5" /> Results</TabsTrigger>
          <TabsTrigger value="notices" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notices</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Check-In</TableHead><TableHead>Check-Out</TableHead><TableHead>Marked By</TableHead></TableRow></TableHeader>
              <TableBody>{attendance.map((r) => (<TableRow key={r.id}><TableCell className="text-xs">{formatDate(r.date)}</TableCell><TableCell><Badge variant={r.status === "PRESENT" ? "success" : r.status === "LATE" ? "warning" : "destructive"} className="text-[10px]">{r.status}</Badge></TableCell><TableCell className="text-xs font-mono">{r.checkIn || "—"}</TableCell><TableCell className="text-xs font-mono">{r.checkOut || "—"}</TableCell><TableCell className="text-xs text-muted-foreground">{r.markedBy}</TableCell></TableRow>))}</TableBody>
            </Table>
          </div>
          <Card><CardContent className="p-4 text-xs text-muted-foreground flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-emerald-600" /> Attendance synced via biometric devices • Daily updates reflected here.</CardContent></Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Period</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead></TableRow></TableHeader>
              <TableBody>{invoices.map((inv) => (<TableRow key={inv.id}><TableCell className="font-mono text-xs font-bold">{inv.invoiceNumber}</TableCell><TableCell className="text-xs">{inv.period}</TableCell><TableCell className="text-xs">{formatCurrency(inv.totalAmount)}</TableCell><TableCell className="text-xs text-emerald-600">{formatCurrency(inv.paidAmount)}</TableCell><TableCell className="text-xs font-bold text-rose-600">{formatCurrency(inv.balanceAmount)}</TableCell><TableCell><Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "destructive" : "warning"} className="text-[10px]">{inv.status}</Badge></TableCell><TableCell className="text-xs">{formatDate(inv.dueDate)}</TableCell></TableRow>))}</TableBody>
            </Table>
          </div>
          {invoices.length === 0 && <div className="text-center py-6 text-muted-foreground text-sm">No invoices for this ward.</div>}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {results.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">No results published yet.</div> : (
            <div className="grid gap-4">
              {results.map((res) => (
                <Card key={res.id} className="border-border/80"><CardHeader className="pb-2"><CardTitle className="text-sm flex justify-between">{res.examTypeName} • {res.academicYear}<Badge variant={res.status === "PASS" ? "success" : "destructive"} className="text-[10px]">{res.status}</Badge></CardTitle><p className="text-xs text-muted-foreground">{res.className} {res.sectionName} • Rank {res.rank}/{res.totalStudents} • GPA {res.gpa}</p></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs font-bold border-b pb-2"><span>{res.marksObtained}/{res.totalMarks} • {res.percentage}% • {res.overallGrade}</span><span className="text-emerald-600">{res.status}</span></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">{res.subjects.map((sub) => (<div key={sub.subjectId} className="p-2 rounded-lg bg-muted/40 border flex justify-between"><span>{sub.subjectName}</span><span className="font-bold">{sub.marksObtained}/{sub.totalMarks} • {sub.grade}</span></div>))}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {selected.academicHistory.length > 0 && (
            <Card><CardHeader><CardTitle className="text-sm flex gap-2"><BookOpen className="h-4 w-4" /> Academic History</CardTitle></CardHeader><CardContent className="space-y-2">{selected.academicHistory.map((h) => (<div key={h.term} className="flex justify-between text-xs p-2 rounded-lg bg-muted/40 border"><span>{h.term} • {h.grade}</span><span className="font-semibold">{h.percentage}% • GPA {h.gpa} • Rank {h.rank}</span></div>))}</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          <div className="grid gap-3">
            {notices.map((n) => (<Card key={n.id} className="border-border/80"><CardContent className="p-4"><div className="flex justify-between items-start gap-2"><h4 className="font-semibold text-sm">{n.title}</h4><Badge variant={n.priority === "URGENT" ? "destructive" : n.priority === "HIGH" ? "warning" : "outline"} className="text-[10px] shrink-0">{n.priority}</Badge></div><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p><p className="text-[11px] text-muted-foreground mt-2">{formatDate(n.date)} • {n.category} • {n.branchName}</p></CardContent></Card>))}
            {announcements.map((a) => (<Card key={a.id} className="border-border/80 bg-blue-500/5"><CardContent className="p-4"><h4 className="font-semibold text-sm">{a.title}</h4><p className="text-xs text-muted-foreground mt-1">{a.summary}</p><p className="text-[11px] text-muted-foreground mt-2">{formatDate(a.publishDate)} • {a.branchName}</p></CardContent></Card>))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
