"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { fetchStudents, bulkImportStudentsApi } from "@/lib/api/students";
import { ExcelCsvImportDialog } from "@/components/common/excel-csv-import-dialog";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet } from "lucide-react";
import { StudentFormDialog } from "@/components/students/student-form-dialog";

const studentTemplateCsv = `First Name,Last Name,Class,Section,Roll No,Gender,DOB,Guardian Name,Guardian Phone,Guardian Email,Address,City,State,Pincode,Blood Group,Category,Religion
Aarav,Sharma,10,A,101,Male,2010-05-15,Ramesh Sharma,9876543220,ramesh@example.com,Sector 4 Main Road,Madhubani,Bihar,847211,O+,General,Hindu
Ananya,Verma,9,B,102,Female,2011-08-20,Sanjay Verma,9876543221,sanjay@example.com,Ward 12 Station Road,Patna,Bihar,800001,B+,OBC,Hindu`;

export function StudentHeader() {
  const { activeBranchId } = useERP();
  const { data: students, refresh: refreshStudents } = useCampusData({
    fetcher: async (cid) => {
      const res = await fetchStudents({ campusId: cid, limit: 100 });
      return res.data;
    },
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "students",
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
                Student Directory &amp; Roster
              </h1>
              <Badge variant="outline" className="text-xs">
                {students.length} Enrolled
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              School (Nursery–12 + CBSE/ICSE/State) aur College (UG/PG/Diploma — B.Tech, BCA, B.Com, MBA) dono ke liye unified — PRN, semester, hostel &amp; scholarship tracks.
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
              <Plus className="h-4 w-4" />
              <span>Register Student</span>
            </Button>
          </div>
        </div>
      </div>

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentToEdit={null}
        onSuccess={() => void refreshStudents()}
      />

      <ExcelCsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Students via Excel / CSV"
        description="Upload a batch of students with roll numbers, classes, guardians, and demographic details."
        templateFileName="students_import_template.csv"
        templateCsvContent={studentTemplateCsv}
        previewColumns={[
          { key: "First Name", label: "First Name" },
          { key: "Last Name", label: "Last Name" },
          { key: "Class", label: "Class" },
          { key: "Section", label: "Section" },
          { key: "Roll No", label: "Roll" },
          { key: "Guardian Phone", label: "Parent Mobile" },
        ]}
        onImport={async (rows) => {
          return await bulkImportStudentsApi(rows, activeBranchId);
        }}
        onSuccess={() => void refreshStudents()}
      />
    </>
  );
}
