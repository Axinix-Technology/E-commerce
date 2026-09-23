# Known Limitations, Architecture Exceptions & Bug Recipes

This document outlines structural limitations, operational exceptions, and preventative bug recipes for developers and AI agents working with the Populate Engine, Django ORM, and MySQL backend.

---

## 1. Recipe 01 — InnoDB Lock Contention on High-Frequency Transaction Tables

### The Threat
- **Mechanism:** Using `select_for_update()` inside `transaction.atomic()` locks target database rows until the transaction terminates.
- **Production Failure:** If service hooks (`before_*` or `after_*`) perform third-party HTTP requests, payment gateway handshakes, slow validations, or email/SMS notifications while holding a row lock, concurrent requests queue up, leading to **MySQL Error 1213 (Deadlock detected)** and **Lock wait timeout exceeded**.

### Non-Negotiable Directive
1. **Never perform network I/O or heavy computations inside the transaction lock window.**
2. Execute all external calls and pre-validations **before** acquiring the lock:
   ```python
   # ✅ CORRECT PATTERN:
   # 1. External I/O and heavy checks outside the transaction
   payment_service.verify_token(token)
   
   # 2. Tight, minimal DB lock window
   with transaction.atomic():
       record = Model.objects.select_for_update().get(pk=object_id)
       record.status = new_status
       record.save(update_fields=["status"])
       
   # 3. Post-commit side effects outside the transaction
   event_bus.publish_async("order.updated", record.id)
   ```
3. Keep database lock holding duration strictly under **10 milliseconds**.

---

## 2. Recipe 02 — The "Soft-Delete Index Trap" (`status = 1`)

### The Threat
- **Mechanism:** Golden Rule 11 automatically scopes read queries to `WHERE status = 1`.
- **Production Failure:** `status` is a low-cardinality field (choices: `0` or `1`). In production tables where 95%+ of rows are active (`status = 1`), MySQL's query optimizer evaluates a single-column index on `status` as ineffective and **drops back to a full table scan**, devastating query performance on large tables.

### Non-Negotiable Directive
1. **Never rely on a standalone `db_index=True` on `status`.**
2. Every high-volume master and transaction table **must** define compound/composite indexes:
   ```python
   class Meta:
       indexes = [
           # Compound index for tenant + status scoping
           models.Index(fields=["status", "tenant_id", "created_at"]),
           # Compound index for relation lookup with status
           models.Index(fields=["user_id", "status"]),
       ]
   ```
3. Ensure composite index ordering matches the exact filtering hierarchy in query compilation.

---

## 3. Recipe 03 — Memory Spikes from Nested `prefetch_related`

### The Threat
- **Mechanism:** Deep populate requests (e.g. `order → items → product → vendor`) traverse reverse foreign keys or many-to-many relationships.
- **Production Failure:** Unlike `select_related` (which uses SQL `JOIN`), `prefetch_related` runs separate queries and stitches hundreds or thousands of model instances in Python process memory. Under concurrent load, nested unbounded queries trigger immediate RAM spikes and container **OOM (Out Of Memory) crashes**.

### Non-Negotiable Directive
1. **Hard Ceiling on Populate Depth:** No populate instruction may exceed **3 nested levels** (e.g., `a.b.c`). Deeper queries fail validation closed (`MaxPopulateDepthExceeded`).
2. **Bounded Children Limit:** Nested populated child relations must enforce a default pagination ceiling (maximum **50 records** per parent node).
3. Where large child collections exist, use a dedicated paginated endpoint rather than deep cascading populate trees.

---

## 4. Recipe 04 — Pipeline Execution CPU Overhead & Dynamic Caching

### The Threat
- **Mechanism:** The Populate Engine executes a deterministic 10-stage pipeline (Ingress → Validation → Sanitization → Authorization → Parsing → Planning → Compilation → Execution → Serialization → Finalization).
- **Production Failure:** Processing all 10 stages entirely dynamically in pure Python can introduce 15–30ms of pure CPU overhead per request, bottlenecking throughput on high-traffic endpoints.

### Non-Negotiable Directive
1. **Cache Parsed DSL Plans:** For repeated queries, cache the parsed query plan and field projection tokens in an in-process LRU cache keyed by `hash(model_name + action + dsl_payload)`.
2. **Bypass Redundant Parsing on Cache Hit:** Validated query plans skip Stage 05 (Parsing) and proceed straight to parameterized compilation.
3. **Cache Policy Evaluation:** User permissions and role capabilities must be read from Redis/in-memory cache rather than queried from MySQL on every pipeline cycle.
