"use client";

import { useEffect, useMemo, useState } from "react";

interface UsePaginationResult<T> {
  page: number;
  totalPages: number;
  totalItems: number;
  pageItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * Client-side pagination over an already-filtered array.
 * Resets to page 1 whenever the item list identity/length changes.
 */
export function usePagination<T>(items: T[], pageSize = 9): UsePaginationResult<T> {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [totalItems]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    totalPages,
    totalItems,
    pageItems,
    setPage: (p) => setPage(Math.min(Math.max(1, p), totalPages)),
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
