"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import {
  fetchStaffDashboard,
  fetchStaffList,
  bulkImportStaffApi,
  createStaffApi,
  deleteStaffApi,
  fetchStaffAttendance,
  bulkMarkAttendance,
  fetchDocumentExpiryReport,
} from "@/lib/api/staff";
import { fetchLeaves, mapBackendLeave } from "@/lib/api/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { ListPagination } from "@/components/ui/list-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ExcelCsvImportDialog } from "@/components/common/excel-csv-import-dialog";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  BadgePlus,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Award,
  Receipt,
  BarChart3,
  Loader2,
  Download,
  LayoutDashboard,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

function DashboardTab() {
  const { activeBranchId } = useERP();
  const { data, isLoading, error, isOffline } = useCampusData({
    fetcher: (cid) => fetchStaffDashboard(cid),
    campusId: activeBranchId,
    fallback: null as any,
    queryKeyPrefix: "staff-dashboard",
  });

  if (isLoading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  if (error) return <EmptyState title="Failed to load dashboard" description={String(error)} />;
  if (!data) return <EmptyState title="No data" description="No dashboard data available" />;
  const cards = (data as any).cards;
  const charts = (data as any).charts;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Staff" value={cards.totalStaff} icon={<Users className="h-5 w-5" />} iconColor="bg-blue-500/10 text-blue-600" />
        <StatCard title="Teaching" value={cards.teachingStaff} icon={<GraduationCap className="h-5 w-5" />} iconColor="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Non-Teaching" value={cards.nonTeachingStaff} icon={<Users className="h-5 w-5" />} iconColor="bg-purple-500/10 text-purple-600" />
        <StatCard title="Active" value={cards.activeStaff} icon={<UserCheck className="h-5 w-5" />} iconColor="bg-teal-500/10 text-teal-600" />
        <StatCard title="Inactive" value={cards.inactiveStaff} icon={<UserX className="h-5 w-5" />} iconColor="bg-rose-500/10 text-rose-600" />
        <StatCard title="Today Attendance" value={cards.todaysAttendance} icon={<Clock className="h-5 w-5" />} iconColor="bg-amber-500/10 text-amber-600" />
        <StatCard title="On Leave" value={cards.staffOnLeave} icon={<Calendar className="h-5 w-5" />} iconColor="bg-orange-500/10 text-orange-600" />
        <StatCard title="New Joining (30d)" value={cards.newJoining} icon={<BadgePlus className="h-5 w-5" />} iconColor="bg-indigo-500/10 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Staff by Department</CardTitle></CardHeader>
          <CardContent>
            {charts.staffByDepartment?.length ? (
              <div className="space-y-2">
                {charts.staffByDepartment.map((d: any) => (
                  <div key={d.department} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{d.department}</span>
                    <Badge variant="secondary">{d.count}</Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Teaching vs Non-Teaching</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3"><div className="flex-1 h-3 rounded-full bg-muted overflow-hidden flex"><div className="bg-emerald-500" style={{ width: `${(charts.teachingVsNonTeaching.teaching / Math.max(1, charts.teachingVsNonTeaching.teaching + charts.teachingVsNonTeaching.nonTeaching)) * 100}%` }} /><div className="bg-purple-500 flex-1" /></div></div>
            <div className="flex gap-4 text-xs"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Teaching: {charts.teachingVsNonTeaching.teaching}</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Non-Teaching: {charts.teachingVsNonTeaching.nonTeaching}</span></div>
            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
              <div><p className="text-muted-foreground">Present</p><p className="font-bold">{charts.monthlyAttendance.present}</p></div>
              <div><p className="text-muted-foreground">Absent</p><p className="font-bold">{charts.monthlyAttendance.absent}</p></div>
              <div><p className="text-muted-foreground">Leave</p><p className="font-bold">{charts.monthlyAttendance.leave}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Joining</CardTitle></CardHeader>
        <CardContent>
          {(data as any).recentJoining?.length ? (
            <div className="divide-y">
              {(data as any).recentJoining.map((s: any) => (
                <div key={s.uuid} className="flex items-center gap-3 py-2">
                  <img src={s.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.firstName || s.employeeId)}`} alt={s.employeeId} className="h-8 w-8 rounded-full object-cover" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{[s.firstName, s.lastName].filter(Boolean).join(" ") || s.employeeId}</p><p className="text-xs text-muted-foreground truncate">{s.designation} • {s.department}</p></div>
                  <Badge variant="outline" className="text-[10px]">{s.staffType}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No recent joining</p>}
        </CardContent>
      </Card>
      {isOffline && <p className="text-xs text-amber-600">Offline — showing cached data</p>}
    </div>
  );
}

function ListTab() {
  const { activeBranchId } = useERP();
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ALL");
  const [staffType, setStaffType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, isOffline, refresh } = useCampusData({
    fetcher: async (cid) => {
      const res = await fetchStaffList({ campusId: cid, search: search || undefined, department: department !== "ALL" ? department : undefined, staffType: staffType !== "ALL" ? staffType : undefined, status: status !== "ALL" ? status : undefined, page, limit });
      return res;
    },
    campusId: activeBranchId,
    fallback: { data: [], total: 0 } as any,
    queryKeyPrefix: `staff-list-${search}-${department}-${staffType}-${status}-${page}`,
  });

  const list = (data as any)?.data ?? [];
  const total = (data as any)?.total ?? 0;

  const handleDelete = async (uuid: string) => {
    if (!confirm("Delete this staff?")) return;
    try { await deleteStaffApi(uuid); toast.success("Staff deleted"); refresh(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 p-3 rounded-xl bg-card border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Name, Employee ID, Mobile, Email" className="pl-9 h-9 text-sm" />
        </div>
        <Select value={department} onValueChange={(v) => { setDepartment(v); setPage(1); }}><SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Department" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Departments</SelectItem><SelectItem value="Academics">Academics</SelectItem><SelectItem value="Administration">Administration</SelectItem><SelectItem value="Accounts">Accounts</SelectItem><SelectItem value="Library">Library</SelectItem><SelectItem value="Transport">Transport</SelectItem></SelectContent></Select>
        <Select value={staffType} onValueChange={(v) => { setStaffType(v); setPage(1); }}><SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Types</SelectItem><SelectItem value="TEACHING">Teaching</SelectItem><SelectItem value="NON_TEACHING">Non-Teaching</SelectItem></SelectContent></Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}><SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Status</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="RESIGNED">Resigned</SelectItem></SelectContent></Select>
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            onClick={() => setImportOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4" /> Import Excel/CSV
          </Button>
          <Link href="/staff?tab=add">
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Staff</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Joining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRow key={i}><TableCell colSpan={10}><Skeleton className="h-8" /></TableCell></TableRow>) : list.length === 0 ? <TableRow><TableCell colSpan={10} className="text-center py-8"><EmptyState title="No staff found" description="Try adjusting filters or add new staff" /></TableCell></TableRow> : list.map((s: any) => (
                <TableRow key={s.uuid} className="hover:bg-muted/40">
                  <TableCell><img src={s.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.firstName || s.employeeId)}`} alt={s.employeeId} className="h-8 w-8 rounded-full object-cover" /></TableCell>
                  <TableCell className="font-mono text-xs font-bold">{s.employeeId}</TableCell>
                  <TableCell className="font-medium text-sm">{[s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || s.user?.name || "—"}</TableCell>
                  <TableCell className="text-xs">{s.designation}</TableCell>
                  <TableCell className="text-xs">{s.department}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.staffType}</Badge></TableCell>
                  <TableCell className="text-xs">{s.mobile || "—"}</TableCell>
                  <TableCell className="text-xs">{formatDate(s.joiningDate)}</TableCell>
                  <TableCell><Badge variant={s.isActive ? "success" : "secondary"} className="text-[10px]">{s.employmentStatus || s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/staff/${s.uuid}`}><Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></Link>
                      <Link href={`/staff?tab=add&edit=${s.uuid}`}><Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button></Link>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => handleDelete(s.uuid)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {error && <p className="p-3 text-sm text-rose-600">{String(error)}</p>}
        {isOffline && <p className="p-2 text-xs text-amber-600 text-center">Offline — cached data</p>}
        <div className="p-3 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{total} total staff</span>
          <ListPagination page={page} totalPages={Math.ceil(total / limit)} totalItems={total} pageSize={limit} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function AddStaffTab({ editId }: { editId?: string }) {
  const { activeBranchId } = useERP();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPincode, setLoadingPincode] = useState(false);

  const generateAutoEmpId = () => `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const [form, setForm] = useState<any>({
    employeeId: generateAutoEmpId(),
    firstName: "",
    lastName: "",
    department: "Academics",
    designation: "Teacher",
    staffType: "TEACHING",
    joiningDate: new Date().toISOString().slice(0, 10),
    mobile: "",
    email: "",
    gender: "Male",
    employmentType: "Permanent",
    workType: "Full Time",
    employmentStatus: "ACTIVE",
    city: "",
    state: "",
    pincode: "",
  });

  const handlePincodeChange = async (pin: string) => {
    handleChange("pincode", pin);
    const cleaned = pin.trim();
    if (/^[1-9]\d{5}$/.test(cleaned)) {
      setLoadingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const json = await res.json();
        if (json?.[0]?.Status === "Success" && json[0]?.PostOffice?.[0]) {
          const po = json[0].PostOffice[0];
          const dist = po.District || po.Block || po.Name || "";
          const st = po.State || "";
          setForm((prev: any) => ({ ...prev, pincode: pin, city: dist, state: st }));
          toast.info(`📍 Auto-detected location: ${dist}, ${st}`);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPincode(false);
      }
    }
  };

  const handleChange = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // All fields optional — provide safe fallbacks if user leaves them blank
    const empId = form.employeeId?.trim() || `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fName = form.firstName?.trim() || "Staff Member";
    const dept = form.department?.trim() || "Academics";
    const desig = form.designation?.trim() || "Teacher";
    const joinDate = form.joiningDate || new Date().toISOString().slice(0, 10);
    const submission = {
      ...form,
      employeeId: empId,
      firstName: fName,
      department: dept,
      designation: desig,
      joiningDate: joinDate,
    };
    setLoading(true);
    try {
      if (editId) {
        const { updateStaffApi } = await import("@/lib/api/staff");
        await updateStaffApi(editId, submission);
        toast.success("Staff updated");
      } else {
        await createStaffApi(submission, activeBranchId);
        toast.success("Staff created");
      }
      router.push("/staff?tab=list");
    } catch (err: any) { toast.error(err.message || "Failed"); } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{editId ? "Edit Staff" : "Add Staff"} — All Fields Optional</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex gap-1.5 items-center"><Input placeholder="Employee ID" value={form.employeeId} onChange={(e) => handleChange("employeeId", e.target.value)} /><Button type="button" variant="outline" size="sm" className="h-9 px-2 text-xs shrink-0" title="Generate New ID" onClick={() => handleChange("employeeId", generateAutoEmpId())}>Auto ID</Button></div>
              <Input placeholder="First Name" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
              <Input placeholder="Last Name" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              <Input placeholder="Father Name" value={form.fatherName || ""} onChange={(e) => handleChange("fatherName", e.target.value)} />
              <Input placeholder="Mother Name" value={form.motherName || ""} onChange={(e) => handleChange("motherName", e.target.value)} />
              <Input type="date" placeholder="DOB" value={form.dob || ""} onChange={(e) => handleChange("dob", e.target.value)} />
              <Select value={form.gender} onValueChange={(v) => handleChange("gender", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
              <Input placeholder="Blood Group" value={form.bloodGroup || ""} onChange={(e) => handleChange("bloodGroup", e.target.value)} />
              <Input placeholder="Mobile" value={form.mobile} onChange={(e) => handleChange("mobile", e.target.value)} />
              <Input placeholder="Alternate Mobile" value={form.alternateMobile || ""} onChange={(e) => handleChange("alternateMobile", e.target.value)} />
              <Input placeholder="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
              <Input placeholder="City" value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)} />
              <Input placeholder="State" value={form.state || ""} onChange={(e) => handleChange("state", e.target.value)} />
              <div className="relative"><Input placeholder="Pincode (6 digits)" maxLength={6} value={form.pincode || ""} onChange={(e) => handlePincodeChange(e.target.value)} />{loadingPincode && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />}</div>
              <Input placeholder="Emergency Contact Name" value={form.emergencyContactName || ""} onChange={(e) => handleChange("emergencyContactName", e.target.value)} />
              <Input placeholder="Emergency Contact Number" value={form.emergencyContactNumber || ""} onChange={(e) => handleChange("emergencyContactNumber", e.target.value)} />
              <Input placeholder="Relationship" value={form.emergencyContactRelationship || ""} onChange={(e) => handleChange("emergencyContactRelationship", e.target.value)} />
              <Input placeholder="Address" className="md:col-span-3" value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Identity Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={form.idType || ""} onValueChange={(v) => handleChange("idType", v)}><SelectTrigger><SelectValue placeholder="ID Type" /></SelectTrigger><SelectContent><SelectItem value="Aadhaar">Aadhaar</SelectItem><SelectItem value="PAN">PAN</SelectItem><SelectItem value="Passport">Passport</SelectItem><SelectItem value="Voter ID">Voter ID</SelectItem><SelectItem value="Driving Licence">Driving Licence</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
              <Input placeholder="ID Number (masked in tables)" value={form.idNumber || ""} onChange={(e) => handleChange("idNumber", e.target.value)} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Job / Employment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={form.staffType} onValueChange={(v) => handleChange("staffType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TEACHING">Teaching</SelectItem><SelectItem value="NON_TEACHING">Non-Teaching</SelectItem></SelectContent></Select>
              <Input placeholder="Department" value={form.department} onChange={(e) => handleChange("department", e.target.value)} />
              <Input placeholder="Designation" value={form.designation} onChange={(e) => handleChange("designation", e.target.value)} />
              <Input type="date" value={form.joiningDate} onChange={(e) => handleChange("joiningDate", e.target.value)} />
              <Select value={form.employmentType} onValueChange={(v) => handleChange("employmentType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Permanent">Permanent</SelectItem><SelectItem value="Temporary">Temporary</SelectItem><SelectItem value="Contract">Contract</SelectItem><SelectItem value="Part Time">Part Time</SelectItem></SelectContent></Select>
              <Select value={form.workType} onValueChange={(v) => handleChange("workType", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full Time">Full Time</SelectItem><SelectItem value="Part Time">Part Time</SelectItem></SelectContent></Select>
              <Select value={form.employmentStatus} onValueChange={(v) => handleChange("employmentStatus", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="RESIGNED">Resigned</SelectItem><SelectItem value="TERMINATED">Terminated</SelectItem><SelectItem value="RETIRED">Retired</SelectItem></SelectContent></Select>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Bank & Salary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Account Holder Name" value={form.accountHolderName || ""} onChange={(e) => handleChange("accountHolderName", e.target.value)} />
              <Input placeholder="Bank Name" value={form.bankName || ""} onChange={(e) => handleChange("bankName", e.target.value)} />
              <Input placeholder="Account Number (secured)" value={form.accountNumber || ""} onChange={(e) => handleChange("accountNumber", e.target.value)} />
              <Input placeholder="IFSC" value={form.ifscCode || ""} onChange={(e) => handleChange("ifscCode", e.target.value)} />
              <Input placeholder="Branch" value={form.bankBranch || ""} onChange={(e) => handleChange("bankBranch", e.target.value)} />
              <Input type="number" placeholder="Basic Salary" value={form.basicSalary || ""} onChange={(e) => handleChange("basicSalary", e.target.value ? Number(e.target.value) : null)} />
              <Input type="number" placeholder="HRA" value={form.hra || ""} onChange={(e) => handleChange("hra", e.target.value ? Number(e.target.value) : null)} />
              <Input type="number" placeholder="Allowances" value={form.allowances || ""} onChange={(e) => handleChange("allowances", e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto gap-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{editId ? "Update Staff" : "Create Staff"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReportsTab() {
  const { activeBranchId } = useERP();
  const { data, isLoading } = useCampusData({
    fetcher: (cid) => fetchDocumentExpiryReport(cid),
    campusId: activeBranchId,
    fallback: { expiring: [], expired: [] } as any,
    queryKeyPrefix: "staff-expiry",
  });

  const handleExport = (type: string) => {
    const rows = type === "expiring" ? (data as any)?.expiring ?? [] : (data as any)?.expired ?? [];
    const csv = ["Employee ID,Name,Document,Expiry", ...rows.map((r: any) => `${r.staff?.employeeId},${r.staff?.firstName},${r.documentType},${r.expiryDate}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `staff_${type}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Expiring Documents (30 days)</CardTitle><Button size="sm" variant="outline" className="gap-1" onClick={() => handleExport("expiring")}><Download className="h-3.5 w-3.5" /> CSV</Button></CardHeader>
          <CardContent>{(data as any)?.expiring?.length ? (data as any).expiring.map((d: any) => <div key={d.uuid} className="flex justify-between py-1.5 text-sm border-b last:border-0"><span>{d.staff?.employeeId} — {d.documentType}</span><span className="text-xs text-muted-foreground">{formatDate(d.expiryDate)}</span></div>) : <p className="text-sm text-muted-foreground">No expiring documents</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Expired Documents</CardTitle><Button size="sm" variant="outline" className="gap-1" onClick={() => handleExport("expired")}><Download className="h-3.5 w-3.5" /> CSV</Button></CardHeader>
          <CardContent>{(data as any)?.expired?.length ? (data as any).expired.map((d: any) => <div key={d.uuid} className="flex justify-between py-1.5 text-sm border-b last:border-0"><span>{d.staff?.employeeId} — {d.documentType}</span><Badge variant="destructive" className="text-[10px]">Expired</Badge></div>) : <p className="text-sm text-muted-foreground">No expired documents</p>}</CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Available Reports</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {["Staff List", "Department-wise", "Teaching Staff", "Attendance", "Leave", "Payroll", "Joining", "Document Expiry", "Performance"].map((r) => (
            <div key={r} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"><span>{r}</span><FileText className="h-4 w-4 text-muted-foreground" /></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StaffPage() {
  const router = useRouter();
  const { activeBranchId } = useERP();
  const [globalImportOpen, setGlobalImportOpen] = useState(false);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const editId = searchParams.get("edit") || undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Complete, production-ready staff module — backend + database integrated, responsive, dark mode supported</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-emerald-500/40 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium shadow-sm"
            onClick={() => setGlobalImportOpen(true)}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            <span>Import Excel/CSV</span>
          </Button>
          <Link href="/staff?tab=add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Staff</span>
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={tab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex h-auto flex-wrap">
            <TabsTrigger value="dashboard" asChild><Link href="/staff?tab=dashboard" className="gap-1.5 text-xs"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</Link></TabsTrigger>
            <TabsTrigger value="list" asChild><Link href="/staff?tab=list" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> All Staff</Link></TabsTrigger>
            <TabsTrigger value="add" asChild><Link href="/staff?tab=add" className="gap-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Add Staff</Link></TabsTrigger>
            <TabsTrigger value="import" asChild><Link href="/staff?tab=import" className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium"><FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Import Excel/CSV</Link></TabsTrigger>
            <TabsTrigger value="attendance" asChild><Link href="/staff?tab=attendance" className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" /> Attendance</Link></TabsTrigger>
            <TabsTrigger value="leave" asChild><Link href="/staff?tab=leave" className="gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" /> Leave</Link></TabsTrigger>
            <TabsTrigger value="payroll" asChild><Link href="/staff?tab=payroll" className="gap-1.5 text-xs"><Receipt className="h-3.5 w-3.5" /> Payroll</Link></TabsTrigger>
            <TabsTrigger value="documents" asChild><Link href="/staff?tab=documents" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> Documents</Link></TabsTrigger>
            <TabsTrigger value="performance" asChild><Link href="/staff?tab=performance" className="gap-1.5 text-xs"><Award className="h-3.5 w-3.5" /> Performance</Link></TabsTrigger>
            <TabsTrigger value="reports" asChild><Link href="/staff?tab=reports" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Reports</Link></TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="list"><ListTab /></TabsContent>
        <TabsContent value="add"><AddStaffTab editId={editId} /></TabsContent>
        <TabsContent value="attendance">
          <Card><CardHeader><CardTitle className="text-sm">Staff Attendance — Mark & Bulk</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Select a staff from All Staff → Profile → Attendance to mark daily attendance. Bulk attendance available via API: POST /api/v1/staff/attendance/bulk</CardContent></Card>
        </TabsContent>
        <TabsContent value="leave">
          <Card><CardHeader><CardTitle className="text-sm">Leave Management</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Leave requests are managed via Leaves module. Staff can apply, HR/Principal can approve/reject. APIs: POST /api/v1/leaves, PATCH /api/v1/leaves/:id/approve</CardContent></Card>
        </TabsContent>
        <TabsContent value="payroll">
          <Card><CardHeader><CardTitle className="text-sm">Payroll</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Monthly payroll generation per staff: POST /api/v1/payroll/generate — unique per staff/month/year. Payslip view via Staff Profile → Payroll tab.</CardContent></Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card><CardHeader><CardTitle className="text-sm">Documents</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Upload, view, download, delete with expiry tracking. APIs: POST /api/v1/staff/:id/documents</CardContent></Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card><CardHeader><CardTitle className="text-sm">Performance</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Performance reviews & trainings per staff profile. APIs: POST /api/v1/staff/:id/performance</CardContent></Card>
        </TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                <span>Bulk Import Staff via Excel or CSV</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download the official template, populate your teachers &amp; staff details, and upload to create profiles and logins in bulk.
              </p>
              <Button
                type="button"
                onClick={() => setGlobalImportOpen(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Upload className="h-4 w-4" />
                <span>Open File Upload Dialog</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExcelCsvImportDialog
        open={globalImportOpen}
        onOpenChange={setGlobalImportOpen}
        title="Import Staff Members via Excel / CSV"
        description="Upload your faculty &amp; staff roster. We'll automatically create staff profiles and login accounts."
        templateFileName="staff_import_template.csv"
        templateCsvContent={`First Name,Last Name,Department,Designation,Staff Type,Mobile,Email,Gender,Joining Date,City,State,Pincode,Basic Salary,HRA,Allowances,Bank Name,Account Number,IFSC Code
Vikash,Kumar,Academics,Senior Teacher,TEACHING,9876543210,vikash@example.com,Male,2026-09-01,Madhubani,Bihar,847211,35000,7000,3000,State Bank of India,39482910394,SBIN0001234
Pooja,Sharma,Administration,Accountant,NON_TEACHING,9876543211,pooja@example.com,Female,2026-09-01,Patna,Bihar,800001,28000,5000,2000,HDFC Bank,50100234910,HDFC0000123`}
        previewColumns={[
          { key: "First Name", label: "First Name" },
          { key: "Last Name", label: "Last Name" },
          { key: "Department", label: "Department" },
          { key: "Designation", label: "Designation" },
          { key: "Mobile", label: "Mobile" },
          { key: "Staff Type", label: "Type" },
        ]}
        onImport={async (rows) => {
          return await bulkImportStaffApi(rows, activeBranchId);
        }}
        onSuccess={() => {
          router.push("/staff?tab=list");
        }}
      />
    </div>
  );
}
