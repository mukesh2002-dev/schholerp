"use client";

import { Suspense } from "react";
import Link from "next/link";
import { SectionGuard } from "@/components/layout/section-guard";
import { FeesSubnav } from "@/components/layout/fees-subnav";
import { FeesMetricsRibbon, FeesMetricsRibbonSkeleton } from "@/sections/fees";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import {
  fetchDefaulters,
  fetchInvoices,
  fetchAssignments,
} from "@/lib/api/fees";
import {
  UserCheck,
  Users,
  Layers,
  ClipboardList,
  Receipt,
  Wallet,
  Landmark,
  CreditCard,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

const PAGES = [
  { href: "/fees/collect", title: "Collect Fees", desc: "Search student → dues → collect → receipt", Icon: UserCheck, daily: true },
  { href: "/fees/students", title: "Student Fees", desc: "Who is assigned what, paid vs due", Icon: Users },
  { href: "/fees/structures", title: "Fee Structures", desc: "Class fee plans: heads, amounts, billing months", Icon: Layers },
  { href: "/fees/assignments", title: "Assignments", desc: "Link students to structures, bulk assign, discontinue", Icon: ClipboardList },
  { href: "/fees/invoices", title: "Invoices", desc: "Generate monthly / bulk, cancel, track status", Icon: Receipt },
  { href: "/fees/payments", title: "Payments", desc: "Receipts ledger, cancel wrong entries", Icon: Wallet },
  { href: "/fees/heads", title: "Fee Heads", desc: "Master list: Tuition, Exam, Transport…", Icon: CreditCard },
  { href: "/fees/defaulters", title: "Defaulters", desc: "Overdue students, worst first, reminders", Icon: AlertTriangle },
  { href: "/fees/refunds", title: "Refunds", desc: "Withdrawal pro-rata, approve, mark paid", Icon: Landmark },
];

function QuickStats() {
  const { activeBranchId } = useERP();
  const { data: invoices } = useCampusData({
    fetcher: (cid) => fetchInvoices({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchInvoices>>,
    queryKeyPrefix: "fee-invoices",
  });
  const { data: assignments } = useCampusData({
    fetcher: (cid) => fetchAssignments({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAssignments>>,
    queryKeyPrefix: "fee-assignments",
  });
  const { data: defaulters } = useCampusData({
    fetcher: (cid) => fetchDefaulters({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchDefaulters>>,
    queryKeyPrefix: "fee-defaulters",
  });

  const unpaid = (invoices as any[]).filter((i) => !["paid", "cancelled"].includes(String(i.status)));
  const outstanding = unpaid.reduce((a, i) => a + (Number(i.amount ?? 0) - Number(i.paidAmount ?? 0)), 0);
  const duesCount = (assignments as any[]).filter((a) => !a.discontinuedAt && a.status !== "PAID").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Open Invoices", val: String(unpaid.length), cls: "" },
        { label: "Outstanding", val: formatCurrency(outstanding), cls: "text-amber-600" },
        { label: "Assignments w/ dues", val: String(duesCount), cls: "" },
        { label: "Defaulters", val: String((defaulters as any[]).length), cls: "text-rose-600" },
      ].map((s) => (
        <Card key={s.label} className="border-border/70">
          <CardContent className="p-3">
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
            <div className={`text-base font-bold font-mono mt-0.5 ${s.cls}`}>{s.val}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FeesOverviewPage() {
  return (
    <SectionGuard featureKey="fees">
      <div className="space-y-4 animate-in fade-in duration-300">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Fees & Collections</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Year-isolated fee plans → assignments → invoices (snapshots) → collection → ledger. Old-year data is never touched.
          </p>
        </div>
        <FeesSubnav />
        <Suspense fallback={<FeesMetricsRibbonSkeleton />}>
          <FeesMetricsRibbon />
        </Suspense>
        <Suspense fallback={<div className="text-xs text-muted-foreground">Loading stats…</div>}>
          <QuickStats />
        </Suspense>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PAGES.map(({ href, title, desc, Icon, daily }) => (
            <Link key={href} href={href} className="group">
              <Card className="border-border/70 hover:border-primary/40 transition-colors h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                    <span className="font-semibold text-sm">{title}</span>
                    {daily && <Badge variant="success" className="text-[10px] ml-auto">Daily</Badge>}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="gradient" className="h-8 text-xs gap-1">
            <Link href="/fees/collect"><UserCheck className="h-3.5 w-3.5" /> Collect Payment</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
            <Link href="/fees/invoices/generate"><Receipt className="h-3.5 w-3.5" /> Generate Invoices</Link>
          </Button>
        </div>
      </div>
    </SectionGuard>
  );
}