import React from "react";

/**
 * Size & Color Configurable Status / Tag Badge
 * Sizes: "xs" | "sm" | "md"
 * Variants: "brand" | "emerald" | "amber" | "rose" | "cyan" | "blue" | "neutral"
 */
export default function Badge({
  children,
  variant = "neutral",
  size = "sm",
  dot = false,
  className = "",
  ...props
}) {
  const sizeStyles = {
    xs: "px-1.5 py-0.2 text-[9px] font-mono",
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantStyles = {
    brand: "bg-[rgba(0,210,210,0.12)] text-brand-token border-[rgba(0,210,210,0.25)]",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    neutral: "bg-surface-elevated text-secondary-token border-token",
  };

  const dotColors = {
    brand: "bg-[var(--brand-secondary)]",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    cyan: "bg-cyan-400",
    blue: "bg-blue-400",
    neutral: "bg-muted-token",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors select-none ${
        sizeStyles[size] || sizeStyles.sm
      } ${variantStyles[variant] || variantStyles.neutral} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
