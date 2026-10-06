"use client";

import { useState } from "react";
import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { DriversList } from "@/sections/transport/drivers-list";
import { HelpersList } from "@/sections/transport/helpers-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function DriversPage() {
  const [tab, setTab] = useState("drivers");
  return (
    <SectionGuard>
      <TransportPageShell
        title="Drivers & Helpers"
        subtitle="License compliance at a glance — expiry badges warn before renewal dates. Conductors, attendants and ayahs ride along on assigned buses."
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-9">
            <TabsTrigger value="drivers" className="text-xs">Drivers</TabsTrigger>
            <TabsTrigger value="helpers" className="text-xs">Conductors & Helpers</TabsTrigger>
          </TabsList>
          <TabsContent value="drivers" className="mt-3"><DriversList /></TabsContent>
          <TabsContent value="helpers" className="mt-3"><HelpersList /></TabsContent>
        </Tabs>
      </TransportPageShell>
    </SectionGuard>
  );
}
