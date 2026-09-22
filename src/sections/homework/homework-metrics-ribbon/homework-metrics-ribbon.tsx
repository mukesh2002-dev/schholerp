"use client";

import React, { useEffect, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchHomework } from "@/lib/api/homework";
import { Card } from "@/components/ui/card";
import { ClipboardList, BookOpen, Clock, FileWarning } from "lucide-react";

export function HomeworkMetricsRibbon() {
  const { activeBranchId } = useERP();
  const campusId = activeBranchId === "all" ? null : activeBranchId;

  const [stats, setStats] = useState({ total: 0, active: 0, overdue: 0, submissions: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await fetchHomework({ campusId, limit: 100 });
        if (cancelled) return;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        setStats({
          total: items.length,
          active: items.filter((h) => h.status === "ACTIVE").length,
          overdue: items.filter((h) => h.status === "ACTIVE" && new Date(h.dueDate) < now).length,
          submissions: items.reduce((acc, h) => acc + ((h as any).submissionsCount ?? 0), 0),
        });
      } catch {
        if (!cancelled) setStats({ total: 0, active: 0, overdue: 0, submissions: 0 });
      }
    })();
    const h = () => {
      fetchHomework({ campusId, limit: 100 })
        .then(({ items }) => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          setStats({
            total: items.length,
            active: items.filter((x) => x.status === "ACTIVE").length,
            overdue: items.filter((x) => x.status === "ACTIVE" && new Date(x.dueDate) < now).length,
            submissions: items.reduce((acc, x) => acc + ((x as any).submissionsCount ?? 0), 0),
          });
        })
        .catch(() => {});
    };
    if (typeof window !== "undefined") {
      window.addEventListener("homework-updated", h);
      return () => {
        cancelled = true;
        window.removeEventListener("homework-updated", h);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [campusId]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Tasks
          </span>
          <ClipboardList className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{stats.total}</span>
        <span className="text-[11px] text-muted-foreground">Assigned across terms</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Due
          </span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{stats.active}</span>
        <span className="text-[11px] text-amber-600 font-medium">Pending submission</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Submissions
          </span>
          <BookOpen className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{stats.submissions}</span>
        <span className="text-[11px] text-purple-600 font-medium">Received from students</span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Overdue
          </span>
          <FileWarning className="h-4 w-4 text-rose-500" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">{stats.overdue}</span>
        <span className="text-[11px] text-rose-600 font-medium">Past due date &amp; still active</span>
      </Card>
    </div>
  );
}
