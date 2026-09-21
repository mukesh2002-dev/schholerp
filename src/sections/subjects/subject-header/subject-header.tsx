"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Subject, ClassRoom } from "@/types";
import { fetchSubjects, fetchClasses } from "@/lib/api/classes";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { canMutateAcademics } from "@/lib/auth/roles";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";

export function SubjectHeader() {
  const { activeBranchId, session } = useERP();
  const canEdit = canMutateAcademics(session.role);
  const { data: subjects } = useCampusData({
    fetcher: (cid) => fetchSubjects({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as (Subject & { classId: string; className: string; branchId: string; branchName: string })[],
    queryKeyPrefix: "subjects",
  });
  const { data: classes } = useCampusData({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as ClassRoom[],
    queryKeyPrefix: "classes",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Layers className="h-5 w-5" />
                </span>
                Subjects & Topics
              </h1>
              <Badge variant="outline" className="text-xs">
                {subjects.length} Subjects • {classes.length} Classes
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Class-wise subject catalogue with chapter-wise topics — editable, add / delete. Linked to Classes & Sections.
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span>Add Subject</span>
            </Button>
          )}
        </div>
      </div>
      <SubjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={() => window.dispatchEvent(new Event("subjects:refresh"))} />
    </>
  );
}