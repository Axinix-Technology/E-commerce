/**
 * Universal Field Character Validation & Sanitization Engine
 * 
 * Rules:
 * - name: letters, numbers, and spaces only (no special characters).
 * - code / sku: letters, numbers, hyphens (-), and underscores (_) only.
 * - hsn: numeric digits only (2 to 8 digits).
 * - phone / mobile: digits only, optional leading '+', 7 to 15 digits.
 * - email: standard RFC-compliant email address.
 * - pincode: 6 numeric digits.
 * - gstin: 15-character standard Indian GSTIN.
 * - url / website: valid URL starting with http:// or https://.
 */

export const FIELD_PATTERNS = {
  name: /^[a-zA-Z0-9 ]+$/,
  code: /^[a-zA-Z0-9_-]+$/,
  hsn: /^\d{2,8}$/,
  phone: /^\+?[0-9]{7,15}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  pincode: /^\d{6}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
  url: /^https?:\/\/.+/i,
};

export const FIELD_RESTRICTIONS = {
  // Regex of DISALLOWED characters while typing (to be stripped)
  name: /[^a-zA-Z0-9 ]/g,
  code: /[^a-zA-Z0-9_-]/g,
  hsn: /[^0-9]/g,
  phone: /[^\d+]/g,
  pincode: /[^0-9]/g,
  number: /[^0-9.]/g,
};

export const ERROR_MESSAGES = {
  name: "Special characters are not allowed. Only letters, numbers, and spaces are permitted.",
  code: "Only letters, numbers, hyphens (-), and underscores (_) are allowed.",
  hsn: "HSN code must be 2 to 8 numeric digits with no letters or special characters.",
  phone: "Please enter a valid phone number (7 to 15 digits).",
  email: "Please enter a valid email address.",
  pincode: "PIN code must be exactly 6 numeric digits.",
  gstin: "Please enter a valid 15-character GSTIN (e.g. 33AAAAA0000A1Z5).",
  url: "URL must start with http:// or https://.",
};

/**
 * Validates a value based on field type
 * @returns {{ isValid: boolean, error: string | null }}
 */
export const validateField = (fieldType, val, customError = null) => {
  if (val === null || val === undefined || val === "") {
    return { isValid: true, error: null };
  }

  const str = String(val).trim();
  if (str === "") {
    return { isValid: true, error: null };
  }

  const pattern = FIELD_PATTERNS[fieldType];
  if (!pattern) {
    return { isValid: true, error: null };
  }

  const isValid = pattern.test(fieldType === "gstin" ? str.toUpperCase() : str);
  return {
    isValid,
    error: isValid ? null : (customError || ERROR_MESSAGES[fieldType] || "Invalid format"),
  };
};

/**
 * Filter / sanitize input values while typing
 */
export const sanitizeInput = (fieldType, val) => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  const regex = FIELD_RESTRICTIONS[fieldType];
  if (!regex) return str;
  return str.replace(regex, "");
};

/**
 * Infer fieldType from label or input name
 */
export const inferFieldType = (label, name, type) => {
  const identifier = `${label || ""} ${name || ""}`.toLowerCase();
  if (identifier.includes("hsn")) return "hsn";
  if (identifier.includes("gstin")) return "gstin";
  if (identifier.includes("pincode") || identifier.includes("postal")) return "pincode";
  if (identifier.includes("phone") || identifier.includes("mobile") || identifier.includes("contact")) return "phone";
  if (type === "email" || identifier.includes("email")) return "email";
  if (type === "url" || identifier.includes("website") || identifier.includes("url") || identifier.includes("logo")) return "url";
  if (identifier.includes("code") || identifier.includes("sku")) return "code";
  if (identifier.includes("name") || identifier.includes("label") || identifier.includes("title")) return "name";
  return null;
};
