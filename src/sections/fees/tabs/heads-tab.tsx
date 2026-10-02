"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchFeeHeads, deleteFeeHeadApi } from "@/lib/api/fees";

export function HeadsList() {
  const { activeBranchId } = useERP();
  const [q, setQ] = useState("");
  const { data: heads, isLoading, refresh } = useCampusData({
    fetcher: () => fetchFeeHeads(),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchFeeHeads>>,
    queryKeyPrefix: "fee-heads",
  });

  const filtered = heads.filter((h) => !q.trim() || h.name.toLowerCase().includes(q.toLowerCase()) || h.category.toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (uuid: string, hname: string) => {
    if (!window.confirm(`Delete fee head "${hname}"? Blocked if used in structure items.`)) return;
    try {
      await deleteFeeHeadApi(uuid);
      toast.success("Fee head deleted");
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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search heads / category" className="pl-9 h-9 text-xs" />
        </div>
        <Button asChild size="sm" className="gap-1 h-9 text-xs"><Link href="/fees/heads/new"><Plus className="h-4 w-4" /> Add Fee Head</Link></Button>
      </div>
      {isLoading && heads.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">Loading fee heads…</Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <h3 className="font-semibold text-sm">No fee heads</h3>
          <p className="text-xs text-muted-foreground mt-1">Heads are the building blocks of every fee structure (Tuition, Exam, Transport…).</p>
          <Button asChild size="sm" className="h-8 text-xs gap-1"><Link href="/fees/heads/new"><Plus className="h-3.5 w-3.5" /> Create the first one</Link></Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <Card key={h.uuid} className="border-border/70">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: h.color ?? "#3b82f6" }} />
                  <Link href={`/fees/heads/${h.uuid}`} className="font-bold text-sm line-clamp-1 hover:text-primary transition-colors">{h.name}</Link>
                  <Badge variant={h.isRecurring ? "secondary" : "outline"} className="text-[10px] ml-auto shrink-0">{h.isRecurring ? "Recurring" : "One-time"}</Badge>
                </div>
                {h.description && <p className="text-xs text-muted-foreground line-clamp-2">{h.description}</p>}
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{h.category}</Badge>
                  {h.isMandatory && <Badge variant="outline" className="text-[10px]">Mandatory</Badge>}
                </div>
                <div className="flex gap-1.5 pt-1">
                  <Button asChild variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1"><Link href={`/fees/heads/${h.uuid}`}><Pencil className="h-3 w-3" /> Edit</Link></Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => void handleDelete(h.uuid, h.name)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}