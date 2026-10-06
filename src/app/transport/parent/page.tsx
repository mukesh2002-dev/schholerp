"use client";

import { SectionGuard } from "@/components/layout/section-guard";
import { TransportPageShell } from "@/components/layout/transport-subnav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { Bus, User, Clock, Receipt, Check, X } from "lucide-react";
import { fetchParentTransport } from "@/lib/api/transport";

export default function ParentTransportPage() {
  const { activeBranchId } = useERP();
  const { data: info, isLoading, error } = useCampusData({
    fetcher: () => fetchParentTransport(),
    campusId: activeBranchId,
    fallback: null,
    queryKeyPrefix: "transport-parent",
  });

  const t = (info as any)?.transport ?? null;
  const child = (info as any)?.child ?? null;
  const history: any[] = (info as any)?.boardingHistory ?? [];
  const fee = (info as any)?.fee ?? null;

  return (
    <SectionGuard>
      <TransportPageShell
        title="My Child's Transport"
        subtitle="Bus, stop timings, crew, boarding history and fee — only your own child is visible here."
      >
        {isLoading ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">Loading…</Card>
        ) : error || !child ? (
          <Card className="border-dashed p-10 text-center text-xs text-muted-foreground">
            {error ?? "No transport record linked to your account yet."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-bold">{child.name}</h3><Badge variant="outline" className="text-[10px] ml-auto">{child.class ?? "—"}</Badge></div>
                {!t ? (
                  <p className="text-xs text-muted-foreground">Not on school transport.</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2"><Bus className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{t.vehicle?.registrationNumber ?? "—"}</span><span className="text-muted-foreground">{t.route?.name ?? ""}</span></div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">Stop</div><div className="font-medium">{t.stop ?? "—"}</div></div>
                      <div className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">Pickup / Drop</div><div className="font-mono">{t.pickupTime ?? "—"} / {t.dropTime ?? "—"}</div></div>
                      <div className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">Driver</div><div className="font-medium">{t.driver?.name ?? "—"}{t.driver?.phone ? ` · ${t.driver.phone}` : ""}</div></div>
                      <div className="p-2 rounded-lg bg-muted/30"><div className="text-[10px] text-muted-foreground">Conductor</div><div className="font-medium">{t.conductor?.name ?? "—"}{t.conductor?.phone ? ` · ${t.conductor.phone}` : ""}</div></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-bold">Boarding history</h3></div>
                {history.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No trips marked yet.</p>
                ) : (
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {history.slice(0, 20).map((h: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-1.5 rounded-lg border bg-muted/20">
                        {h.boarded ? <Check className="h-3.5 w-3.5 text-green-600" /> : <X className="h-3.5 w-3.5 text-destructive" />}
                        <span className="font-mono">{String(h.tripDate ?? h.date ?? "").slice(0, 10)}</span>
                        <Badge variant="outline" className="text-[10px]">{h.tripType}</Badge>
                        <span className="ml-auto text-muted-foreground">{h.boarded ? "Boarded" : (h.notPickedReason ?? h.reason ?? "Not boarded")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 lg:col-span-2">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-bold">Transport fee</h3>
                  {fee && <div className="ml-auto text-xs">Total ₹{fee.total} · Paid ₹{fee.paid} · <span className="font-bold">Pending ₹{fee.pending}</span></div>}
                </div>
                {(fee?.records ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No billing records yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(fee.records as any[]).map((r: any) => (
                      <Badge key={r.uuid} variant={r.status === "PAID" ? "default" : "outline"} className="text-[10px]">
                        {r.month}/{r.year} · ₹{r.amountPaid}/{r.amountDue} · {r.status}{r.invoice ? ` · ${r.invoice.invoiceNumber}` : ""}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </TransportPageShell>
    </SectionGuard>
  );
}
