"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Student } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StudentFormDialog } from "@/components/students/student-form-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  DollarSign,
  ArrowLeft,
  Edit2,
  Award,
  ShieldCheck,
  BookOpen,
  Bus,
  Route as RouteIcon,
  Banknote,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState(() => mockDb.getStudentById(studentId));
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!student) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Student Record Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested student record could not be found in the school roster.
        </p>
        <Button asChild variant="outline">
          <Link href="/students">Back to Student Directory</Link>
        </Button>
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "GRADUATED":
        return "purple";
      case "TRANSFERRED":
        return "warning";
      case "SUSPENDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Student Profile Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={student.avatar}
                alt={student.fullName}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-primary/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border border-border shadow-xs">
                {student.bloodGroup}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {student.rollNumber}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  Admission #{student.admissionNumber}
                </span>
                <Badge variant={statusVariant(student.status) as any} className="text-xs">
                  {student.status}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {student.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <span>{student.branchName}</span>
                <span>•</span>
                <span className="text-foreground font-semibold">{student.className}</span>
                <span>({student.sectionName})</span>
                {(student as any).program && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-[11px]">{(student as any).program} {(student as any).department ?? ""}</Badge>
                    {(student as any).semester && <span>Sem {(student as any).semester}</span>}
                    {(student as any).universityPrn && <span className="font-mono text-[11px]">PRN {(student as any).universityPrn}</span>}
                  </>
                )}
              </p>
              {(student as any).program && (
                <p className="text-[11px] text-muted-foreground">
                  Year {(student as any).yearOfStudy ?? "-"} • {(student as any).university ?? ""} • {(student as any).admissionType ?? ""} {(student as any).hostelRequired ? "• Hostel" : "• Day Scholar"} {(student as any).scholarshipType && (student as any).scholarshipType !== "None" ? `• ${ (student as any).scholarshipType} Scholarship` : ""} {(student as any).mentorName ? `• Mentor: ${(student as any).mentorName}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-1.5"
            >
              <Edit2 className="h-4 w-4 text-amber-500" />
              <span>Edit Student</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/students" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 360-Degree Tabbed Dossier */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-4xl h-10 p-1 bg-muted/60">
          <TabsTrigger value="overview" className="text-xs font-semibold">
            Overview
          </TabsTrigger>
          <TabsTrigger value="academic" className="text-xs font-semibold">
            Academic History
          </TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs font-semibold">
            Attendance
          </TabsTrigger>
          <TabsTrigger value="fees" className="text-xs font-semibold">
            Fee Ledger
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs font-semibold">
            Documents
          </TabsTrigger>
          <TabsTrigger value="transport" className="text-xs font-semibold gap-1">
            <Bus className="h-3 w-3" /> Transport
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Date of Birth</span>
                    <span className="font-bold text-foreground text-sm">{formatDate(student.dateOfBirth)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Gender</span>
                    <span className="font-bold text-foreground text-sm">{student.gender}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Blood Group</span>
                    <span className="font-bold text-foreground text-sm">{student.bloodGroup}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-muted-foreground block">Admission Date</span>
                    <span className="font-bold text-foreground text-sm">{formatDate(student.admissionDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/60 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {student.address}, {student.city}, {student.state}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Guardian & Emergency Details */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Guardian & Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-muted-foreground block">Primary Parent / Guardian</span>
                  <span className="font-bold text-foreground text-sm">{student.guardian.name}</span>
                  <span className="text-muted-foreground block">
                    {student.guardian.relation} • {student.guardian.occupation}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Guardian Email:</span>
                    <span className="font-semibold text-foreground font-mono">{student.guardian.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                    <span className="text-muted-foreground">Primary Phone:</span>
                    <span className="font-semibold text-foreground font-mono">{student.guardian.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-rose-600 font-medium">Emergency Line:</span>
                    <span className="font-bold text-rose-600 font-mono">{student.guardian.emergencyContact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Academic History */}
        <TabsContent value="academic" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Report Cards & Historical GPA Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.academicHistory.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border/70 bg-card space-y-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{rec.term}</h4>
                      <span className="text-xs text-muted-foreground">
                        Class Rank #{rec.rank} • Overall Score: {rec.percentage}%
                      </span>
                    </div>
                    <Badge variant="success" className="text-xs font-mono font-bold">
                      GPA: {rec.gpa} ({rec.grade})
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                    {rec.remarks}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Attendance Breakdown */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Attendance Summary & Biometric Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-600 block">Present Days</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {student.attendanceSummary.presentDays}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[11px] text-rose-600 block">Absent Days</span>
                  <span className="text-xl font-bold text-rose-600">{student.attendanceSummary.absentDays}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] text-amber-600 block">Late Check-ins</span>
                  <span className="text-xl font-bold text-amber-600">{student.attendanceSummary.lateDays}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[11px] text-blue-600 block">Attendance Rate</span>
                  <span className="text-xl font-bold text-blue-600">
                    {student.attendanceSummary.attendanceRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Fee Ledger */}
        <TabsContent value="fees" className="space-y-4 mt-4">
          {(() => {
            const assignment = mockDb.getFeeAssignmentByStudentId(student.id);
            const transportAssignment = mockDb.getStudentTransportAssignmentByStudentId(student.id);
            const hasTransport = !!transportAssignment && transportAssignment.status === "ACTIVE";
            const transportHead = assignment?.feeHeads?.find((h) => h.feeHeadId === "fh-04");
            const transportAmount = transportHead?.amount ?? transportAssignment?.feePerMonth ?? 0;
            const transportDue = transportHead?.dueAmount ?? (hasTransport ? transportAmount : 0);
            return (
              <>
                <Card className="border-border/80 shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Tuition & Fee Status
                    </CardTitle>
                    <CardDescription className="text-xs">Assigned − Discount − Paid = Due • Transport via Transport module auto-added as conditional head</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                        <span className="text-muted-foreground block">Total Billed</span>
                        <span className="text-lg font-bold text-foreground mt-1 block">
                          {formatCurrency(assignment?.totalAssigned ?? student.feeSummary.totalAssigned)}
                        </span>
                        {assignment && assignment.discount > 0 && <span className="text-[11px] text-emerald-600 block">Disc −{formatCurrency(assignment.discount)}</span>}
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-600 block">Paid to Date</span>
                        <span className="text-lg font-bold text-emerald-600 mt-1 block">
                          {formatCurrency(assignment?.totalPaid ?? student.feeSummary.totalPaid)}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-rose-600 block">Outstanding Balance</span>
                        <span className="text-lg font-bold text-rose-600 mt-1 block">
                          {formatCurrency(assignment?.totalPending ?? student.feeSummary.totalPending)}
                        </span>
                      </div>
                    </div>

                    {/* Transport Fee row inside Fee Ledger */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${hasTransport ? "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900" : "bg-muted/20 border-dashed"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${hasTransport ? "bg-sky-500 text-white" : "bg-muted text-muted-foreground"}`}>
                          <Bus className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">Transport Fee {hasTransport ? <Badge variant="outline" className="text-[10px] border-sky-300 text-sky-700">Via Transport</Badge> : <Badge variant="secondary" className="text-[10px]">Not using transport</Badge>}</div>
                          {hasTransport ? (
                            <div className="text-[11px] text-muted-foreground">
                              {transportAssignment.routeName} → {transportAssignment.stopName} • {transportAssignment.distanceKm}km Zone {transportAssignment.zone} • {formatCurrency(transportAssignment.feePerMonth)}/mo
                              {transportAssignment.isProrated && transportAssignment.proratedFee ? ` • Prorated ${formatCurrency(transportAssignment.proratedFee)}` : ""}
                              {transportAssignment.discount ? ` • Sibling disc −${formatCurrency(transportAssignment.discount)}` : ""}
                            </div>
                          ) : (
                            <div className="text-[11px] text-muted-foreground">No active transport assignment — fee head not added. Assign in Transport module to auto-add.</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${hasTransport && transportDue > 0 ? "text-amber-600" : hasTransport ? "text-emerald-600" : "text-muted-foreground"}`}>{hasTransport ? formatCurrency(transportAmount) : "—"}</div>
                        {hasTransport && <div className="text-[11px] text-muted-foreground">Due: {formatCurrency(transportDue)}</div>}
                      </div>
                    </div>

                    {assignment?.feeHeads && assignment.feeHeads.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-foreground">Fee Head Breakdown</div>
                        <div className="rounded-lg border overflow-hidden">
                          <div className="grid grid-cols-4 gap-2 p-2 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                            <span>Head</span><span className="text-right">Amount</span><span className="text-right">Paid</span><span className="text-right">Due</span>
                          </div>
                          {assignment.feeHeads.map((fh) => (
                            <div key={fh.feeHeadId} className={`grid grid-cols-4 gap-2 p-2 text-xs border-t ${fh.feeHeadId === "fh-04" ? "bg-sky-50/60 dark:bg-sky-950/10" : ""}`}>
                              <span className="font-medium flex items-center gap-1">{fh.feeHeadName} {fh.feeHeadId === "fh-04" && <Badge variant="outline" className="text-[9px] h-4">Via Transport</Badge>}</span>
                              <span className="text-right font-mono">{formatCurrency(fh.amount)}</span>
                              <span className="text-right font-mono text-emerald-600">{formatCurrency(fh.paidAmount)}</span>
                              <span className="text-right font-mono font-bold text-rose-600">{fh.dueAmount > 0 ? formatCurrency(fh.dueAmount) : "—"}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link href={`/fees/${student.id}`}>Open Fee Detail</Link></Button>
                          {hasTransport && <Button asChild variant="ghost" size="sm" className="h-7 text-xs"><Link href="/transport">Manage Transport</Link></Button>}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </TabsContent>

        {/* Tab 5: Documents */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Submitted Certificates & Transcripts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{doc.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Uploaded {formatDate(doc.uploadedAt)} • {doc.size}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Transport — next to Documents per guide */}
        <TabsContent value="transport" className="space-y-4 mt-4">
          {(() => {
            const ta = mockDb.getStudentTransportAssignmentByStudentId(student.id);
            const route = ta ? mockDb.getTransportRouteById(ta.routeId) : undefined;
            const vehicle = ta ? mockDb.getVehicleById(ta.vehicleId) : undefined;
            const driver = route?.driverId ? mockDb.getDriverById(route.driverId) : undefined;
            const conductor = (route as any)?.helperId ? mockDb.getBusHelpers().find((b) => b.id === (route as any).helperId) : undefined;
            const slab = ta ? mockDb.getTransportFeeForZone(ta.zone) : undefined;
            if (!ta) {
              return (
                <Card className="border-dashed p-8 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center"><Bus className="h-6 w-6 text-muted-foreground" /></div>
                  <h3 className="font-semibold text-sm">No Transport Assigned</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">Is student ko abhi koi route/stop assign nahi hai. Transport module me jaake Route → Stop → Assignment karein, tab yahan fee slab ke saath dikhega aur Fee Ledger me Transport Fee auto-add ho jayega.</p>
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs"><Link href="/transport">Go to Transport Module</Link></Button>
                </Card>
              );
            }
            return (
              <div className="space-y-4">
                <Card className="border-border/80 shadow-xs overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2"><Bus className="h-4 w-4 text-primary" /> Transport Assignment <Badge variant={ta.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">{ta.status}</Badge>{ta.isProrated && <Badge variant="warning" className="text-[10px]">Prorated {formatCurrency(ta.proratedFee!)}</Badge>}</CardTitle>
                    <CardDescription className="text-xs">Route → Stop → Vehicle → Crew • Fee slab auto → Fee Collection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border bg-muted/30 space-y-1">
                        <div className="text-muted-foreground flex items-center gap-1"><RouteIcon className="h-3 w-3" /> Route</div>
                        <div className="font-bold text-foreground">{ta.routeName} <span className="font-mono text-xs text-muted-foreground">({route?.routeNumber})</span></div>
                        <div className="text-muted-foreground">{route?.stops[0]?.name} → {route?.stops[route.stops.length - 1]?.name} • {route?.totalDistance}km • {route?.estimatedDuration}min</div>
                        <Badge variant="outline" className="text-[10px] mt-1">{route?.status}</Badge>
                      </div>
                      <div className="p-3 rounded-xl border bg-muted/30 space-y-1">
                        <div className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Stop & Pickup</div>
                        <div className="font-bold text-foreground">{ta.stopName} • {ta.distanceKm}km Zone {ta.zone}</div>
                        <div className="text-muted-foreground">Arrival {route?.stops.find((s) => s.id === ta.stopId)?.arrivalTime || "—"} • Shift {ta.shift} • {slab?.label} → {formatCurrency(ta.feePerMonth)}/mo</div>
                        {ta.discount ? <div className="text-emerald-600 font-medium">Sibling disc −{formatCurrency(ta.discount)} ({ta.discountReason})</div> : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border bg-card space-y-1">
                        <div className="text-muted-foreground">Vehicle</div>
                        <div className="font-bold">{ta.vehicleRegistration} <span className="text-muted-foreground font-normal">• {vehicle?.brand} {vehicle?.model}</span></div>
                        <div className="text-muted-foreground">{vehicle?.capacity} seats • {vehicle?.fuelType} • {vehicle?.status}</div>
                        {vehicle && <div className="text-[11px]">Insurance {formatDate(vehicle.insuranceExpiry)} • Fitness {formatDate((vehicle as any).fitnessCertificateExpiry)}</div>}
                      </div>
                      <div className="p-3 rounded-xl border bg-card space-y-1">
                        <div className="text-muted-foreground">Driver</div>
                        <div className="font-bold">{driver?.name || route?.driverName || "—"}</div>
                        <div className="text-muted-foreground font-mono text-[11px]">Lic {driver?.licenseNumber} • Exp {driver ? formatDate(driver.licenseExpiry) : "—"}</div>
                        <div className="text-muted-foreground">Ph {driver?.phone || "—"}</div>
                      </div>
                      <div className="p-3 rounded-xl border bg-card space-y-1">
                        <div className="text-muted-foreground">Conductor</div>
                        <div className="font-bold">{conductor?.name || (route as any)?.helperName || "— Not assigned"}</div>
                        <div className="text-muted-foreground">Ph {conductor?.phone || "—"} • {conductor?.assignedVehicleId ? `Vehicle ${conductor.assignedVehicleId}` : ""}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-1"><Banknote className="h-3.5 w-3.5" /> Transport Fee Slab → Fee Ledger</div>
                        <div className="text-[11px] text-sky-700 dark:text-sky-300">{slab?.label} → {formatCurrency(ta.feePerMonth)}/mo {ta.isProrated ? `• Prorated first month ${formatCurrency(ta.proratedFee!)}` : ""} • Auto added as <strong>Transport Fee</strong> head in Fee Collection</div>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs"><Link href={`/fees/${student.id}`}>View Fee Ledger</Link></Button>
                    </div>

                    {ta.history && ta.history.length > 0 && (
                      <div className="p-3 rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 space-y-1">
                        <div className="font-semibold text-amber-800 dark:text-amber-200 text-xs">Reassignment History (route split/ change)</div>
                        {ta.history.map((h, i) => (
                          <div key={i} className="text-[11px] text-amber-700 dark:text-amber-300">• {h.routeName} → {h.stopName} Zone {h.zone} {formatCurrency(h.feePerMonth)} on {formatDate(h.changedAt)} {h.reason ? `— ${h.reason}` : ""}</div>
                        ))}
                      </div>
                    )}

                    {ta.refundAmount ? <div className="p-3 rounded-xl border bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-xs"><span className="font-semibold text-rose-700">Refund:</span> <span className="text-rose-600">{formatCurrency(ta.refundAmount)} — transport dropped mid-session, prepaid months adjusted</span></div> : null}

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link href="/transport">Manage in Transport</Link></Button>
                      <Button asChild variant="ghost" size="sm" className="h-7 text-xs"><Link href={`/transport/${ta.routeId}`}>View Route</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Edit Student Dialog */}
      <StudentFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        studentToEdit={student}
        onSuccess={() => setStudent(mockDb.getStudentById(studentId))}
      />
    </div>
  );
}
