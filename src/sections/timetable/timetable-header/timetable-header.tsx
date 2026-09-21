"use client";

import React, { useEffect, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Calendar, WifiOff } from "lucide-react";
import { fetchSlots } from "@/lib/api/timetable";
import { ApiError } from "@/lib/api/client";

export function TimetableHeader() {
  const { activeBranchId } = useERP();
  const campusId = activeBranchId !== "all" ? activeBranchId : undefined;
  const [count, setCount] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const h = () => setOffline(!navigator.onLine);
    window.addEventListener("online", h);
    window.addEventListener("offline", h);
    return () => { window.removeEventListener("online", h); window.removeEventListener("offline", h); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSlots({ campusId })
      .then((slots) => { if (!cancelled) setCount(slots.length); })
      .catch((e) => { if (!cancelled && e instanceof ApiError && e.status === 0) setOffline(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [campusId]);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Master Academic Timetable
            </h1>
            <Badge variant="outline" className="text-xs">
              {loading ? "…" : `${count ?? 0} Active Slots`}
            </Badge>
            {offline && <Badge variant="outline" className="text-xs gap-1 border-amber-300 text-amber-700"><WifiOff className="h-3 w-3" /> Offline</Badge>}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Weekly class schedules, period matrix, teacher workload distribution, and conflict detection. Choose a class above to manage its timetable — empty states guide you to create one.
          </p>
        </div>
      </div>
    </div>
  );
}
