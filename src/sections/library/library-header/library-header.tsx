"use client";

import React from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function LibraryHeader() {
  const { activeBranchId } = useERP();
  const books = mockDb.getLibraryBooks(activeBranchId);

  return (
    <div className="space-y-4">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Library &amp; Media Center
            </h1>
            <Badge variant="outline" className="text-xs">
              {books.length} Catalog Titles
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Book catalog, student borrowing/returns, fine collection &amp; digital literature repository.
          </p>
        </div>

        <Button
          variant="gradient"
          className="gap-2 shrink-0"
          onClick={() =>
            toast.info("Add Book — Catalog Entry", {
              description: "Full ISBN lookup & catalog entry dialog.",
            })
          }
        >
          <Plus className="h-4 w-4" />
          <span>Add Book</span>
        </Button>
      </div>
    </div>
  );
}
