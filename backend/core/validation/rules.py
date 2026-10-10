import re
from typing import Any, Tuple

# Field-level character and format regular expressions
NAME_REGEX = re.compile(r'^[a-zA-Z0-9 ]+$')
BUSINESS_NAME_REGEX = re.compile(r'^[a-zA-Z0-9 .,&_\'()/-]+$')
CODE_REGEX = re.compile(r'^[a-zA-Z0-9_-]+$')
HSN_REGEX = re.compile(r'^\d{2,8}$')
PHONE_REGEX = re.compile(r'^\+?[0-9]{7,15}$')
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')
GSTIN_REGEX = re.compile(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
PINCODE_REGEX = re.compile(r'^\d{6}$')
URL_REGEX = re.compile(r'^https?://[^\s/$.?#].[^\s]*$', re.IGNORECASE)


def validate_field_characters(key: str, val: Any) -> Tuple[bool, str | None]:
    """
    Validates that a field value only contains permissible characters.
    Rules:
    - Business / Corporate entity names: letters, numbers, spaces, and standard corporate symbols (&, ., -, ,, ', ()).
    - Personal Name fields: letters, numbers, and spaces.
    - Code / SKU fields: alphanumeric, hyphens, and underscores.
    - HSN codes: 2 to 8 numeric digits.
    - Phone / Mobile: 7 to 15 digits with optional leading '+'.
    - Email: standard RFC-compliant email address.
    - GSTIN: 15-character statutory alphanumeric code.
    - PIN Code: 6 numeric digits.
    - Website / URL: valid HTTP/HTTPS URL.
    """
    if val is None or not isinstance(val, str):
        return True, None

    cleaned_str = val.strip()
    if not cleaned_str:
        return True, None

    key_lower = key.lower()

    # 1. Business / Corporate entity names
    if key_lower in ("legal_name", "company_name", "trade_name", "vendor_name", "supplier_name", "store_name"):
        if not BUSINESS_NAME_REGEX.match(val):
            return False, (
                f"Field '{key}' contains invalid characters. "
                "Permitted: letters, numbers, spaces, and standard business symbols (&, ., -, ,, ', ())."
            )

    # 2. General Name fields
    elif key_lower == "name" or key_lower.endswith("_name"):
        if not BUSINESS_NAME_REGEX.match(val):
            return False, (
                f"Field '{key}' can only contain letters, numbers, spaces, and standard punctuation. "
                "Disallowed special characters detected."
            )

    # 2. HSN code (numeric 2-8 digits)
    elif key_lower == "hsn_code":
        if not HSN_REGEX.match(cleaned_str):
            return False, (
                f"Field '{key}' must be 2 to 8 numeric digits with no letters or special characters."
            )

    # 3. Code / SKU fields (alphanumeric, hyphens, underscores)
    elif key_lower in ("code", "sku") or (key_lower.endswith("_code") and key_lower not in ("pincode", "postal_code")):
        if not CODE_REGEX.match(cleaned_str):
            return False, (
                f"Field '{key}' can only contain letters, numbers, hyphens, and underscores."
            )

    # 4. Phone numbers
    elif key_lower in ("phone", "mobile", "contact_number"):
        if not PHONE_REGEX.match(cleaned_str):
            return False, (
                f"Field '{key}' must be a valid phone number with 7 to 15 digits."
            )

    # 5. Email addresses
    elif key_lower == "email":
        if not EMAIL_REGEX.match(cleaned_str):
            return False, (
                f"Field '{key}' must be a valid email address."
            )

    # 6. GSTIN
    elif key_lower == "gstin":
        if not GSTIN_REGEX.match(cleaned_str.upper()):
            return False, (
                f"Field '{key}' must be a valid 15-character GSTIN (e.g. 33AAAAA0000A1Z5)."
            )

    # 7. PIN code / Postal code
    elif key_lower in ("pincode", "postal_code"):
        if not PINCODE_REGEX.match(cleaned_str):
            return False, (
                f"Field '{key}' must be a 6-digit postal PIN code."
            )

    # 8. URLs / Websites
    elif key_lower in ("website", "logo_url", "url"):
        if not URL_REGEX.match(cleaned_str):
            return False, (
                f"Field '{key}' must be a valid URL starting with http:// or https://."
            )

    return True, None
