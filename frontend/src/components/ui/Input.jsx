import React, { useMemo } from "react";
import { X, AlertCircle } from "lucide-react";
import { validateField, sanitizeInput, inferFieldType } from "../../utils/validation";

/**
 * Size & Style Configurable Input Field with Built-in Character Validation
 * Sizes: "xs" | "sm" | "md" | "lg"
 * 
 * Character Validation Rules:
 * - fieldType="name": Only letters, numbers, and spaces (no special characters).
 * - fieldType="code": Only alphanumeric characters, hyphens, and underscores.
 * - fieldType="hsn": 2 to 8 numeric digits only.
 * - fieldType="phone": 7 to 15 digits with optional leading '+'.
 * - fieldType="email": Standard email address format.
 * - fieldType="pincode": 6 numeric digits.
 * - fieldType="gstin": 15-character standard Indian GSTIN.
 * - fieldType="url": Valid HTTP/HTTPS URL.
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
  fieldType,
  restrictChars = false,
  showValidation = true,
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

  const ActiveLeftIcon = Icon || LeftIcon;

  // Determine effective field type
  const effectiveFieldType = useMemo(() => {
    return fieldType || inferFieldType(label, props.name, type);
  }, [fieldType, label, props.name, type]);

  // Live validation calculation
  const validationResult = useMemo(() => {
    if (!showValidation || !effectiveFieldType) return { isValid: true, error: null };
    return validateField(effectiveFieldType, value);
  }, [showValidation, effectiveFieldType, value]);

  const activeError = error || (!validationResult.isValid ? validationResult.error : null);

  const handleChange = (e) => {
    if (!onChange) return;

    if (restrictChars && effectiveFieldType) {
      const sanitized = sanitizeInput(effectiveFieldType, e.target.value);
      e.target.value = sanitized;
      onChange(e);
    } else {
      onChange(e);
    }
  };

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className={`block font-semibold text-slate-800 dark:text-secondary-token ${labelSizes[size] || labelSizes.sm}`}>
          {label} {required && <span className="text-rose-600 dark:text-rose-400 font-bold">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {ActiveLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-token pointer-events-none">
            <ActiveLeftIcon className="w-3.5 h-3.5" />
          </div>
        )}

        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-700 dark:text-secondary-token pointer-events-none">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-white dark:bg-surface-elevated border shadow-xs transition-all text-slate-900 dark:text-primary-token placeholder:text-slate-400 dark:placeholder:text-muted-token hover:border-slate-400 dark:hover:border-[var(--brand-secondary)]/60 focus:outline-none focus:border-[var(--brand-secondary)] focus:ring-2 focus:ring-[var(--brand-secondary)]/25 disabled:opacity-50 disabled:cursor-not-allowed ${
            sizeStyles[size] || sizeStyles.sm
          } ${activeError ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30" : "border-slate-300 dark:border-token"} ${
            ActiveLeftIcon ? "pl-9" : prefix ? "pl-7" : ""
          } ${onClear && value ? "pr-8" : suffix || RightIcon || activeError ? "pr-9" : ""} ${className}`}
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

        {!onClear && activeError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-600 dark:text-rose-400 pointer-events-none" title={activeError}>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        )}

        {!onClear && !activeError && RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-token pointer-events-none">
            <RightIcon className="w-3.5 h-3.5" />
          </div>
        )}

        {!onClear && !activeError && suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-secondary-token pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {activeError ? (
        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
          <span>{activeError}</span>
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-muted-token">{helperText}</p>
      ) : null}
    </div>
  );
}
