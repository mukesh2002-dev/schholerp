"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { CalendarEvent, EventCategory, EventStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  List,
  LayoutGrid,
  MapPin,
  Users,
  Clock,
  Eye,
  Tag,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const categoryBadgeVariant: Record<EventCategory, "default" | "success" | "warning" | "info" | "destructive" | "purple" | "rose" | "secondary"> = {
  ACADEMIC: "info",
  CULTURAL: "purple",
  SPORTS: "success",
  WORKSHOP: "warning",
  MEETING: "secondary",
  HOLIDAY: "rose",
  EXCURSION: "info",
  OTHER: "default",
};

const statusBadgeVariant: Record<EventStatus, "default" | "success" | "warning" | "info" | "destructive"> = {
  UPCOMING: "info",
  ONGOING: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const categoryLabels: Record<EventCategory, string> = {
  ACADEMIC: "Academic",
  CULTURAL: "Cultural",
  SPORTS: "Sports",
  WORKSHOP: "Workshop",
  MEETING: "Meeting",
  HOLIDAY: "Holiday",
  EXCURSION: "Excursion",
  OTHER: "Other",
};

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
  const { activeBranchId } = useERP();
  const [events] = useState<CalendarEvent[]>(() => mockDb.getEvents(activeBranchId) || []);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
      const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [events, categoryFilter, statusFilter]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const today = new Date();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="ACADEMIC">Academic</SelectItem>
              <SelectItem value="CULTURAL">Cultural</SelectItem>
              <SelectItem value="SPORTS">Sports</SelectItem>
              <SelectItem value="WORKSHOP">Workshop</SelectItem>
              <SelectItem value="MEETING">Meeting</SelectItem>
              <SelectItem value="HOLIDAY">Holiday</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ONGOING">Ongoing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="calendar" className="gap-1.5 text-xs">
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Calendar View</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5 text-xs">
            <List className="h-3.5 w-3.5" />
            <span>List View</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            <span>All Events Table</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/70">
              <button
                type="button"
                onClick={prevMonth}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Prev
              </button>
              <h3 className="text-sm font-bold text-foreground">
                {getMonthName(currentMonth)} {currentYear}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-border/70">
              {DAYS_IN_WEEK.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/60 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] border-r border-b border-border/60 last:border-r-0 bg-muted/20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday =
                  today.getFullYear() === currentYear &&
                  today.getMonth() === currentMonth &&
                  today.getDate() === day;
                const dayEvents = filteredEvents.filter(
                  (e) =>
                    isSameDay(e.startDate, currentYear, currentMonth, day) ||
                    isSameDay(e.endDate, currentYear, currentMonth, day)
                );
                return (
                  <div
                    key={day}
                    className={`min-h-[80px] p-1.5 border-r border-b border-border/60 last:border-r-0 ${isToday ? "bg-primary/5" : "hover:bg-muted/30"} transition-colors`}
                  >
                    <div
                      className={`text-xs font-semibold mb-1 ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground" : "text-foreground"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((evt) => (
                        <Link
                          key={evt.id}
                          href={`/events/${evt.id}`}
                          className="block rounded px-1.5 py-0.5 text-[10px] font-medium truncate bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {evt.title}
                        </Link>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="block px-1 text-[9px] text-muted-foreground">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No Events Found"
              description="No events matched your current filter criteria."
              icon={<Calendar className="h-7 w-7" />}
            />
          ) : (
            <div className="grid gap-3">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="border-border/80 shadow-xs hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-extrabold text-sm">
                            {event.title.charAt(0)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                                {event.title}
                              </h3>
                              <Badge variant={categoryBadgeVariant[event.category]} className="text-[10px] py-0">
                                {categoryLabels[event.category]}
                              </Badge>
                              <Badge variant={statusBadgeVariant[event.status]} className="text-[10px] py-0">
                                {event.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(event.startDate)}
                                {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.startTime} - {event.endTime}
                              </span>
                              {event.venueName && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.venueName}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.participantCount}
                                {event.maxParticipants && ` / ${event.maxParticipants}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div className="hidden sm:flex flex-col items-end gap-0.5">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Eye className="h-3 w-3" />
                              {(event.visibility || "").replace("_", " ")}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {event.organizer}
                            </span>
                          </div>
                          {event.tags && event.tags.length > 0 && (
                            <div className="hidden lg:flex items-center gap-1">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {event.tags.slice(0, 2).join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <EmptyState
              title="No Events Found"
              description="No events matched your current filter criteria."
              icon={<Calendar className="h-7 w-7" />}
            />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/40">
                      <TableCell>
                        <Link
                          href={`/events/${event.id}`}
                          className="flex items-center gap-3 min-w-0 group"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {event.title.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors block truncate max-w-[200px]">
                              {event.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {event.organizer}
                            </span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryBadgeVariant[event.category]} className="text-[10px] py-0">
                          {categoryLabels[event.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(event.startDate)}
                        {event.startDate !== event.endDate && (
                          <span className="block text-[10px]">
                            to {formatDate(event.endDate)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {event.allDay ? "All Day" : `${event.startTime} - ${event.endTime}`}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {event.venueName || "-"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium text-foreground">
                          {event.participantCount}
                        </span>
                        {event.maxParticipants && (
                          <span className="text-muted-foreground">
                            /{event.maxParticipants}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant[event.status]} className="text-[10px] py-0">
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {(event.visibility || "").replace("_", " ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
