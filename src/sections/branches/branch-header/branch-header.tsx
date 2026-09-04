"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";

export function BranchHeader() {
  const { branches } = useERP();
  const [formDialogOpen, setFormDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Campus Branch Management
              </h1>
              <Badge variant="outline" className="text-xs">
                {branches.length} Registered
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Oversee multi-branch school network, capacity allocation, campus principals, and operations.
            </p>
          </div>

          <Button
            onClick={() => setFormDialogOpen(true)}
            variant="gradient"
            className="gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Campus</span>
          </Button>
        </div>
      </div>

      <BranchFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        branchToEdit={null}
      />
    </>
  );
}
