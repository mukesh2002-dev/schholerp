"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Activity, Clock, Shield, Sparkles } from "lucide-react";

export function RecentActivity() {
  const { activeBranchId } = useERP();
  const [activities] = useState(() => mockDb.getActivities(activeBranchId));

  const actionVariant = (action: string) => {
    switch (action) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "info";
      case "APPROVE":
        return "purple";
      case "PAYMENT":
        return "default";
      case "SYNC":
        return "warning";
      case "DELETE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="col-span-full lg:col-span-6 border-border/80 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity & Audit Trail
          </CardTitle>
          <CardDescription>Live system operations and user actions across campuses</CardDescription>
        </div>
        <Badge variant="outline" className="text-xs">
          Realtime Stream
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1">
          {activities.slice(0, 6).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors"
            >
              <img
                src={act.user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={act.user.name}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-border mt-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-semibold text-foreground truncate">{act.user.name}</span>
                    <span className="text-[10px] text-muted-foreground">• {act.user.role}</span>
                  </div>
                  <Badge variant={actionVariant(act.action) as any} className="text-[9px] py-0 px-1.5 shrink-0">
                    {act.action}
                  </Badge>
                </div>
                <p className="text-xs text-foreground font-medium truncate">{act.entityName}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{act.details}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span className="font-medium text-primary/80">{act.branchName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(act.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
