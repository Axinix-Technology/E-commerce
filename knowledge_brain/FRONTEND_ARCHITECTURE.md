# Frontend Architecture: Vite, Tailwind CSS v4 & File-Based Routing

## Overview

The Frontend application is structured to follow the **Tracker-v2 Architecture** from `nexonic-technologies-tracker-v2`:
- **Core Bundler**: Vite 6 with `@vitejs/plugin-react`.
- **CSS Framework**: Tailwind CSS v4 with `@tailwindcss/vite` and `@import "tailwindcss";`.
- **Routing Engine**: Automatic file-based routing with `vite-plugin-pages` (`~react-pages`) and `react-router-dom`.
- **Theme Provider**: Dark/Light mode persistence in `localStorage` (`ThemeContext`).
- **Auth Provider**: JWT Bearer token lifecycle, `/api/auth/me` session hydration, and route protection in `BaseLayout`.

---

## Sacred Law: Pure Page-Only `src/pages/` Integrity

`vite-plugin-pages` automatically reflects every `.jsx`, `.js`, `.tsx`, `.ts` file inside `src/pages/` into an accessible URL route:
- **`src/pages/login.jsx`** $\rightarrow$ `/login`
- **`src/pages/dashboard/index.jsx`** $\rightarrow$ `/dashboard`
- **`src/pages/index.jsx`** $\rightarrow$ `/` (redirects to `/dashboard`)

> [!CAUTION]
> **Zero Tolerance for Non-Page Components in `src/pages/`**:
> Reusable UI components, widgets, cards, modals, sidebars, or layout wrappers MUST NEVER be created inside `src/pages/`. Placing non-page components in `src/pages/` creates phantom, broken URL routes. All components live strictly in `src/components/`, `src/layouts/`, `src/context/`, or `src/api/`.

---

## Authentication & Route Guard Flow (`BaseLayout.jsx`)

1. **Hydration State (`loading === true`)**:
   Shows fullscreen loading spinner while verifying existing token with `/api/auth/me`.
2. **Unauthenticated User (`!user`)**:
   - On public/auth route (`/login`): Renders standalone login screen with glassmorphism styling and username/password credentials.
   - On protected route: Automatically redirects to `/login` via `<Navigate to="/login" replace />`.
3. **Authenticated User (`user`)**:
   - On `/login`: Automatically redirects to `/dashboard`.
   - On protected route: Renders application shell with `Sidebar`, `TopNavBar`, and `{element}` page content.

---

## Sidebar Navigation Governance

Sidebar navigation is designed to support dynamic role-filtered menus loaded from MongoDB collections (e.g. `sidebars` via `/api/populate/read/sidebars`). In the current initial phase, the active route is restricted to the **Dashboard**, with future modules documented in code comments for subsequent phases.
