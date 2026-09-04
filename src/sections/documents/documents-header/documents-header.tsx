"use client";

import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export function DocumentsHeader() {
  const { activeBranchId } = useERP();
  const documents = mockDb.getDocuments(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Document Center
            </h1>
            <Badge variant="outline" className="text-xs">
              {documents.length} Files
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage, verify, and track all institutional documents across campuses.
          </p>
        </div>

        <Button
          variant="gradient"
          className="gap-2 shrink-0"
          onClick={() =>
            toast.info("Upload Document — demo placeholder", {
              description: "Document upload and verification workflow coming soon.",
            })
          }
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>
    </div>
  );
}
