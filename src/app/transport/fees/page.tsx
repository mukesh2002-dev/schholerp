"use client";

import { useState } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeeCollection } from "@/sections/transport/fee-collection";
import { FeeDashboard } from "@/sections/transport/fee-dashboard";
import type { TransportPendingBill } from "@/lib/api/transport";

export default function TransportFeesPage() {
  const [tab, setTab] = useState("dashboard");
  const [focusBill, setFocusBill] = useState<TransportPendingBill | null>(null);

  return (
    <SectionGuard>
      <TransportPageShell
        title="Transport Fee Collection"
        subtitle="Pending bills, route-wise dues aur date-wise collection dekho; student search karke payment collect karo."
      >
        <Tabs value={tab} onValueChange={setTab} className="space-y-3">
          <TabsList className="h-9">
            <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
            <TabsTrigger value="collect" className="text-xs">Collect Payment</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <FeeDashboard
              onCollect={(bill) => {
                setFocusBill(bill);
                setTab("collect");
              }}
            />
          </TabsContent>
          <TabsContent value="collect">
            <FeeCollection focusBill={focusBill} />
          </TabsContent>
        </Tabs>
      </TransportPageShell>
    </SectionGuard>
  );
}
