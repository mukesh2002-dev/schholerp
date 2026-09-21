"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export function PerformanceOverview() {
  const { data } = useDashboard();
  const stats: Record<string, number> = (data?.stats ?? {}) as Record<string, number>;
  const liveRows = [
    { label: "Enrolled Students", value: Number(stats.totalStudents ?? 0), fill: "#3b82f6" },
    { label: "Total Classes", value: Number(stats.totalClasses ?? 0), fill: "#10b981" },
    { label: "Faculty & Teachers", value: Number(stats.totalTeachers ?? 0), fill: "#8b5cf6" },
    { label: "Attendance Today", value: Number(stats.attendanceToday ?? 0), fill: "#f59e0b" },
  ];
  const maxValue = Math.max(1, ...liveRows.map((r) => r.value));

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              Live Academic Overview
            </CardTitle>
            <CardDescription>Enrollment, classes, faculty & today&apos;s attendance from the backend</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            {formatNumber(Number(stats.totalStudents ?? 0))} Students
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {liveRows.map((row) => (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{row.label}</span>
              <span className="text-muted-foreground font-mono">
                <strong className="text-foreground">{formatNumber(row.value)}</strong>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? Math.round((row.value / maxValue) * 100) : 0}%`,
                  backgroundColor: row.fill,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}