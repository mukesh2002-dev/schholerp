"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { ExpenseEntry } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  Tag,
  Building2,
  User,
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusBadgeVariant: Record<string, "success" | "warning" | "info" | "destructive" | "default"> = {
  PENDING: "warning",
  APPROVED: "info",
  REJECTED: "destructive",
  PAID: "success",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
};

const approvalStepLabels: Record<string, string> = {
  HOD: "Head of Department",
  PRINCIPAL: "Principal",
  ADMIN: "Admin Manager",
};

const approvalSteps = ["HOD", "PRINCIPAL", "ADMIN"];

export default function ExpenseDetailPage() {
  const params = useParams();
  const expenseId = params.id as string;

  const [expense] = useState<ExpenseEntry | undefined>(() => mockDb.getExpenseById(expenseId));

  if (!expense) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Receipt className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Expense Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested expense record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/expenses">Back to Expenses</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = approvalSteps.indexOf(expense.approvalLevel);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-2xl">
              {expense.title.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {expense.id}
                </Badge>
                <Badge variant={statusBadgeVariant[expense.status]} className="text-[10px]">
                  {statusLabels[expense.status]}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {expense.categoryName}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {expense.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                <span className="text-primary font-semibold">{expense.branchName}</span>
                {" • "}
                <span className="font-bold text-foreground">{formatCurrency(expense.amount)}</span>
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/expenses" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="approval" className="gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Approval</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Expense Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Title</span>
                    <span className="font-bold text-foreground text-sm">{expense.title}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Amount</span>
                    <span className="font-bold text-foreground text-sm">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Category</span>
                    <span className="font-bold text-foreground text-sm">{expense.categoryName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Branch</span>
                    <span className="font-bold text-foreground text-sm">{expense.branchName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground flex items-center gap-1 mb-0.5">
                      <User className="h-3 w-3" />
                      Submitted By
                    </span>
                    <span className="font-bold text-foreground text-sm">{expense.submittedBy}</span>
                    <span className="text-muted-foreground block text-[10px]">{expense.submittedByRole}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Approved By
                    </span>
                    <span className="font-bold text-foreground text-sm">{expense.approvedBy || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Approval Level</span>
                    <span className="font-bold text-foreground text-sm">
                      {approvalStepLabels[expense.approvalLevel]}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground flex items-center gap-1 mb-0.5">
                      <CreditCard className="h-3 w-3" />
                      Payment Method
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {expense.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  {expense.invoiceNumber && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Invoice Number</span>
                      <span className="font-bold text-foreground text-sm font-mono">{expense.invoiceNumber}</span>
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Calendar className="h-3 w-3" />
                      Expense Date
                    </span>
                    <span className="font-bold text-foreground text-sm">{formatDate(expense.expenseDate)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Description</span>
                  <p className="text-foreground text-sm leading-relaxed">{expense.description}</p>
                </div>
                {expense.notes && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Notes</span>
                    <p className="text-foreground text-sm leading-relaxed">{expense.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1">
                    <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider block">
                      Total Amount
                    </span>
                    <span className="text-2xl font-extrabold text-foreground block">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      via {expense.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Status</span>
                      <Badge variant={statusBadgeVariant[expense.status]} className="text-[10px]">
                        {statusLabels[expense.status]}
                      </Badge>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Submitted</span>
                      <span className="font-bold text-foreground text-sm">{formatDate(expense.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Category Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Category</span>
                    <span className="font-bold text-foreground text-sm">{expense.categoryName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Branch</span>
                    <span className="font-bold text-foreground text-sm">{expense.branchName}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/80" />
                <div className="space-y-6">
                  {approvalSteps.map((step, index) => {
                    const isCurrentStep = step === expense.approvalLevel;
                    const isPastStep = index < currentStepIndex;
                    const isFutureStep = index > currentStepIndex;

                    let stepStatus: "completed" | "current" | "upcoming" | "rejected";
                    if (expense.status === "REJECTED" && isPastStep) {
                      stepStatus = "completed";
                    } else if (expense.status === "REJECTED" && isCurrentStep) {
                      stepStatus = "rejected";
                    } else if (isPastStep) {
                      stepStatus = "completed";
                    } else if (isCurrentStep) {
                      stepStatus = "current";
                    } else {
                      stepStatus = "upcoming";
                    }

                    return (
                      <div key={step} className="relative flex items-start gap-4 pl-4">
                        <div className="relative z-10 shrink-0">
                          {stepStatus === "completed" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                          {stepStatus === "current" && expense.status === "PENDING" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                              <Clock className="h-4 w-4" />
                            </div>
                          )}
                          {stepStatus === "current" && expense.status === "APPROVED" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                          {stepStatus === "current" && expense.status === "PAID" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                          {stepStatus === "rejected" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                              <XCircle className="h-4 w-4" />
                            </div>
                          )}
                          {stepStatus === "upcoming" && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground border-2 border-border">
                              <span className="text-[10px] font-bold">{index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${stepStatus === "upcoming" ? "text-muted-foreground" : "text-foreground"}`}>
                              {approvalStepLabels[step]}
                            </span>
                            {stepStatus === "completed" && (
                              <Badge variant="success" className="text-[10px] py-0">Completed</Badge>
                            )}
                            {stepStatus === "current" && expense.status === "PENDING" && (
                              <Badge variant="warning" className="text-[10px] py-0">Awaiting</Badge>
                            )}
                            {stepStatus === "current" && (expense.status === "APPROVED" || expense.status === "PAID") && (
                              <Badge variant="success" className="text-[10px] py-0">Approved</Badge>
                            )}
                            {stepStatus === "rejected" && (
                              <Badge variant="destructive" className="text-[10px] py-0">Rejected</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[11px] mt-0.5">
                            {stepStatus === "completed"
                              ? step === expense.approvalLevel
                                ? `Approved by ${expense.approvedBy || "—"}`
                                : "Step completed"
                              : stepStatus === "current" && expense.status === "PENDING"
                              ? "Waiting for approval"
                              : stepStatus === "current" && expense.status === "APPROVED"
                              ? `Approved by ${expense.approvedBy || "—"}`
                              : stepStatus === "current" && expense.status === "PAID"
                              ? `Approved and paid — ${expense.approvedBy || "—"}`
                              : stepStatus === "rejected"
                              ? `Rejected by ${expense.approvedBy || "—"}`
                              : "Not yet reached"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
