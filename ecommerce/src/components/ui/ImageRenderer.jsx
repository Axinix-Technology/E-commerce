import React, { useState } from "react";
import { Package, X, ZoomIn } from "lucide-react";

/**
 * Standard Configurable Image Renderer
 * Sizes: "xs" (24px) | "sm" (36px) | "md" (48px) | "lg" (64px) | "xl" (96px) | "full"
 * Rounded: "sm" | "md" | "lg" | "xl" | "full" | "none"
 */
export default function ImageRenderer({
  src,
  alt = "Product / Entity Image",
  size = "md",
  rounded = "xl",
  fallbackIcon: FallbackIcon = Package,
  zoomable = true,
  badge = null,
  className = "",
}) {
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const sizeStyles = {
    xs: "w-6 h-6 min-w-6",
    sm: "w-9 h-9 min-w-9",
    md: "w-12 h-12 min-w-12",
    lg: "w-16 h-16 min-w-16",
    xl: "w-24 h-24 min-w-24",
    full: "w-full h-full",
  };

  const roundedStyles = {
    none: "rounded-none",
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
    xl: "w-10 h-10",
    full: "w-12 h-12",
  };

  const hasValidSrc = Boolean(src && !hasError);

  return (
    <>
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden bg-surface-elevated border border-token shrink-0 select-none ${
          sizeStyles[size] || sizeStyles.md
        } ${roundedStyles[rounded] || roundedStyles.xl} ${
          zoomable && hasValidSrc ? "cursor-pointer group" : ""
        } ${className}`}
        onClick={() => {
          if (zoomable && hasValidSrc) setIsZoomed(true);
        }}
      >
        {hasValidSrc ? (
          <>
            <img
              src={src}
              alt={alt}
              onError={() => setHasError(true)}
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            {zoomable && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-token/60 bg-[rgba(0,210,210,0.04)]">
            <FallbackIcon className={iconSizes[size] || iconSizes.md} />
          </div>
        )}

        {badge && (
          <div className="absolute top-1 right-1 pointer-events-none">
            {badge}
          </div>
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomed && hasValidSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] p-2 rounded-2xl glass-panel border border-token"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[80vh] rounded-xl object-contain mx-auto"
            />
            <p className="text-center text-xs text-secondary-token mt-2 font-medium">{alt}</p>
          </div>
        </div>
      )}
    </>
  );
}
