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
    <div className={`glass-panel rounded-2xl border border-token overflow-hidden shadow-xs ${className}`}>
      {(headerTitle || headerAction) && (
        <div className="p-3.5 sm:p-4 bg-surface-elevated/60 border-b border-token flex items-center justify-between gap-3 text-xs">
          {headerTitle && (
            <div className="font-bold text-primary-token flex items-center gap-2">
              {headerTitle}
            </div>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`bg-surface-elevated border-b border-token text-muted-token uppercase tracking-wider font-semibold ${headerSizes[size] || headerSizes.md}`}>
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

          <tbody className="divide-y divide-token font-normal">
            {loading ? (
              <tr>
                <td colSpan={columns.length || 1} className="py-12 text-center text-muted-token text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-token" />
                  Loading records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="py-12 text-center text-muted-token text-xs">
                  <EmptyIcon className="w-7 h-7 mx-auto mb-2 opacity-30 text-muted-token" />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id ?? rowIdx}
                  onClick={() => onRowClick && onRowClick(row, rowIdx)}
                  className={`transition-colors ${
                    onRowClick ? "cursor-pointer hover:bg-surface-elevated" : "hover:bg-surface-elevated/40"
                  } ${striped && rowIdx % 2 === 1 ? "bg-surface-elevated/20" : ""}`}
                >
                  {columns.map((col, colIdx) => {
                    const val = col.key ? row[col.key] : undefined;
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left";

                    // Default render handles Rule 15: zero values as dash "—"
                    let content;
                    if (col.render) {
                      content = col.render(val, row, rowIdx);
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
