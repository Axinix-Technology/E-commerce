import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Standard Configurable Page Header Component
 * Unifies header presentation across index and create/edit pages.
 * 
 * Props:
 * - title: string | ReactNode
 * - subtitle?: string | ReactNode
 * - icon?: LucideIcon
 * - backTo?: string (URL path for back button)
 * - actions?: ReactNode (action buttons on right)
 * - className?: string
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  backTo,
  actions,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {backTo && (
          <Link
            to={backTo}
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token hover:bg-surface-elevated transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}

        {Icon && (
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-surface-elevated/40 border border-teal-200/80 dark:border-token text-brand-token shadow-xs shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
