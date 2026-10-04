"use client";

import { useState } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2, Search, ArrowRight, Layers } from "lucide-react";
import { fetchFeeStructures, deleteFeeStructureApi } from "@/lib/api/fees";

export function StructuresList() {
  const { activeBranchId } = useERP();
  const [q, setQ] = useState("");
  const { data: structures, isLoading, refresh } = useCampusData({
    fetcher: (cid) => fetchFeeStructures({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeStructures>>,
    queryKeyPrefix: "fee-structures",
  });

  const filtered = structures.filter((s: any) => !q.trim() || s.name.toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (uuid: string, sname: string) => {
    if (!window.confirm(`Delete structure "${sname}"? Blocked if invoices exist.`)) return;
    try {
      await deleteFeeStructureApi(uuid);
      toast.success("Structure deleted");
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-between flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search structures" className="pl-9 h-9 text-xs" />
        </div>
        <Button asChild size="sm" className="gap-1 h-9 text-xs">
          <Link href="/fees/structures/new"><Plus className="h-4 w-4" /> New Structure</Link>
        </Button>
      </div>

      {isLoading && structures.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading structures…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-semibold text-sm">No fee structures</h3>
            <p className="text-xs text-muted-foreground mt-1">One plan per class per academic year: heads + amounts + billing months. Fee hikes happen via rollover — old years stay frozen.</p>
          </div>
          <Button asChild size="sm" className="h-8 text-xs gap-1"><Link href="/fees/structures/new"><Plus className="h-3.5 w-3.5" /> Create the first one</Link></Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((s: any) => (
            <Card key={s.uuid} className="border-border/60 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/fees/structures/${s.uuid}`} className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">{s.name}</Link>
                    <div className="text-xs text-muted-foreground">
                      {[s.class?.name, s.section?.name, s.academicYear?.name].filter(Boolean).join(" • ") || "All classes"}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono shrink-0">{formatCurrency(s.amount)}</Badge>
                </div>
                <div className="text-xs space-y-1 border-t pt-2">
                  {(s.structureItems ?? []).slice(0, 4).map((it: any) => (
                    <div key={it.uuid} className="flex justify-between">
                      <span className="text-muted-foreground">{it.feeHead?.name ?? "Head"} <span className="text-[10px]">({it.frequency})</span></span>
                      <span className="font-mono font-medium">{formatCurrency(it.amount)}</span>
                    </div>
                  ))}
                  {(s.structureItems ?? []).length > 4 && <div className="text-[11px] text-muted-foreground">+{(s.structureItems ?? []).length - 4} more heads</div>}
                  {(s.structureItems ?? []).length === 0 && <div className="text-[11px] text-muted-foreground">No items</div>}
                </div>
                <div className="flex gap-1.5">
                  <Button asChild variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1">
                    <Link href={`/fees/structures/${s.uuid}`}>Open <ArrowRight className="h-3 w-3" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => void handleDelete(s.uuid, s.name)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}