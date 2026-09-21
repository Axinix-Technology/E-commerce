# Architecture: Dynamic Dispatch Pattern (Tracker-v2 Model)

## Context & Decision
The original Project Plan (`Docs/Commerce_Platform_Project_Plan.docx`) proposed per-module controllers and routes (e.g. `product.controller.js`, `product.routes.js`).
Per system requirement, this was updated to match the production architecture from `nexonic-technologies-tracker-v2`:
1. **Central Model Registry (`models/Collection.js`)**: All Mongoose models are imported and exported in an aggregated object dictionary (`{ users, roles, sessions, ... }`).
2. **Unified Dynamic Route (`routes/populateRoutes.js`)**:
   - `ALL /api/populate/:action/:model`
   - `ALL /api/populate/:action/:model/:id`
3. **Dynamic Dispatch Helper (`helper/populateHelper.js`)**:
   - Parses the target model and action (`create`, `read`, `update`, `delete`, `report`).
   - Dispatches to specialized query builders (`crud/buildCreateQuery.js`, `crud/buildReadQuery.js`, etc.).
   - Triggers pre/post hooks in domain services (`services/<model>.js`) when present.
4. **Dedicated Domain Subsystems**:
   - Flows requiring customized business lifecycles and specialized security guards (specifically Authentication at `/api/auth/*`) retain dedicated controllers (`Controller/AuthController.js`) and routes (`routes/authRoutes.js`).
5. **Strict Router & Controller Creation Rule (Rule #8)**:
   - **`populate` is NOT limited to standard CRUD**: Through domain services (`services/<model>.js`), the populate pipeline can execute **ANY** complex business logic, validations, calculations, multi-collection mutations, third-party integrations, and side effects via lifecycle hooks (`beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `beforeRead`, `afterRead`, `beforeDelete`, `afterDelete`, custom queries/aggregations).
   - Having custom or complex business logic is **NEVER** a valid reason to create a dedicated controller or router. All business logic belongs in the domain service (`services/<model>.js`), executed seamlessly within the `/api/populate` request lifecycle (`ctx`).
   - Creating a new controller or router is **STRICTLY PROHIBITED** unless:
     - The transport **cannot** physically be handled via `populateHelper` (e.g., binary stream piping/downloads like `/api/backups/download/:id`, stateful session handshakes in Auth, or external webhook signature verification).
     - OR handling it via `populateHelper` causes a verified, critical **performance bottleneck**.
   - If an entity or feature can be handled via `models/` + `Collection.js` + `populateHelper` + `services/<model>.js`, it **must** be implemented within this pipeline. No new controller or router may be created.
6. **Core Use Case & Architectural Rationale**:
   - **Predefined Access Policies**: Centralized, fine-grained RBAC with action permissions (`read`, `create`, `update`, `delete`, `report`) and field-level controls (`allowAccess`, `forbiddenAccess`) enforced automatically by `policyEngine` without writing custom permission middlewares for every endpoint.
   - **Automatic Data Sanitization**: Dedicated sanitizers (`sanitizeWrite`, `sanitizeRead`, `sanitizeUpdate`) automatically strip prohibited fields, enforce schema boundaries, and protect sensitive data across all models.
   - **Safe Aggregation & Resource Protection**: All reporting queries automatically run through `safeAggregate`, enforcing lookup limits, unwind caps, match stages, and blocking dangerous operators (`$out`, `$merge`) without manual defensive coding.
   - **Seamless Validation & Perimeter Security**: Request tracing (`x-request-id`), centralized error formatting (`sanitizeErrorResponse`), file upload parsing (Multer), and pagination/sorting/filtering normalization are applied universally.
   - **Zero-Boilerplate Productivity**: Developers never re-write routing, validation, sanitization, or permission checks. They define the pure schema in `models/` and focus 100% on domain business rules inside `services/<model>.js`.

