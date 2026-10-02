import React from "react";
import { X } from "lucide-react";

/**
 * Size & Style Configurable Input Field
 * Sizes: "xs" | "sm" | "md" | "lg"
 */
export default function Input({
  label,
  size = "sm",
  type = "text",
  value,
  onChange,
  onClear,
  placeholder,
  error,
  helperText,
  icon: Icon,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  prefix,
  suffix,
  disabled = false,
  required = false,
  className = "",
  containerClassName = "",
  ...props
}) {
  const sizeStyles = {
    xs: "px-2.5 py-1 text-[11px] rounded-lg",
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-3.5 py-2 text-xs rounded-xl",
    lg: "px-4 py-2.5 text-sm rounded-xl",
  };

  const labelSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-xs font-semibold",
    lg: "text-sm font-semibold",
  };

  const activeLeftIcon = Icon || LeftIcon;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className={`block font-semibold text-secondary-token ${labelSizes[size] || labelSizes.sm}`}>
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {activeLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-token pointer-events-none">
            <activeLeftIcon className="w-3.5 h-3.5" />
          </div>
        )}

        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary-token pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-surface-elevated border transition-all text-primary-token placeholder-muted-token focus:outline-none focus:border-[var(--brand-secondary)] focus:ring-1 focus:ring-[var(--brand-secondary)]/30 disabled:opacity-50 disabled:cursor-not-allowed ${
            sizeStyles[size] || sizeStyles.sm
          } ${error ? "border-rose-500/80 focus:border-rose-500" : "border-token"} ${
            activeLeftIcon ? "pl-9" : prefix ? "pl-7" : ""
          } ${onClear && value ? "pr-8" : suffix || RightIcon ? "pr-9" : ""} ${className}`}
          {...props}
        />

        {onClear && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-token hover:text-primary-token cursor-pointer p-0.5 rounded-full hover:bg-surface"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {!onClear && RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-token pointer-events-none">
            <RightIcon className="w-3.5 h-3.5" />
          </div>
        )}

        {!onClear && suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary-token pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-[10px] text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[10px] text-muted-token">{helperText}</p>
      ) : null}
    </div>
  );
}
