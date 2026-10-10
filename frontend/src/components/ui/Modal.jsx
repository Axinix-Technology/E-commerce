import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Standard Configurable Modal Component
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - title: string | ReactNode
 * - subtitle?: string
 * - icon?: LucideIcon
 * - children: ReactNode
 * - footer?: ReactNode
 * - size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
 * - headerAction?: ReactNode
 * - closeOnOverlayClick?: boolean
 * - className?: string
 */
export default function Modal({
  isOpen = false,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  size = "lg",
  headerAction,
  closeOnOverlayClick = true,
  className = "",
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
    "2xl": "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`glass-panel w-full rounded-2xl border border-token overflow-hidden shadow-2xl relative my-auto transition-all ${
          sizeClasses[size] || sizeClasses.lg
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="p-4 bg-slate-50 dark:bg-surface-elevated/70 border-b border-slate-200 dark:border-token flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-surface-elevated border border-teal-200 dark:border-token text-brand-token shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-sm font-bold text-slate-900 dark:text-primary-token tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-[11px] text-slate-500 dark:text-muted-token truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerAction}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-muted-token dark:hover:text-primary-token hover:bg-slate-100 dark:hover:bg-surface transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[78vh] overflow-y-auto">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-3 sm:p-4 bg-slate-50 dark:bg-surface-elevated/60 border-t border-slate-200 dark:border-token flex items-center justify-end gap-2 text-xs">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
