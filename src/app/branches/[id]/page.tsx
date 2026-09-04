"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useERP } from "@/components/providers/erp-provider";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import {
  Building2,
  GraduationCap,
  Users,
  HardHat,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  CheckCircle2,
  Edit2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Layers,
  Clock,
} from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BranchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { branches, setActiveBranchId, activeBranchId } = useERP();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const branchId = params.id as string;
  const branch = branches.find((b) => b.id === branchId);

  if (!branch) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Building2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Campus Branch Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested branch record could not be located in the multi-campus database.
        </p>
        <Button asChild variant="outline">
          <Link href="/branches">Back to Campus Directory</Link>
        </Button>
      </div>
    );
  }

  const isCurrentActive = activeBranchId === branch.id;
  const occupancyRate = Math.round((branch.totalStudents / branch.capacity) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero Campus Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="h-4 w-full" style={{ backgroundColor: branch.color || "#3b82f6" }} />
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white font-extrabold text-xl shadow-md"
                style={{ backgroundColor: branch.color || "#3b82f6" }}
              >
                {branch.code.split("-")[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {branch.code}
                  </span>
                  <Badge
                    variant={
                      branch.status === "ACTIVE"
                        ? "success"
                        : branch.status === "EXPANDING"
                        ? "purple"
                        : "warning"
                    }
                    className="text-xs"
                  >
                    {branch.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">Est. {branch.establishedYear}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {branch.name}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">{branch.tagline}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={isCurrentActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveBranchId(branch.id)}
                className="gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isCurrentActive ? "Active Global Context" : "Set Workspace Context"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-1.5"
              >
                <Edit2 className="h-4 w-4 text-amber-500" />
                <span>Edit Branch</span>
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link href="/branches" className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Roster</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Contact & Address Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">
                {branch.address}, {branch.city}, {branch.state} {branch.postalCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>{branch.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{branch.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Specific KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Student Capacity"
          value={`${formatNumber(branch.totalStudents)} / ${formatNumber(branch.capacity)}`}
          change={occupancyRate}
          changeType="increase"
          period="Occupancy quota"
          description={`${occupancyRate}% filled`}
          icon={<GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          iconColor="bg-blue-500/10"
        />

        <StatCard
          title="Faculty Instructors"
          value={formatNumber(branch.totalTeachers)}
          description="Assigned full-time teachers"
          period="1:16 student ratio"
          icon={<Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          iconColor="bg-emerald-500/10"
        />

        <StatCard
          title="Support & Facility Staff"
          value={formatNumber(branch.totalStaff + branch.totalWorkers)}
          description={`${branch.totalStaff} admin + ${branch.totalWorkers} workers`}
          period="Daily shifts"
          icon={<HardHat className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          iconColor="bg-amber-500/10"
        />

        <StatCard
          title="Monthly Operating Budget"
          value={formatCurrency(branch.monthlyRevenue)}
          description={`Net: ${formatCurrency(branch.monthlyRevenue - branch.monthlyExpenses)}`}
          period={`${branch.feeCollectionRate}% fee recovery`}
          icon={<DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
          iconColor="bg-purple-500/10"
        />
      </div>

      {/* Detail Grid: Leadership & Facilities & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Principal Leadership Card */}
        <Card className="lg:col-span-4 border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Campus Principal & Leadership
            </CardTitle>
            <CardDescription>Academic and executive administration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-base">
                {branch.principalName.charAt(0)}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{branch.principalName}</h4>
                <p className="text-xs text-muted-foreground">Head of Institution</p>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 mt-1">
                  Active Principal
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                <span className="text-muted-foreground">Direct Email:</span>
                <span className="font-semibold text-foreground font-mono">{branch.principalEmail}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                <span className="text-muted-foreground">Direct Phone:</span>
                <span className="font-semibold text-foreground font-mono">{branch.principalPhone}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60">
                <span className="text-muted-foreground">Attendance Rating:</span>
                <span className="font-bold text-emerald-600">{branch.attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Departments & Academic Divisions */}
        <Card className="lg:col-span-8 border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Academic Departments & Heads
            </CardTitle>
            <CardDescription>Departmental staff allocation and leadership hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branch.departments.map((dept, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border/70 bg-card space-y-1 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-foreground">{dept.name}</h5>
                    <Badge variant="secondary" className="text-[10px]">
                      {dept.staffCount} Staff
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Head of Dept: <strong className="text-foreground">{dept.head}</strong>
                  </p>
                </div>
              ))}
            </div>

            {/* Campus Facilities */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Campus Infrastructure & Facilities
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {branch.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground border border-border/60"
                  >
                    ✓ {facility}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Branch Dialog */}
      <BranchFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        branchToEdit={branch}
      />
    </div>
  );
}
