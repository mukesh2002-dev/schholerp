"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { mockDb } from "@/lib/services/mock-db";
import { Message, MessageChannel } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Send,
  Star,
  Clock,
  User,
  MessageSquare,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const channelConfig: Record<MessageChannel, { label: string; className: string }> = {
  IN_APP: { label: "In-App", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  EMAIL: { label: "Email", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  SMS: { label: "SMS", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  WHATSAPP: { label: "WhatsApp", className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  SENT: { label: "Sent", icon: <Circle className="h-3.5 w-3.5" />, className: "text-muted-foreground" },
  DELIVERED: { label: "Delivered", icon: <CheckCircle2 className="h-3.5 w-3.5" />, className: "text-sky-600 dark:text-sky-400" },
  READ: { label: "Read", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, className: "text-emerald-600 dark:text-emerald-400" },
  FAILED: { label: "Failed", icon: <Circle className="h-3.5 w-3.5" />, className: "text-red-600 dark:text-red-400" },
};

const replySchema = z.object({
  reply: z
    .string()
    .min(1, "Reply cannot be empty")
    .max(5000, "Reply is too long"),
});

type ReplyFormValues = z.infer<typeof replySchema>;

export default function MessageDetailPage() {
  const params = useParams();
  const messageId = params.id as string;

  const message = mockDb.getMessageById(messageId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { reply: "" },
  });

  if (!message) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto text-muted-foreground">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Message Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The requested message could not be found or may have been deleted.
        </p>
        <Button asChild variant="outline">
          <Link href="/messages">Back to Messages</Link>
        </Button>
      </div>
    );
  }

  if (!message.isRead) {
    mockDb.markMessageRead(message.id);
  }

  const handleReply = (values: ReplyFormValues) => {
    if (!message) return;
    mockDb.saveMessage({
      subject: `RE: ${message.subject}`,
      body: values.reply.trim(),
      senderId: "current-user",
      senderName: "Current User",
      senderRole: "SUPER_ADMIN",
      recipientIds: [message.senderId],
      recipientNames: [message.senderName],
      recipientType: "INDIVIDUAL",
      channel: message.channel,
      channelStatus: "SENT",
      branchId: message.branchId,
      branchName: message.branchName,
      isRead: false,
      isStarred: false,
      replyToId: message.id,
      threadId: message.threadId || message.id,
    });
    reset();
    toast.success("Reply sent", { description: `Your reply to ${message.senderName} was dispatched.` });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {message.subject}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] border ${channelConfig[message.channel].className}`}>
              {channelConfig[message.channel].label}
            </Badge>
            <span className={`flex items-center gap-1 text-[11px] ${statusConfig[message.channelStatus].className}`}>
              {statusConfig[message.channelStatus].icon}
              {statusConfig[message.channelStatus].label}
            </span>
            {message.isStarred && (
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            )}
          </div>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href="/messages" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {message.senderAvatar ? (
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="h-11 w-11 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0 text-sm font-bold">
                    {message.senderName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">{message.senderName}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {message.senderRole}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {message.branchName}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border/60">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {message.body}
                </p>
              </div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border/60 space-y-2">
                  <span className="text-xs font-medium text-muted-foreground">Attachments</span>
                  {message.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/60 text-xs">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{att}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                Reply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleReply)} className="space-y-3" noValidate>
                <Textarea
                  placeholder="Write your reply..."
                  className="min-h-[120px]"
                  {...register("reply")}
                />
                {errors.reply && <p className="text-xs text-destructive">{errors.reply.message}</p>}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Sending…" : "Send Reply"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Message Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                <span className="text-muted-foreground block mb-0.5">From</span>
                <span className="font-bold text-foreground">{message.senderName}</span>
                <span className="text-muted-foreground block mt-0.5">({message.senderRole})</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                <span className="text-muted-foreground block mb-0.5">To</span>
                <span className="font-bold text-foreground">{message.recipientNames.join(", ") || "N/A"}</span>
                <span className="text-muted-foreground block mt-0.5">({message.recipientType.replace(/_/g, " ")})</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                <span className="text-muted-foreground">Channel</span>
                <Badge variant="outline" className={`text-[10px] border ${channelConfig[message.channel].className}`}>
                  {channelConfig[message.channel].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                <span className="text-muted-foreground">Sent</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(message.sentAt)}
                </span>
              </div>
              {message.readAt && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                  <span className="text-muted-foreground">Read</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {formatDateTime(message.readAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/60 text-xs">
                <span className="text-muted-foreground">Status</span>
                <span className={`flex items-center gap-1 font-semibold ${statusConfig[message.channelStatus].className}`}>
                  {statusConfig[message.channelStatus].icon}
                  {statusConfig[message.channelStatus].label}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
