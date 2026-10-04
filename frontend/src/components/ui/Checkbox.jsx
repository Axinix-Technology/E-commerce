import React from "react";
import { Check } from "lucide-react";

/**
 * Accessible & Theme-consistent Checkbox Component
 * Sizes: "sm" | "md"
 */
export default function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  error,
  size = "sm",
  className = "",
  containerClassName = "",
  id,
  name,
  ...props
}) {
  const generatedId = id || (name ? `checkbox-${name}` : undefined);

  const boxSizes = {
    sm: "w-4 h-4 rounded-md",
    md: "w-5 h-5 rounded-lg",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
  };

  const labelSizes = {
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <div className={`flex flex-col space-y-1 ${containerClassName}`}>
      <label
        htmlFor={generatedId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            id={generatedId}
            name={name}
            type="checkbox"
            checked={Boolean(checked)}
            onChange={onChange}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`${boxSizes[size] || boxSizes.sm} border transition-all flex items-center justify-center ${
              checked
                ? "bg-[var(--brand-secondary)] border-[var(--brand-secondary)] text-slate-950 shadow-xs"
                : "bg-surface-elevated border-token hover:border-[var(--brand-secondary)]/60"
            } ${error ? "border-rose-500" : ""} peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--brand-secondary)]/40`}
          >
            {checked && <Check className={`${iconSizes[size] || iconSizes.sm} stroke-[3]`} />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className={`font-semibold text-primary-token leading-tight ${labelSizes[size] || labelSizes.sm}`}>
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-muted-token mt-0.5 leading-snug">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && <p className="text-[10px] text-rose-400 font-medium pl-6">{error}</p>}
    </div>
  );
}
