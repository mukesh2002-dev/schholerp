"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchLibraries,
  createLibraryApi,
  fetchLibrarySections,
  createSectionApi,
  fetchFineRules,
  upsertFineRuleApi,
} from "@/lib/api/library";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { Library, LibraryFineRule, LibrarySection } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Library as LibIcon, Plus, Layers, Edit3, CalendarClock } from "lucide-react";
import { toast } from "sonner";

const LIB_TYPES = ["GENERAL", "DIGITAL", "REFERENCE", "DEPARTMENT"];
const RULE_TYPES = ["OVERDUE", "LOST_BOOK", "DAMAGED_BOOK", "MISSING_BOOK"];

export function LibraryManagementView() {
  const { activeBranchId } = useERP();

  // ── Libraries ──
  const {
    data: libraries,
    isOffline,
    error,
    isLoading,
    refresh: refreshLibraries,
  } = useCampusData<Library[]>({
    fetcher: (cid) => fetchLibraries({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "libraries",
  });

  // ── Fine rules ──
  const { data: fineRules, refresh: refreshRules } = useCampusData<LibraryFineRule[]>({
    fetcher: (cid) => fetchFineRules({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "library-fine-rules",
  });

  const [libOpen, setLibOpen] = useState(false);
  const [libName, setLibName] = useState("");
  const [libType, setLibType] = useState("GENERAL");
  const [libLocation, setLibLocation] = useState("");
  const [libMaxDays, setLibMaxDays] = useState("14");

  const [sectionsFor, setSectionsFor] = useState<Library | null>(null);
  const [sections, setSections] = useState<LibrarySection[]>([]);
  const [secName, setSecName] = useState("");

  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    ruleType: "OVERDUE",
    finePerDay: "5",
    maxFineAmount: "500",
    gracePeriodDays: "2",
    flatFineAmount: "0",
    replacementPercent: "100",
  });

  const handleCreateLibrary = async () => {
    if (!libName.trim()) { toast.error("Library name is required"); return; }
    try {
      await createLibraryApi(
        {
          name: libName.trim(),
          type: libType,
          location: libLocation || null,
          maxDaysPerIssue: Number(libMaxDays) || 14,
          maxBooksPerStudent: 3,
        },
        activeBranchId !== "all" ? activeBranchId : undefined
      );
      toast.success(`Library "${libName.trim()}" created`);
      setLibOpen(false);
      setLibName("");
      void refreshLibraries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create library");
    }
  };

  const handleViewSections = async (lib: Library) => {
    setSectionsFor(lib);
    setSections(await fetchLibrarySections(lib.uuid, { campusId: activeBranchId }).catch(() => []));
  };

  const handleCreateSection = async () => {
    if (!sectionsFor || !secName.trim()) return;
    try {
      await createSectionApi(sectionsFor.uuid, { name: secName.trim() }, activeBranchId !== "all" ? activeBranchId : undefined);
      toast.success(`Section "${secName.trim()}" added`);
      setSecName("");
      setSections(await fetchLibrarySections(sectionsFor.uuid, { campusId: activeBranchId }).catch(() => []));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add section");
    }
  };

  const handleUpsertRule = async () => {
    try {
      await upsertFineRuleApi(
        {
          ruleType: ruleForm.ruleType,
          finePerDay: Number(ruleForm.finePerDay) || 0,
          maxFineAmount: ruleForm.maxFineAmount ? Number(ruleForm.maxFineAmount) : null,
          gracePeriodDays: Number(ruleForm.gracePeriodDays) || 0,
          flatFineAmount: Number(ruleForm.flatFineAmount) || 0,
          replacementPercent: Number(ruleForm.replacementPercent) || 100,
        },
        activeBranchId !== "all" ? activeBranchId : undefined
      );
      toast.success("Fine rule saved");
      setRuleOpen(false);
      void refreshRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save fine rule");
    }
  };

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={isOffline} error={error} isLoading={isLoading} />

      {/* Libraries */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <LibIcon className="h-4 w-4 text-primary" /> Libraries
            </CardTitle>
            <CardDescription>Multiple libraries per campus — Main, Junior Wing, Digital Lab, Reference…</CardDescription>
          </div>
          <Button size="sm" variant="gradient" className="h-8 text-xs gap-1.5" onClick={() => setLibOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Library
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          {libraries.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed text-xs text-muted-foreground">
              No libraries yet. Add a library to start organizing books, sections and fine rules.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {libraries.map((lib) => (
                <div key={lib.uuid} className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-sm block">{lib.name}</span>
                      <span className="text-[11px] text-muted-foreground block">
                        {lib.code || "—"} • {lib.type} {lib.location ? `• ${lib.location}` : ""}
                      </span>
                    </div>
                    <Badge variant={lib.isActive ? "success" : "secondary"} className="text-[10px]">{lib.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {lib._count?.books ?? 0} books • {lib._count?.copies ?? 0} copies • {lib.maxDaysPerIssue} days loan
                    {lib.librarian?.name ? ` • Librarian: ${lib.librarian.name}` : ""}
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1" onClick={() => void handleViewSections(lib)}>
                    <Layers className="h-3 w-3" /> View Sections
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sections (inline when a library is selected) */}
      {sectionsFor && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Sections — {sectionsFor.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <span key={s.uuid} className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60">
                  {s.name} {s.code ? `(${s.code})` : ""} {s.floor ? `• ${s.floor}` : ""}
                </span>
              ))}
              {sections.length === 0 && <span className="text-muted-foreground">No sections yet.</span>}
            </div>
            <div className="flex items-center gap-2">
              <Input value={secName} onChange={(e) => setSecName(e.target.value)} placeholder="New section name (e.g. Fiction)" className="h-8 text-xs flex-1" />
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => void handleCreateSection()}><Plus className="h-3 w-3" /> Add</Button>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSectionsFor(null)}>Close</Button>
          </CardContent>
        </Card>
      )}

      {/* Fine rules */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Fine Rules Engine
            </CardTitle>
            <CardDescription>Configurable per-campus rules — overdue ₹/day, grace, caps, lost/damaged replacement.</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setRuleOpen(true)}>
            <Edit3 className="h-3.5 w-3.5" /> Configure Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pt-1 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RULE_TYPES.map((t) => {
              const rule = fineRules.find((r) => r.ruleType === t);
              return (
                <div key={t} className="p-3 rounded-xl border border-border/70 bg-card">
                  <Badge variant={t === "OVERDUE" ? "warning" : "destructive"} className="text-[10px]">{t}</Badge>
                  <div className="mt-1.5 space-y-0.5">
                    {t === "OVERDUE" ? (
                      <>
                        <span className="text-muted-foreground block">₹{rule?.finePerDay ?? 2}/day • {rule?.gracePeriodDays ?? 0}d grace</span>
                        <span className="text-muted-foreground block">Cap: {rule?.maxFineAmount ? `₹${rule.maxFineAmount}` : "∞"}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground block">Flat ₹{rule?.flatFineAmount ?? 0}</span>
                        <span className="text-muted-foreground block">{rule?.replacementPercent ?? 100}% of book cost</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Library dialog */}
      <Dialog open={libOpen} onOpenChange={setLibOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Library</DialogTitle>
            <DialogDescription>Create a library within the campus (Main, Junior Wing, Digital Lab…).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Library Name *</label>
              <Input value={libName} onChange={(e) => setLibName(e.target.value)} placeholder="e.g. Main Library" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Type</label>
                <Select value={libType} onValueChange={(v) => setLibType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LIB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Loan Period (days)</label>
                <Input type="number" value={libMaxDays} onChange={(e) => setLibMaxDays(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Location</label>
              <Input value={libLocation} onChange={(e) => setLibLocation(e.target.value)} placeholder="Building A, 2nd Floor" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLibOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => void handleCreateLibrary()}>Create Library</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fine rule dialog */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Configure Fine Rule</DialogTitle>
            <DialogDescription>Campus-wide default rule. Library-specific rules can be added later per library.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Rule Type</label>
              <Select value={ruleForm.ruleType} onValueChange={(v) => setRuleForm((p) => ({ ...p, ruleType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RULE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Fine / day (₹)</label><Input type="number" value={ruleForm.finePerDay} onChange={(e) => setRuleForm((p) => ({ ...p, finePerDay: e.target.value }))} /></div>
              <div><label className="text-xs font-medium block mb-1">Max fine (₹, blank = none)</label><Input type="number" value={ruleForm.maxFineAmount} onChange={(e) => setRuleForm((p) => ({ ...p, maxFineAmount: e.target.value }))} /></div>
              <div><label className="text-xs font-medium block mb-1">Grace (days)</label><Input type="number" value={ruleForm.gracePeriodDays} onChange={(e) => setRuleForm((p) => ({ ...p, gracePeriodDays: e.target.value }))} /></div>
              <div><label className="text-xs font-medium block mb-1">Flat fine (₹)</label><Input type="number" value={ruleForm.flatFineAmount} onChange={(e) => setRuleForm((p) => ({ ...p, flatFineAmount: e.target.value }))} /></div>
              <div className="col-span-2"><label className="text-xs font-medium block mb-1">Replacement % of cost</label><Input type="number" value={ruleForm.replacementPercent} onChange={(e) => setRuleForm((p) => ({ ...p, replacementPercent: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => void handleUpsertRule()}>Save Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}