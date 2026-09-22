"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchEventByUuid,
  submitEventApi,
  approveEventApi,
  rejectEventApi,
  completeEventApi,
  cancelEventApi,
} from "@/lib/api/events";
import { SchoolEvent, SchoolEventStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Send, CheckCircle2, XCircle, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_VARIANTS: Record<SchoolEventStatus, string> = {
  DRAFT: "secondary", PENDING_APPROVAL: "warning", PUBLISHED: "success",
  COMPLETED: "info", REJECTED: "destructive", CANCELLED: "destructive",
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { session } = useERP();
  const isApprover = session.role === "ADMIN" || session.role === "PRINCIPAL";
  const canCreate = isApprover || session.role === "HR_MANAGER";

  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const e = await fetchEventByUuid(eventId).catch(() => null);
    setEvent(e);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, [eventId]);

  const doAction = async (fn: () => Promise<unknown>, okMsg: string) => {
    try {
      await fn();
      toast.success(okMsg);
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Calendar className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Event Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">The requested event record could not be found.</p>
        <Button asChild variant="outline"><Link href="/events">Back to Events</Link></Button>
      </div>
    );
  }

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
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {event.status === "DRAFT" && (
              <Button size="sm" variant="gradient" className="gap-1.5" onClick={() => void doAction(() => submitEventApi(event.uuid), "Submitted for approval")}>
                <Send className="h-4 w-4" /> Submit for Approval
              </Button>
            )}
            {event.status === "PENDING_APPROVAL" && isApprover && (
              <>
                <Button size="sm" variant="default" className="gap-1.5 text-emerald-600" onClick={() => void doAction(() => approveEventApi(event.uuid), "Event published")}>
                  <CheckCircle2 className="h-4 w-4" /> Approve & Publish
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-rose-600" onClick={() => void doAction(() => rejectEventApi(event.uuid, "Rejected by principal"), "Event rejected")}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            {event.status === "PUBLISHED" && isApprover && (
              <Button size="sm" variant="default" className="gap-1.5" onClick={() => void doAction(() => completeEventApi(event.uuid), "Event completed")}>
                <CheckCheck className="h-4 w-4" /> Mark Completed
              </Button>
            )}
            {event.status === "DRAFT" && canCreate && (
              <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={() => void doAction(() => cancelEventApi(event.uuid), "Event cancelled")}>
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
              <span className="text-lg font-bold text-foreground mt-1 block">{formatDate(event.eventDate)}</span>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1"><Clock className="h-3 w-3" /> Time</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{event.allDay ? "All Day" : `${event.startTime} - ${event.endTime}`}</span>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1"><MapPin className="h-3 w-3" /> Venue</span>
              <span className="text-lg font-bold text-foreground mt-1 block">{event.venue || "—"}</span>
            </div>
            <div className="p-4 rounded-xl border border-border/70 bg-card">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1"><Users className="h-3 w-3" /> Audience</span>
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
    </div>
  );
}