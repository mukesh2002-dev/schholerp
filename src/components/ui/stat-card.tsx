import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "./card";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  period?: string;
  description?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  badge?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  period,
  description,
  icon,
  iconColor = "bg-primary/10 text-primary",
  badge,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden group hover:border-primary/40 transition-all duration-300", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</h3>
              {badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {badge}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                iconColor
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {(change !== undefined || description || period) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            {change !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded",
                  changeType === "increase" && "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
                  changeType === "decrease" && "text-rose-600 bg-rose-500/10 dark:text-rose-400",
                  changeType === "neutral" && "text-muted-foreground bg-muted"
                )}
              >
                {changeType === "increase" && <TrendingUp className="h-3 w-3" />}
                {changeType === "decrease" && <TrendingDown className="h-3 w-3" />}
                {changeType === "neutral" && <Minus className="h-3 w-3" />}
                {change > 0 ? `+${change}%` : `${change}%`}
              </span>
            )}
            {period && <span>{period}</span>}
            {description && !period && <span className="truncate">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
