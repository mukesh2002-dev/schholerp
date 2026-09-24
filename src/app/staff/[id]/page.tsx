"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { fetchStaffById, fetchStaffAttendance, fetchStaffDocuments, createStaffDocument, fetchStaffPerformance, createStaffPerformance, fetchStaffAssignments, createStaffAssignment, fetchStaffPayroll, generatePayroll } from "@/lib/api/staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function StaffProfilePage() {
  const { id } = useParams() as { id: string };
  const { data: staff, isLoading } = useCampusData({
    fetcher: () => fetchStaffById(id),
    campusId: null,
    fallback: null as any,
    queryKeyPrefix: `staff-${id}`,
  });

  const [docForm, setDocForm] = useState({ documentType: "Aadhaar / ID Proof", fileUrl: "", expiryDate: "" });
  const [perfForm, setPerfForm] = useState({ reviewDate: new Date().toISOString().slice(0, 10), rating: 4, remarks: "" });
  const [assignForm, setAssignForm] = useState({ classId: "", section: "", subjectId: "" });
  const [payrollMonth, setPayrollMonth] = useState(String(new Date().getMonth() + 1));
  const [payrollYear, setPayrollYear] = useState(String(new Date().getFullYear()));

  const { data: attendance } = useCampusData({ fetcher: () => fetchStaffAttendance(id), campusId: null, fallback: [] as any, queryKeyPrefix: `att-${id}` });
  const { data: documents, refresh: refreshDocs } = useCampusData({ fetcher: () => fetchStaffDocuments(id), campusId: null, fallback: [] as any, queryKeyPrefix: `docs-${id}` });
  const { data: performances, refresh: refreshPerf } = useCampusData({ fetcher: () => fetchStaffPerformance(id), campusId: null, fallback: [] as any, queryKeyPrefix: `perf-${id}` });
  const { data: assignments, refresh: refreshAssign } = useCampusData({ fetcher: () => fetchStaffAssignments(id), campusId: null, fallback: null as any, queryKeyPrefix: `assign-${id}` });
  const { data: payrolls, refresh: refreshPayroll } = useCampusData({ fetcher: () => fetchStaffPayroll(id), campusId: null, fallback: [] as any, queryKeyPrefix: `payroll-${id}` });

  if (isLoading) return <Skeleton className="h-64" />;
  if (!staff) return <div className="p-6 text-center text-sm text-muted-foreground">Staff not found</div>;
  const s = staff as any;

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 to-indigo-500/20" />
        <CardContent className="p-4 -mt-10">
          <div className="flex gap-4 items-end">
            <img src={s.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.firstName || s.employeeId)}`} alt={s.employeeId} className="h-20 w-20 rounded-xl object-cover ring-4 ring-card bg-card" />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{[s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || s.user?.name}</h1>
              <p className="text-sm text-muted-foreground">{s.employeeId} • {s.designation} • {s.department} • Joined {formatDate(s.joiningDate)}</p>
              <div className="flex gap-2 mt-1 flex-wrap"><Badge variant="outline" className="text-[11px]">{s.staffType}</Badge><Badge variant={s.isActive ? "success" : "secondary"} className="text-[11px]">{s.employmentStatus}</Badge><Badge variant="secondary" className="text-[11px]">{s.campus?.name}</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="overflow-x-auto"><TabsList className="inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList></div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card><CardHeader><CardTitle className="text-sm">Contact</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p>Mobile: {s.mobile || "—"}</p><p>Email: {s.email || s.user?.email || "—"}</p><p>Address: {s.address || "—"}, {s.city} {s.state} {s.pincode}</p></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-sm">Bank & Salary</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p>Bank: {s.bankName || "—"} — {s.accountNumberMasked || "****"}</p><p>IFSC: {s.ifscCode || "—"}</p><p>Gross: {s.grossSalary ?? "—"} Net: {s.netSalary ?? "—"}</p></CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="personal">
          <Card><CardContent className="p-4 grid grid-cols-2 gap-2 text-sm">
            <p>Father: {s.fatherName || "—"}</p><p>Mother: {s.motherName || "—"}</p><p>DOB: {s.dob ? formatDate(s.dob) : "—"}</p><p>Gender: {s.gender || "—"}</p><p>Blood Group: {s.bloodGroup || "—"}</p><p>Emergency: {s.emergencyContactName} {s.emergencyContactNumber}</p><p>ID: {s.idType} {s.idNumberMasked || s.idNumber}</p><p>Qualification: {s.highestQualification || s.qualification || "—"}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card><CardContent className="p-4 grid grid-cols-2 gap-2 text-sm">
            <p>Department: {s.department}</p><p>Designation: {s.designation}</p><p>Staff Type: {s.staffType}</p><p>Employment Type: {s.employmentType || "—"}</p><p>Work Type: {s.workType || "—"}</p><p>Status: {s.employmentStatus}</p><p>Joining: {formatDate(s.joiningDate)}</p><p>Experience: {s.experienceYears ?? "—"} years</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card><CardHeader><CardTitle className="text-sm">Attendance History</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Remarks</TableHead></TableRow></TableHeader><TableBody>{(attendance as any)?.length ? (attendance as any).map((a: any) => <TableRow key={a.uuid}><TableCell>{formatDate(a.date)}</TableCell><TableCell><Badge className="text-[10px]">{a.status}</Badge></TableCell><TableCell className="text-xs">{a.remarks || "—"}</TableCell></TableRow>) : <TableRow><TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">No attendance records</TableCell></TableRow>}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Leave history visible via HR Leave tab. Staff can apply via Leaves module.</CardContent></Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm">Payroll History</CardTitle><div className="flex gap-2"><Input className="w-20 h-8 text-xs" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)} placeholder="MM" /><Input className="w-24 h-8 text-xs" value={payrollYear} onChange={(e) => setPayrollYear(e.target.value)} placeholder="YYYY" /><Button size="sm" className="h-8" onClick={async () => { try { await generatePayroll({ staffId: id, month: Number(payrollMonth), year: Number(payrollYear) }); toast.success("Payroll generated"); refreshPayroll(); } catch (e: any) { toast.error(e.message); } }}>Generate</Button></div></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Month/Year</TableHead><TableHead>Base</TableHead><TableHead>Allowances</TableHead><TableHead>Deductions</TableHead><TableHead>Net</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{(payrolls as any)?.length ? (payrolls as any).map((p: any) => <TableRow key={p.uuid}><TableCell>{p.month}/{p.year}</TableCell><TableCell>{p.baseSalary}</TableCell><TableCell>{p.totalAllowances}</TableCell><TableCell>{p.totalDeductions}</TableCell><TableCell className="font-bold">{p.netSalary}</TableCell><TableCell><Badge className="text-[10px]">{p.status}</Badge></TableCell></TableRow>) : <TableRow><TableCell colSpan={6} className="text-center py-6 text-sm text-muted-foreground">No payroll records</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card><CardHeader><CardTitle className="text-sm">Documents — Upload with expiry tracking</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select value={docForm.documentType} onValueChange={(v) => setDocForm({ ...docForm, documentType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Aadhaar / ID Proof">Aadhaar / ID Proof</SelectItem><SelectItem value="PAN">PAN</SelectItem><SelectItem value="Qualification Certificate">Qualification Certificate</SelectItem><SelectItem value="Experience Certificate">Experience Certificate</SelectItem><SelectItem value="Joining Letter">Joining Letter</SelectItem><SelectItem value="Resume">Resume</SelectItem><SelectItem value="Other Documents">Other</SelectItem></SelectContent></Select>
              <Input placeholder="File URL (or upload via /staff/upload)" value={docForm.fileUrl} onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })} />
              <Input type="date" value={docForm.expiryDate} onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })} />
              <Button onClick={async () => { if (!docForm.fileUrl) { toast.error("File URL required"); return; } try { await createStaffDocument(id, docForm); toast.success("Document uploaded"); refreshDocs(); } catch (e: any) { toast.error(e.message); } }}>Upload</Button>
            </div>
            <Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>File</TableHead><TableHead>Expiry</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{(documents as any)?.length ? (documents as any).map((d: any) => <TableRow key={d.uuid}><TableCell className="text-xs">{d.documentType}</TableCell><TableCell className="text-xs truncate max-w-[200px]"><a href={d.fileUrl} target="_blank" className="text-primary underline">{d.fileUrl.slice(0, 40)}...</a></TableCell><TableCell className="text-xs">{d.expiryDate ? formatDate(d.expiryDate) : "—"}</TableCell><TableCell>{d.expiryDate && new Date(d.expiryDate) < new Date() ? <Badge variant="destructive" className="text-[10px]">Expired</Badge> : <Badge variant="outline" className="text-[10px]">Valid</Badge>}</TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">No documents</TableCell></TableRow>}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card><CardHeader><CardTitle className="text-sm">Performance Reviews</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input type="date" value={perfForm.reviewDate} onChange={(e) => setPerfForm({ ...perfForm, reviewDate: e.target.value })} />
              <Select value={String(perfForm.rating)} onValueChange={(v) => setPerfForm({ ...perfForm, rating: Number(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5 — Excellent</SelectItem><SelectItem value="4">4 — Good</SelectItem><SelectItem value="3">3 — Average</SelectItem><SelectItem value="2">2 — Below Average</SelectItem><SelectItem value="1">1 — Poor</SelectItem></SelectContent></Select>
              <Input placeholder="Remarks" value={perfForm.remarks} onChange={(e) => setPerfForm({ ...perfForm, remarks: e.target.value })} />
              <Button onClick={async () => { try { await createStaffPerformance(id, perfForm); toast.success("Review added"); refreshPerf(); } catch (e: any) { toast.error(e.message); } }}>Add Review</Button>
            </div>
            <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Rating</TableHead><TableHead>Remarks</TableHead><TableHead>Reviewer</TableHead></TableRow></TableHeader><TableBody>{(performances as any)?.length ? (performances as any).map((p: any) => <TableRow key={p.uuid}><TableCell className="text-xs">{formatDate(p.reviewDate)}</TableCell><TableCell><Badge>{p.rating ?? "—"}</Badge></TableCell><TableCell className="text-xs">{p.remarks || p.assessment || "—"}</TableCell><TableCell className="text-xs">{p.reviewer?.name || "—"}</TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">No reviews</TableCell></TableRow>}</TableBody></Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card><CardHeader><CardTitle className="text-sm">Class / Subject Assignments (Teacher Only)</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input placeholder="Class UUID" value={assignForm.classId} onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })} />
              <Input placeholder="Section (A/B)" value={assignForm.section} onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })} />
              <Input placeholder="Subject UUID (optional)" value={assignForm.subjectId} onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })} />
              <Button onClick={async () => { if (!assignForm.classId) { toast.error("Class ID required"); return; } try { await createStaffAssignment(id, assignForm); toast.success("Assigned"); refreshAssign(); } catch (e: any) { toast.error(e.message); } }}>Assign</Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold">Class Assignments: {(assignments as any)?.classAssignments?.length ?? 0}</p>
              {(assignments as any)?.classAssignments?.map((a: any) => <div key={a.uuid} className="flex justify-between p-2 rounded bg-muted/50 text-sm"><span>{a.class?.name} Sec {a.section || "—"}</span><Badge className="text-[10px]">{a.subject?.name || "General"}</Badge></div>)}
              <p className="text-xs font-semibold mt-3">Subject Assignments: {(assignments as any)?.subjectAssignments?.length ?? 0}</p>
              {(assignments as any)?.subjectAssignments?.map((a: any) => <div key={a.uuid} className="flex justify-between p-2 rounded bg-muted/50 text-sm"><span>{a.class?.name} — {a.subject?.name}</span><span className="text-xs text-muted-foreground">Sec {a.section || "—"}</span></div>)}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Activity timeline — attendance, leave, payroll, documents aggregated. Extend via Audit Logs.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
