"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Briefcase, Calendar, Search, Plus, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

export default function HRPage() {
  const { activeBranchId } = useERP();
  const [staff, setStaff] = useState(() => [...mockDb.getStaffMembers(activeBranchId), ...mockDb.getTeachers(activeBranchId).map((t) => ({
    id: t.id, employeeId: t.employeeId, name: t.fullName, email: t.email, phone: t.phone, avatar: t.avatar, gender: t.gender, dateOfBirth: t.dateOfBirth, joiningDate: t.joiningDate, branchId: t.branchId, branchName: t.branchName, department: t.department, designation: t.designation, staffType: "TEACHING" as const, status: t.status === "ACTIVE" ? "ACTIVE" as const : t.status === "ON_LEAVE" ? "ON_LEAVE" as const : "ACTIVE" as const, qualification: t.qualification, experienceYears: t.experienceYears, salaryStructureId: undefined, salaryStructureName: undefined, createdAt: t.createdAt, updatedAt: t.updatedAt,
  }))]);
  const [leaves, setLeaves] = useState(() => mockDb.getLeaveRecords(activeBranchId));
  const [payrolls] = useState(() => mockDb.getPayrollRecords(activeBranchId));
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("ALL");

  const filteredStaff = useMemo(() => staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.employeeId.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || s.staffType === typeFilter;
    return matchSearch && matchType;
  }), [staff, search, typeFilter]);

  const filteredLeaves = useMemo(() => leaves.filter((l) => {
    const matchSearch = l.staffName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = leaveStatusFilter === "ALL" || l.status === leaveStatusFilter;
    return matchSearch && matchStatus;
  }), [leaves, search, leaveStatusFilter]);

  const handleLeaveAction = (id: string, status: "APPROVED" | "REJECTED") => {
    mockDb.updateLeaveStatus(id, status, "HR Manager");
    setLeaves([...mockDb.getLeaveRecords(activeBranchId)]);
    toast.success(`Leave ${status.toLowerCase()}`);
  };

  const totalStaff = staff.length;
  const active = staff.filter((s) => s.status === "ACTIVE").length;
  const onLeave = staff.filter((s) => s.status === "ON_LEAVE").length;
  const pendingLeaves = leaves.filter((l) => l.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">HR & Staff Management</h1><Badge variant="outline">{totalStaff} Members</Badge></div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Employee records, payroll & leave management.</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={() => toast.info("Add Employee — demo placeholder", { description: "Staff onboarding form coming soon." })}><Plus className="h-4 w-4" /> Add Employee</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Total Employees</span><span className="text-2xl font-bold mt-1 block">{totalStaff}</span><span className="text-[11px] text-muted-foreground">All types</span></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Active</span><span className="text-2xl font-bold text-emerald-600 mt-1 block">{active}</span><span className="text-[11px] text-emerald-600">On duty</span></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">On Leave</span><span className="text-2xl font-bold text-amber-600 mt-1 block">{onLeave}</span><span className="text-[11px] text-amber-600">Leave</span></CardContent></Card>
        <Card><CardContent className="p-4"><span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Pending Leaves</span><span className="text-2xl font-bold text-blue-600 mt-1 block">{pendingLeaves}</span><span className="text-[11px] text-blue-600">Awaiting approval</span></CardContent></Card>
      </div>

      <Tabs defaultValue="directory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="directory" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Directory</TabsTrigger>
          <TabsTrigger value="leaves" className="gap-1.5"><Calendar className="h-3.5 w-3.5" /> Leave Management</TabsTrigger>
          <TabsTrigger value="payroll" className="gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Payroll Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-4">
          <div className="flex gap-2 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, ID, department..." className="pl-9 h-9 text-xs" /></div>
            <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Types</SelectItem><SelectItem value="TEACHING">Teaching</SelectItem><SelectItem value="ADMIN">Admin</SelectItem><SelectItem value="SUPPORT">Support</SelectItem><SelectItem value="NON_TEACHING">Non-Teaching</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((s) => (
              <Card key={s.id} className="border-border/80 hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <img src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`} alt={s.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-border shrink-0" />
                    <div className="flex-1 min-w-0"><h4 className="font-semibold text-sm truncate">{s.name}</h4><p className="text-[11px] text-muted-foreground">{s.employeeId} • {s.designation}</p><p className="text-[11px] text-muted-foreground">{s.department} • {s.branchName}</p></div>
                    <Badge variant={s.status === "ACTIVE" ? "success" : s.status === "ON_LEAVE" ? "warning" : "secondary"} className="text-[10px] h-fit shrink-0">{s.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-muted/40 border"><span className="text-muted-foreground block text-[10px]">Type</span><span className="font-medium">{s.staffType}</span></div>
                    <div className="p-2 rounded-lg bg-muted/40 border"><span className="text-muted-foreground block text-[10px]">Exp</span><span className="font-medium">{s.experienceYears} yrs</span></div>
                  </div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">{s.email}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <div className="flex gap-2 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." className="pl-9 h-9 text-xs" /></div>
            <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}><SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="APPROVED">Approved</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem></SelectContent></Select>
            <Button size="sm" variant="outline" className="h-9 text-xs gap-1" onClick={() => toast.info("Apply Leave — demo placeholder")}><Plus className="h-3.5 w-3.5" /> Apply</Button>
          </div>
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Period</TableHead><TableHead>Days</TableHead><TableHead>Reason</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredLeaves.map((lv) => (
                  <TableRow key={lv.id} className="hover:bg-muted/40">
                    <TableCell><span className="font-semibold text-sm">{lv.staffName}</span><span className="block text-[11px] text-muted-foreground">{lv.branchName}</span></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{lv.leaveType}</Badge></TableCell>
                    <TableCell className="text-xs">{formatDate(lv.fromDate)} → {formatDate(lv.toDate)}</TableCell>
                    <TableCell className="text-xs font-bold">{lv.totalDays}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{lv.reason}</TableCell>
                    <TableCell><Badge variant={lv.status === "APPROVED" ? "success" : lv.status === "PENDING" ? "warning" : "destructive"} className="text-[10px]">{lv.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      {lv.status === "PENDING" ? (<><Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleLeaveAction(lv.id, "APPROVED")}><CheckCircle2 className="h-3 w-3" /> Approve</Button><Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleLeaveAction(lv.id, "REJECTED")}><XCircle className="h-3 w-3" /> Reject</Button></>) : <span className="text-[11px] text-muted-foreground">{lv.approvedBy || "—"}</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
            <Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Month</TableHead><TableHead>Working/Present</TableHead><TableHead>Gross</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Payslip</TableHead></TableRow></TableHeader>
              <TableBody>
                {payrolls.slice(0, 8).map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell><span className="font-semibold text-sm">{p.employeeName}</span><span className="block text-[11px] text-muted-foreground">{p.employeeRole}</span></TableCell>
                    <TableCell className="text-xs">{p.month} {p.year}</TableCell>
                    <TableCell className="text-xs">{p.presentDays}/{p.workingDays}</TableCell>
                    <TableCell className="text-xs">{formatCurrency(p.grossSalary)}</TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600">{formatCurrency(p.netSalary)}</TableCell>
                    <TableCell><Badge variant={p.status === "PAID" ? "success" : p.status === "DRAFT" ? "secondary" : "info"} className="text-[10px]">{p.status}</Badge></TableCell>
                    <TableCell className="text-right"><Button asChild variant="ghost" size="sm" className="h-7 text-[11px] gap-1"><Link href={`/payroll/${p.id}`}><ExternalLink className="h-3 w-3" /> View</Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-center"><Button asChild variant="outline" size="sm"><Link href="/payroll">Go to Payroll Full View →</Link></Button></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
