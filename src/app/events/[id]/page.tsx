"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchEventByUuid,
  submitEventApi,
  approveEventApi,
  rejectEventApi,
  completeEventApi,
  cancelEventApi,
  updateEventApi,
} from "@/lib/api/events";
import { SchoolEvent, SchoolEventStatus, SchoolEventType } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Send, CheckCircle2, XCircle, CheckCheck, Trash2, Loader2, WifiOff, RefreshCw, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/axios-client";

const STATUS_VARIANTS: Record<SchoolEventStatus, string> = {
  DRAFT: "secondary", PENDING_APPROVAL: "warning", PUBLISHED: "success",
  COMPLETED: "info", REJECTED: "destructive", CANCELLED: "destructive",
};

const TYPE_OPTIONS: SchoolEventType[] = ["ACADEMIC", "CULTURAL", "SPORTS", "WORKSHOP", "MEETING", "HOLIDAY", "EXCURSION", "OTHER"];
const AUDIENCE_OPTIONS = ["STUDENTS", "PARENTS", "TEACHERS", "STAFF"];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { session } = useERP();
  const isApprover = session.role === "ADMIN" || session.role === "PRINCIPAL";
  const canCreate = isApprover || session.role === "HR_MANAGER";

  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [form, setForm] = useState({
    title: "", type: "ACADEMIC" as string, eventDate: "", startTime: "09:00",
    endTime: "17:00", allDay: false, venue: "", description: "", organizer: "", audience: [] as string[],
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setIsOffline(false);
    try {
      const e = await fetchEventByUuid(eventId);
      setEvent(e);
      if (!e) setLoadError("The requested event record could not be found.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        setIsOffline(true);
        setLoadError("You are offline — event details are unavailable.");
      } else if (err instanceof ApiError && err.status === 404) {
        setLoadError("The requested event record could not be found.");
      } else if (err instanceof ApiError && err.status === 403) {
        setLoadError("You don't have permission to view this event.");
      } else {
        setLoadError(err instanceof Error ? err.message : "Failed to load event.");
      }
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const doAction = async (key: string, fn: () => Promise<unknown>, okMsg: string) => {
    setBusyKey(key);
    try {
      await fn();
      toast.success(okMsg);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyKey(null);
    }
  };

  const openEdit = () => {
    if (!event) return;
    setForm({
      title: event.title, type: event.type, eventDate: String(event.eventDate).slice(0, 10),
      startTime: event.startTime ?? "09:00", endTime: event.endTime ?? "17:00", allDay: event.allDay,
      venue: event.venue ?? "", description: event.description ?? "", organizer: event.organizer ?? "",
      audience: [...(event.audience ?? [])],
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!event) return;
    if (!form.title.trim() || !form.eventDate) { toast.error("Event name and date are required"); return; }
    setSaving(true);
    try {
      await updateEventApi(event.uuid, {
        title: form.title.trim(),
        type: form.type,
        eventDate: form.eventDate,
        startTime: form.allDay ? null : form.startTime || null,
        endTime: form.allDay ? null : form.endTime || null,
        allDay: form.allDay,
        venue: form.venue.trim() || null,
        description: form.description.trim() || null,
        organizer: form.organizer.trim() || null,
        audience: form.audience,
      });
      toast.success("Event updated");
      setEditOpen(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <Breadcrumbs />
        {isOffline ? (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
            <WifiOff className="h-4 w-4" /> You are offline — reconnect to view this event.
          </div>
        ) : null}
        <EmptyState
          title={loadError === "The requested event record could not be found." ? "Event Not Found" : "Could not load event"}
          description={loadError ?? "The requested event record could not be found."}
          icon={<Calendar className="h-7 w-7" />}
        />
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => void reload()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
          <Button asChild variant="ghost"><Link href="/events" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back to Events</Link></Button>
        </div>
      </div>
    );
  }

  const canEdit = canCreate && event.status !== "COMPLETED" && event.status !== "CANCELLED";
  const canDelete = canCreate && event.status !== "COMPLETED" && event.status !== "CANCELLED" && (event.status !== "PUBLISHED" || isApprover);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      {/* Hero */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-2xl">{event.title.charAt(0)}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{event.title}</h1>
                <Badge variant={STATUS_VARIANTS[event.status] as any} className="text-xs">{event.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {event.type} • {event.audience.length ? `Audience: ${event.audience.join(", ")}` : "All"}
                {event.organizer ? ` • Organizer: ${event.organizer}` : ""}
              </p>
              {event.rejectionReason && (
                <p className="text-[11px] text-rose-600 mt-1">Rejection reason: {event.rejectionReason}</p>
              )}
              {event.approver && event.approvedAt && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Approved by {event.approver.name} on {formatDate(event.approvedAt)}
                </p>
              )}
              {event.creator && (
                <p className="text-[11px] text-muted-foreground mt-1">Created by {event.creator.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {event.status === "DRAFT" && (
              <Button size="sm" variant="gradient" className="gap-1.5" disabled={busyKey === "submit"} onClick={() => void doAction("submit", () => submitEventApi(event.uuid), "Submitted for approval")}>
                {busyKey === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit for Approval
              </Button>
            )}
            {event.status === "PENDING_APPROVAL" && isApprover && (
              <>
                <Button size="sm" variant="default" className="gap-1.5" disabled={busyKey === "approve"} onClick={() => void doAction("approve", () => approveEventApi(event.uuid), "Event published")}>
                  {busyKey === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Approve & Publish
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-rose-600" onClick={() => { setRejectReason(""); setRejectOpen(true); }}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            {event.status === "PUBLISHED" && isApprover && (
              <Button size="sm" variant="default" className="gap-1.5" disabled={busyKey === "complete"} onClick={() => void doAction("complete", () => completeEventApi(event.uuid), "Event completed")}>
                {busyKey === "complete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />} Mark Completed
              </Button>
            )}
            {canEdit && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={openEdit}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Cancel Event
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild><Link href="/events" className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Back</Link></Button>
          </div>
        </div>
      </div>

      {/* Details */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Date</span>
              <span className="text-lg font-bold text-foreground mt-1 block">
                {(() => {
                  const d = new Date(event.eventDate);
                  const wd = d.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
                  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                  const n = new Date();
                  const b = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
                  const diff = Math.round((a - b) / 86400000);
                  const rel = diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : diff === -1 ? "Yesterday" : diff > 1 && diff <= 30 ? `in ${diff} days` : diff < -1 && diff >= -30 ? `${Math.abs(diff)} days ago` : "";
                  return <>{wd}, {formatDate(event.eventDate)}{rel ? <span className="ml-2 text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">{rel}</span> : null}</>;
                })()}
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3" /> Time</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{event.allDay ? "All Day" : `${event.startTime ?? "--"} - ${event.endTime ?? "--"}`}</span>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Venue</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{event.venue || "—"}</span>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Users className="h-3 w-3" /> Audience</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{event.audience.length ? event.audience.join(", ") : "All"}</span>
            </div>
          </div>
          {event.description && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
              <span className="font-bold text-foreground block">Description</span>
              <p className="leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Event</DialogTitle>
            <DialogDescription>Changes are saved to the same event record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Event Name *</label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Annual Sports Day" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Date *</label>
                <Input type="date" value={form.eventDate} onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Start Time</label>
                <Input type="time" value={form.startTime} disabled={form.allDay} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">End Time</label>
                <Input type="time" value={form.endTime} disabled={form.allDay} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            <label className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs">
              <input type="checkbox" checked={form.allDay} onChange={(e) => setForm((p) => ({ ...p, allDay: e.target.checked }))} className="rounded text-primary" />
              All day event
            </label>
            <div>
              <label className="text-xs font-medium block mb-1">Venue</label>
              <Input value={form.venue} onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))} placeholder="Main Ground, Auditorium..." />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Organizer</label>
              <Input value={form.organizer} onChange={(e) => setForm((p) => ({ ...p, organizer: e.target.value }))} placeholder="e.g. HR / Sports Dept" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Audience</label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCE_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input type="checkbox" checked={form.audience.includes(a)} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.checked ? [...p.audience, a] : p.audience.filter((x) => x !== a) }))} className="rounded text-primary" />
                    {a}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Description</label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Event details, schedule, notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="gradient" disabled={saving} onClick={() => void handleSave()}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Cancel this event?</DialogTitle>
            <DialogDescription>It will be marked CANCELLED but stays visible in the list.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Keep event</Button>
            <Button
              variant="destructive"
              disabled={busyKey === "delete"}
              onClick={() => { setDeleteOpen(false); void doAction("delete", () => cancelEventApi(event.uuid), "Event cancelled").then(() => router.push("/events")); }}
            >
              {busyKey === "delete" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Yes, cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject with reason */}
      <Dialog open={rejectOpen} onOpenChange={(o) => { if (!o) setRejectOpen(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Reject event?</DialogTitle>
            <DialogDescription>A reason is required — the creator will see it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium block">Rejection reason *</label>
            <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Venue already booked" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={busyKey === "reject"}
              onClick={() => {
                if (!rejectReason.trim()) { toast.error("Please enter a rejection reason"); return; }
                setRejectOpen(false);
                void doAction("reject", () => rejectEventApi(event.uuid, rejectReason.trim()), "Event rejected");
              }}
            >
              {busyKey === "reject" && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Reject event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
