import React from "react";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * Standard Configurable Filter Toolbar
 * Sizes: "sm" | "md"
 */
export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  size = "sm",
  filters = null,
  actions = null,
  onReset = null,
  className = "",
}) {
  const isSm = size === "sm";

  return (
    <div
      className={`glass-panel p-3 sm:p-3.5 rounded-2xl border border-token flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
        {/* Search input with icon & clear button */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-token pointer-events-none ${
                isSm ? "w-3.5 h-3.5" : "w-4 h-4"
              }`}
            />
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-8 bg-surface-elevated border border-token rounded-xl text-primary-token placeholder-muted-token focus:outline-none focus:border-[var(--brand-secondary)] focus:ring-1 focus:ring-[var(--brand-secondary)]/30 ${
                isSm ? "py-1.5 text-xs" : "py-2 text-xs"
              }`}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-token hover:text-primary-token cursor-pointer p-0.5 rounded-full hover:bg-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Custom filter dropdowns or elements */}
        {filters && <div className="flex flex-wrap items-center gap-2.5">{filters}</div>}

        {/* Optional Reset Filters Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-1.5 rounded-xl text-muted-token hover:text-primary-token hover:bg-surface border border-token transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right side actions (e.g. Export button, view toggle) */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
