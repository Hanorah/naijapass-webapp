"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { buildPaginationPages } from "@/lib/paginationPages";

type Props = {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  className?: string;
};

export default function PaginationBar({
  page,
  pageCount,
  onPage,
  className = "",
}: Props) {
  if (pageCount <= 1) return null;

  const pages = buildPaginationPages(page, pageCount);

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <button
        type="button"
        aria-label="First page"
        disabled={page === 1}
        onClick={() => onPage(1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy/10 text-navy disabled:opacity-40"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy/10 text-navy disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-slate"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPage(item)}
            aria-current={item === page ? "page" : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold ${
              item === page
                ? "bg-orange text-white"
                : "border border-navy/10 text-navy hover:bg-mist"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy/10 text-navy disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Last page"
        disabled={page === pageCount}
        onClick={() => onPage(pageCount)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy/10 text-navy disabled:opacity-40"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
}
