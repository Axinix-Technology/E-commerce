import React from "react";
import { RefreshCw } from "lucide-react";

/**
 * Size & Variant Configurable Button
 * Sizes: "xs" | "sm" | "md" | "lg"
 * Variants: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger"
 */
export default function Button({
  children,
  variant = "secondary",
  size = "sm",
  type = "button",
  loading = false,
  disabled = false,
  icon: Icon,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  className = "",
  onClick,
  ...props
}) {
  const sizeStyles = {
    xs: "px-2 py-1 text-[11px] rounded-lg gap-1.5 font-medium",
    sm: "px-3 py-1.5 text-xs rounded-xl gap-2 font-semibold",
    md: "px-4 py-2 text-xs rounded-xl gap-2 font-bold",
    lg: "px-5 py-2.5 text-sm rounded-xl gap-2.5 font-bold",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-tr from-[var(--brand-primary-navy)] to-[var(--brand-primary)] text-white border border-[rgba(255,255,255,0.12)] hover:brightness-110 shadow-sm",
    secondary:
      "bg-[var(--brand-secondary)] text-slate-950 hover:brightness-105 shadow-xs shadow-[rgba(0,210,210,0.25)]",
    accent:
      "bg-[var(--brand-accent)] text-slate-950 hover:brightness-105 shadow-xs shadow-[rgba(245,158,11,0.25)]",
    outline:
      "bg-surface hover:bg-surface-elevated text-primary-token border border-token hover:border-[var(--brand-secondary)]/50",
    ghost:
      "bg-transparent hover:bg-surface-elevated text-secondary-token hover:text-primary-token",
    danger:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30",
  };

  const ActiveIcon = Icon || LeftIcon;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${
        sizeStyles[size] || sizeStyles.sm
      } ${variantStyles[variant] || variantStyles.secondary} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : ActiveIcon ? (
        <ActiveIcon className="w-3.5 h-3.5 shrink-0" />
      ) : null}

      {children && <span className="truncate">{children}</span>}

      {!loading && RightIcon && <RightIcon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}
