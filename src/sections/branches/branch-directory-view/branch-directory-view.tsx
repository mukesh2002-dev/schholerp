"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Branch } from "@/types";
import { BranchCard } from "@/components/branches/branch-card";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Search,
  LayoutGrid,
  List,
  Trash2,
  ExternalLink,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

export function BranchDirectoryView() {
  const { branches, deleteBranch, setActiveBranchId, activeBranchId } = useERP();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  // Filtered and searched branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchesType = typeFilter === "ALL" || b.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [branches, searchQuery, statusFilter, typeFilter]);

  const handleEdit = (branch: Branch) => {
    setBranchToEdit(branch);
    setFormDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (branchToDelete) {
      deleteBranch(branchToDelete.id);
      setBranchToDelete(null);
    }
  };

  const handleAddNew = () => {
    setBranchToEdit(null);
    setFormDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, code, principal, city..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPANDING">Expanding</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs hidden sm:flex">
              <SelectValue placeholder="Campus Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="Main Campus">Main Campus</SelectItem>
              <SelectItem value="STEM Academy">STEM Academy</SelectItem>
              <SelectItem value="Montessori &amp; Prep">Montessori &amp; Prep</SelectItem>
              <SelectItem value="International">International</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Arts &amp; Sports">Arts &amp; Sports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 self-end md:self-auto border border-border/80 rounded-lg p-0.5 bg-muted/30">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Table</span>
          </Button>
        </div>
      </div>

      {/* Main List Rendering */}
      {filteredBranches.length === 0 ? (
        <EmptyState
          title="No Campus Branches Found"
          description="We couldn't find any branches matching your search and filter criteria. Try adjusting your query or register a new campus."
          actionLabel="Register New Campus"
          onAction={handleAddNew}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={handleEdit}
              onDelete={(b) => setBranchToDelete(b)}
            />
          ))}
        </div>
      ) : (
        /* Structured Table View */
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Code</TableHead>
                <TableHead>Campus Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead className="text-right tabular-nums">Students / Capacity</TableHead>
                <TableHead className="text-right tabular-nums">Faculty / Workers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((b) => (
                <TableRow key={b.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono font-bold text-xs">{b.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: b.color || "#3b82f6" }}
                      />
                      <div>
                        <Link
                          href={`/branches/${b.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {b.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground block">
                          {b.city}, {b.state}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.type}</TableCell>
                  <TableCell className="text-xs font-medium text-foreground">{b.principalName}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-mono">
                    <span className="font-bold text-foreground">{formatNumber(b.totalStudents)}</span> /{" "}
                    {formatNumber(b.capacity)}{" "}
                    <span className="text-primary font-semibold">
                      ({Math.round((b.totalStudents / b.capacity) * 100)}%)
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{b.totalTeachers}</span> teachers •{" "}
                    {b.totalWorkers} workers
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        b.status === "ACTIVE"
                          ? "success"
                          : b.status === "EXPANDING"
                          ? "purple"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => setActiveBranchId(b.id)}
                        title="Switch Campus Workspace Context"
                        className={activeBranchId === b.id ? "text-primary" : "text-muted-foreground"}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        asChild
                        title="View Details"
                      >
                        <Link href={`/branches/${b.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => handleEdit(b)}
                        title="Edit Branch"
                      >
                        <Edit2 className="h-4 w-4 text-amber-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={() => setBranchToDelete(b)}
                        title="Deactivate Branch"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Branch Dialog */}
      <BranchFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        branchToEdit={branchToEdit}
      />

      {/* Delete / Deactivate Confirmation Dialog */}
      <Dialog open={!!branchToDelete} onOpenChange={(open) => !open && setBranchToDelete(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive">
              Deactivate Campus Branch?
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed">
              Are you sure you want to deactivate and archive{" "}
              <strong>
                {branchToDelete?.name} ({branchToDelete?.code})
              </strong>
              ? This will remove the branch from the active roster while preserving audit historical records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setBranchToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Confirm Deactivation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
