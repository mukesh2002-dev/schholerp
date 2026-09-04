"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fingerprint, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function AttendanceHeader() {
  const { triggerBiometricSync } = useERP();

  const handleBiometricSync = () => {
    const res = triggerBiometricSync();
    toast.success(res.message);
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Fingerprint className="h-6 w-6 text-primary" />
              Attendance &amp; Biometric Gateway
            </h1>
            <Badge variant="outline" className="text-xs">
              ZK &amp; Facial Gateways Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Student roll-call, faculty check-in punches, support worker shifts, and automated attendance trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleBiometricSync}
            variant="gradient"
            className="gap-2 shrink-0"
          >
            <Fingerprint className="h-4 w-4" />
            <span>Biometric Live Sync</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
