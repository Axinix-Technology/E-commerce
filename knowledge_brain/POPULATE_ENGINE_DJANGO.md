# Populate Engine (Django + MySQL Foundation)

## 1. Overview
The Populate Engine is the centralized, generic execution system for Django + MySQL based on `POPULATE_ENGINE_DJANGO_MYSQL.md` and Tracker-v2 architecture. Every data request flows through a strict, fixed 10-stage execution pipeline.

---

## 2. The 10 Core Pipeline Stages

```text
REQUEST -> Ingress -> Validation -> Sanitization -> Authorization -> Parsing -> Planning -> Compilation -> Execution -> Serialization -> Finalization -> RESPONSE
```

| # | Stage | Module | Responsibility |
|---|---|---|---|
| **01** | **Ingress** | `core/pipeline/stages.py:IngressStage` | Extracts parameters, query, body, user into immutable `RequestContext`. |
| **02** | **Validation** | `core/validation/validator.py` | Validates data shape, model registration, action, and types via `DynamicModelValidator`. |
| **03** | **Sanitization** | `core/security/sanitizer.py` | Validates identifiers against whitelist (`IdentifierGuard`, `LookupGuard`). No string character-replacement. |
| **04** | **Authorization** | `core/policy/engine.py` | Evaluates RBAC/ABAC permissions via `PolicyEngine` (strictly `is_superuser` bool). Returns row `Q()` and field masks. |
| **05** | **Parsing** | `core/query/parser.py` | Converts developer DSL (`populate`, `filters`) into `ParsedQueryAST` with in-memory LRU caching. |
| **06** | **Planning** | `core/query/planner.py` | Maps joins to `select_related` and `prefetch_related` with max depth = 3 and max 50 children. |
| **07** | **Compilation** | `core/query/compiler.py` | Compiles `QueryPlan` into Django `QuerySet` with mandatory active status scoping (`Q(status=1)`). |
| **08** | **Execution** | `core/crud/` | Executes atomic CRUD transactions with domain service extension hooks (`before_*`, `after_*`). Minimal lock windows (<10ms). |
| **09** | **Serialization** | `core/serialization/output.py` | Controls output security, filters forbidden fields (`password`), renders nested relations. |
| **10** | **Finalization** | `core/response/normalizer.py` | Logs audit records via `AuditLogger` and emits standardized `{ success, count, data, metadata }` response. |

---

## 3. Dynamic Navigation & Capability System
Dynamic navigation is stored in the database (`Sidebar` and `Capability` models):
- **Parent Nodes**: E.g., `Catalogue Master` has `is_parent=True`, `main_route=None`, and a dedicated icon (`Tags`). In the UI, clicking a parent node only toggles the collapsible submenu accordion.
- **Submenus**: E.g., `Category`, `Product`, `Product Variants`, `GST Master`. Submenu items use a single unified subtle dot indicator to prevent icon clutter.
- **Capability Gating**: Submenu items are bound to specific `Capability` keys to control visibility and permissions.
