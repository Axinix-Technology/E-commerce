import React from "react";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * Standard Configurable Filter Toolbar
 * Sizes: "sm" | "md"
 */
export default function FilterBar({
  search,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  size = "sm",
  filters = null,
  actions = null,
  onReset = null,
  children,
  className = "",
}) {
  const isSm = size === "sm";
  const effectiveSearch = search !== undefined ? search : searchValue || "";

  return (
    <div
      className={`glass-panel p-3 sm:p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
        {/* Search input with icon & clear button */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[180px] max-w-md">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-muted-token pointer-events-none ${
                isSm ? "w-3.5 h-3.5" : "w-4 h-4"
              }`}
            />
            <input
              type="text"
              value={effectiveSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-8 bg-white dark:bg-surface border border-slate-300 dark:border-token rounded-xl text-slate-900 dark:text-primary-token placeholder:text-slate-400 dark:placeholder:text-muted-token shadow-xs hover:border-slate-400 dark:hover:border-[var(--brand-secondary)]/50 focus:outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/25 transition-all ${
                isSm ? "py-1.5 text-xs" : "py-2 text-xs"
              }`}
            />
            {effectiveSearch && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-muted-token dark:hover:text-primary-token cursor-pointer p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Custom filter dropdowns or child elements */}
        {(filters || children) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {filters}
            {children}
          </div>
        )}

        {/* Optional Reset Filters Button */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-muted-token dark:hover:text-primary-token bg-white dark:bg-surface border border-slate-300 dark:border-token shadow-xs transition-colors cursor-pointer"
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
