"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Mail, Send, Bell, Smartphone } from "lucide-react";

export function MessagesMetricsRibbon() {
  const { activeBranchId } = useERP();
  const messages = mockDb.getMessages(activeBranchId) || [];

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const inAppCount = messages.filter((m) => m.channel === "IN_APP").length;
  const externalChannelCount = messages.filter((m) => m.channel !== "IN_APP").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Messages
          </span>
          <Mail className="h-4 w-4 text-primary" />
        </div>
        <span className="text-2xl font-bold text-foreground mt-1 block">
          {messages.length}
        </span>
        <span className="text-[11px] text-muted-foreground">All conversation threads</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block">
            Unread Inbox
          </span>
          <Bell className="h-4 w-4 text-rose-600" />
        </div>
        <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
          {unreadCount}
        </span>
        <span className="text-[11px] text-rose-600 font-medium">Awaiting action</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
            In-App Threads
          </span>
          <Send className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 block">
          {inAppCount}
        </span>
        <span className="text-[11px] text-blue-600 font-medium">Direct staff chats</span>
      </div>

      <div className="p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
            External Gateways
          </span>
          <Smartphone className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
          {externalChannelCount}
        </span>
        <span className="text-[11px] text-emerald-600 font-medium">SMS, Email &amp; WhatsApp</span>
      </div>
    </div>
  );
}
