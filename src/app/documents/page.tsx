"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { DocumentRecord, DocumentCategory, DocumentVerificationStatus } from "@/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Filter,
  Calendar,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  Tag,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const categoryColors: Record<DocumentCategory, string> = {
  IDENTITY: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  ACADEMIC: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  MEDICAL: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
  FINANCIAL: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  LEGAL: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400",
  EMPLOYMENT: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
  OTHER: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400",
};

const verificationConfig: Record<
  DocumentVerificationStatus,
  { icon: React.ReactNode; color: string; label: string }
> = {
  VERIFIED: {
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    label: "Verified",
  },
  PENDING: {
    icon: <Shield className="h-3.5 w-3.5" />,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    label: "Pending",
  },
  REJECTED: {
    icon: <ShieldX className="h-3.5 w-3.5" />,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    label: "Rejected",
  },
  EXPIRED: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400",
    label: "Expired",
  },
};

export default function DocumentsPage() {
  const { activeBranchId } = useERP();
  const [documents] = useState(() => mockDb.getDocuments(activeBranchId));
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>("ALL");
  const [verificationFilter, setVerificationFilter] = useState<string>("ALL");

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "ALL" || doc.category === categoryFilter;
      const matchesOwner = ownerTypeFilter === "ALL" || doc.ownerType === ownerTypeFilter;
      const matchesVerification =
        verificationFilter === "ALL" || doc.verificationStatus === verificationFilter;

      return matchesSearch && matchesCategory && matchesOwner && matchesVerification;
    });
  }, [documents, searchQuery, categoryFilter, ownerTypeFilter, verificationFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Document Center
            </h1>
            <Badge variant="outline" className="text-xs">
              {documents.length} Files
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage, verify, and track all institutional documents across campuses.
          </p>
        </div>

        <Button variant="gradient" className="gap-2 shrink-0" onClick={() => toast.info("Upload Document — demo placeholder", { description: "Document upload and verification workflow coming soon." })}>
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents, owners, tags..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="IDENTITY">Identity</SelectItem>
              <SelectItem value="ACADEMIC">Academic</SelectItem>
              <SelectItem value="MEDICAL">Medical</SelectItem>
              <SelectItem value="FINANCIAL">Financial</SelectItem>
              <SelectItem value="LEGAL">Legal</SelectItem>
              <SelectItem value="EMPLOYMENT">Employment</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ownerTypeFilter} onValueChange={setOwnerTypeFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Owner Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Owners</SelectItem>
              <SelectItem value="STUDENT">Student</SelectItem>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="WORKER">Worker</SelectItem>
            </SelectContent>
          </Select>

          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <EmptyState
          title="No Documents Found"
          description="No documents matched your current search and filter criteria."
          icon={<FileText className="h-7 w-7" />}
          actionLabel="Upload Document"
          onAction={() => toast.info("Upload Document — demo placeholder", { description: "Document upload and verification workflow coming soon." })}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const verification = verificationConfig[doc.verificationStatus];
            return (
              <Card
                key={doc.id}
                className="group hover:border-primary/40 transition-all duration-300 hover:shadow-md"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {doc.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${categoryColors[doc.category]}`}
                    >
                      {doc.category}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Owner</span>
                      <span className="font-medium text-foreground">{doc.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {doc.ownerType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">File</span>
                      <span className="font-mono text-foreground">
                        {doc.fileType} &middot; {doc.fileSize}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Uploaded
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(doc.uploadDate)}
                      </span>
                    </div>
                    {doc.expiryDate && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Expires
                        </span>
                        <span className="font-medium text-foreground">
                          {formatDate(doc.expiryDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${verification.color}`}
                    >
                      {verification.icon}
                      {verification.label}
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {doc.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted text-muted-foreground"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">
                            +{doc.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
