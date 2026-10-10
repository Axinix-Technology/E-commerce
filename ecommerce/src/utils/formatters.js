/**
 * Universal UI Formatters complying with Rules:
 * 1. Zero Value as Dash ("—")
 * 2. Dynamic Currency from General Settings
 */

// Active configuration defaulted to standard enterprise settings
let activeCurrencyConfig = {
  code: "INR",
  symbol: "₹",
  format: "INR",
  position: "prefix",
  decimals: 2,
};

// Auto-hydrate from localStorage on load if available
try {
  const cached = localStorage.getItem("general_settings");
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.currency_symbol) activeCurrencyConfig.symbol = parsed.currency_symbol;
    if (parsed.currency_code) activeCurrencyConfig.code = parsed.currency_code;
    if (parsed.currency_format) activeCurrencyConfig.format = parsed.currency_format;
    if (parsed.currency_position) activeCurrencyConfig.position = parsed.currency_position;
    if (parsed.decimal_places) activeCurrencyConfig.decimals = Number(parsed.decimal_places);
  }
} catch {
  // fallback to defaults
}

/**
 * Update currency settings dynamically across the frontend application.
 */
export const setCurrencyConfig = (config = {}) => {
  activeCurrencyConfig = { ...activeCurrencyConfig, ...config };
};

export const getCurrencyConfig = () => ({ ...activeCurrencyConfig });

/**
 * Format currency amounts dynamically according to General Settings:
 * - If 0, null, or empty -> returns "—" (Dash)
 * - Supports INR (Lakhs/Crores) or INTL (Millions/Billions) numbering format
 * - Supports prefix or suffix symbol placement
 */
export const formatCurrency = (val, customSymbol = null, customFormat = null) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num) || num === 0) return "—";

  const symbol = customSymbol ?? activeCurrencyConfig.symbol ?? "₹";
  const format = (customFormat ?? activeCurrencyConfig.format ?? "INR").toUpperCase();
  const position = activeCurrencyConfig.position || "prefix";
  const decimals = activeCurrencyConfig.decimals ?? 2;

  let formattedNumber = "";
  if (format === "INR") {
    // Indian numbering format (e.g., 1,50,000.00)
    formattedNumber = num.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } else {
    // International numbering format (e.g., 150,000.00)
    formattedNumber = num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return position === "suffix"
    ? `${formattedNumber} ${symbol}`
    : `${symbol}${formattedNumber}`;
};

/**
 * Format integer stock quantities:
 * - If 0, null, or empty -> returns "—" (Dash)
 */
export const formatQty = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num) || num === 0) return "—";
  return num.toLocaleString();
};

/**
 * Format inward stock deltas (+qty):
 * - If 0, null, or empty -> returns "—" (Dash)
 */
export const formatInwardQty = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num) || num === 0) return "—";
  return `+${num.toLocaleString()}`;
};

/**
 * Format outward stock deltas (-qty):
 * - If 0, null, or empty -> returns "—" (Dash)
 */
export const formatOutwardQty = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num) || num === 0) return "—";
  return `-${num.toLocaleString()}`;
};
