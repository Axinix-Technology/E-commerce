import React from "react";

/**
 * Size & Style Configurable Textarea Field
 * Sizes: "xs" | "sm" | "md" | "lg"
 */
export default function Textarea({
  label,
  size = "sm",
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  helperText,
  disabled = false,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  const sizeStyles = {
    xs: "px-2.5 py-1.5 text-[11px] rounded-lg",
    sm: "px-3 py-2 text-xs rounded-xl",
    md: "px-3.5 py-2.5 text-xs rounded-xl",
    lg: "px-4 py-3 text-sm rounded-xl",
  };

  const labelSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-xs font-semibold",
    lg: "text-sm font-semibold",
  };

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className={`block font-semibold text-secondary-token ${labelSizes[size] || labelSizes.sm}`}>
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-surface-elevated border transition-all text-primary-token placeholder-muted-token focus:outline-none focus:border-[var(--brand-secondary)] focus:ring-1 focus:ring-[var(--brand-secondary)]/30 disabled:opacity-50 disabled:cursor-not-allowed resize-y ${
          sizeStyles[size] || sizeStyles.sm
        } ${error ? "border-rose-500/80 focus:border-rose-500" : "border-token"} ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[10px] text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-muted-token">{helperText}</p>
      ) : null}
    </div>
  );
}
