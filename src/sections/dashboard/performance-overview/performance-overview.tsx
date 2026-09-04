"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { initialAdmissionFunnel } from "@/lib/mock-data/dashboard";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export function PerformanceOverview() {
  const totalLeads = initialAdmissionFunnel[0]?.count || 1840;

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              2026-27 Admission Conversion Pipeline
            </CardTitle>
            <CardDescription>Inquiry to Enrollment funnel stages &amp; retention efficiency</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            {formatNumber(totalLeads)} Total Inquiries
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {initialAdmissionFunnel.map((step) => (
          <div key={step.stage} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{step.stage}</span>
              <span className="text-muted-foreground font-mono">
                <strong className="text-foreground">{formatNumber(step.count)}</strong> ({step.percentage}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${step.percentage}%`,
                  backgroundColor: step.fill,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
