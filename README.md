# Centralized E-commerce, Inventory & Marketplace Management Platform

Monorepo for the Centralized E-commerce Platform.

## Directory Layout
- **`backend/`**: Express.js REST API with dynamic CRUD dispatcher & authentication engine.
- **`frontend/`**: React.js Admin Panel (Vite) for staff operations.
- **`ecommerce/`**: Next.js Storefront for customer sales.
- **`database/`**: MongoDB scripts, migrations, seed data, and query playgrounds.
- **`Docs/`**: Original BRS, DRN, and Project Plan documentation.
- **`knowledge_brain/`**: Living Knowledge Brain documenting architecture and decisions.
- **`.agents/`**: Core directives and rules.

## Quick Start (Backend)
```bash
cd backend
npm install
npm run seed
npm run dev
```
