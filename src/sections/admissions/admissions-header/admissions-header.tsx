"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { fetchAdmissions, bulkImportAdmissionsApi } from "@/lib/api/admissions";
import { ExcelCsvImportDialog } from "@/components/common/excel-csv-import-dialog";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, FileSpreadsheet } from "lucide-react";
import { AdmissionFormDialog } from "@/components/admissions/admission-form-dialog";

const admTemplateCsv = `First Name,Last Name,Grade Applied,Academic Year,Gender,DOB,Parent Name,Parent Phone,Parent Email,City,State,Address,Previous School,Last Class Passed,Percentage / Grade
Rohan,Mishra,Class 11,2026-2027,Male,2010-04-12,Kailash Mishra,9876543230,kailash@example.com,Madhubani,Bihar,Cinema Hall Road Ward 5,St. Xavier High School,Class 10,88.5%
Sneha,Pandey,Class 6,2026-2027,Female,2015-09-18,Rajeev Pandey,9876543231,rajeev@example.com,Patna,Bihar,Boring Road Anandpuri,Delhi Public School,Class 5,92%`;

export function AdmissionsHeader() {
  const { activeBranchId } = useERP();
  const { data: admissions, refresh: refreshAdmissions } = useCampusData({
    fetcher: (cid) => fetchAdmissions({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "admissions",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

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
              School (Class 1–12) + College (B.Tech/BCA/B.Com/MBA — CET/JEE/CUET/CAT, quota, hostel) unified pipeline — CAP round, merit &amp; management quota.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setImportOpen(true)}
              variant="outline"
              className="gap-2 border-emerald-500/40 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              <span>Import Excel/CSV</span>
            </Button>
            <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span>New Application</span>
            </Button>
          </div>
        </div>
      </div>

      <AdmissionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => void refreshAdmissions()}
      />

      <ExcelCsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Admission Applications via Excel / CSV"
        description="Upload inquiries &amp; admissions applications in bulk. All applications are enrolled into the pipeline with automatic application numbers."
        templateFileName="admissions_import_template.csv"
        templateCsvContent={admTemplateCsv}
        previewColumns={[
          { key: "First Name", label: "First Name" },
          { key: "Last Name", label: "Last Name" },
          { key: "Grade Applied", label: "Grade" },
          { key: "Parent Name", label: "Parent" },
          { key: "Parent Phone", label: "Mobile" },
          { key: "City", label: "City" },
        ]}
        onImport={async (rows) => {
          return await bulkImportAdmissionsApi(rows, activeBranchId);
        }}
        onSuccess={() => void refreshAdmissions()}
      />
    </>
  );
}
