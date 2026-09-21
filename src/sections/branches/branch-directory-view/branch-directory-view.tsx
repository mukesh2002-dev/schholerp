"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { Branch } from "@/types";
import { BranchCard } from "@/components/branches/branch-card";
import { BranchFormDialog } from "@/components/branches/branch-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionOfflineBanner } from "@/components/layout/section-guard";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
import { ListPagination } from "@/components/ui/list-pagination";
import {
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { canManageCampuses } from "@/lib/auth/roles";
import Link from "next/link";

const PAGE_SIZE = 6;

const BranchTableRow = React.memo(function BranchTableRow({
  b,
  activeBranchId,
  onActive,
}: {
  b: Branch;
  activeBranchId: string;
  onActive: (id: string) => void;
}) {
  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell className="font-mono font-bold text-xs">{b.code}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color || "#3b82f6" }} />
          <div>
            <Link href={`/branches/${b.id}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm">
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
        <span className="font-bold text-foreground">{formatNumber(b.totalStudents)}</span> / {formatNumber(b.capacity)}{" "}
        <span className="text-primary font-semibold">({Math.round((b.totalStudents / b.capacity) * 100)}%)</span>
      </TableCell>
      <TableCell className="text-right tabular-nums text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{b.totalTeachers}</span> teachers • {b.totalWorkers} workers
      </TableCell>
      <TableCell>
        <Badge variant={b.status === "ACTIVE" ? "success" : b.status === "EXPANDING" ? "purple" : "warning"} className="text-[10px]">
          {b.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="iconSm" onClick={() => onActive(b.id)} title="Switch Campus" className={activeBranchId === b.id ? "text-primary" : "text-muted-foreground"}>
            <CheckCircle2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="iconSm" asChild title="View Details">
            <Link href={`/branches/${b.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export function BranchDirectoryView() {
  const { branches, setActiveBranchId, activeBranchId, branchesLoading, branchesError, session } = useERP();
  // Only super_admin may register new campuses (edit/delete are not offered here).
  const canManage = canManageCampuses(session.rawRole);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const filteredBranches = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return branches.filter((b) => {
      const matchesSearch =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.principalName?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      const matchesType = typeFilter === "ALL" || b.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [branches, debouncedSearch, statusFilter, typeFilter]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL" || typeFilter !== "ALL";

  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(filteredBranches, PAGE_SIZE);

  const handleAddNew = useCallback(() => {
    setBranchToEdit(null);
    setFormDialogOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  }, []);

  const isOffline = Boolean(branchesError && /offline|network|timeout|failed to fetch|connection|unreachable/i.test(branchesError));

  return (
    <div className="space-y-4">
      <SectionOfflineBanner isOffline={isOffline} error={branchesError} isLoading={branchesLoading} />

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[180px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, code, principal, city..." className="pl-9 h-9 text-xs" />
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
              <SelectItem value="INACTIVE">Inactive</SelectItem>
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
              <SelectItem value="Montessori & Prep">Montessori & Prep</SelectItem>
              <SelectItem value="International">International</SelectItem>
              <SelectItem value="High School">High School</SelectItem>
              <SelectItem value="Arts & Sports">Arts & Sports</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs gap-1.5">
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Badge variant="outline" className="text-[11px] font-mono hidden lg:flex">
            {filteredBranches.length} / {branches.length}
          </Badge>
          <div className="flex items-center gap-1 border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="h-7 px-2.5 text-xs gap-1">
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")} className="h-7 px-2.5 text-xs gap-1">
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
              Search: &ldquo;{searchQuery}&rdquo; <button onClick={() => setSearchQuery("")} className="ml-1 rounded-full hover:bg-muted p-0.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {statusFilter !== "ALL" && (
            <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
              Status: {statusFilter} <button onClick={() => setStatusFilter("ALL")} className="ml-1 rounded-full hover:bg-muted p-0.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          {typeFilter !== "ALL" && (
            <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
              Type: {typeFilter} <button onClick={() => setTypeFilter("ALL")} className="ml-1 rounded-full hover:bg-muted p-0.5"><X className="h-3 w-3" /></button>
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-1">{filteredBranches.length} result(s)</span>
        </div>
      )}

      {/* Main List Rendering */}
      {filteredBranches.length === 0 ? (
        <EmptyState
          title="No Campus Branches Found"
          description={hasActiveFilters ? "No branches match your filters. Clear filters to see all campuses." : canManage ? "We couldn't find any branches. Register a new campus to get started." : "No campuses are registered yet."}
          actionLabel={hasActiveFilters ? "Clear filters" : canManage ? "Register New Campus" : undefined}
          onAction={hasActiveFilters ? clearFilters : canManage ? handleAddNew : undefined}
        />
      ) : viewMode === "grid" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
          <ListPagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      ) : (
        <>
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
                {pageItems.map((b) => (
                  <BranchTableRow key={b.id} b={b} activeBranchId={activeBranchId} onActive={setActiveBranchId} />
                ))}
              </TableBody>
            </Table>
          </div>
          <ListPagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}

      <BranchFormDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} branchToEdit={branchToEdit} />
    </div>
  );
}
