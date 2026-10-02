# Living Knowledge Brain - Master Index

This index is maintained in strict alphabetical order to satisfy Core Rule #2 and Core Rule #3.

---

## Alphabetical Catalog

- [ACCESS_POLICIES - Database Model & Dynamic Resolution](./ACCESS_POLICIES.md)
  - Details the AccessPolicies database model, schema fields, and dynamic database-driven resolution mechanism in the policy engine.
- [ARCHITECTURE - Dynamic Dispatch Pattern (Tracker-v2 Architecture)](./ARCHITECTURE.md)
  - Details the transition to centralized model registry (`Collection.js`), dynamic generic CRUD dispatcher (`populateHelper`), dedicated auth subsystem, and Rule #8 prohibiting redundant controllers/routers.
- [AUTHENTICATION - Basic Login & Session Lifecycle](./AUTHENTICATION.md)
  - Documents the authentication flow, token issuance (JWT Access & Refresh tokens), session persistence, and role definitions.
- [BACKUP_AND_CRON_SYSTEM - Automated Backups & Dynamic Scheduler](./BACKUP_AND_CRON_SYSTEM.md)
  - Documents the database-backed backup configurations (`backup_configs`), execution records (`backups`), dynamic `node-cron` synchronization, retention pruning, and dedicated UI endpoints.
- [FRONTEND_ARCHITECTURE - Vite, Tailwind CSS v4 & File-Based Routing](./FRONTEND_ARCHITECTURE.md)
  - Documents the frontend setup, Tailwind CSS v4, dynamic file-based routing (`~react-pages`), ThemeProvider, and pure page routing integrity.
- [GENERAL_SETTINGS - Centralized Platform Configuration](./GENERAL_SETTINGS.md)
  - Documents the platform settings schema (`general_settings`), store branding, localization, currency preferences, inventory rules, and maintenance controls manageable directly via UI.
- [GST_AND_BILLING_ARCHITECTURE - Geography Masters, Customer Master & Tax Reporting](./GST_AND_BILLING_ARCHITECTURE.md)
  - Details the State Master (36 statutory GST codes), B2B/B2C Customer Master, Place of Supply (POS) engine, and GSTR-1/GSTR-3B compliance reporting.
- [POLICY_ENGINE - Lightweight Authorization & CRUD Resolution](./POLICY_ENGINE.md)
  - Documents the streamlined Policy Engine logic: Super Admin bypass, in-memory cache policy verification, and dynamic CRUD resolution.
- [POPULATE_ENGINE_DJANGO - 10-Stage Pipeline Architecture & Core Implementation](./POPULATE_ENGINE_DJANGO.md)
  - Details the immutable 10-stage Django/MySQL execution pipeline, ModelRegistry, RelationRegistry, security guards, LRU caching, and dynamic navigation system.
- [POPULATE_ENGINE_LIMITATIONS - Engine Constraints, Exceptions & Bug Recipes](./POPULATE_ENGINE_LIMITATIONS.md)
  - Documents MySQL InnoDB lock windows, soft-delete composite indexing directives, prefetch memory limits, and pipeline caching recipes.
- [STOCK_AND_MARKETPLACE_INTEGRATION - Stock Reports & Amazon/Flipkart Sync](./STOCK_AND_MARKETPLACE_INTEGRATION.md)
  - Details the double-entry stock ledger, Available to Promise (ATP) calculations, and real-time inventory feed integration with Amazon SP-API and Flipkart.
- [STOCK_LEDGER_ARCHITECTURE - Inward/Outward Dynamic Report & Stock Buckets](./STOCK_LEDGER_ARCHITECTURE.md)
  - Details the Opening-Inward-Outward-Closing dynamic aggregation formula, multi-bucket state segregation (Sellable, Approval/Memo, Quarantine, Repair), and Service Layer architecture.
- [VENDOR_MASTER - Supplier Registration & Trade Credentials](./VENDOR_MASTER.md)
  - Details the VendorMaster entity, GSTIN/PAN compliance, banking attributes, and linkage to Inwarding/GRN.
- [VERSIONING - Centralized Single-Source-of-Truth Versioning](./VERSIONING.md)
  - Documents the single source of truth versioning system (`version.json`), semver automation (`version-tool.mjs`), multi-target synchronization, and deployment gates (`verify-deploy-version.mjs`).
