"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { ClassRoom } from "@/types";
import { fetchClasses } from "@/lib/api/classes";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { canMutateAcademics } from "@/lib/auth/roles";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { ClassFormDialog } from "@/components/classes/class-form-dialog";
import { SubjectFormDialog } from "@/components/subjects/subject-form-dialog";

export function AcademicHeader() {
  const { activeBranchId, session } = useERP();
  const canEdit = canMutateAcademics(session.role);
  const { data: classes, refresh: refreshClasses } = useCampusData<ClassRoom[]>({
    fetcher: (cid) => fetchClasses({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "classes",
  });
  const [classOpen, setClassOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  useEffect(() => {
    const handleClassesRefresh = () => refreshClasses();
    window.addEventListener("classes:refresh", handleClassesRefresh);
    return () => window.removeEventListener("classes:refresh", handleClassesRefresh);
  }, [refreshClasses]);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Academic Structure
              </h1>
              <Badge variant="outline" className="text-xs">
                {classes.length} Classes
              </Badge>
              <Badge variant="secondary" className="text-xs gap-1">
                <BookOpen className="h-3 w-3" /> Class → Section → Subject → Chapter → Topic
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Hierarchical curriculum management — Class → Section → Subject → Chapter → Topic with reusable subject masters.
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <Button onClick={() => setSubjectOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Subject</span>
              </Button>
              <Button onClick={() => setClassOpen(true)} variant="gradient" className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Class</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <ClassFormDialog
        open={classOpen}
        onOpenChange={setClassOpen}
        onSuccess={() => {
          refreshClasses();
          window.dispatchEvent(new Event("classes:refresh"));
        }}
      />
      <SubjectFormDialog
        open={subjectOpen}
        onOpenChange={setSubjectOpen}
        onSuccess={() => {
          window.dispatchEvent(new Event("subjects:refresh"));
          window.dispatchEvent(new Event("classes:refresh"));
        }}
      />
    </>
  );
}
