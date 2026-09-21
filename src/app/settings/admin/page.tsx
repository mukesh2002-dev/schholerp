"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { useAdminConfig } from "@/lib/hooks/use-admin-config";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ShieldAlert, Zap, Layers, Loader2, WifiOff, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminControlPage() {
  const { session } = useERP();
  const { phases, features, isLoading, isFetching, isOffline, error, refresh, togglePhase, toggleFeature } = useAdminConfig() as ReturnType<typeof useAdminConfig> & { isFetching?: boolean };
  const [pendingPhase, setPendingPhase] = React.useState<number | null>(null);
  const [pendingFeature, setPendingFeature] = React.useState<string | null>(null);
  const refreshing = Boolean(isFetching);

  const isAdmin = session.role === "ADMIN";

  if (!isAdmin) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Breadcrumbs />
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Admin only
            </CardTitle>
            <CardDescription>This page is only available to ADMIN. Your role is {session.roleLabel}.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleTogglePhase = async (id: number, enabled: boolean) => {
    setPendingPhase(id);
    try {
      await togglePhase(id, !enabled);
      toast.success(`Phase ${id} ${!enabled ? "enabled" : "disabled"}`, { description: "Sidebar updates instantly for all users. Cache: 60s." });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update phase");
    } finally {
      setPendingPhase(null);
    }
  };

  const handleToggleFeature = async (key: string, enabled: boolean) => {
    setPendingFeature(key);
    try {
      await toggleFeature(key, !enabled);
      toast.success(`Feature ${key} ${!enabled ? "enabled" : "disabled"}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update feature");
    } finally {
      setPendingFeature(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-primary" /> Admin Control
            <Badge variant="outline" className="ml-1 text-xs">Dynamic</Badge>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Phase-by-phase &amp; feature flags. Stored in <code className="font-mono">settings</code> table, Redis cached 60s, RBAC ADMIN-only.
            No new tables. Toggle instantly hides/shows sidebar items.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refresh()}
          disabled={isLoading || refreshing}
          className="gap-1.5"
          title="Refresh — throttled 1.5s, max 3 attempts exponential backoff"
        >
          {isLoading || refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {/* Offline / error banners - never crash UI */}
      {isOffline && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <WifiOff className="h-4 w-4" /> Offline — showing last known config. Changes will sync when back online.
        </div>
      )}
      {error && !isOffline && (
        <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
      )}

      {/* Phases */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" /> Phases (task.md 1-7)
          </CardTitle>
          <CardDescription>Disable a phase to hide its modules for every role. ADMIN-only, dynamic per request.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && phases.length === 0 ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : (
            phases.map((p) => {
              const pending = pendingPhase === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                    p.enabled ? "border-primary/30 bg-primary/[0.04]" : "border-border/70 bg-muted/20 opacity-80"
                  )}
                >
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold shrink-0", p.enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {p.id}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-semibold block truncate">{p.name}</span>
                    <span className="text-[11px] text-muted-foreground block truncate">{p.description}</span>
                  </span>
                  <Badge variant={p.enabled ? "default" : "outline"} className="shrink-0 text-[10px]">
                    {p.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.enabled}
                    disabled={pending}
                    onClick={() => handleTogglePhase(p.id, p.enabled)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors shrink-0",
                      p.enabled ? "bg-primary" : "bg-muted",
                      pending && "opacity-60"
                    )}
                  >
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", p.enabled ? "left-[22px]" : "left-0.5")} />
                  </button>
                  {pending && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" /> Feature Flags
          </CardTitle>
          <CardDescription>Granular module toggles. If a feature is off, its nav items disappear for every role. Uses same single API (no duplicate routes).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && features.length === 0 ? (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : (
            features.map((f) => {
              const pending = pendingFeature === f.key;
              return (
                <div
                  key={f.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border",
                    f.enabled ? "border-border/70 bg-card" : "border-border/50 bg-muted/10 opacity-80"
                  )}
                >
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-semibold flex items-center gap-1.5">
                      {f.name} <span className="text-[10px] font-mono text-muted-foreground">({f.key})</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">Phase {f.phase} · {f.enabled ? "visible" : "hidden"} in sidebar</span>
                  </span>
                  <Badge variant={f.enabled ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {f.enabled ? "On" : "Off"}
                  </Badge>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={f.enabled}
                    disabled={pending}
                    onClick={() => handleToggleFeature(f.key, f.enabled)}
                    className={cn("relative h-6 w-11 rounded-full transition-colors shrink-0", f.enabled ? "bg-primary" : "bg-muted", pending && "opacity-60")}
                  >
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", f.enabled ? "left-[22px]" : "left-0.5")} />
                  </button>
                  {pending && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Backend: <code className="font-mono">GET/PUT /admin/config</code> + <code className="font-mono">/admin/phases/:id</code> + <code className="font-mono">/admin/features/:key</code> — ADMIN-only via <code className="font-mono">role_endpoint_access</code>. Frontend: same API, no duplicate routes for shared resources (e.g. <code className="font-mono">GET /students</code> is campus-scoped, not duplicated as <code className="font-mono">/admin/students</code>).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
