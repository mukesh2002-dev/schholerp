"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Message, MessageChannel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Mail,
  Send,
  PenSquare,
  Star,
  Clock,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

const channelConfig: Record<MessageChannel, { label: string; className: string }> = {
  IN_APP: { label: "In-App", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
  EMAIL: { label: "Email", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  SMS: { label: "SMS", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  WHATSAPP: { label: "WhatsApp", className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
};

const composeSchema = z.object({
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject must be under 120 characters"),
  body: z
    .string()
    .min(10, "Message body must be at least 10 characters")
    .max(5000, "Message body is too long"),
  recipientType: z.enum(["INDIVIDUAL", "GROUP", "ALL_TEACHERS", "ALL_PARENTS", "ALL_STUDENTS"]),
  channel: z.enum(["IN_APP", "EMAIL", "SMS", "WHATSAPP"]),
});

type ComposeFormValues = z.infer<typeof composeSchema>;

export function MessagesDirectoryView() {
  const { activeBranchId } = useERP();
  const [messages, setMessages] = useState<Message[]>(() => mockDb.getMessages(activeBranchId) || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComposeFormValues>({
    resolver: zodResolver(composeSchema),
    defaultValues: {
      subject: "",
      body: "",
      recipientType: "INDIVIDUAL",
      channel: "IN_APP",
    },
  });
  const recipientType = watch("recipientType");
  const channel = watch("channel");

  const refreshMessages = () => {
    setMessages(mockDb.getMessages(activeBranchId) || []);
  };

  const inboxMessages = useMemo(() => {
    return messages
      .filter((m) => {
        const matchesSearch =
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.body.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [messages, searchQuery]);

  const sentMessages = useMemo(() => {
    return messages
      .filter((m) => {
        const matchesSearch =
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.recipientNames || []).some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
          m.body.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [messages, searchQuery]);

  const unreadCount = useMemo(() => messages.filter((m) => !m.isRead).length, [messages]);

  const handleSend = (values: ComposeFormValues) => {
    mockDb.saveMessage({
      subject: values.subject.trim(),
      body: values.body.trim(),
      senderId: "current-user",
      senderName: "Administrator",
      senderRole: "SUPER_ADMIN",
      recipientIds: [],
      recipientNames: [values.recipientType.replace("_", " ")],
      recipientType: values.recipientType,
      channel: values.channel,
      channelStatus: "SENT",
      branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId,
      branchName: "Apex Global Campus",
      isRead: false,
      isStarred: false,
    });
    toast.success("Message dispatched successfully via " + values.channel);
    reset();
    refreshMessages();
    setActiveTab("inbox");
  };

  const MessageCard = ({ msg, isSent = false }: { msg: Message; isSent?: boolean }) => {
    const recipient = isSent ? (msg.recipientNames || []).join(", ") || "Recipients" : msg.senderName;
    const role = isSent ? msg.recipientType : msg.senderRole;

    return (
      <Link href={`/messages/${msg.id}`}>
        <Card className={`border-border/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer ${!msg.isRead && !isSent ? "border-l-2 border-l-primary" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0 text-xs font-bold">
                  {recipient.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm truncate ${!msg.isRead && !isSent ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {recipient}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {role}
                    </span>
                  </div>
                  <p className={`text-sm mt-0.5 truncate ${!msg.isRead && !isSent ? "font-semibold text-foreground" : "text-foreground"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {msg.body}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border ${channelConfig[msg.channel]?.className || ""}`}>
                    {channelConfig[msg.channel]?.label || msg.channel}
                  </Badge>
                  {msg.isStarred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDateTime(msg.sentAt)}</span>
                </div>
                {!msg.isRead && !isSent && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5">
            <Inbox className="h-3.5 w-3.5" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="compose" className="gap-1.5">
            <PenSquare className="h-3.5 w-3.5" />
            Compose
          </TabsTrigger>
        </TabsList>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <TabsContent value="inbox" className="space-y-3">
        {inboxMessages.length === 0 ? (
          <EmptyState
            title="No Messages Found"
            description="Your inbox is empty or no messages match your search."
            icon={<Mail className="h-7 w-7" />}
          />
        ) : (
          <div className="space-y-2">
            {inboxMessages.map((msg) => (
              <MessageCard key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sent" className="space-y-3">
        {sentMessages.length === 0 ? (
          <EmptyState
            title="No Sent Messages"
            description="You haven't sent any messages yet."
            icon={<Send className="h-7 w-7" />}
          />
        ) : (
          <div className="space-y-2">
            {sentMessages.map((msg) => (
              <MessageCard key={msg.id} msg={msg} isSent />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="compose" className="space-y-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(handleSend)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="compose-subject" className="font-medium text-foreground mb-1 block text-sm">Subject</label>
                <Input
                  id="compose-subject"
                  placeholder="Enter message subject"
                  className="h-9"
                  {...register("subject")}
                />
                {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label htmlFor="compose-body" className="font-medium text-foreground mb-1 block text-sm">Body</label>
                <Textarea
                  id="compose-body"
                  placeholder="Write your message..."
                  className="min-h-[160px]"
                  {...register("body")}
                />
                {errors.body && <p className="text-xs text-destructive mt-1">{errors.body.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-foreground mb-1 block text-sm">Recipient Type</label>
                  <Select
                    value={recipientType}
                    onValueChange={(v) => setValue("recipientType", v as Message["recipientType"], { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                      <SelectItem value="GROUP">Group</SelectItem>
                      <SelectItem value="ALL_TEACHERS">All Teachers</SelectItem>
                      <SelectItem value="ALL_PARENTS">All Parents</SelectItem>
                      <SelectItem value="ALL_STUDENTS">All Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-foreground mb-1 block text-sm">Channel</label>
                  <Select
                    value={channel}
                    onValueChange={(v) => setValue("channel", v as MessageChannel, { shouldValidate: true })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN_APP">In-App</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending…" : "Send Message"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
