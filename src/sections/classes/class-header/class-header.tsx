"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClassFormDialog } from "@/components/classes/class-form-dialog";

export function ClassHeader() {
  const { activeBranchId } = useERP();
  const classes = mockDb.getClasses(activeBranchId);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Classes &amp; Academic Sections
              </h1>
              <Badge variant="outline" className="text-xs">
                {classes.length} Grade Levels
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Curriculum mapping, section cohorts, classroom assignments, and class teachers across campuses.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Add Academic Class</span>
          </Button>
        </div>
      </div>

      <ClassFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
