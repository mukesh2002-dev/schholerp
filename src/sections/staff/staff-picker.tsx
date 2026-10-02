"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchStaffList } from "@/lib/api/staff";
import { DEPARTMENTS, STAFF_TYPE_OPTIONS } from "@/lib/staff-employment";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PickerStaff {
  uuid: string;
  employeeId: string;
  firstName?: string | null;
  lastName?: string | null;
  designation?: string | null;
  department?: string | null;
  staffType?: string | null;
  user?: { uuid: string; name: string; email: string } | null;
}

export function staffDisplayName(s: PickerStaff): string {
  const n = [s.firstName, s.lastName].filter(Boolean).join(" ").trim();
  return n || s.user?.name || s.employeeId;
}

interface StaffPickerProps {
  value: string;
  onChange: (uuid: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Show Department + Staff Type filter dropdowns (default true). */
  showFilters?: boolean;
}

/** Searchable staff dropdown with Department + Staff Type filters, shared by all staff-module tabs. */
export function StaffPicker({ value, onChange, placeholder = "Select staff member", disabled, showFilters = true }: StaffPickerProps) {
  const { activeBranchId } = useERP();
  const [staff, setStaff] = useState<PickerStaff[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [staffType, setStaffType] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchStaffList({
          campusId: activeBranchId !== "all" ? activeBranchId : undefined,
          limit: 200,
        });
        if (!cancelled) setStaff((res as any)?.data ?? []);
      } catch {
        if (!cancelled) setStaff([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeBranchId]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff
      .filter((s) => {
        if (department !== "ALL" && String(s.department ?? "").toLowerCase() !== department.toLowerCase()) return false;
        if (staffType !== "ALL" && String(s.staffType ?? "").toUpperCase().replace(/[\s-]+/g, "_") !== staffType) return false;
        if (q && !`${staffDisplayName(s)} ${s.employeeId} ${s.designation ?? ""} ${s.department ?? ""}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .slice(0, 100);
  }, [staff, search, department, staffType]);

  const filtersActive = department !== "ALL" || staffType !== "ALL" || search.trim() !== "";

  const clearFilters = () => {
    setDepartment("ALL");
    setStaffType("ALL");
    setSearch("");
  };

  return (
    <div className="space-y-1.5">
      {showFilters && (
        <div className="grid grid-cols-2 gap-1.5">
          <Select value={department} onValueChange={setDepartment} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={staffType} onValueChange={setStaffType} disabled={disabled}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Staff Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Staff Types</SelectItem>
              {STAFF_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Input
        placeholder="Search staff by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-xs"
        disabled={disabled}
      />
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder={loading ? "Loading staff..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {visible.map((s) => (
            <SelectItem key={s.uuid} value={s.uuid}>
              {staffDisplayName(s)} • {s.designation || s.staffType} ({s.employeeId})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          {loading ? "Loading..." : `${visible.length} of ${staff.length} staff shown`}
        </p>
        {filtersActive && (
          <button type="button" onClick={clearFilters} className="text-[11px] text-primary hover:underline">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
