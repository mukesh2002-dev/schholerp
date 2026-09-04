"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";

export function ParentsHeader() {
  const { activeBranchId } = useERP();
  const students = mockDb.getStudents(activeBranchId) || [];

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Parent Portal
            </h1>
            <Badge variant="outline" className="text-xs">
              {students.length} Wards Enrolled
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ward attendance records, fee statements, report cards, and institutional circulars.
          </p>
        </div>
      </div>
    </div>
  );
}
