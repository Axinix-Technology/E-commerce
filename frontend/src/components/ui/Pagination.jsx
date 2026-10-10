import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

/**
 * Standard Configurable Pagination Component
 * 
 * Props:
 * - page: number (current page, 1-indexed)
 * - totalPages: number
 * - onPageChange: (newPage: number) => void
 * - totalItems?: number
 * - className?: string
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  className = "",
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`p-3 border-t border-token flex items-center justify-between text-xs text-secondary-token select-none ${className}`}
    >
      <div className="flex items-center gap-2">
        <span>
          Page <strong className="text-primary-token font-bold">{page}</strong> of{" "}
          <strong className="text-primary-token font-bold">{totalPages}</strong>
        </span>
        {totalItems !== undefined && (
          <span className="text-muted-token">
            ({totalItems.toLocaleString()} total items)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="xs"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
        >
          Previous
        </Button>

        <Button
          variant="secondary"
          size="xs"
          rightIcon={ChevronRight}
          disabled={page >= totalPages}
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
