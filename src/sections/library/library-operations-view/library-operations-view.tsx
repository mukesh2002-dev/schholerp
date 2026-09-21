"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchPurchaseRequests,
  createPurchaseRequestApi,
  reviewPurchaseRequestApi,
  receivePurchaseRequestApi,
  fetchAnnouncements,
  createAnnouncementApi,
  publishAnnouncementApi,
  fetchRules,
  createRuleApi,
  toggleRuleApi,
} from "@/lib/api/library";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { BookPurchaseRequest, LibraryAnnouncement, LibraryRule } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Megaphone, ScrollText, Plus, CheckCircle2, XCircle, Send, CalendarClock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const RULE_CATEGORIES = ["GENERAL", "BORROWING", "FINE_POLICY", "CONDUCT", "DIGITAL", "MEMBERSHIP", "TIMINGS", "DAMAGE"];

export function LibraryOperationsView() {
  const { activeBranchId } = useERP();

  const {
    data: purchaseRequests,
    isOffline,
    error,
    isLoading,
    refresh: refreshRequests,
  } = useCampusData<BookPurchaseRequest[]>({
    fetcher: (cid) => fetchPurchaseRequests({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "library-purchase-requests",
  });
  const { data: announcements, refresh: refreshAnnouncements } = useCampusData<LibraryAnnouncement[]>({
    fetcher: (cid) => fetchAnnouncements({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "library-announcements",
  });
  const { data: rules, refresh: refreshRules } = useCampusData<LibraryRule[]>({
    fetcher: (cid) => fetchRules({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "library-rules",
  });

  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ title: "", author: "", isbn: "", quantity: "1", estimatedPrice: "400", priority: "NORMAL", reason: "" });
  const [annOpen, setAnnOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", content: "", type: "GENERAL", priority: "NORMAL", published: true });
  const [ruleOpen, setRuleOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({ category: "BORROWING", title: "", description: "", severity: "INFO" });

  const handleCreateRequest = async () => {
    if (!reqForm.title.trim() || !reqForm.reason.trim()) { toast.error("Title and reason are required"); return; }
    try {
      await createPurchaseRequestApi(
        {
          title: reqForm.title.trim(),
          author: reqForm.author || null,
          isbn: reqForm.isbn || null,
          quantity: Number(reqForm.quantity) || 1,
          estimatedPrice: Number(reqForm.estimatedPrice) || 0,
          priority: reqForm.priority,
          reason: reqForm.reason,
        },
        activeBranchId !== "all" ? activeBranchId : undefined
      );
      toast.success(`Purchase request created`);
      setReqOpen(false);
      void refreshRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create request");
    }
  };

  const handleReviewRequest = async (req: BookPurchaseRequest, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewPurchaseRequestApi(req.uuid, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      void refreshRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update request");
    }
  };

  const handleReceiveRequest = async (req: BookPurchaseRequest) => {
    try {
      await receivePurchaseRequestApi(req.uuid, { receivedQuantity: req.quantity, vendorName: "To be filled" });
      toast.success(`Request "${req.requestNumber}" marked received`);
      void refreshRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark received");
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!annForm.title.trim() || !annForm.content.trim()) { toast.error("Title and content are required"); return; }
    try {
      await createAnnouncementApi(
        {
          title: annForm.title.trim(),
          content: annForm.content,
          type: annForm.type,
          priority: annForm.priority,
          published: annForm.published,
        },
        activeBranchId !== "all" ? activeBranchId : undefined
      );
      toast.success(`Announcement ${annForm.published ? "published" : "saved as draft"}`);
      setAnnOpen(false);
      void refreshAnnouncements();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create announcement");
    }
  };

  const handleCreateRule = async () => {
    if (!ruleForm.title.trim() || !ruleForm.description.trim()) { toast.error("Title and description are required"); return; }
    try {
      await createRuleApi(
        {
          category: ruleForm.category,
          title: ruleForm.title.trim(),
          description: ruleForm.description,
          severity: ruleForm.severity,
          sortOrder: rules.filter((r) => r.category === ruleForm.category).length + 1,
        },
        activeBranchId !== "all" ? activeBranchId : undefined
      );
      toast.success("Library rule added");
      setRuleOpen(false);
      void refreshRules();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add rule");
    }
  };

  const groupedRules = RULE_CATEGORIES
    .map((c) => ({ category: c, items: rules.filter((r) => r.category === c) }))
    .filter((g) => g.items.length > 0 || g.category === "TIMINGS");

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={isOffline} error={error} isLoading={isLoading} />

      {/* Purchase requests */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" /> Purchase Requests
            </CardTitle>
            <CardDescription>Librarians request new books — admins approve, reject, and mark received.</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setReqOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New Request
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pt-1">
          {purchaseRequests.length === 0 ? (
            <div className="p-5 text-center rounded-xl border border-dashed text-xs text-muted-foreground">No purchase requests yet.</div>
          ) : (
            <div className="space-y-2">
              {purchaseRequests.map((r) => (
                <div key={r.uuid} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-border/70 bg-card">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.title}</span>
                      <Badge variant={r.status === "RECEIVED" || r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "destructive" : r.status === "PENDING" ? "warning" : "secondary"} className="text-[10px]">{r.status}</Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">{r.requestNumber}</Badge>
                      <Badge variant={r.priority === "URGENT" || r.priority === "HIGH" ? "destructive" : "secondary"} className="text-[10px]">{r.priority}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.author || "—"} • qty {r.quantity} • {r.estimatedPrice ? `${formatCurrency(r.estimatedPrice)}/copy` : "price TBD"} • {r.reason}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.status === "PENDING" || r.status === "UNDER_REVIEW" ? (
                      <>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] text-emerald-600" onClick={() => void handleReviewRequest(r, "APPROVED")}><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] text-rose-600" onClick={() => void handleReviewRequest(r, "REJECTED")}><XCircle className="h-3 w-3" /> Reject</Button>
                      </>
                    ) : r.status === "APPROVED" ? (
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => void handleReceiveRequest(r)}>Mark Received</Button>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Done</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Library Announcements
            </CardTitle>
            <CardDescription>New arrivals, closures, events and reminders for students & staff.</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setAnnOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Post Notice
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 pt-1">
          {announcements.length === 0 ? (
            <div className="p-5 text-center rounded-xl border border-dashed text-xs text-muted-foreground">No announcements yet.</div>
          ) : (
            announcements.slice(0, 8).map((a) => (
              <div key={a.uuid} className="p-3 rounded-xl border border-border/70 bg-card flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{a.title}</span>
                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                    {a.isPinned && <Badge variant="secondary" className="text-[10px]">Pinned</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{a.content}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!a.publishedAt && (
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => void publishAnnouncementApi(a.uuid).then(() => { toast.success("Published"); void refreshAnnouncements(); })}><Send className="h-3 w-3" /> Publish</Button>
                  )}
                  {a.publishedAt && <Badge variant="success" className="text-[10px]">Live</Badge>}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Rules & regulations */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-primary" /> Library Rules & Regulations
            </CardTitle>
            <CardDescription>Borrowing policies, fines, conduct and timings visible to students & parents.</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setRuleOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-1 text-xs">
          {groupedRules.map((g) => (
            <div key={g.category} className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1"><CalendarClock className="h-3 w-3 text-primary" /> {g.category}</div>
              {g.items.length === 0 ? (
                <div className="text-muted-foreground text-[11px] mt-1">No rules in this category.</div>
              ) : (
                <ul className="mt-1 space-y-1">
                  {g.items.map((r) => (
                    <li key={r.uuid} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">• {r.title} — {r.description}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={r.severity === "STRICT" ? "destructive" : r.severity === "WARNING" ? "warning" : "secondary"} className="text-[10px]">{r.severity}</Badge>
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[11px]" onClick={() => void toggleRuleApi(r.uuid).then(() => void refreshRules())}>{r.isActive ? "Disable" : "Enable"}</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Purchase request dialog */}
      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">New Book Purchase Request</DialogTitle>
            <DialogDescription>Request a new book for the library — admin will approve & procure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Book Title *</label><Input value={reqForm.title} onChange={(e) => setReqForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. NCERT Physics Class 10" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium block mb-1">Author</label><Input value={reqForm.author} onChange={(e) => setReqForm((p) => ({ ...p, author: e.target.value }))} /></div>
              <div><label className="text-xs font-medium block mb-1">ISBN</label><Input value={reqForm.isbn} onChange={(e) => setReqForm((p) => ({ ...p, isbn: e.target.value }))} /></div>
              <div><label className="text-xs font-medium block mb-1">Quantity</label><Input type="number" value={reqForm.quantity} onChange={(e) => setReqForm((p) => ({ ...p, quantity: e.target.value }))} /></div>
              <div><label className="text-xs font-medium block mb-1">Est. Price (₹)</label><Input type="number" value={reqForm.estimatedPrice} onChange={(e) => setReqForm((p) => ({ ...p, estimatedPrice: e.target.value }))} /></div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Priority</label>
              <Select value={reqForm.priority} onValueChange={(v) => setReqForm((p) => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["NORMAL", "HIGH", "URGENT", "LOW"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium block mb-1">Reason *</label><Textarea rows={2} value={reqForm.reason} onChange={(e) => setReqForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Required for Grade 10 new syllabus..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => void handleCreateRequest()}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement dialog */}
      <Dialog open={annOpen} onOpenChange={setAnnOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Post Library Announcement</DialogTitle>
            <DialogDescription>New arrival, closure, event or reminder for students & staff.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div><label className="text-xs font-medium block mb-1">Title *</label><Input value={annForm.title} onChange={(e) => setAnnForm((p) => ({ ...p, title: e.target.value }))} placeholder="50 New Science Books Added!" /></div>
            <div>
              <label className="text-xs font-medium block mb-1">Type</label>
              <Select value={annForm.type} onValueChange={(v) => setAnnForm((p) => ({ ...p, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GENERAL", "NEW_ARRIVAL", "EVENT", "CLOSURE", "OVERDUE_REMINDER", "RULE_CHANGE", "MAINTENANCE"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-medium block mb-1">Content *</label><Textarea rows={3} value={annForm.content} onChange={(e) => setAnnForm((p) => ({ ...p, content: e.target.value }))} /></div>
            <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs">
              <input type="checkbox" checked={annForm.published} onChange={(e) => setAnnForm((p) => ({ ...p, published: e.target.checked }))} className="rounded text-primary" />
              Publish immediately (unchecked = save as draft)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => void handleCreateAnnouncement()}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add rule dialog */}
      <Dialog open={ruleOpen} onOpenChange={setRuleOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Library Rule</DialogTitle>
            <DialogDescription>Borrowing policy, fine policy, conduct, timings or damage rule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Category</label>
                <Select value={ruleForm.category} onValueChange={(v) => setRuleForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RULE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Severity</label>
                <Select value={ruleForm.severity} onValueChange={(v) => setRuleForm((p) => ({ ...p, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["INFO", "WARNING", "STRICT"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs font-medium block mb-1">Title *</label><Input value={ruleForm.title} onChange={(e) => setRuleForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Maximum Books" /></div>
            <div><label className="text-xs font-medium block mb-1">Description *</label><Textarea rows={2} value={ruleForm.description} onChange={(e) => setRuleForm((p) => ({ ...p, description: e.target.value }))} placeholder="Each student can borrow a maximum of 3 books at a time." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => void handleCreateRule()}>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}