"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeacherFormDialog } from "@/components/teachers/teacher-form-dialog";

export function TeacherHeader() {
  const { activeBranchId } = useERP();
  const teachers = mockDb.getTeachers(activeBranchId);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Faculty &amp; Teacher Management
              </h1>
              <Badge variant="outline" className="text-xs">
                {teachers.length} Active Instructors
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Faculty credentials, department allocations, teaching assignments, and attendance records.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Add Faculty Member</span>
          </Button>
        </div>
      </div>

      <TeacherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacherToEdit={null}
      />
    </>
  );
}
