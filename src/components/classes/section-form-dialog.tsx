"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSectionApi, updateSectionApi, fetchSections, BackendSection } from "@/lib/api/sections";
import { fetchTeachers } from "@/lib/api/teachers";
import { useERP } from "@/components/providers/erp-provider";
import { ApiError } from "@/lib/api/client";
import { DoorClosed, Search, Check, X, UserCheck, AlertCircle, ChevronsUpDown, User } from "lucide-react";

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required (e.g. A, B, Rose)"),
  roomNumber: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  classTeacherId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className?: string;
  editingSection?: BackendSection | null;
  onSuccess?: () => void;
}

interface TeacherOption {
  id: string;
  name: string;
  department?: string;
  email?: string;
  alreadyAssignedSection?: string;
  isAssignedToOther: boolean;
  isCurrentSectionTeacher: boolean;
}

export function SectionFormDialog({
  open,
  onOpenChange,
  classId,
  className,
  editingSection,
  onSuccess,
}: SectionFormDialogProps) {
  const { activeBranchId } = useERP();
  const isEditing = !!editingSection;
  const [submitting, setSubmitting] = useState(false);
  const [rawTeachers, setRawTeachers] = useState<Array<{ id: string; name: string; department?: string; email?: string }>>([]);
  const [existingSections, setExistingSections] = useState<BackendSection[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Searchable select state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: "",
      roomNumber: "",
      capacity: 40,
      classTeacherId: "NONE",
      status: "ACTIVE",
    },
  });

  const selectedTeacherId = watch("classTeacherId");
  const status = watch("status");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch teachers and existing sections for 1-to-1 class teacher mapping
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingTeachers(true);

    Promise.all([
      fetchTeachers({ campusId: activeBranchId, limit: 200 }),
      fetchSections({ campusId: activeBranchId, limit: 300 }),
    ])
      .then(([tRes, sRes]: [any, any]) => {
        if (cancelled) return;
        if (tRes?.data) {
          const list: any[] = Array.isArray(tRes.data) ? tRes.data : [];
          // Deduplicate by teacher name
          const seen = new Set<string>();
          const unique: Array<{ id: string; name: string; department?: string; email?: string }> = [];
          for (const u of list) {
            const name = (u.fullName || u.name || "").trim();
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase());
              unique.push({
                id: u.id || u.uuid,
                name,
                department: u.department || "Academics",
                email: u.email,
              });
            }
          }
          setRawTeachers(unique);
        }
        if (sRes?.data) {
          setExistingSections(Array.isArray(sRes.data) ? sRes.data : []);
        }
      })
      .catch((err) => {
        console.error("Failed to load teachers or sections:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingTeachers(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, activeBranchId]);

  // Compute teacher options with assignments
  const teacherOptions = useMemo<TeacherOption[]>(() => {
    // Map of teacher name or uuid -> section info
    const assignedMap = new Map<string, { sectionName: string; className: string; sectionUuid: string }>();

    for (const sec of existingSections) {
      if (sec.classTeacher?.name) {
        const secLabel = `${(sec as any).class?.name || (sec as any).className || "Class"} - ${sec.name}`;
        assignedMap.set(sec.classTeacher.name.toLowerCase().trim(), {
          sectionName: sec.name,
          className: (sec as any).class?.name || "",
          sectionUuid: sec.uuid,
        });
        if (sec.classTeacher.uuid) {
          assignedMap.set(sec.classTeacher.uuid, {
            sectionName: sec.name,
            className: (sec as any).class?.name || "",
            sectionUuid: sec.uuid,
          });
        }
      }
    }

    return rawTeachers.map((t) => {
      const assigned = assignedMap.get(t.name.toLowerCase().trim()) || assignedMap.get(t.id);
      const isCurrentSection = isEditing && editingSection && assigned?.sectionUuid === editingSection.uuid;
      const isAssignedToOther = !!assigned && !isCurrentSection;

      return {
        id: t.id,
        name: t.name,
        department: t.department,
        email: t.email,
        alreadyAssignedSection: assigned ? `${assigned.className} ${assigned.sectionName}`.trim() : undefined,
        isAssignedToOther,
        isCurrentSectionTeacher: !!isCurrentSection,
      };
    });
  }, [rawTeachers, existingSections, isEditing, editingSection]);

  // Filtered teachers based on search query
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teacherOptions;
    const q = searchQuery.toLowerCase().trim();
    return teacherOptions.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.department && t.department.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q))
    );
  }, [teacherOptions, searchQuery]);

  // Selected teacher display
  const currentSelectedTeacher = useMemo(() => {
    if (!selectedTeacherId || selectedTeacherId === "NONE") return null;
    return teacherOptions.find(
      (t) => t.id === selectedTeacherId || (editingSection?.classTeacher?.name && t.name.toLowerCase() === editingSection.classTeacher.name.toLowerCase())
    );
  }, [selectedTeacherId, teacherOptions, editingSection]);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectorOpen(false);
      if (editingSection) {
        reset({
          name: editingSection.name.replace(/^Sections+/i, ""),
          roomNumber: editingSection.roomNumber || "",
          capacity: editingSection.capacity || 40,
          classTeacherId: editingSection.classTeacher?.uuid || editingSection.classTeacherId || "NONE",
          status: (editingSection.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
        });
      } else {
        reset({
          name: "",
          roomNumber: "",
          capacity: 40,
          classTeacherId: "NONE",
          status: "ACTIVE",
        });
      }
    }
  }, [open, editingSection, reset]);

  const onSubmit = async (data: SectionFormValues) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        classId,
        name: data.name.trim(),
        roomNumber: data.roomNumber?.trim() || null,
        capacity: Number(data.capacity),
        classTeacherId: data.classTeacherId && data.classTeacherId !== "NONE" ? data.classTeacherId : null,
        status: data.status,
      };

      if (isEditing && editingSection) {
        await updateSectionApi(editingSection.uuid, payload);
        toast.success(`Section "${data.name}" updated successfully`);
      } else {
        await createSectionApi(payload);
        toast.success(`Section "${data.name}" created successfully`);
      }

      onOpenChange(false);
      onSuccess?.();
      window.dispatchEvent(new Event("sections:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to save section";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DoorClosed className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {isEditing ? "Edit Section" : "Add Section"}
              </DialogTitle>
              <DialogDescription>
                {className ? `For ${className} • ` : ""}Configure section name, capacity, and teacher.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">
              Section Name / Identifier <span className="text-rose-500">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. A, B, C or Blue, Red"
              className={errors.name ? "border-rose-500" : ""}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Room Number</label>
              <Input {...register("roomNumber")} placeholder="e.g. Room 104" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">
                Capacity <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                className={errors.capacity ? "border-rose-500" : ""}
              />
              {errors.capacity && <p className="text-[11px] text-rose-500 mt-1">{errors.capacity.message}</p>}
            </div>
          </div>

          {/* Searchable Class Teacher Selector */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-foreground block">
                Class Teacher (Optional)
              </label>
              <span className="text-[11px] text-muted-foreground">
                1 teacher per section rule applied
              </span>
            </div>

            {/* Custom Dropdown Trigger */}
            <div
              onClick={() => setSelectorOpen((prev) => !prev)}
              className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background/50 hover:bg-muted/30 cursor-pointer transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex items-center gap-2 truncate">
                {currentSelectedTeacher ? (
                  <div className="flex items-center gap-2 truncate">
                    <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {currentSelectedTeacher.name}
                    </span>
                    {currentSelectedTeacher.department && (
                      <span className="text-xs text-muted-foreground truncate">
                        ({currentSelectedTeacher.department})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground/60" />
                    No Teacher Assigned
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                {currentSelectedTeacher && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setValue("classTeacherId", "NONE");
                    }}
                    className="p-1 hover:bg-muted rounded-full"
                    title="Clear selection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </div>
            </div>

            {/* Dropdown Menu with Search Input */}
            {selectorOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover/95 backdrop-blur-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden">
                {/* Search Box */}
                <div className="p-2 border-b border-border bg-muted/20">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder="Search teacher by name or department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs bg-background"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-2 p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Teachers List */}
                <div className="max-h-60 overflow-y-auto p-1 text-xs space-y-0.5">
                  {/* None Option */}
                  <div
                    onClick={() => {
                      setValue("classTeacherId", "NONE");
                      setSelectorOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded cursor-pointer transition-colors ${
                      !selectedTeacherId || selectedTeacherId === "NONE"
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>No Teacher Assigned</span>
                    {(!selectedTeacherId || selectedTeacherId === "NONE") && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>

                  {loadingTeachers && (
                    <div className="p-3 text-center text-muted-foreground text-xs">
                      Loading teachers...
                    </div>
                  )}

                  {!loadingTeachers && filteredTeachers.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground text-xs">
                      No matching teachers found
                    </div>
                  )}

                  {filteredTeachers.map((t) => {
                    const isSelected = selectedTeacherId === t.id;
                    const isDisabled = t.isAssignedToOther;

                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (isDisabled) {
                            toast.error(`${t.name} is already assigned as Class Teacher for ${t.alreadyAssignedSection}. A teacher can only lead one section.`);
                            return;
                          }
                          setValue("classTeacherId", t.id);
                          setSelectorOpen(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 rounded transition-colors ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed bg-muted/10 hover:bg-destructive/5"
                            : isSelected
                            ? "bg-primary/10 text-primary font-medium cursor-pointer"
                            : "hover:bg-muted text-foreground cursor-pointer"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 truncate mr-2">
                          <span className="font-medium text-foreground truncate">{t.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {t.department || "Teaching Staff"}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {t.isAssignedToOther ? (
                            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 gap-1 bg-amber-500/10">
                              <AlertCircle className="h-3 w-3" />
                              <span>Assigned: {t.alreadyAssignedSection}</span>
                            </Badge>
                          ) : t.isCurrentSectionTeacher ? (
                            <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                              Current
                            </Badge>
                          ) : isSelected ? (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Status</label>
            <Select value={status} onValueChange={(val: "ACTIVE" | "INACTIVE") => setValue("status", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} variant="gradient">
              {submitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Section" : "Create Section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
