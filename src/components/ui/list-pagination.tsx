"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ListPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

/** Compact reusable pagination bar for directory views. */
export function ListPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "records",
}: ListPaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = React.useMemo(() => {
    const pages: number[] = [];
    const window = 1;
    for (let i = Math.max(1, page - window); i <= Math.min(totalPages, page + window); i++) {
      pages.push(i);
    }
    if (pages[0] > 1) pages.unshift(-1);
    if (pages[pages.length - 1] < totalPages) pages.push(-2);
    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 pt-1">
      <span className="text-[11px] text-muted-foreground">
        Showing <strong className="text-foreground">{start}–{end}</strong> of{" "}
        <strong className="text-foreground">{totalItems}</strong> {label}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {pageNumbers.map((p, idx) =>
            p < 0 ? (
              <span key={`ellipsis-${idx}`} className="text-[11px] text-muted-foreground px-1">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="sm"
                className="h-7 min-w-7 px-2 text-[11px]"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
