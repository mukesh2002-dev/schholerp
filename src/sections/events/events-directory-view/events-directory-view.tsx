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
import Link from "next/link";
import { Calendar, List, LayoutGrid, Plus, MapPin, Clock, Send, CheckCircle2, XCircle, CheckCheck, Trash2, Search, Sparkles, ArrowRight, Users } from "lucide-react";
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

// Human-readable helpers: weekday + relative day labels.
function weekdayOf(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" });
  } catch {
    return "";
  }
}

function relativeDayLabel(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const n = new Date();
    const b = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
    const diff = Math.round((a - b) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    if (diff > 1 && diff <= 30) return `in ${diff} days`;
    if (diff < -1 && diff >= -30) return `${Math.abs(diff)} days ago`;
    return null;
  } catch {
    return null;
  }
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
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // Click a calendar date -> modal with that day's events.
  const [selectedDay, setSelectedDay] = useState<{ year: number; month: number; day: number } | null>(null);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => {
        const matchesType = typeFilter === "ALL" || e.type === typeFilter;
        const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
        const matchesSearch =
          !q ||
          e.title.toLowerCase().includes(q) ||
          (e.venue ?? "").toLowerCase().includes(q) ||
          (e.organizer ?? "").toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q);
        return matchesType && matchesStatus && matchesSearch;
      })
      .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
  }, [events, typeFilter, statusFilter, search]);

  // Visible on the public calendar = published + completed
  const calendarEvents = useMemo(() => events.filter((e) => e.status === "PUBLISHED" || e.status === "COMPLETED"), [events]);

  // Spotlight: the next upcoming published event.
  const upNext = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return calendarEvents
      .filter((e) => new Date(e.eventDate).getTime() >= startOfToday)
      .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate))[0] ?? null;
  }, [calendarEvents]);

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

      {upNext && (
        <Link href={`/events/${upNext.uuid}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:from-primary/15 transition-colors">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-primary">
              Up next {relativeDayLabel(upNext.eventDate) ? `— ${relativeDayLabel(upNext.eventDate)}` : ""} · {weekdayOf(upNext.eventDate)}, {formatDate(upNext.eventDate)}
            </span>
            <span className="block truncate text-base font-bold text-foreground">{upNext.title}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {upNext.allDay ? "All day" : `${upNext.startTime} - ${upNext.endTime}`} · {upNext.venue || "Venue TBA"}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events, venue..." className="pl-9 h-9 text-xs w-[200px]" />
          </div>
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
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{getMonthName(currentMonth)} {currentYear}</h3>
                <button
                  type="button"
                  onClick={() => { const n = new Date(); setCurrentMonth(n.getMonth()); setCurrentYear(n.getFullYear()); }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20"
                >
                  Today
                </button>
              </div>
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
                const hasEvents = dayEvents.length > 0;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!hasEvents}
                    onClick={() => hasEvents && setSelectedDay({ year: currentYear, month: currentMonth, day })}
                    title={hasEvents ? `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""} — click to view` : undefined}
                    className={`min-h-[80px] p-1.5 border-r border-b border-border/60 last:border-r-0 text-left transition-colors ${isToday ? "bg-primary/5" : ""} ${hasEvents ? "cursor-pointer hover:bg-primary/10" : "cursor-default"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-xs font-semibold ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground" : "text-foreground"}`}>{day}</span>
                      {hasEvents && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </div>
                    <div className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
                      {dayEvents.slice(0, 2).map((evt) => (
                        <Link key={evt.uuid} href={`/events/${evt.uuid}`} title={`${evt.title} — view details`} className="block rounded px-1.5 py-0.5 text-[10px] font-medium truncate bg-primary/10 text-primary hover:bg-primary/20">
                          {evt.title}
                        </Link>
                      ))}
                      {dayEvents.length > 2 && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedDay({ year: currentYear, month: currentMonth, day })}
                          onKeyDown={(e) => { if (e.key === "Enter") setSelectedDay({ year: currentYear, month: currentMonth, day }); }}
                          className="block px-1 text-[9px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
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
                            <Link href={`/events/${event.uuid}`} className="font-bold text-foreground text-sm truncate hover:text-primary hover:underline">
                              {event.title}
                            </Link>
                            <Badge variant={TYPE_VARIANTS[event.type] as any} className="text-[10px] py-0">{TYPE_LABELS[event.type]}</Badge>
                            <Badge variant={STATUS_VARIANTS[event.status] as any} className="text-[10px] py-0">{event.status.replace("_", " ")}</Badge>
                            {relativeDayLabel(event.eventDate) && (
                              <Badge variant="outline" className="text-[10px] py-0 text-primary border-primary/30 bg-primary/5">
                                {relativeDayLabel(event.eventDate)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {weekdayOf(event.eventDate)}, {formatDate(event.eventDate)}</span>
                            {!event.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.startTime} - {event.endTime}</span>}
                            {event.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.venue}</span>}
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.audience.length ? event.audience.join(", ") : "Everyone"}</span>
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
                        <Link href={`/events/${event.uuid}`} className="font-semibold text-foreground text-sm truncate max-w-[220px] hover:text-primary hover:underline">
                          {event.title}
                        </Link>
                        <span className="text-[10px] text-muted-foreground">{event.organizer || "-"}</span>
                      </TableCell>
                      <TableCell><Badge variant={TYPE_VARIANTS[event.type] as any} className="text-[10px] py-0">{TYPE_LABELS[event.type]}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{weekdayOf(event.eventDate)}, {formatDate(event.eventDate)}</TableCell>
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

      {/* Day detail modal — click a marked calendar date */}
      <Dialog open={!!selectedDay} onOpenChange={(o) => { if (!o) setSelectedDay(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && `${weekdayOf(`${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, "0")}-${String(selectedDay.day).padStart(2, "0")}`)}, ${selectedDay.day} ${getMonthName(selectedDay.month)} ${selectedDay.year}`}
            </DialogTitle>
            <DialogDescription>
              {selectedDay && (() => {
                const list = filteredEvents.filter((e) => isSameDay(e.eventDate, selectedDay.year, selectedDay.month, selectedDay.day));
                return `${list.length} event${list.length === 1 ? "" : "s"} on this date`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selectedDay && filteredEvents
              .filter((e) => isSameDay(e.eventDate, selectedDay.year, selectedDay.month, selectedDay.day))
              .map((evt) => (
                <div key={evt.uuid} className="flex items-start gap-3 p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-extrabold text-sm">
                    {evt.title.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{evt.title}</span>
                      <Badge variant={TYPE_VARIANTS[evt.type] as any} className="text-[10px] py-0">{TYPE_LABELS[evt.type]}</Badge>
                      <Badge variant={STATUS_VARIANTS[evt.status] as any} className="text-[10px] py-0">{evt.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      {!evt.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{evt.startTime} - {evt.endTime}</span>}
                      {evt.allDay && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />All day</span>}
                      {evt.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{evt.venue}</span>}
                    </div>
                    {evt.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{evt.description}</p>}
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 shrink-0" asChild>
                    <Link href={`/events/${evt.uuid}`}>Open <ArrowRight className="h-3 w-3" /></Link>
                  </Button>
                </div>
              ))}
            {selectedDay && filteredEvents.filter((e) => isSameDay(e.eventDate, selectedDay.year, selectedDay.month, selectedDay.day)).length === 0 && (
              <EmptyState title="No events this day" description="Nothing scheduled for this date with the current filters." />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDay(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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