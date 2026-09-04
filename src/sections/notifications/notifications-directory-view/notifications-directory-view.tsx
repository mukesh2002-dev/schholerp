"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Notification, NotificationPreference, NotificationCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  BookOpen,
  CreditCard,
  Bus,
  MessageSquare,
  UserX,
  Settings,
  Calendar,
  CheckCircle2,
  Eye,
  X,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const categoryConfig: Record<NotificationCategory, { label: string; color: string; icon: React.ReactNode }> = {
  ACADEMIC: {
    label: "Academic",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  FINANCE: {
    label: "Finance",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: <CreditCard className="h-3.5 w-3.5" />,
  },
  TRANSPORT: {
    label: "Transport",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <Bus className="h-3.5 w-3.5" />,
  },
  EVENT: {
    label: "Event",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  ATTENDANCE: {
    label: "Attendance",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: <UserX className="h-3.5 w-3.5" />,
  },
  SYSTEM: {
    label: "System",
    color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    icon: <Settings className="h-3.5 w-3.5" />,
  },
  MESSAGE: {
    label: "Message",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: <MessageSquare className="h-3.5 w-3.5" />,
  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  URGENT: { label: "Urgent", color: "bg-red-500" },
  HIGH: { label: "High", color: "bg-amber-500" },
  NORMAL: { label: "Normal", color: "bg-sky-500" },
  LOW: { label: "Low", color: "bg-gray-400" },
};

const allCategories: NotificationCategory[] = ["ACADEMIC", "FINANCE", "TRANSPORT", "EVENT", "ATTENDANCE", "SYSTEM", "MESSAGE"];

const channelLabels: { key: string; label: string }[] = [
  { key: "inApp", label: "In-App" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "whatsapp", label: "WhatsApp" },
];

export function NotificationsDirectoryView() {
  const { activeBranchId } = useERP();
  const [notifications, setNotifications] = useState(() => mockDb.getNotifications(activeBranchId) || []);
  const [preferences, setPreferences] = useState(() => mockDb.getNotificationPreferences() || []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const refreshList = () => {
    setNotifications(mockDb.getNotifications(activeBranchId) || []);
  };

  const handleMarkRead = (id: string) => {
    mockDb.markNotificationRead(id);
    toast.success("Notification marked as read");
    refreshList();
  };

  const handleDismiss = (id: string) => {
    mockDb.archiveNotification(id);
    toast.info("Notification dismissed");
    refreshList();
  };

  const handleTogglePref = (category: NotificationCategory, channel: "inApp" | "email" | "sms" | "whatsapp") => {
    const existing = preferences.find((p) => p.category === category);
    if (!existing) return;
    const updated: NotificationPreference = { ...existing, [channel]: !existing[channel] };
    mockDb.saveNotificationPreference(updated);
    setPreferences((prev) => prev.map((p) => (p.category === category ? updated : p)));
    toast.success(`Preference updated for ${category}`);
  };

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all" className="gap-1.5 text-xs">
          <Bell className="h-3.5 w-3.5" />
          All Notifications ({notifications.length})
        </TabsTrigger>
        <TabsTrigger value="unread" className="gap-1.5 text-xs">
          <Eye className="h-3.5 w-3.5" />
          Unread
          {unreadCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] h-4 min-w-4 flex items-center justify-center px-1 font-bold">
              {unreadCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="preferences" className="gap-1.5 text-xs">
          <Settings className="h-3.5 w-3.5" />
          Delivery Preferences
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          {notifications.length === 0 ? (
            <EmptyState
              title="No Notifications"
              description="You have no notifications at this time. They will appear here when new alerts arrive."
              icon={<Bell className="h-7 w-7" />}
            />
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.map((n) => {
                const cat = categoryConfig[n.category] || categoryConfig.SYSTEM;
                const pri = priorityConfig[n.priority] || priorityConfig.NORMAL;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-4 sm:p-5 transition-colors ${
                      n.isRead ? "bg-background" : "bg-muted/30"
                    } hover:bg-muted/50`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.color} border`}>
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`text-sm font-semibold leading-tight ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                            {n.title}
                          </h3>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`h-1.5 w-1.5 rounded-full ${pri.color}`} title={pri.label} />
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed ${n.isRead ? "text-muted-foreground" : "text-foreground/80"}`}>
                        {n.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] border ${cat.color}`}>
                          {cat.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {n.actionLabel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => handleMarkRead(n.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[11px] px-2.5 text-muted-foreground"
                          onClick={() => handleMarkRead(n.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2.5 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDismiss(n.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="unread">
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          {notifications.filter((n) => !n.isRead).length === 0 ? (
            <EmptyState
              title="No Unread Notifications"
              description="All caught up! You have no unread notifications."
              icon={<CheckCheck className="h-7 w-7" />}
            />
          ) : (
            <div className="divide-y divide-border/60">
              {notifications.filter((n) => !n.isRead).map((n) => {
                const cat = categoryConfig[n.category] || categoryConfig.SYSTEM;
                const pri = priorityConfig[n.priority] || priorityConfig.NORMAL;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 p-4 sm:p-5 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.color} border`}>
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold leading-tight text-foreground">
                            {n.title}
                          </h3>
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        </div>
                        <span className={`h-1.5 w-1.5 rounded-full ${pri.color} shrink-0`} title={pri.label} />
                      </div>

                      <p className="text-xs leading-relaxed text-foreground/80">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] border ${cat.color}`}>
                          {cat.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {n.actionLabel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => handleMarkRead(n.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2.5 text-muted-foreground"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        Mark Read
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2.5 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDismiss(n.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="preferences">
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="p-5 border-b border-border/60">
            <h2 className="text-base font-bold text-foreground">Notification Delivery Preferences</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how you receive notifications for each category.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                  {channelLabels.map((ch) => (
                    <th key={ch.key} className="text-left py-3 px-4 font-semibold text-muted-foreground">
                      {ch.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {allCategories.map((cat) => {
                  const pref = preferences.find((p) => p.category === cat);
                  const cfg = categoryConfig[cat] || categoryConfig.SYSTEM;
                  return (
                    <tr key={cat} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${cfg.color} border`}>
                            {cfg.icon}
                          </div>
                          <span className="font-medium text-foreground">{cfg.label}</span>
                        </div>
                      </td>
                      {(["inApp", "email", "sms", "whatsapp"] as const).map((channel) => (
                        <td key={channel} className="text-left py-3 px-4">
                          {pref ? (
                            <button
                              type="button"
                              onClick={() => handleTogglePref(cat, channel)}
                              className={`inline-flex h-6 min-w-[44px] items-center justify-center rounded-full px-2 text-[10px] font-semibold transition-colors ${
                                pref[channel]
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : "bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20"
                              }`}
                            >
                              {pref[channel] ? "ON" : "OFF"}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
