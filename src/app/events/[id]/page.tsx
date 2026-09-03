"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { mockDb } from "@/lib/services/mock-db";
import { CalendarEvent, EventCategory, EventStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  Tag,
  Bell,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Globe,
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

const channelLabels: Record<string, string> = {
  IN_APP: "In-App",
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
};

function formatRemindBefore(minutes: number): string {
  if (minutes < 60) return `${minutes} min before`;
  if (minutes < 1440) return `${minutes / 60} hour(s) before`;
  return `${minutes / 1440} day(s) before`;
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event] = useState<CalendarEvent | undefined>(() => mockDb.getEventById(eventId));

  if (!event) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <Calendar className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Event Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested event record could not be found.
        </p>
        <Button asChild variant="outline">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const participantPercentage = event.maxParticipants
    ? Math.round((event.participantCount / event.maxParticipants) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-extrabold text-2xl">
              {event.title.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={categoryBadgeVariant[event.category]} className="text-[10px]">
                  {categoryLabels[event.category]}
                </Badge>
                <Badge variant={statusBadgeVariant[event.status]} className="text-[10px]">
                  {event.status}
                </Badge>
                {event.allDay && (
                  <Badge variant="outline" className="text-[10px]">All Day</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {event.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {event.branchName}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/events" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Calendar className="h-3 w-3" />
              Start Date
            </span>
            <span className="font-bold text-foreground text-sm">{formatDate(event.startDate)}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Calendar className="h-3 w-3" />
              End Date
            </span>
            <span className="font-bold text-foreground text-sm">{formatDate(event.endDate)}</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <Clock className="h-3 w-3" />
              Time
            </span>
            <span className="font-bold text-foreground text-sm">
              {event.allDay ? "All Day" : `${event.startTime} - ${event.endTime}`}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mb-1">
              <MapPin className="h-3 w-3" />
              Venue
            </span>
            <span className="font-bold text-foreground text-sm">{event.venueName || "TBD"}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="participants" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Participants</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            <span>Reminders</span>
            {event.reminders.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
                {event.reminders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Event Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Event Title</span>
                    <span className="font-bold text-foreground text-sm">{event.title}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Category</span>
                    <span className="font-bold text-foreground text-sm">{categoryLabels[event.category]}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Branch</span>
                    <span className="font-bold text-foreground text-sm">{event.branchName}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Status</span>
                    <Badge variant={statusBadgeVariant[event.status]} className="text-[10px]">
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground block mb-0.5">Description</span>
                  <p className="text-foreground text-sm leading-relaxed">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Name</span>
                      <span className="font-bold text-foreground text-sm">{event.organizer}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground block mb-0.5">Role</span>
                      <span className="font-bold text-foreground text-sm">{event.organizerRole}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Visible To</span>
                    <span className="font-bold text-foreground text-sm">
                      {event.visibility.replace("_", " ")}
                    </span>
                  </div>
                  {event.tags && event.tags.length > 0 && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-muted-foreground flex items-center gap-1 mb-1.5">
                        <Tag className="h-3 w-3" />
                        Tags
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Participant Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Registered</span>
                    <span className="font-bold text-foreground text-lg">{event.participantCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Capacity</span>
                    <span className="font-bold text-foreground text-lg">{event.maxParticipants || "Unlimited"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Target Audience</span>
                    <span className="font-bold text-foreground text-sm">{event.participantType}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <span className="text-muted-foreground block mb-0.5">Fill Rate</span>
                    <span className="font-bold text-foreground text-sm">
                      {event.maxParticipants ? `${participantPercentage}%` : "N/A"}
                    </span>
                  </div>
                </div>
                {event.maxParticipants && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-muted-foreground text-[11px] font-semibold">Capacity Progress</span>
                      <span className="font-bold text-foreground text-xs">{participantPercentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(participantPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {event.classNames && event.classNames.length > 0 && (
              <Card className="border-border/80 shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Applicable Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.classNames.map((cls) => (
                      <Badge key={cls} variant="outline" className="text-xs">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          {event.reminders.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                <Bell className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No Reminders Set</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                No reminders have been configured for this event.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-border/70">
                <h3 className="text-sm font-bold text-foreground">
                  {event.reminders.length} Reminder(s) Configured
                </h3>
              </div>
              <div className="divide-y divide-border/70">
                {event.reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          reminder.sent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {reminder.sent ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground text-sm block">
                          {channelLabels[reminder.channel] || reminder.channel}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatRemindBefore(reminder.remindBefore)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={reminder.sent ? "success" : "secondary"}
                      className="text-[10px] py-0"
                    >
                      {reminder.sent ? "Sent" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
