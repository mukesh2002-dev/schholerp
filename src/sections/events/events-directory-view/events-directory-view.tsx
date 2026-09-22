"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import {
  fetchEvents,
  createEventApi,
  updateEventApi,
  submitEventApi,
  approveEventApi,
  rejectEventApi,
  completeEventApi,
  cancelEventApi,
} from "@/lib/api/events";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { SchoolEvent, SchoolEventStatus, SchoolEventType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Calendar, List, LayoutGrid, Plus, MapPin, Clock, Send, CheckCircle2, XCircle, CheckCheck, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_LABELS: Record<SchoolEventType, string> = {
  ACADEMIC: "Academic", CULTURAL: "Cultural", SPORTS: "Sports", WORKSHOP: "Workshop",
  MEETING: "Meeting", HOLIDAY: "Holiday", EXCURSION: "Excursion", OTHER: "Other",
};
const TYPE_VARIANTS: Record<SchoolEventType, string> = {
  ACADEMIC: "info", CULTURAL: "purple", SPORTS: "success", WORKSHOP: "warning",
  MEETING: "secondary", HOLIDAY: "rose", EXCURSION: "info", OTHER: "default",
};
const STATUS_VARIANTS: Record<SchoolEventStatus, string> = {
  DRAFT: "secondary", PENDING_APPROVAL: "warning", PUBLISHED: "success",
  COMPLETED: "info", REJECTED: "destructive", CANCELLED: "destructive",
};
const AUDIENCE_OPTIONS = ["STUDENTS", "PARENTS", "TEACHERS", "STAFF"];
const TYPE_OPTIONS: SchoolEventType[] = ["ACADEMIC", "CULTURAL", "SPORTS", "WORKSHOP", "MEETING", "HOLIDAY", "EXCURSION", "OTHER"];
const DAYS_IN_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function isSameDay(dateStr: string, year: number, month: number, day: number): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}
function getMonthName(month: number): string {
  return new Date(2026, month).toLocaleString("en-US", { month: "long" });
}

