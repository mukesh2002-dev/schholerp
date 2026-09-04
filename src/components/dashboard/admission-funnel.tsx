"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { initialAdmissionFunnel } from "@/lib/mock-data/dashboard";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AdmissionFunnel() {
  const { branches } = useERP();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Admission Conversion Funnel */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                2026-27 Admission Pipeline
              </CardTitle>
              <CardDescription>Inquiry to Enrollment conversion funnel</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
              1,840 Total Leads
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
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

      {/* Campus Capacity Distribution */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Campus Capacity Quotas
              </CardTitle>
              <CardDescription>Live occupancy vs maximum infrastructure limit</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              6 Campuses
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {branches.map((b) => {
            const occupancy = Math.round((b.totalStudents / b.capacity) * 100);
            return (
              <div key={b.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: b.color || "#3b82f6" }}
                    />
                    <span className="font-medium text-foreground truncate max-w-[170px]">{b.name}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">
                    <strong className="text-foreground">{formatNumber(b.totalStudents)}</strong> / {formatNumber(b.capacity)}{" "}
                    <span className="font-bold text-foreground">({occupancy}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(occupancy, 100)}%`,
                      backgroundColor: b.color || "#3b82f6",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
