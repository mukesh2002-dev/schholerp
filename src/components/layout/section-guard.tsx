"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { canRoleAccessPath, getLandingPageForRole } from "@/lib/auth/role-navigation";
import { useAdminConfig } from "@/lib/hooks/use-admin-config";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, WifiOff, Loader2 } from "lucide-react";

export function SectionGuard({
  children,
  featureKey,
  pathnameOverride,
}: {
  children: React.ReactNode;
  featureKey?: string;
  pathnameOverride?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useERP();
  const { isFeatureEnabled, isLoading } = useAdminConfig();
  const checkPath = pathnameOverride ?? pathname ?? "/";

  // Feature flag check (dynamic admin toggle)
  if (featureKey && !isLoading && !isFeatureEnabled(featureKey)) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 text-sm">
            <ShieldAlert className="h-4 w-4" /> Module disabled by admin
          </CardTitle>
          <CardDescription className="text-amber-700">This module ({featureKey}) is currently disabled via Admin Control → Feature Flags.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!canRoleAccessPath(session.role, checkPath, { isFeatureEnabled, allowedModules: session.sidebar })) {
    const landing = getLandingPageForRole(session.role, { isFeatureEnabled, allowedModules: session.sidebar });
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive text-sm">
            <ShieldAlert className="h-4 w-4" /> Access denied
          </CardTitle>
          <CardDescription>
            Your role {session.roleLabel} cannot access {checkPath}.{" "}
            <button onClick={() => router.replace(landing)} className="underline text-primary">
              Go to dashboard
            </button>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
}

export function SectionOfflineBanner({ isOffline, error, isLoading }: { isOffline: boolean; error: string | null; isLoading: boolean }) {
  if (isLoading) return <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading…</div>;
  if (isOffline) return <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs"><WifiOff className="h-3.5 w-3.5" /> Offline — showing cached data</div>;
  if (error) return <div className="p-2.5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs">{error}</div>;
  return null;
}
