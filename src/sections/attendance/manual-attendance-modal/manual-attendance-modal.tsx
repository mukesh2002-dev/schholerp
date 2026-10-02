"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  markStudentAttendanceApi,
  markSingleStaffAttendanceApi,
  staffDirectoryCategory,
} from "@/lib/api/attendance";
import { fetchClasses } from "@/lib/api/classes";
import { fetchSections } from "@/lib/api/sections";
import { fetchStudents } from "@/lib/api/students";
import { fetchStaffList } from "@/lib/api/staff";
import type { AttendanceCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, UserCheck } from "lucide-react";

type PersonCategory = AttendanceCategory;

interface ManualAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: PersonCategory;
  onSaved?: () => void;
}

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "LEAVE", label: "Leave" },
] as const;

const labelCls = "text-xs font-medium text-muted-foreground";

const todayISO = () => new Date().toISOString().split("T")[0];

function staffUserId(s: any): string {
  return s?.user?.uuid ?? s?.user?.id ?? "";
}

function staffDisplayName(s: any): string {
  const n = [s?.firstName, s?.lastName].filter(Boolean).join(" ").trim();
  return n || s?.user?.name || s?.employeeId || "Staff";
}

export function ManualAttendanceModal({
  open,
  onOpenChange,
  defaultCategory = "STUDENT",
  onSaved,
}: ManualAttendanceModalProps) {
  const { activeBranchId } = useERP();
  const campusId = activeBranchId !== "all" ? activeBranchId : undefined;

  const [category, setCategory] = useState<PersonCategory>(defaultCategory);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState<string>("PRESENT");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  // Student path
  const [classes, setClasses] = useState<any[]>([]);
  const [classId, setClassId] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [section, setSection] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingPeople, setLoadingPeople] = useState(false);

  // Staff/Teacher path
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffUserIdSel, setStaffUserIdSel] = useState("");
  const [personSearch, setPersonSearch] = useState("");

  useEffect(() => {
    if (open) {
      setCategory(defaultCategory);
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("PRESENT");
      setRemarks("");
      setClassId("");
      setSection("");
      setStudentId("");
      setStaffUserIdSel("");
      setPersonSearch("");
    }
  }, [open, defaultCategory]);

  // Load classes when modal opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoadingClasses(true);
      try {
        const list = await fetchClasses({ campusId, limit: 100 });
        if (!cancelled) setClasses(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setClasses([]);
      } finally {
        if (!cancelled) setLoadingClasses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeBranchId]);

  // Load sections when class changes (student path)
  useEffect(() => {
    if (!open || category !== "STUDENT" || !classId) {
      setSections([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchSections({ classId, campusId });
        const list = Array.isArray((res as any)?.data) ? (res as any).data : [];
        if (cancelled) return;
        if (list.length > 0) {
          setSections(list);
        } else {
          // Fallback: derive sections from student's className if API has none
          setSections([{ uuid: "A", name: "A" }, { uuid: "B", name: "B" }, { uuid: "C", name: "C" }, { uuid: "D", name: "D" }]);
        }
      } catch {
        if (!cancelled) setSections([{ uuid: "A", name: "A" }, { uuid: "B", name: "B" }]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category, classId]);

  // Load students for selected class (then filter by section client-side)
  useEffect(() => {
    if (!open || category !== "STUDENT" || !classId) {
      setStudents([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingPeople(true);
      try {
        const res = await fetchStudents({ campusId, limit: 200 });
        if (!cancelled) {
          const all = (res as any)?.data ?? [];
          setStudents(all.filter((s: any) => !s.classId || s.classId === "all" || s.classId === classId));
        }
      } catch {
        if (!cancelled) setStudents([]);
      } finally {
        if (!cancelled) setLoadingPeople(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category, classId]);

  // Load staff list for teacher/staff path
  useEffect(() => {
    if (!open || category === "STUDENT") return;
    let cancelled = false;
    (async () => {
      setLoadingPeople(true);
      try {
        const res = await fetchStaffList({ campusId, limit: 100 });
        if (!cancelled) setStaffList((res as any)?.data ?? []);
      } catch {
        if (!cancelled) setStaffList([]);
      } finally {
        if (!cancelled) setLoadingPeople(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category, activeBranchId]);

  const visibleStudents = useMemo(() => {
    let list = students;
    if (section) {
      list = list.filter((s: any) => {
        const sec = String(s.sectionName ?? s.sectionId ?? "").trim().toLowerCase();
        return !sec || sec === String(section).trim().toLowerCase();
      });
    }
    if (personSearch.trim()) {
      const q = personSearch.trim().toLowerCase();
      list = list.filter((s: any) =>
        `${s.fullName} ${s.rollNumber} ${s.admissionNumber}`.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 100);
  }, [students, section, personSearch]);

  const visibleStaff = useMemo(() => {
    // Strict category match (TEACHING -> Teachers, everything else -> Staff).
    // Falls back to the full list only when nothing matches.
    const matched = staffList.filter(
      (s: any) => staffDirectoryCategory({ staffType: s.staffType }) === category
    );
    let list = matched.length > 0 ? matched : staffList;
    if (personSearch.trim()) {
      const q = personSearch.trim().toLowerCase();
      list = list.filter((s: any) =>
        `${staffDisplayName(s)} ${s.employeeId ?? ""} ${s.designation ?? ""}`.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 100);
  }, [staffList, category, personSearch]);

  const canSubmit =
    category === "STUDENT"
      ? Boolean(classId && studentId && date && status)
      : Boolean(staffUserIdSel && date && status);

  const handleSubmit = async () => {
    if (!navigator.onLine) {
      toast.error("Offline — internet check karo");
      return;
    }
    if (!canSubmit) {
      toast.error("Class, Section aur naam select karo");
      return;
    }
    if (date > todayISO()) {
      toast.error("Future dates not allowed — today or past only");
      return;
    }
    setSaving(true);
    try {
      if (category === "STUDENT") {
        const apiStatus = status === "LEAVE" ? "excused" : status.toLowerCase();
        await markStudentAttendanceApi({
          campusId,
          classId,
          date,
          records: [{ studentId, status: apiStatus, remarks: remarks || null }],
        });
      } else {
        await markSingleStaffAttendanceApi({
          campusId,
          userId: staffUserIdSel,
          date,
          status,
          remarks: remarks || null,
        });
      }
      toast.success(`Attendance marked — ${status}`);
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Manual Attendance</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Kisko mark karna hai? Pehle category chuno, phir naam select karo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          {/* 1. Kisko? */}
          <div>
            <label className={labelCls}>1. Kisko mark karna hai? *</label>
            <Select value={category} onValueChange={(v) => { setCategory(v as PersonCategory); setStudentId(""); setStaffUserIdSel(""); setPersonSearch(""); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student (class-wise)</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Student path: Class → Section → Student */}
          {category === "STUDENT" && (
            <>
              <div>
                <label className={labelCls}>2. Kon si Class? *</label>
                <Select value={classId} onValueChange={(v) => { setClassId(v); setSection(""); setStudentId(""); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={loadingClasses ? "Loading classes..." : "Select class"} /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.uuid ?? c.id} value={c.uuid ?? c.id}>
                        {c.name}{c.section ? ` • Sec ${c.section}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={labelCls}>3. Kon sa Section?</label>
                <Select value={section || "__all"} onValueChange={(v) => { setSection(v === "__all" ? "" : v); setStudentId(""); }} disabled={!classId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={classId ? "Select section" : "Pehle class chuno"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">All sections</SelectItem>
                    {sections.map((s: any) => (
                      <SelectItem key={s.uuid ?? s.name} value={String(s.name)}>
                        Section {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={labelCls}>4. Kon sa Student? *</label>
                <Input
                  placeholder="Naam se khojo..."
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                  className="mt-1 mb-1.5 h-8 text-xs"
                />
                <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
                  <SelectTrigger><SelectValue placeholder={loadingPeople ? "Loading students..." : classId ? "Select student" : "Pehle class chuno"} /></SelectTrigger>
                  <SelectContent>
                    {visibleStudents.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.fullName} • {s.className}{s.sectionName ? `-${s.sectionName}` : ""} • {s.rollNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 2. Staff path: direct person picker */}
          {category !== "STUDENT" && (
            <div>
              <label className={labelCls}>2. Kon {category === "TEACHER" ? "Teacher" : "Staff"}? *</label>
              <Input
                placeholder="Naam se khojo..."
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                className="mt-1 mb-1.5 h-8 text-xs"
              />
              <Select value={staffUserIdSel} onValueChange={setStaffUserIdSel}>
                <SelectTrigger><SelectValue placeholder={loadingPeople ? "Loading..." : "Select person"} /></SelectTrigger>
                <SelectContent>
                  {visibleStaff
                    .filter((s: any) => staffUserId(s))
                    .map((s: any) => (
                      <SelectItem key={s.uuid ?? staffUserId(s)} value={staffUserId(s)}>
                        {staffDisplayName(s)} • {s.designation || s.staffType} ({s.employeeId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {visibleStaff.some((s: any) => !staffUserId(s)) && (
                <p className="text-[11px] text-muted-foreground mt-1">Note: bina login account wale staff list me nahi dikhenge.</p>
              )}
            </div>
          )}

          {/* Date + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date *</label>
              <Input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && v > todayISO()) {
                    toast.error("Future dates not allowed — reset to today");
                    setDate(todayISO());
                  } else {
                    setDate(v);
                  }
                }}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className={labelCls}>Status *</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Remarks (optional)</label>
            <Input
              placeholder="Koi note..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="pt-3 border-t gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={saving || !canSubmit} onClick={handleSubmit} className="gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving..." : "Mark Attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const OPEN_MANUAL_ATTENDANCE_EVENT = "open-manual-attendance";
