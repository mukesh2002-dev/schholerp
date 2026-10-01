"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  AlertTriangle,
  Receipt,
  CreditCard,
  Layers,
  ClipboardList,
  Wallet,
  Landmark,
  UserCheck,
} from "lucide-react";
import { CollectTab } from "../tabs/collect-tab";
import { StudentsTab } from "../tabs/students-tab";
import { InvoicesTab } from "../tabs/invoices-tab";
import { StructuresTab } from "../tabs/structures-tab";
import { AssignmentsTab } from "../tabs/assignments-tab";
import { HeadsTab } from "../tabs/heads-tab";
import { LedgerTab } from "../tabs/ledger-tab";
import { DefaultersTab } from "../tabs/defaulters-tab";
import { RefundsTab } from "../tabs/refunds-tab";

const TABS = [
  { value: "collect", label: "Collect", Icon: UserCheck },
  { value: "students", label: "Students", Icon: Users },
  { value: "invoices", label: "Invoices", Icon: Receipt },
  { value: "structures", label: "Structures", Icon: Layers },
  { value: "assignments", label: "Assignments", Icon: ClipboardList },
  { value: "heads", label: "Fee Heads", Icon: CreditCard },
  { value: "ledger", label: "Ledger", Icon: Landmark },
  { value: "defaulters", label: "Defaulters", Icon: AlertTriangle },
  { value: "refunds", label: "Refunds", Icon: Wallet },
];

export function FeesDirectoryView() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="collect" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          {TABS.map(({ value, label, Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="collect" className="space-y-4">
          <CollectTab />
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <StudentsTab />
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <InvoicesTab />
        </TabsContent>
        <TabsContent value="structures" className="space-y-4">
          <StructuresTab />
        </TabsContent>
        <TabsContent value="assignments" className="space-y-4">
          <AssignmentsTab />
        </TabsContent>
        <TabsContent value="heads" className="space-y-4">
          <HeadsTab />
        </TabsContent>
        <TabsContent value="ledger" className="space-y-4">
          <LedgerTab />
        </TabsContent>
        <TabsContent value="defaulters" className="space-y-4">
          <DefaultersTab />
        </TabsContent>
        <TabsContent value="refunds" className="space-y-4">
          <RefundsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
