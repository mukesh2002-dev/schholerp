"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { ExpenseEntry, ExpenseCategory, MonthlyExpenseSummary } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Receipt,
  FolderOpen,
  BarChart3,
  ExternalLink,
  DollarSign,
  Tag,
  Building2,
  User,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  gray: "bg-gray-500",
};

export default function ExpensesPage() {
  const { activeBranchId } = useERP();
  const [expenses] = useState<ExpenseEntry[]>(() => mockDb.getExpenseEntries(activeBranchId));
  const [categories] = useState<ExpenseCategory[]>(() => mockDb.getExpenseCategories());
  const [monthlySummary] = useState<MonthlyExpenseSummary[]>(() => mockDb.getMonthlyExpenseSummary());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [expenses, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Expenses & Ledger
            </h1>
            <Badge variant="outline" className="text-xs">
              {expenses.length} Entries
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track operational expenditures, category budgets, and approval workflows.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="all" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" />
            <span>All Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Monthly Summary</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses by title, category, branch..."
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-9 text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <EmptyState
              title="No Expenses Found"
              description="No expense records matched your current search and status filters."
              icon={<Receipt className="h-7 w-7" />}
            />
          ) : (
            <div className="grid gap-3">
              {filteredExpenses.map((expense) => (
                <Link key={expense.id} href={`/expenses/${expense.id}`}>
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-sm">
                            {expense.title.charAt(0)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                                {expense.title}
                              </h3>
                              <Badge variant={statusBadgeVariant[expense.status]} className="text-[10px] py-0">
                                {statusLabels[expense.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {expense.categoryName}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {formatCurrency(expense.amount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {expense.branchName}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {expense.submittedBy}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div className="hidden sm:flex flex-col items-end gap-0.5">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <CreditCard className="h-3 w-3" />
                              {expense.paymentMethod.replace("_", " ")}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {formatDate(expense.expenseDate)}
                            </span>
                          </div>
                          <span className="font-extrabold text-foreground text-sm">
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const spentPct = cat.totalBudget > 0 ? Math.round((cat.spent / cat.totalBudget) * 100) : 0;
              return (
                <Card key={cat.id} className="border-border/80 shadow-xs hover:shadow-md transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${colorMap[cat.color] || "bg-gray-500"}`} />
                      <h3 className="font-bold text-foreground text-sm">{cat.name}</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.description}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-medium">Budget Used</span>
                        <span className="font-bold text-foreground">{spentPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colorMap[cat.color] || "bg-gray-500"}`}
                          style={{ width: `${Math.min(spentPct, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{formatCurrency(cat.spent)} spent</span>
                        <span>{formatCurrency(cat.totalBudget)} total</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Monthly Expense Breakdown</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