export function EventsDirectoryView() {
  const { activeBranchId, session } = useERP();
  const isApprover = session.role === "ADMIN" || session.role === "PRINCIPAL";
  const canCreate = isApprover || session.role === "HR_MANAGER";

  const {
    data: events,
    isOffline,
    error,
    isLoading,
    refresh: refreshEvents,
  } = useCampusData<SchoolEvent[]>({
    fetcher: (cid) => fetchEvents({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "events",
  });

  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
        const matchesType = typeFilter === "ALL" || e.type === typeFilter;
        const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
        return matchesType && matchesStatus;
      }),
    [events, typeFilter, statusFilter]
  );

  // Visible on the public calendar = published + completed
  const calendarEvents = useMemo(() => events.filter((e) => e.status === "PUBLISHED" || e.status === "COMPLETED"), [events]);

  // ── Create / edit dialog ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolEvent | null>(null);
  const [form, setForm] = useState({
    title: "", type: "ACADEMIC", eventDate: new Date().toISOString().split("T")[0],
    startTime: "09:00", endTime: "17:00", allDay: false, venue: "",
    description: "", organizer: "", audience: [] as string[],
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", type: "ACADEMIC", eventDate: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00", allDay: false, venue: "", description: "", organizer: "", audience: [] });
    setDialogOpen(true);
  };
  const openEdit = (e: SchoolEvent) => {
    setEditing(e);
    setForm({
      title: e.title, type: e.type, eventDate: String(e.eventDate).slice(0, 10),
      startTime: e.startTime ?? "09:00", endTime: e.endTime ?? "17:00", allDay: e.allDay,
      venue: e.venue ?? "", description: e.description ?? "", organizer: e.organizer ?? "",
      audience: [...e.audience],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.eventDate) { toast.error("Event name and date are required"); return; }
    const payload = {
      title: form.title.trim(),
      type: form.type,
      eventDate: form.eventDate,
      startTime: form.allDay ? null : form.startTime,
      endTime: form.allDay ? null : form.endTime,
      allDay: form.allDay,
      venue: form.venue || null,
      description: form.description || null,
      organizer: form.organizer || null,
      audience: form.audience,
    };
    try {
      if (editing) {
        await updateEventApi(editing.uuid, payload);
        toast.success("Event updated");
      } else {
        await createEventApi(payload, activeBranchId !== "all" ? activeBranchId : undefined);
        toast.success("Event saved as draft");
      }
      setDialogOpen(false);
      void refreshEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save event");
    }
  };

  const doAction = async (fn: () => Promise<unknown>, okMsg: string) => {
    try {
      await fn();
      toast.success(okMsg);
      void refreshEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); } else { setCurrentMonth((m) => m - 1); }
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); } else { setCurrentMonth((m) => m + 1); }
  };

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={isOffline} error={error} isLoading={isLoading} />

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.keys(STATUS_VARIANTS).map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button size="sm" variant="gradient" className="h-9 text-xs gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Create Event
          </Button>
        )}
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="calendar" className="gap-1.5 text-xs"><LayoutGrid className="h-3.5 w-3.5" /> <span>Calendar</span></TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5 text-xs"><List className="h-3.5 w-3.5" /> <span>List</span></TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5 text-xs"><Calendar className="h-3.5 w-3.5" /> <span>All Events</span></TabsTrigger>
        </TabsList>

        {/* Calendar (published + completed only) */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/70">
              <button type="button" onClick={prevMonth} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground">Prev</button>
              <h3 className="text-sm font-bold text-foreground">{getMonthName(currentMonth)} {currentYear}</h3>
              <button type="button" onClick={nextMonth} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground">Next</button>
            </div>
            <div className="grid grid-cols-7 border-b border-border/70">
              {DAYS_IN_WEEK.map((d) => <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/60 last:border-r-0">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="min-h-[80px] border-r border-b border-border/60 last:border-r-0 bg-muted/20" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
                const dayEvents = calendarEvents.filter((e) => isSameDay(e.eventDate, currentYear, currentMonth, day));
                return (
                  <div key={day} className={`min-h-[80px] p-1.5 border-r border-b border-border/60 last:border-r-0 ${isToday ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                    <div className={`text-xs font-semibold mb-1 ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground" : "text-foreground"}`}>{day}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <div key={evt.uuid} className="block rounded px-1.5 py-0.5 text-[10px] font-medium truncate bg-primary/10 text-primary">{evt.title}</div>
                      ))}
                      {dayEvents.length > 2 && <span className="block px-1 text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* List view */}
        <TabsContent value="list" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <EmptyState title="No Events Found" description="No events matched your current filter criteria." icon={<Calendar className="h-7 w-7" />} />
          ) : (
            <div className="grid gap-3">
              {filteredEvents.map((event) => (
                <Card key={event.uuid} className="border-border/80 shadow-xs">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-sm">{event.title.charAt(0)}</div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-foreground text-sm truncate">{event.title}</h3>
                            <Badge variant={TYPE_VARIANTS[event.type] as any} className="text-[10px] py-0">{TYPE_LABELS[event.type]}</Badge>
                            <Badge variant={STATUS_VARIANTS[event.status] as any} className="text-[10px] py-0">{event.status.replace("_", " ")}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(event.eventDate)}</span>
                            {!event.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.startTime} - {event.endTime}</span>}
                            {event.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.venue}</span>}
                            <span className="flex items-center gap-1">{event.audience.length ? event.audience.join(" · ") : "All"}</span>
                          </div>
                          {event.description && <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {event.status === "DRAFT" && <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => void doAction(() => submitEventApi(event.uuid), "Submitted for approval")}><Send className="h-3 w-3" /> Submit</Button>}
                        {event.status === "PENDING_APPROVAL" && isApprover && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] text-emerald-600" onClick={() => void doAction(() => approveEventApi(event.uuid), "Event published")}><CheckCircle2 className="h-3 w-3" /> Approve</Button>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] text-rose-600" onClick={() => void doAction(() => rejectEventApi(event.uuid, "Rejected"), "Event rejected")}><XCircle className="h-3 w-3" /> Reject</Button>
                          </>
                        )}
                        {event.status === "PUBLISHED" && isApprover && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => void doAction(() => completeEventApi(event.uuid), "Event completed")}><CheckCheck className="h-3 w-3" /> Complete</Button>
                        )}
                        {canCreate && event.status !== "COMPLETED" && event.status !== "CANCELLED" && (
                          <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => openEdit(event)}>Edit</Button>
                        )}
                        {canCreate && event.status !== "COMPLETED" && event.status !== "CANCELLED" && (event.status !== "PUBLISHED" || isApprover) && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Cancel / delete event" onClick={() => void doAction(() => cancelEventApi(event.uuid), "Event cancelled")}><Trash2 className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Table view */}
        <TabsContent value="all" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <EmptyState title="No Events Found" description="No events matched your current filter criteria." icon={<Calendar className="h-7 w-7" />} />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.uuid} className="hover:bg-muted/40">
                      <TableCell>
                        <span className="font-semibold text-foreground text-sm block truncate max-w-[220px]">{event.title}</span>
                        <span className="text-[10px] text-muted-foreground">{event.organizer || "—"}</span>
                      </TableCell>
                      <TableCell><Badge variant={TYPE_VARIANTS[event.type] as any} className="text-[10px] py-0">{TYPE_LABELS[event.type]}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(event.eventDate)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{event.allDay ? "All Day" : `${event.startTime} - ${event.endTime}`}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{event.venue || "-"}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{event.audience.length ? event.audience.join(", ") : "All"}</TableCell>
                      <TableCell><Badge variant={STATUS_VARIANTS[event.status] as any} className="text-[10px] py-0">{event.status.replace("_", " ")}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editing ? "Edit Event" : "Create Event"}</DialogTitle>
            <DialogDescription>Create → submit → principal approves → published on calendar → completed.</DialogDescription>
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
                  <SelectContent>{TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>)}</SelectContent>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={() => void handleSave()}>{editing ? "Save Changes" : "Save Event (Draft)"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}