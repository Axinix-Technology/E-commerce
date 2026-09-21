# General Settings System

## Overview

The General Settings system provides a centralized configuration document persisted in MongoDB (`general_settings` collection) to manage platform-wide preferences, store branding, localization, inventory thresholds, order prefixes, and security rules directly from the Admin UI.

---

## Schema & Settings Hierarchy

The model [`GeneralSettings.js`](file:///e:/Loigmax/E-commerce/backend/src/models/GeneralSettings.js) uses a category-keyed structure (`key: "general"` by default):

### 1. Store & Platform Identity
- **`platformName`**: Name of the multi-channel enterprise platform.
- **`storeName`**: Primary customer-facing store brand name.
- **`tagline`**: Marketing / branding tagline.
- **`siteUrl`**: Base URL of the storefront.
- **`supportEmail`** / **`supportPhone`**: Operational customer contact channels.
- **`logoUrl`** / **`faviconUrl`**: Brand asset paths.

### 2. Currency & Localization
- **`currency`**:
  - `code`: ISO 4217 code (e.g., `"USD"`, `"INR"`, `"EUR"`).
  - `symbol`: Visual symbol (e.g., `"$"`, `"₹"`).
  - `position`: `"prefix"` | `"suffix"`.
  - `decimalPlaces`: Floating precision (default `2`).
- **`localization`**:
  - `timezone`: Default system timezone (e.g., `"UTC"`).
  - `dateFormat`: UI formatting pattern (e.g., `"YYYY-MM-DD"`).
  - `timeFormat`: UI time format (e.g., `"HH:mm:ss"`).
  - `defaultLanguage`: Locale code (e.g., `"en"`).

### 3. Inventory & Order Policies
- **`inventorySettings`**:
  - `lowStockThreshold`: Stock level triggering low inventory alerts (default `10`).
  - `outOfStockThreshold`: Stock level marking SKU as depleted (default `0`).
  - `enableBackorders`: Allow orders when stock is zero.
  - `autoReserveStockOnOrder`: Deduct available stock immediately upon order placement.
  - `trackInventoryByBatch`: Enforce batch/lot tracking.
- **`orderSettings`**:
  - `orderPrefix`: Prefix for order numbers (e.g., `"ORD-"`).
  - `invoicePrefix`: Prefix for generated tax invoices (e.g., `"INV-"`).
  - `autoCancelUnpaidMinutes`: Expiration threshold for pending checkout sessions.
  - `enableGuestCheckout`: Allow checkout without account registration.

### 4. Security & Maintenance
- **`securitySettings`**:
  - `sessionTimeoutMinutes`: Maximum duration of an inactive session (default `1440` mins / 24h).
  - `maxLoginAttempts`: Consecutive failed logins before lockout.
  - `lockoutDurationMinutes`: Account cooldown duration.
  - `requireMFA`: Platform-wide multi-factor authentication toggle.
  - `allowedFileExtensions`: Whitelisted media file upload extensions.
- **`maintenanceMode`**:
  - `enabled`: Boolean toggle to place storefront into maintenance mode.
  - `message`: User-facing notification banner.

---

## UI Management via Dynamic Populate

Since `general_settings` is registered in [`Collection.js`](file:///e:/Loigmax/E-commerce/backend/src/models/Collection.js), the Admin UI manages it through the standard dynamic populate route:

- **Fetch Settings**:
  ```http
  POST /api/populate/read/general_settings
  Content-Type: application/json

  {
    "filter": { "key": "general" }
  }
  ```

- **Update Settings**:
  ```http
  POST /api/populate/update/general_settings/:id
  Content-Type: application/json

  {
    "currency": {
      "code": "USD",
      "symbol": "$",
      "position": "prefix",
      "decimalPlaces": 2
    },
    "inventorySettings": {
      "lowStockThreshold": 15
    }
  }
  ```
