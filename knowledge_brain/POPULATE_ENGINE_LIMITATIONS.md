# Populate Engine Limitations, Exceptions & Bug Recipes

This document records the architectural constraints, MySQL/Django ORM edge cases, and required development practices when building or querying using the Populate Engine.

---

## 1. Scope and Rationale

The Populate Engine is a generic, 10-stage execution pipeline designed to eliminate manual boilerplate and enforce security. While architecturally robust, running dynamic ORM queries on relational MySQL requires strict adherence to concurrency, indexing, and memory boundaries.

---

## 2. Documented Limitations & Recipes

### A. Lock Contention & Transaction Windows (InnoDB)
- **Constraint:** Using `select_for_update()` inside `transaction.atomic()` holds row locks in MySQL until the entire transaction finishes.
- **Risk:** Performing slow validations, external HTTP requests, or notification dispatch while holding locks leads to **MySQL Error 1213 (Deadlock detected)** or connection exhaustion.
- **Recipe:**
  - Execute non-database work (external APIs, heavy compute) **before** opening the atomic block.
  - Keep row-locking transactions strictly under **10ms**.
  - Dispatch event notifications and webhook triggers asynchronously **after** transaction commit (`transaction.on_commit(...)`).

### B. The Low-Cardinality Soft-Delete Trap (`status = 1`)
- **Constraint:** Golden Rule 11 scopes queries automatically to `status = 1`.
- **Risk:** Because 95%+ of records are active, MySQL's B-Tree optimizer skips standalone single-column indexes on `status` and falls back to a **full table scan**.
- **Recipe:**
  - Never rely on an isolated `status` index.
  - Implement composite indexes matching query patterns, e.g. `(status, tenant_id, created_at)` or `(user_id, status)`.

### C. Memory Footprint in Deep `prefetch_related`
- **Constraint:** Resolving nested relations across one-to-many or many-to-many relationships loads entire query sets into Python memory.
- **Risk:** Cascading relationships (e.g. `order → items → product → vendor`) cause Python process memory spikes and Out-Of-Memory (OOM) worker kills under concurrent load.
- **Recipe:**
  - Hard limit of **3 nested levels** on populate DSL requests.
  - Enforce bounded slicing (max 50 records per parent child list).

### D. Pipeline Latency Mitigation
- **Constraint:** 10 sequential pipeline stages can incur 15–30ms pure Python CPU processing overhead.
- **Recipe:**
  - Cache parsed DSL ASTs and query plans in an in-memory LRU cache.
  - Cache authorization policies in Redis/memory to avoid per-request MySQL queries.

---

## 3. Related References

- [Architecture Contract](../Docs/POPULATE_ENGINE_DJANGO_MYSQL.md)
- [Agent Rules: Known Limitations & Recipes](../.agents/Rules/known_limitations_and_recipes.md)
- [Living Index](./INDEX.md)
