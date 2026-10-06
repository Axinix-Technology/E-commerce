import React from "react";
import { RefreshCw, Inbox } from "lucide-react";
import { formatQty } from "../../utils/formatters";

/**
 * Standard Configurable Data Table
 * Sizes: "sm" | "md" | "lg"
 * Props:
 * - columns: [{ key, header, align: "left"|"center"|"right", width, render(val, row, idx) }]
 * - data: Array of records
 * - size: "sm" | "md" | "lg"
 * - loading: boolean
 * - emptyMessage: string
 * - emptyIcon: Lucide icon component
 * - onRowClick: (row, index) => void
 * - headerAction: ReactNode
 */
export default function Table({
  columns = [],
  data = [],
  size = "md",
  loading = false,
  emptyMessage = "No records found matching your filters.",
  emptyIcon: EmptyIcon = Inbox,
  onRowClick,
  className = "",
  headerTitle,
  headerAction,
  striped = false,
}) {
  const cellSizes = {
    sm: "py-2 px-3 text-xs",
    md: "py-3 px-4 text-xs",
    lg: "py-3.5 px-5 text-sm",
  };

  const headerSizes = {
    sm: "py-2 px-3 text-[9px]",
    md: "py-2.5 px-4 text-[10px]",
    lg: "py-3 px-5 text-xs",
  };

  return (
    <div className={`glass-panel rounded-2xl overflow-hidden ${className}`}>
      {(headerTitle || headerAction) && (
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-surface-elevated/60 border-b border-slate-200 dark:border-token flex items-center justify-between gap-3 text-xs">
          {headerTitle && (
            <div className="font-bold text-slate-800 dark:text-primary-token flex items-center gap-2">
              {headerTitle}
            </div>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`bg-slate-50 dark:bg-surface-elevated/80 border-b border-slate-200 dark:border-token text-slate-700 dark:text-secondary-token uppercase tracking-wider font-bold ${headerSizes[size] || headerSizes.md}`}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={col.width ? { width: col.width } : undefined}
                  className={`${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-token font-normal">
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} className="py-12 text-center text-slate-500 dark:text-muted-token text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-token" />
                  Loading records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="py-14 text-center text-slate-500 dark:text-muted-token text-xs">
                  <EmptyIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400 dark:text-muted-token" />
                  <span className="font-medium">{emptyMessage}</span>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  onClick={() => onRowClick && onRowClick(row, rowIdx)}
                  className={`transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-elevated" : "hover:bg-slate-50/80 dark:hover:bg-surface-elevated/40"
                  } ${striped && rowIdx % 2 === 1 ? "bg-slate-50/50 dark:bg-surface-elevated/20" : ""}`}
                >
                  {columns.map((col, colIdx) => {
                    const key = col.key || col.accessor;
                    const val = key ? row[key] : undefined;
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left";

                    // Default render handles Rule 1: zero values as dash "—"
                    let content;
                    if (col.render) {
                      try {
                        const cellVal = key !== undefined ? val : row;
                        content = col.render(cellVal, row, rowIdx);
                      } catch (renderErr) {
                        console.error("Table column render error:", renderErr);
                        content = "—";
                      }
                    } else if (val === 0 || val === "0" || val === 0.0) {
                      content = "—";
                    } else if (val === null || val === undefined || val === "") {
                      content = "—";
                    } else {
                      content = val;
                    }

                    return (
                      <td
                        key={col.key || colIdx}
                        className={`${cellSizes[size] || cellSizes.md} ${alignClass} ${col.cellClassName || ""}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
