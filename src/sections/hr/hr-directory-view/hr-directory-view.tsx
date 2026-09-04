"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Calendar, Search, CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export function HrDirectoryView() {
  const { activeBranchId } = useERP();
  const [staff] = useState(() => [
    ...mockDb.getStaffMembers(activeBranchId),
    ...mockDb.getTeachers(activeBranchId).map((t) => ({
      id: t.id,
      employeeId: t.employeeId,
      name: t.fullName,
      email: t.email,
      phone: t.phone,
      avatar: t.avatar,
      gender: t.gender,
      dateOfBirth: t.dateOfBirth,
      joiningDate: t.joiningDate,
      branchId: t.branchId,
      branchName: t.branchName,
      department: t.department,
      designation: t.designation,
      staffType: "TEACHING" as const,
      status:
        t.status === "ACTIVE"
          ? ("ACTIVE" as const)
          : t.status === "ON_LEAVE"
          ? ("ON_LEAVE" as const)
          : ("ACTIVE" as const),
      qualification: t.qualification,
      experienceYears: t.experienceYears,
      salaryStructureId: undefined,
      salaryStructureName: undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  ]);
  const [leaves, setLeaves] = useState(() => mockDb.getLeaveRecords(activeBranchId));
  const [payrolls] = useState(() => mockDb.getPayrollRecords(activeBranchId));
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("ALL");

  const filteredStaff = useMemo(
    () =>
      staff.filter((s) => {
        const matchSearch =
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.employeeId.toLowerCase().includes(search.toLowerCase()) ||
          s.department.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "ALL" || s.staffType === typeFilter;
        return matchSearch && matchType;
      }),
    [staff, search, typeFilter]
  );

  const filteredLeaves = useMemo(
    () =>
      leaves.filter((l) => {
        const matchSearch = l.staffName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = leaveStatusFilter === "ALL" || l.status === leaveStatusFilter;
        return matchSearch && matchStatus;
      }),
    [leaves, search, leaveStatusFilter]
  );

  const handleLeaveAction = (id: string, status: "APPROVED" | "REJECTED") => {
    mockDb.updateLeaveStatus(id, status, "HR Manager");
    setLeaves([...mockDb.getLeaveRecords(activeBranchId)]);
    toast.success(`Leave request ${status.toLowerCase()}`);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> All Staff ({staff.length})
          </TabsTrigger>
          <TabsTrigger value="leaves" className="gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" /> Leave Requests ({leaves.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Staff Directory */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm flex items-center gap-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, emp ID, department..."
                className="pl-9 h-9 text-xs flex-1"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[170px] h-9 text-xs">
                <SelectValue placeholder="Staff Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Staff Types</SelectItem>
                <SelectItem value="TEACHING">Teaching Faculty</SelectItem>
                <SelectItem value="ADMINISTRATIVE">Administrative</SelectItem>
                <SelectItem value="SUPPORT">Support Staff</SelectItem>
                <SelectItem value="WORKER">Campus Worker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Emp ID</TableHead>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Department &amp; Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Campus</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs">{s.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            s.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                          }
                          alt={s.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                        />
                        <div>
                          <span className="font-semibold text-sm text-foreground block">{s.name}</span>
                          <span className="text-[11px] text-muted-foreground block">{s.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-foreground block">{s.department}</span>
                      <span className="text-[11px] text-muted-foreground block">{s.designation}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {s.staffType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.branchName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(s.joiningDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "ACTIVE"
                            ? "success"
                            : s.status === "ON_LEAVE"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Leaves */}
        <TabsContent value="leaves" className="space-y-4">
          <div className="flex gap-2 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff name..."
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Leaves</SelectItem>
                <SelectItem value="PENDING">Pending Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right tabular-nums">Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/40">
                    <TableCell>
                      <span className="font-semibold text-sm">{l.staffName}</span>
                      <span className="block text-[11px] text-muted-foreground">{l.branchName}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {l.leaveType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(l.fromDate)} - {formatDate(l.toDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono font-bold">{l.totalDays} days</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {l.reason}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.status === "APPROVED"
                            ? "success"
                            : l.status === "PENDING"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px]"
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => handleLeaveAction(l.id, "APPROVED")}
                          >
                            <CheckCircle2 className="h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] gap-1 text-rose-600 hover:bg-rose-500/10"
                            onClick={() => handleLeaveAction(l.id, "REJECTED")}
                          >
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {l.approvedBy ? `by ${l.approvedBy}` : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
