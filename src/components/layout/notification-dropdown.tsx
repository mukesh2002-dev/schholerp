"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Bell, CheckCheck, Clock, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export function NotificationDropdown() {
  const { activeBranchId } = useERP();
  const [notices, setNotices] = useState(() => mockDb.getNotices(activeBranchId));
  const [unreadCount, setUnreadCount] = useState(3);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  const priorityVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-accent relative"
          title="Notifications & Notices"
        >
          <Bell className="h-4 w-4 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute 1.5 top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
          )}
          <span className="sr-only">View notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] sm:w-[380px] p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Notifications & Circulars</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-[320px] overflow-y-auto space-y-1 py-1">
          {notices.map((n) => (
            <div
              key={n.id}
              className="p-2.5 rounded-lg hover:bg-accent/60 transition-colors border border-border/40 text-left space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-foreground line-clamp-1">{n.title}</span>
                <Badge variant={priorityVariant(n.priority) as any} className="text-[9px] py-0 px-1 shrink-0">
                  {n.priority}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.content}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                <span>By {n.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(n.date)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <DropdownMenuSeparator />

        <div className="p-1 text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary/90 h-8">
            View All Broadcasts
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
