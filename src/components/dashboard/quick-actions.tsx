"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  UserPlus,
  CreditCard,
  CheckSquare,
  HardHat,
  Fingerprint,
  Plus,
  Sparkles,
  Zap,
  GraduationCap,
} from "lucide-react";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { AdmissionFormDialog } from "@/components/admissions/admission-form-dialog";
import { StudentFormDialog } from "@/components/students/student-form-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function QuickActions() {
  const { triggerBiometricSync } = useERP();
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState<{ title: string; desc: string; phase: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = (title: string, desc: string, phase: string) => {
    setDemoModalOpen({ title, desc, phase });
  };

  const handleBiometricSync = () => {
    const res = triggerBiometricSync();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <>
      <Card className="border-border/80 shadow-xs bg-gradient-to-r from-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <CardTitle className="text-base font-bold text-foreground">
                Quick Action Command Hub
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Instant Operations</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. Add Branch */}
            <button
              onClick={() => setBranchModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all group text-center cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform mb-2">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">Add Branch</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Register Campus</span>
            </button>

            {/* 2. New Admission Application (Phase 2 Active) */}
            <button
              onClick={() => setAdmissionModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all group text-center cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                <UserPlus className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">New Admission</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Application Dossier</span>
            </button>

            {/* 3. Register Student (Phase 2 Active) */}
            <button
              onClick={() => setStudentModalOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all group text-center cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">Enroll Student</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Class Cohort Roster</span>
            </button>

            {/* 4. Record Fee Payment */}
            <button
              onClick={() =>
                handleAction(
                  "Tuition & Fee Collection",
                  "Comprehensive fee head structures, online receipts, and payment ledger will be integrated in Phase 04.",
                  "Phase 04"
                )
              }
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all group text-center cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">Record Fee</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Payment Receipt</span>
            </button>

            {/* 5. Register Worker */}
            <button
              onClick={() =>
                handleAction(
                  "Worker Shift & Profile Registry",
                  "Support worker profile assignment, shifts, and designation tracking will be launched in Phase 03.",
                  "Phase 03"
                )
              }
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all group text-center cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2">
                <HardHat className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">Add Worker</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Staff & Support</span>
            </button>

            {/* 6. Biometric Sync Trigger */}
            <button
              onClick={handleBiometricSync}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/80 bg-card hover:border-emerald-500/50 hover:shadow-md transition-all group text-center cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform mb-2">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">Biometric Sync</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Sync Punch Data</span>
            </button>
          </div>

          {feedback && (
            <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium animate-in fade-in">
              {feedback}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BranchFormDialog open={branchModalOpen} onOpenChange={setBranchModalOpen} />
      <AdmissionFormDialog open={admissionModalOpen} onOpenChange={setAdmissionModalOpen} />
      <StudentFormDialog open={studentModalOpen} onOpenChange={setStudentModalOpen} />

      {/* Demo Action Modal for Future Phase Previews */}
      <Dialog open={!!demoModalOpen} onOpenChange={(open) => !open && setDemoModalOpen(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>{demoModalOpen?.phase} Module Roadmap</span>
            </div>
            <DialogTitle className="text-lg font-bold">{demoModalOpen?.title}</DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              {demoModalOpen?.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1 mt-2">
            <p className="font-semibold text-foreground">Phase 01 &amp; Phase 02 Active Modules:</p>
            <p>• Multi-Campus Management &amp; Directory (`/branches`)</p>
            <p>• Admissions Pipeline &amp; Application Review (`/admissions`)</p>
            <p>• Student Directory &amp; 360° Profiles (`/students`)</p>
            <p>• Classes, Sections &amp; Subject Mapping (`/classes`)</p>
            <p>• Faculty Directory &amp; Teacher Profiles (`/teachers`)</p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="default" onClick={() => setDemoModalOpen(null)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
