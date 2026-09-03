"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { PayrollRecord, PayrollStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  Building2,
  Briefcase,
  CreditCard,
  Hash,
  CalendarDays,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusConfig: Record<PayrollStatus, { label: string; variant: "outline" | "secondary" | "success" | "info" | "warning" | "purple" | "rose" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PROCESSING: { label: "Processing", variant: "info" },
  COMPLETED: { label: "Completed", variant: "success" },
  PAID: { label: "Paid", variant: "success" },
};

const paymentModeLabels: Record<string, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
};

export default function PayslipPage() {
  const params = useParams();
  const payrollId = params.id as string;
  const record = mockDb.getPayrollById(payrollId);

  if (!record) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Briefcase className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Payslip Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested payroll record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/payroll">Back to Payroll</Link>
        </Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Payslip Detail
            </h1>
            <Badge variant={statusConfig[record.status].variant} className="text-xs">
              {statusConfig[record.status].label}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Salary slip for {record.month} {record.year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/payroll" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border/60 bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-xl">
                {record.employeeName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {record.employeeName}
                </h2>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    {record.employeeRole}
                  </span>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    {record.branchName}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-muted-foreground font-medium">Salary Structure</div>
              <div className="text-sm font-bold text-foreground">{record.salaryStructureName}</div>
              <div className="text-xs text-muted-foreground">
                {record.month} {record.year} &bull; {record.presentDays}/{record.workingDays} days
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Earnings
              </h3>

              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 border-b border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground">Component</span>
                </div>
                <div className="divide-y divide-border/60">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-foreground">Base Salary</span>
                    <span className="text-sm font-bold text-foreground">{formatCurrency(record.baseSalary)}</span>
                  </div>
                  {record.allowances.map((allowance, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-3">
                      <span className="text-sm text-muted-foreground">{allowance.name}</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(allowance.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-500/5 px-4 py-3 border-t border-border/60">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">Gross Salary</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(record.grossSalary)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-rose-600" />
                Deductions
              </h3>

              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="bg-muted/40 px-4 py-2.5 border-b border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground">Component</span>
                </div>
                <div className="divide-y divide-border/60">
                  {record.deductions.map((deduction, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-3">
                      <span className="text-sm text-muted-foreground">{deduction.name}</span>
                      <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(deduction.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-rose-500/5 px-4 py-3 border-t border-border/60">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">Total Deductions</span>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">-{formatCurrency(record.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Net Salary Payable</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(record.netSalary)}
                </div>
              </div>
              <div className="text-right space-y-1 text-xs">
                <div className="flex justify-between sm:flex-col sm:items-end gap-1">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusConfig[record.status].variant} className="text-[10px]">
                    {statusConfig[record.status].label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {record.paymentDate && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-0.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Payment Date
                </span>
                <span className="font-bold text-foreground text-sm">{formatDate(record.paymentDate)}</span>
              </div>
              {record.paymentMode && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-0.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment Mode
                  </span>
                  <span className="font-bold text-foreground text-sm">{paymentModeLabels[record.paymentMode] || record.paymentMode}</span>
                </div>
              )}
              {record.transactionId && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-0.5">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    Transaction ID
                  </span>
                  <span className="font-bold text-foreground text-sm font-mono">{record.transactionId}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
