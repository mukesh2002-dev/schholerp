"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function FeeCollections() {
  const [mounted, setMounted] = useState(false);
  const { data } = useDashboard();
  const collected = Number(data?.stats?.revenueCollected ?? 0);
  const billed = Number(data?.stats?.revenueBilled ?? 0);
  const pending = Number(data?.stats?.revenuePending ?? 0);
  const realized = billed > 0 ? Math.round((collected / billed) * 100) : 0;
  const chartData = [
    { month: "MTD", collected, target: billed, pending },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="col-span-full lg:col-span-4 border-border/80 shadow-xs min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Fee Collections (₹)
          </CardTitle>
          <CardDescription>Collected vs billed from live fee records (MTD)</CardDescription>
        </div>
        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
          {realized}% Realized
        </Badge>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="h-[280px] min-h-[280px] w-full min-w-0 pt-2">
          {!mounted ? (
            <Skeleton className="h-[280px] w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={280} minWidth={0}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                />
                <Bar dataKey="collected" name="Collected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
