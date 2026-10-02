import React from "react";
import { ChevronDown } from "lucide-react";

/**
 * Size & Style Configurable Select / Options Dropdown
 * Sizes: "xs" | "sm" | "md" | "lg"
 */
export default function Select({
  label,
  size = "sm",
  options = [],
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  const sizeStyles = {
    xs: "px-2.5 py-1 text-[11px] rounded-lg pr-7",
    sm: "px-3 py-1.5 text-xs rounded-xl pr-8",
    md: "px-3.5 py-2 text-xs rounded-xl pr-9 font-medium",
    lg: "px-4 py-2.5 text-sm rounded-xl pr-10 font-medium",
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

      <div className="relative flex items-center">
        <select
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none bg-surface-elevated border transition-all text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] focus:ring-1 focus:ring-[var(--brand-secondary)]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            sizeStyles[size] || sizeStyles.sm
          } ${error ? "border-rose-500/80 focus:border-rose-500" : "border-token"} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt, i) => {
            if (typeof opt === "object" && opt !== null) {
              return (
                <option key={opt.value ?? i} value={opt.value} disabled={opt.disabled}>
                  {opt.label ?? opt.name ?? opt.value}
                </option>
              );
            }
            return (
              <option key={opt ?? i} value={opt}>
                {opt}
              </option>
            );
          })}
        </select>

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-token pointer-events-none">
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {error ? (
        <p className="text-[10px] text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-muted-token">{helperText}</p>
      ) : null}
    </div>
  );
}
