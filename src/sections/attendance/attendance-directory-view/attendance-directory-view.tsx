"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { AttendanceCategory, AttendanceStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { CalendarCheck, Users, Search, CheckCircle2, TrendingUp } from "lucide-react";

const statusVariant = (s: AttendanceStatus) => {
  switch (s) {
    case "PRESENT":
      return "success";
    case "LATE":
      return "warning";
    case "ABSENT":
      return "destructive";
    case "LEAVE":
      return "info";
    default:
      return "outline";
  }
};

export function AttendanceDirectoryView() {
  const { activeBranchId } = useERP();
  const [category, setCategory] = useState<AttendanceCategory>("STUDENT");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const allRecords = useMemo(
    () => mockDb.getAttendanceRecords(activeBranchId, category),
    [activeBranchId, category]
  );
  const availableDates = useMemo(
    () => Array.from(new Set(allRecords.map((r) => r.date))).sort().reverse(),
    [allRecords]
  );
  const effectiveDate = availableDates.includes(date) ? date : availableDates[0] || date;
  const recordsForDate = useMemo(
    () => allRecords.filter((r) => r.date === effectiveDate),
    [allRecords, effectiveDate]
  );

  const filtered = useMemo(() => {
    return recordsForDate.filter((r) => {
      const matchSearch = r.personName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [recordsForDate, search, statusFilter]);

  const summaries = useMemo(
    () =>
      mockDb
        .getAttendanceDaySummaries(activeBranchId)
        .filter((s) => s.category === category)
        .slice(0, 10),
    [activeBranchId, category]
  );

  const report = useMemo(
    () => mockDb.getAttendanceReportEntries(activeBranchId, category),
    [activeBranchId, category]
  );

  const handleMarkAllPresent = () => {
    toast.success(
      `Marked ${filtered.length} ${category.toLowerCase()}s as PRESENT for ${effectiveDate}`
    );
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Pills & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex items-center gap-2">
          {(["STUDENT", "TEACHER", "STAFF", "WORKER"] as AttendanceCategory[]).map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="text-xs h-8 capitalize"
            >
              {cat.toLowerCase()}s
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkAllPresent}
          className="gap-1.5 text-xs h-8 text-emerald-600 hover:bg-emerald-500/10"
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Mark All Present
        </Button>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily" className="gap-1.5 text-xs">
            <CalendarCheck className="h-3.5 w-3.5" /> Daily Punch Ledger
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" /> Day Trajectory
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Individual Compliance
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Daily */}
        <TabsContent value="daily" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${category.toLowerCase()} name...`}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Input
              type="date"
              value={effectiveDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px] h-9 text-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LEAVE">Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category / Role</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Check-Out</TableHead>
                  <TableHead>Marked By</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-sm">{r.personName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.category}</TableCell>
                    <TableCell className="text-xs font-mono font-medium">
                      {r.checkIn || "—"}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {r.checkOut || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.markedBy || "Biometric"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status) as any} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Summaries */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {summaries.map((s, idx) => (
              <Card key={`${s.date}-${idx}`} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm block">{formatDate(s.date)}</span>
                      <span className="text-[11px] text-muted-foreground">{s.category}</span>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold text-primary">
                      {s.rate}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-xs pt-2 border-t">
                    <div>
                      <span className="block font-bold text-emerald-600">{s.present}</span>
                      <span className="text-[10px] text-muted-foreground">Pres</span>
                    </div>
                    <div>
                      <span className="block font-bold text-amber-600">{s.late}</span>
                      <span className="text-[10px] text-muted-foreground">Late</span>
                    </div>
                    <div>
                      <span className="block font-bold text-rose-600">{s.absent}</span>
                      <span className="text-[10px] text-muted-foreground">Abs</span>
                    </div>
                    <div>
                      <span className="block font-bold text-blue-600">{s.leave}</span>
                      <span className="text-[10px] text-muted-foreground">Leave</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Report */}
        <TabsContent value="report" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person Name</TableHead>
                  <TableHead>Total Days</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((e) => (
                  <TableRow key={e.personId} className="hover:bg-muted/40">
                    <TableCell className="font-semibold text-sm">{e.personName}</TableCell>
                    <TableCell className="text-xs font-mono">{e.totalDays}</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-emerald-600">
                      {e.present}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-amber-600">{e.late}</TableCell>
                    <TableCell className="text-xs font-mono text-rose-600">{e.absent}</TableCell>
                    <TableCell>
                      <Badge
                        variant={e.rate >= 90 ? "success" : e.rate >= 75 ? "warning" : "destructive"}
                        className="text-[10px]"
                      >
                        {e.rate}%
                      </Badge>
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
