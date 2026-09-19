import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageList(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Paginação">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-ink-400">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium",
              entry === page ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {entry + 1}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  const delta = 1;
  const range: (number | "ellipsis")[] = [];
  const start = Math.max(0, current - delta);
  const end = Math.min(total - 1, current + delta);

  if (start > 0) {
    range.push(0);
    if (start > 1) range.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (end < total - 1) {
    if (end < total - 2) range.push("ellipsis");
    range.push(total - 1);
  }

  return range;
}
