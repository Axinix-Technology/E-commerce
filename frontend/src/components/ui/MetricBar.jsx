import React from "react";
import { formatQty, formatCurrency } from "../../utils/formatters";

/**
 * MetricBar
 * 
 * Complies strictly with Rule 2 (Minimalist Single-Line Metric Summary Bar)
 * and Rule 1 (Zero-Value Representation as Dash "—").
 * 
 * Props:
 * - items: Array of { label: string, value: any, variant?: "primary"|"brand"|"emerald"|"amber"|"rose"|"neutral", isQty?: boolean, isCurrency?: boolean, fontMono?: boolean, className?: string }
 * - children?: ReactNode (for custom slot layout)
 * - className?: string
 */
export default function MetricBar({ items = [], children, className = "" }) {
  const variantColorMap = {
    primary: "text-primary-token",
    brand: "text-teal-600 dark:text-cyan-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    success: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-800 dark:text-amber-400",
    warning: "text-amber-800 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
    danger: "text-rose-600 dark:text-rose-400",
    neutral: "text-secondary-token",
  };

  const renderValue = (item) => {
    let val = item.value;
    if (item.isCurrency) {
      val = formatCurrency(val);
    } else if (item.isQty || typeof val === "number") {
      val = formatQty(val);
    } else if (val === 0 || val === "0" || val === null || val === undefined || val === "") {
      val = "—";
    }
    return val;
  };

  return (
    <div
      className={`glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 rounded-xl text-xs text-secondary-token shadow-xs select-none ${className}`}
    >
      {items.map((item, idx) => {
        const colorClass = variantColorMap[item.variant] || variantColorMap.primary;
        const isMono = item.fontMono ? "font-mono" : "";

        return (
          <React.Fragment key={item.key || idx}>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-muted-token">{item.label}:</span>
              <strong className={`font-bold ${colorClass} ${isMono} ${item.className || ""}`}>
                {renderValue(item)}
              </strong>
            </span>
            {idx < items.length - 1 && (
              <span className="text-muted-token/60 select-none">•</span>
            )}
          </React.Fragment>
        );
      })}
      {children}
    </div>
  );
}
