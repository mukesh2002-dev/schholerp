"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AdmissionFormDialog } from "@/components/admissions/admission-form-dialog";

export function AdmissionsHeader() {
  const { activeBranchId } = useERP();
  const admissions = mockDb.getAdmissions(activeBranchId);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Admissions &amp; Enrollment Pipeline
              </h1>
              <Badge variant="outline" className="text-xs">
                {admissions.length} Applications
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Review applicant dossiers, entrance exams, interview schedules, and document checklists.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
            <UserPlus className="h-4 w-4" />
            <span>New Application</span>
          </Button>
        </div>
      </div>

      <AdmissionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
