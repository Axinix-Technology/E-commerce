# Core Rules & System Directives

These rules are non-negotiable and apply to every agent action in this workspace.

## 1. No Hard Patches
- Do not apply surface-level patches, quick hacks, or temporary bypasses.
- Identify and resolve the root cause cleanly and permanently.

## 2. Living Knowledge Brain with Alphabetical Indexing
- Every update, component, concept, or fix must be documented in `knowledge_brain/`.
- Maintain strict alphabetical order in `knowledge_brain/INDEX.md` for fast scanning and retrieval.

## 3. Knowledge Brain Pre-Verification
- Before implementing any requirement or fix, inspect `knowledge_brain/INDEX.md` and corresponding entries.
- Verify existing patterns, lessons learned, and system specifications.

## 4. Generic Cognitive Architecture (No Code-Based Orchestration)
- AR.I.S is an Artificial Intelligent System.
- Do not build hardcoded procedural orchestration pipelines or rigid code paths.
- Design solutions that empower generic, autonomous reasoning and flexible cognitive models.

## 5. Mandatory Implementation & Audit Plan
- Do not write or modify functional code without an implementation plan and verification/audit plan.
- Ensure all changes are code-proofed and validated.

## 6. Human-Understandable Language
- Keep all explanations, documentation, and comments crystal clear, descriptive, and human-readable.

## 7. Prohibition of Surface Guards & Mandatory Exact-Line Audit
- Never use character-level punctuation checks (e.g., `.endswith("?")`, `.startswith()`), string-slicing guards, or hardcoded stopword/keyword lists.
- All linguistic decisions must come from the neural tensor substrate (`CognitiveLinguisticFrame`).
- For every code edit, explicitly record and verify the exact file, exact line numbers, what changed, and why it changed.

## 8. Strict Prohibition on Redundant Routers & Controllers (Populate-Helper + Service First)
- **`populate` is NOT limited to standard CRUD**: Through domain services (`services/<model>.js`), the populate pipeline can execute **ANY** complex business logic, validations, state transitions, calculations, multi-collection workflows, third-party integrations, and side effects via lifecycle hooks (`beforeCreate`, `afterCreate`, `beforeUpdate`, `afterUpdate`, `beforeRead`, `afterRead`, `beforeDelete`, `afterDelete`, custom queries/aggregations).
- **Core Architectural Rationale & Inherited Benefits**:
  - Using this pipeline allows every feature and entity to inherit **predefined access policies** (RBAC, field-level allow/forbidden checks via `policyEngine`), **automatic data sanitization** (`sanitizeWrite`, `sanitizeRead`, `sanitizeUpdate`), **safe aggregation controls** (`safeAggregator`), and **validation security** (correlation IDs, error sanitization, Multer upload normalization, pagination) seamlessly without rewriting them for every endpoint.
- Having custom or complex business logic is **NEVER** a valid reason to create a dedicated controller or router. Custom business logic belongs in the domain service (`services/<model>.js`), executed seamlessly within the `/api/populate` request lifecycle.
- Controllers and routers must **ONLY** be created when a capability **cannot** physically be handled via `populateHelper` (e.g., binary stream piping/downloads like compressed backup archives, stateful session handshakes in Auth, or external webhook signature verification) or would cause a verified, critical **performance bottleneck**.
- If anything can be handled via `models/` + `Collection.js` + `populateHelper` + `services/<model>.js`, creating a new router or controller is **STRICTLY PROHIBITED**.

