"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { PayrollStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Briefcase, ExternalLink, Plus, Edit3, Trash2, Save } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusConfig: Record<PayrollStatus, { label: string; variant: "outline" | "secondary" | "success" | "info" | "warning" | "purple" | "rose" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PROCESSING: { label: "Processing", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  PAID: { label: "Paid", variant: "success" },
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PayrollDirectoryView() {
  const { activeBranchId } = useERP();
  const [records] = useState(() => mockDb.getPayrollRecords(activeBranchId));
  const [structures, setStructures] = useState(() => mockDb.getSalaryStructures());
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", base: "65000", desc: "", allowances: [{ name: "HRA", amount: "15000" }], deductions: [{ name: "PF", amount: "7800" }] });
  useEffect(() => {
    const h = () => setStructures([...mockDb.getSalaryStructures()]);
    window.addEventListener("payroll:updated", h); return () => window.removeEventListener("payroll:updated", h);
  }, []);
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, base: String(s.baseSalary), desc: s.description, allowances: s.allowances.map((a: any) => ({ ...a, amount: String(a.amount) })), deductions: s.deductions.map((d: any) => ({ ...d, amount: String(d.amount) })) }); setEditOpen(true); };
  const openCreate = () => { setEditing(null); setForm({ name: "", base: "40000", desc: "", allowances: [{ name: "HRA", amount: "10000" }], deductions: [{ name: "PF", amount: "4000" }] }); setEditOpen(true); };
  const saveStructure = () => {
    if (!form.name || !form.base) return toast.error("Name & base required");
    const base = Number(form.base);
    const allowances = form.allowances.filter((a) => a.name && Number(a.amount) >= 0).map((a) => ({ name: a.name, amount: Number(a.amount) }));
    const deductions = form.deductions.filter((d) => d.name && Number(d.amount) >= 0).map((d) => ({ name: d.name, amount: Number(d.amount) }));
    const rec = { id: editing?.id ?? `ss-${Date.now().toString(36)}`, name: form.name, description: form.desc, baseSalary: base, allowances, deductions, grossSalary: 0, netSalary: 0, applicableTo: editing?.applicableTo ?? "TEACHER", branchId: "all" } as any;
    mockDb.saveSalaryStructure(rec); toast.success(editing ? "Updated" : "Created"); setEditOpen(false); setStructures([...mockDb.getSalaryStructures()]);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => r.month === selectedMonth);
  }, [records, selectedMonth]);

  return (
    <Tabs defaultValue="monthly" className="space-y-4">
      <TabsList>
        <TabsTrigger value="monthly">Monthly Payroll</TabsTrigger>
        <TabsTrigger value="structures">Salary Structures</TabsTrigger>
        <TabsTrigger value="history">Payroll History</TabsTrigger>
      </TabsList>

      <TabsContent value="monthly" className="space-y-4">
        <div className="flex items-center gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m}>
                  {m} 2026
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            {filteredRecords.length} records
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="border-border/80 shadow-xs hover:shadow-sm transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {record.employeeName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <Link
                        href={`/payroll/${record.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                      >
                        {record.employeeName}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block">
                        {record.employeeRole}
                      </span>
                    </div>
                  </div>
                  <Badge variant={statusConfig[record.status].variant} className="text-[10px]">
                    {statusConfig[record.status].label}
                  </Badge>
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {record.branchName} &bull; {record.salaryStructureName}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block">Working Days</span>
                    <span className="font-bold text-foreground">{record.workingDays}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block">Present Days</span>
                    <span className="font-bold text-foreground">{record.presentDays}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross Salary</span>
                    <span className="font-semibold text-foreground">{formatCurrency(record.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductions</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(record.totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border/60">
                    <span className="font-semibold text-foreground">Net Salary</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(record.netSalary)}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild className="w-full h-8 text-xs gap-1">
                  <Link href={`/payroll/${record.id}`}>
                    <span>View Payslip</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="py-12 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground">No Payroll Records</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No payroll records found for {selectedMonth} 2026.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="structures" className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">Har role ka salary editable — Total auto Gross/Net</p>
          <Button size="sm" onClick={openCreate} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add Structure</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {structures.map((structure) => {
            const totalAllowances = structure.allowances.reduce((sum, a) => sum + a.amount, 0);
            const totalDeductions = structure.deductions.reduce((sum, d) => sum + d.amount, 0);

            return (
              <Card key={structure.id} className="border-border/80 shadow-xs hover:shadow-sm transition-shadow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{structure.name}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{structure.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {structure.applicableTo}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground">Base Salary</span>
                      <span className="font-bold text-foreground">{formatCurrency(structure.baseSalary)}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold text-[11px]">Allowances</span>
                      {structure.allowances.map((a, i) => (
                        <div key={i} className="flex justify-between pl-2">
                          <span className="text-muted-foreground">{a.name}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrency(a.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pl-2 pt-1 border-t border-border/40">
                        <span className="font-semibold text-foreground">Total Allowances</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(totalAllowances)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold text-[11px]">Deductions</span>
                      {structure.deductions.map((d, i) => (
                        <div key={i} className="flex justify-between pl-2">
                          <span className="text-muted-foreground">{d.name}</span>
                          <span className="text-rose-600 dark:text-rose-400 font-medium">-{formatCurrency(d.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pl-2 pt-1 border-t border-border/40">
                        <span className="font-semibold text-foreground">Total Deductions</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(totalDeductions)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 pt-2">
                      <span className="font-bold text-foreground">Gross</span>
                      <span className="font-bold text-foreground">{formatCurrency(structure.grossSalary)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <span className="font-bold text-foreground">Net Salary</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(structure.netSalary)}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1" onClick={() => openEdit(structure)}><Edit3 className="h-3 w-3" /> Edit</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} Salary Structure</DialogTitle><DialogDescription>Base + Allowances − Deductions = Net (auto)</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs font-medium">Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="PGT" /></div>
            <div><label className="text-xs font-medium">Description</label><Textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} /></div>
            <div><label className="text-xs font-medium">Base Salary *</label><Input type="number" value={form.base} onChange={(e) => setForm({ ...form, base: e.target.value })} /></div>
            <div><label className="text-xs font-medium">Allowances</label>{form.allowances.map((a, idx) => <div key={idx} className="flex gap-2 mt-1"><Input value={a.name} onChange={(e) => setForm({ ...form, allowances: form.allowances.map((x, i) => i === idx ? { ...x, name: e.target.value } : x) })} placeholder="HRA" /><Input type="number" value={a.amount} onChange={(e) => setForm({ ...form, allowances: form.allowances.map((x, i) => i === idx ? { ...x, amount: e.target.value } : x) })} className="w-24" /><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm({ ...form, allowances: form.allowances.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}<Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => setForm({ ...form, allowances: [...form.allowances, { name: "", amount: "1000" }] })}><Plus className="h-3 w-3" /> Add</Button></div>
            <div><label className="text-xs font-medium">Deductions</label>{form.deductions.map((d, idx) => <div key={idx} className="flex gap-2 mt-1"><Input value={d.name} onChange={(e) => setForm({ ...form, deductions: form.deductions.map((x, i) => i === idx ? { ...x, name: e.target.value } : x) })} placeholder="PF" /><Input type="number" value={d.amount} onChange={(e) => setForm({ ...form, deductions: form.deductions.map((x, i) => i === idx ? { ...x, amount: e.target.value } : x) })} className="w-24" /><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm({ ...form, deductions: form.deductions.filter((_, i) => i !== idx) })}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}<Button variant="outline" size="sm" className="h-7 text-xs mt-1" onClick={() => setForm({ ...form, deductions: [...form.deductions, { name: "", amount: "500" }] })}><Plus className="h-3 w-3" /> Add</Button></div>
            <div className="p-2 rounded bg-primary/5 border text-xs flex justify-between"><span>Gross: ₹{Number(form.base) + form.allowances.reduce((a, b) => a + Number(b.amount || 0), 0)}</span><span>Net: ₹{Number(form.base) + form.allowances.reduce((a, b) => a + Number(b.amount || 0), 0) - form.deductions.reduce((a, b) => a + Number(b.amount || 0), 0)}</span></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={saveStructure} className="gap-1"><Save className="h-3.5 w-3.5" /> {editing ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent></Dialog>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month / Year</TableHead>
                <TableHead className="text-right tabular-nums">Gross Salary</TableHead>
                <TableHead className="text-right tabular-nums">Deductions</TableHead>
                <TableHead className="text-right tabular-nums">Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div>
                      <Link
                        href={`/payroll/${record.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                      >
                        {record.employeeName}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block">
                        {record.employeeRole} &bull; {record.branchName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {record.month} {record.year}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-semibold">{formatCurrency(record.grossSalary)}</TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-semibold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(record.totalDeductions)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(record.netSalary)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[record.status].variant} className="text-[10px]">
                      {statusConfig[record.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {record.paymentDate ? formatDate(record.paymentDate) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs gap-1">
                      <Link href={`/payroll/${record.id}`}>
                        <span>Payslip</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
