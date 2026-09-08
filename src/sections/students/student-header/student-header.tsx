"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StudentFormDialog } from "@/components/students/student-form-dialog";

export function StudentHeader() {
  const { activeBranchId } = useERP();
  const students = mockDb.getStudents(activeBranchId);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Student Directory &amp; Roster
              </h1>
              <Badge variant="outline" className="text-xs">
                {students.length} Enrolled
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              School (Nursery–12 + CBSE/ICSE/State) aur College (UG/PG/Diploma — B.Tech, BCA, B.Com, MBA) dono ke liye unified — PRN, semester, hostel & scholarship tracks.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Register Student</span>
          </Button>
        </div>
      </div>

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentToEdit={null}
      />
    </>
  );
}
