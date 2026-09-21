# Authentication: Basic Login & Session Lifecycle

## Overview
Authentication adheres to DRN §3, DRN §15, and BRS §9 specifications using JWT and database-backed session tracking:
- **Identity Model**: `User` (`name`, `email`, `password`, `role`, `status`, `lastLogin`).
- **Roles**: `Super Admin`, `Catalogue Manager`, `Inventory Manager`, `Order Manager`, `Operations User`, `Viewer/Reporting User`.
- **Password Security**: Passwords are saved with bcrypt hashing.
- **Tokens**:
  - Short-lived Access Token (`JWT_SECRET`, default 1 hour).
  - Refresh Token (`JWT_REFRESH_SECRET`, default 7 days) paired with a unique JTI.
- **Session Tracking**: `Session` model records active sessions, token, device info, and last used timestamp.
- **Guards**:
  - `authMiddleware` validates Bearer tokens on protected routes (`/api/auth/me`).
  - `authorizeRoles` enforces RBAC where needed.
- **Initial Seeding**: A Super Admin user (`admin@ecommerce.local` / `Admin@123456`) is seeded via `src/scripts/seedSuperAdmin.js`.
