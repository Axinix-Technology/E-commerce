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
- [POLICY_ENGINE - Lightweight Authorization & CRUD Resolution](./POLICY_ENGINE.md)
  - Documents the streamlined Policy Engine logic: Super Admin bypass, in-memory cache policy verification, and dynamic CRUD resolution.
- [POPULATE_ENGINE_LIMITATIONS - Engine Constraints, Exceptions & Bug Recipes](./POPULATE_ENGINE_LIMITATIONS.md)
  - Documents MySQL InnoDB lock windows, soft-delete composite indexing directives, prefetch memory limits, and pipeline caching recipes.
- [VERSIONING - Centralized Single-Source-of-Truth Versioning](./VERSIONING.md)
  - Documents the single source of truth versioning system (`version.json`), semver automation (`version-tool.mjs`), multi-target synchronization, and deployment gates (`verify-deploy-version.mjs`).
