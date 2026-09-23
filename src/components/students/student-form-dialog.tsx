"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchApprovedDropdown, approveAdmissionApi, type ApprovedDropdownItem } from "@/lib/api/admissions";
import { fetchClasses } from "@/lib/api/classes";
import { updateStudentApi } from "@/lib/api/students";
import { ClassRoom, Student } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Building2 } from "lucide-react";
import { toast } from "sonner";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentToEdit?: Student | null;
  onSuccess?: () => void;
}

// Smart enrollment: admission holds all personal data, HR only assigns
// campus/class/section (+ leftover roll no). Approve API creates the student
// and links enrolledStudentId so the admission never repeats in the dropdown.
const createSchema = z.object({
  admissionId: z.string().min(1, "Select an approved admission"),
  branchId: z.string().min(1, "Select campus"),
  classId: z.string().min(1, "Select class"),
  sectionId: z.string().min(1, "Select section"),
  rollNo: z.string().max(30).optional(),
});

const editSchema = z.object({
  branchId: z.string().min(1, "Select campus"),
  classId: z.string().min(1, "Select class"),
  sectionId: z.string().min(1, "Select section"),
  status: z.string().min(1),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

export function StudentFormDialog({
  open,
  onOpenChange,
  studentToEdit,
  onSuccess,
}: StudentFormDialogProps) {
  const { branches, activeBranchId } = useERP();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [admissions, setAdmissions] = useState<ApprovedDropdownItem[]>([]);
  const isEdit = !!studentToEdit;

  useEffect(() => {
    if (!open) return;
    // Use active branch for initial load; will be re-fetched when createBranchId changes to admission's campus
    void fetchClasses({ campusId: activeBranchId !== "all" ? activeBranchId : undefined }).then(setClasses);
    if (!isEdit) {
      // Server-side: APPROVED + not yet enrolled only — already-students never repeat.
      void fetchApprovedDropdown({ campusId: activeBranchId !== "all" ? activeBranchId : undefined })
        .then(setAdmissions)
        .catch(() => setAdmissions([]));
    }
  }, [open, activeBranchId, isEdit]);

  // This effect was incorrectly placed before watch declarations - moved below [see next effect]
  // (kept as comment for reference)

  // Approved dropdown is already filtered server-side; keep client guard too.
  const enrollableAdmissions = useMemo(() => {
    if (isEdit) return [];
    return admissions;
  }, [admissions, isEdit]);

  const {
    register: _regC,
    handleSubmit: handleCreateSubmit,
    setValue: setCreateValue,
    watch: watchCreate,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreateSubmitting },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      admissionId: "",
      branchId: activeBranchId !== "all" ? activeBranchId : branches[0]?.id || "",
      classId: classes[0]?.id || "",
      sectionId: classes[0]?.sections[0]?.id || "",
      rollNo: "",
    },
  });

  const {
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    watch: watchEdit,
    reset: resetEdit,
    formState: { isSubmitting: isEditSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      branchId: studentToEdit?.branchId || activeBranchId !== "all" ? activeBranchId : branches[0]?.id || "",
      classId: studentToEdit?.classId || classes[0]?.id || "",
      sectionId: studentToEdit?.sectionId || classes[0]?.sections[0]?.id || "",
      status: studentToEdit?.status || "ACTIVE",
    },
  });

  const createBranchId = watchCreate("branchId");
  const createClassId = watchCreate("classId");
  const createSectionId = watchCreate("sectionId");
  const createAdmissionId = watchCreate("admissionId");

  const editBranchId = watchEdit("branchId");
  const editClassId = watchEdit("classId");
  const editSectionId = watchEdit("sectionId");
  const editStatus = watchEdit("status");

  const selectedCreateClass = classes.find((c) => c.id === createClassId) || classes[0];
  const selectedEditClass = classes.find((c) => c.id === editClassId) || classes[0];
  const selectedAdmission = enrollableAdmissions.find((a) => a.uuid === createAdmissionId);

  useEffect(() => {
    if (!open) return;
    if (isEdit && studentToEdit) {
      resetEdit({
        branchId: studentToEdit.branchId,
        classId: studentToEdit.classId,
        sectionId: studentToEdit.sectionId,
        status: studentToEdit.status,
      });
    } else {
      // Reset create: keep first approved admission selected by default for speed
      // FIX: match class to selected admission's gradeApplied instead of always classes[0]
      const firstAdmission = enrollableAdmissions[0];
      const grade = String(firstAdmission?.gradeApplied || "").trim();
      const exact = classes.find((c) => c.name === grade);
      const fuzzy = classes.find((c) => c.name.toLowerCase().includes(grade.toLowerCase()) || grade.toLowerCase().includes(c.name.toLowerCase()));
      const preferred = exact || fuzzy || classes[0];
      resetCreate({
        admissionId: firstAdmission?.uuid || "",
        branchId: firstAdmission?.campus?.uuid || (activeBranchId !== "all" ? activeBranchId : branches[0]?.id || ""),
        classId: preferred?.id || "",
        sectionId: preferred?.sections[0]?.id || "",
        rollNo: "",
      });
    }
  }, [open, isEdit, studentToEdit, enrollableAdmissions, classes, branches, activeBranchId, resetCreate, resetEdit]);

  // FIX: when admission's campus changes, refetch classes for that campus (dropdown bug)
  useEffect(() => {
    if (isEdit || !open) return;
    if (createBranchId && createBranchId !== activeBranchId) {
      void fetchClasses({ campusId: createBranchId }).then((filtered) => {
        if (filtered.length > 0) setClasses(filtered);
      });
    }
  }, [createBranchId, activeBranchId, open, isEdit]);

  // When admission changes, auto-fill campus to its branch
  useEffect(() => {
    if (!isEdit && selectedAdmission?.campus) {
      setCreateValue("branchId", selectedAdmission.campus.uuid);
    }
  }, [selectedAdmission, isEdit, setCreateValue]);

  const handleCreateClassChange = (classId: string) => {
    setCreateValue("classId", classId, { shouldValidate: true });
    const nextClass = classes.find((c) => c.id === classId);
    setCreateValue("sectionId", nextClass?.sections[0]?.id || "", { shouldValidate: true });
  };

  const handleEditClassChange = (classId: string) => {
    setEditValue("classId", classId, { shouldValidate: true });
    const nextClass = classes.find((c) => c.id === classId);
    setEditValue("sectionId", nextClass?.sections[0]?.id || "", { shouldValidate: true });
  };

  const onCreate = async (data: CreateValues) => {
    if (!selectedAdmission) {
      toast.error("Enrollment failed — admission not found");
      return;
    }
    // Section backends expect the section NAME (e.g. "Section A").
    const sectionName = selectedCreateClass?.sections.find((s) => s.id === data.sectionId)?.name ?? data.sectionId;
    try {
      // Single approve → enroll call: creates lean student + enrollment and
      // links enrolledStudentId, so this admission never repeats in the list.
      const result = await approveAdmissionApi(selectedAdmission.uuid, {
        classId: data.classId,
        section: sectionName,
        rollNo: data.rollNo || undefined,
      });
      toast.success("Student enrolled", { description: `${selectedAdmission.firstName} ${selectedAdmission.lastName ?? ""} • ${result.student.admissionNo}` });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed", {
        description: "Only principal / HR / admin can approve admissions.",
      });
    }
  };

  const onEdit = async (data: EditValues) => {
    if (!studentToEdit) return;
    try {
      const updated = await updateStudentApi(studentToEdit.id, {
        classId: data.classId,
        section: data.sectionId,
        status: data.status as string,
      });
      toast.success("Student assignment updated", { description: `${updated.fullName} • ${updated.className} ${updated.sectionName}` });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  const branchOptions = branches;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold">
                {isEdit ? `Reassign: ${studentToEdit?.fullName}` : "Enroll Student from Admission"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit
                  ? "Admissions holds full personal data — here only change campus / class / section / status."
                  : "All personal data is taken from Admissions. Here just pick the admitted student and assign campus / class / section."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!isEdit ? (
          <form onSubmit={handleCreateSubmit(onCreate)} className="space-y-4 mt-2">
            {/* Admission dropdown */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Approved Admission <span className="text-rose-500">*</span>
              </label>
              {enrollableAdmissions.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-900">
                  No enrollable admissions found. Go to <strong>Admissions → Approve</strong> first, then enroll here.
                </div>
              ) : (
                <Select value={createAdmissionId} onValueChange={(v) => setCreateValue("admissionId", v, { shouldValidate: true })}>
                  <SelectTrigger className={createErrors.admissionId ? "border-rose-500" : ""}>
                    <SelectValue placeholder="Select admitted student" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollableAdmissions.map((a) => (
                      <SelectItem key={a.uuid} value={a.uuid}>
                        {a.firstName} {a.lastName ?? ""} • {a.applicationNumber} • {a.gradeApplied} • {a.campus?.name ?? ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {createErrors.admissionId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.admissionId.message}</p>}
              {selectedAdmission && (
                <div className="mt-2 p-2 rounded-lg bg-muted/40 border text-[11px] space-y-0.5">
                  <div className="font-semibold text-foreground">{selectedAdmission.firstName} {selectedAdmission.lastName ?? ""} • {selectedAdmission.gradeApplied} • {selectedAdmission.applicationNumber}</div>
                  <div className="text-muted-foreground">Parent: {selectedAdmission.parentName} • {selectedAdmission.parentPhone}</div>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Campus Branch *</label>
              <Select value={createBranchId} onValueChange={(v) => setCreateValue("branchId", v, { shouldValidate: true })}>
                <SelectTrigger className={createErrors.branchId ? "border-rose-500" : ""}>
                  <SelectValue placeholder="Campus" />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createErrors.branchId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.branchId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Class *</label>
                <Select value={createClassId} onValueChange={handleCreateClassChange}>
                  <SelectTrigger className={createErrors.classId ? "border-rose-500" : ""}>
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.filter((c) => c.category !== "UG" && c.category !== "PG" && c.category !== "Diploma").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createErrors.classId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.classId.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Section *</label>
                <Select value={createSectionId} onValueChange={(v) => setCreateValue("sectionId", v, { shouldValidate: true })}>
                  <SelectTrigger className={createErrors.sectionId ? "border-rose-500" : ""}>
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCreateClass?.sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — {s.classTeacherName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createErrors.sectionId && <p className="text-[11px] text-rose-500 mt-1">{createErrors.sectionId.message}</p>}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 text-[11px] text-blue-900 dark:text-blue-100 flex gap-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span>Full name, DOB, guardian, address, documents all come from <strong>Admissions dossier</strong> — HR only fills class / section / roll no here.</span>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Roll No (HR leftover field, optional)</label>
              <Input {..._regC("rollNo")} placeholder="e.g. 101" className="h-9 text-xs" />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreateSubmitting || enrollableAdmissions.length===0} variant="gradient">
                {isCreateSubmitting ? "Enrolling…" : "Confirm Enrollment"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4 mt-2">
            <div className="p-2 rounded-lg bg-muted/40 border text-xs">
              <div className="font-semibold">{studentToEdit?.fullName} • {studentToEdit?.admissionNumber} • {studentToEdit?.rollNumber}</div>
              <div className="text-muted-foreground text-[11px]">Personal data is mastered in Admissions — edit only assignment here.</div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Campus Branch *</label>
              <Select value={editBranchId} onValueChange={(v) => setEditValue("branchId", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Campus" /></SelectTrigger>
                <SelectContent>
                  {branchOptions.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Class *</label>
                <Select value={editClassId} onValueChange={handleEditClassChange}>
                  <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>
                    {classes.filter((c) => c.category !== "UG" && c.category !== "PG" && c.category !== "Diploma").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Section *</label>
                <Select value={editSectionId} onValueChange={(v) => setEditValue("sectionId", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                  <SelectContent>
                    {selectedEditClass?.sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} — {s.classTeacherName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
              <Select value={editStatus} onValueChange={(v) => setEditValue("status", v)}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="GRADUATED">Graduated</SelectItem>
                  <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isEditSubmitting} variant="gradient">
                {isEditSubmitting ? "Saving…" : "Update Assignment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
