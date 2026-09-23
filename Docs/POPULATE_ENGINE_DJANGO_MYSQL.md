# <span style="color:#2563eb">Django + MySQL Populate Engine</span>

> **Architecture contract:** This document defines the generic request pipeline for the Django + MySQL Populate Engine.
>
> **Primary rule:** Every request follows the same pipeline. Developers do not manually remember which validation, security, serialization, or execution checks are required.

---

## <span style="color:#16a34a">🎯 1. Core Philosophy</span>

The engine is a **generic execution system**, not a business-logic system.

The original Populate Engine was a policy-driven generic CRUD orchestrator with separate routing, validation, policy, query building, sanitization, service hooks, auditing, and response responsibilities. The Django version preserves that separation while replacing MongoDB/Mongoose behavior with Django ORM/MySQL behavior.

### Golden Rules

| # | Rule | Meaning |
|---|---|---|
| **01** | **One Request, One Pipeline** | Every request enters one generic pipeline. No alternate shortcut pipeline for a model. |
| **02** | **Only Services Know Business** | Business meaning belongs only in the model's service/domain layer. The generic engine knows execution, not business meaning. |
| **03** | **Generic Over Model Logic** | Avoid `if department`, `if employee`, `if policy_x`. Prefer generic metadata, context, registries, schemas, and policy definitions. |
| **04** | **Every Stage Has Exactly One Purpose** | A stage owns one responsibility. It must not silently perform another stage's job. |
| **05** | **Every Request Follows Every Required Stage** | Developers do not decide whether validation/security/sanitization is needed. The pipeline decides. |
| **06** | **No Duplicate Responsibility** | The same responsibility must not exist in two independent places. One owner only. |
| **07** | **Execution Is Generic** | Query planning and execution must not contain business rules. |
| **08** | **Developer DSL, Not SQL** | Populate/filter payloads are a compact developer DSL. They never become raw SQL. |
| **09** | **Fail Closed** | Invalid schema, relation, operator, policy, field, or query instruction stops execution. |
| **10** | **Business Logic Is an Explicit Extension Point** | Services are called by the pipeline; the pipeline itself never absorbs model-specific business behavior. |
| **11** | **Mandatory Table Status Metadata (0/1)** | Every registered table (whether Master or Transaction) must define a `status` field in its metadata. Status is strictly controlled by `1` (Active) and `0` (Deactive) for delete-based queries, active scoping, and lifecycle state. |

---

# <span style="color:#2563eb">2. Architecture at a Glance</span>

```text
                         REQUEST
                            │
                            ▼
                 ┌────────────────────┐
                 │ 01. INGRESS         │
                 │ Request / Context   │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 02. VALIDATION     │
                 │ Schema / Shape     │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 03. SANITIZATION   │
                 │ Input / Query Safe │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 04. AUTHORIZATION  │
                 │ RBAC / ABAC        │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 05. PARSING        │
                 │ Developer DSL      │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 06. QUERY PLAN     │
                 │ Relations / Joins  │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 07. COMPILATION    │
                 │ Django QuerySet    │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 08. EXECUTION      │
                 │ CRUD + Services    │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 09. SERIALIZATION  │
                 │ Output Security    │
                 └─────────┬──────────┘
                           ▼
                 ┌────────────────────┐
                 │ 10. FINALIZATION   │
                 │ Audit / Events /   │
                 │ Response           │
                 └─────────┬──────────┘
                           ▼
                         RESPONSE
```

---

# <span style="color:#16a34a">3. Responsibility Boundary</span>

| Stage | Owns | Must NOT Own |
|---|---|---|
| 01 Ingress | Request/context creation | Business rules |
| 02 Validation | Shape/types/business-independent validation | Permissions |
| 03 Sanitization | Unsafe input/query instructions | Business decisions |
| 04 Authorization | Authentication, RBAC, ABAC, field access | Query construction |
| 05 Parsing | DSL → structured representation | DB access |
| 06 Query Planning | Relation/join strategy | Business logic |
| 07 Compilation | Structured plan → Django ORM | Execution side effects |
| 08 Execution | CRUD transaction + service hooks | Response formatting |
| 09 Serialization | Allowed output representation | Query construction |
| 10 Finalization | Audit/events/response envelope | Business rules |

> **If a piece of code cannot clearly answer "which stage owns me?", it is probably in the wrong place.**

---

# <span style="color:#f59e0b">4. The One-Pipeline Rule</span>

There must be one entry point for generic data operations.

```text
POST /populate/{action}/{model}
```

Conceptually:

```python
def execute(request):
    context = ingress(request)
    validated = validate(context)
    safe = sanitize(validated)
    authorized = authorize(safe)
    parsed = parse(authorized)
    plan = plan_query(parsed)
    query = compile_query(plan)
    result = execute_query(query)
    output = serialize(result)
    return finalize(output)
```

The actual implementation may use classes, sealed template methods, registries, or dependency injection, but **the responsibility sequence remains fixed**.

Subclasses/extensions may provide hooks. They must not bypass mandatory stages.

---

# <span style="color:#2563eb">5. Level 01 — Ingress & Context</span>

### Purpose

Create the single immutable context used by the entire request.

```python
@dataclass(frozen=True)
class RequestContext:
    action: Action
    model_name: str
    object_id: int | None
    body: dict
    filters: dict
    populate: dict
    ordering: list
    pagination: dict
    user: User
    request_id: str
```

### Owns

- Dynamic route resolution
- Request ID
- Action extraction
- Model-name extraction
- Request context creation

### Does not own

- Field validation
- Policy evaluation
- Query building
- Business logic

---

# <span style="color:#2563eb">6. Level 02 — Validation</span>

### Purpose

Determine whether the request has a valid structure and valid data shape.

Use:

- Pydantic schemas
- DRF serializers where appropriate
- Django model metadata
- Cross-field validation

Examples:

```text
required field
string / integer / date type
maximum length
date relationship
numeric range
enum value
```

### Important boundary

Validation answers:

> **"Is this data structurally and logically valid?"**

It does NOT answer:

> "Is this user allowed to change this field?"

That belongs to Authorization.

---

# <span style="color:#2563eb">7. Level 03 — Security Sanitization</span>

### Purpose

Prevent request-controlled data from becoming executable query instructions.

## SQL Injection Rule

**Never sanitize SQL by deleting characters.**

Do not depend on:

```python
value.replace("'", "")
value.replace("--", "")
value.replace(";", "")
```

Instead:

```text
USER VALUE
   │
   ▼
Django ORM parameter
   │
   ▼
MySQL parameter
```

The engine must never convert request data into raw SQL text.

### Dynamic identifiers must be whitelisted

The following are treated as **syntax**, not values:

```text
model
field
relation
lookup operator
ordering
populate path
join modifier
```

They must be validated against:

```text
Django model metadata
Model Registry
Relation Registry
LookupOperator enum
Ordering whitelist
Populate DSL grammar
```

### Forbidden

```text
raw SQL from request
raw table name from request
raw column name from request
raw JOIN clause from request
raw WHERE clause from request
raw SQL operator from request
```

---

# <span style="color:#2563eb">8. Level 04 — Authorization</span>

### Purpose

Determine what the authenticated user is allowed to do.

```text
Authentication
      ↓
Role / RBAC
      ↓
ABAC conditions
      ↓
Model permission
      ↓
Field permission
```

Policies should be declarative.

Prefer:

```python
Q(manager_id=context.user.id)
```

over:

```python
if model == "employee":
    ...
```

### Generic Context

Policy conditions receive context:

```python
PolicyContext(
    user=user,
    action=action,
    model=model,
    object_id=object_id,
    request=context,
)
```

The policy engine should not know business-specific model behavior.

---

# <span style="color:#2563eb">9. Level 05 — Developer DSL Parser</span>

### Purpose

Convert compact developer payloads into an internal representation.

The frontend/developer-facing syntax remains compact.

## Populate Syntax

```text
relation       = AUTO
relation>      = INNER JOIN
relation<      = LEFT OUTER JOIN
```

Example:

```json
{
  "populate": {
    "department": ["id", "name"],
    "department>manager": ["id", "name"],
    "branch<company": ["id", "name"]
  }
}
```

### Meaning

```text
department
    ↓
AUTO

department>manager
    ↓
department INNER JOIN manager

branch<company
    ↓
branch LEFT OUTER JOIN company
```

The symbols are part of our **Populate DSL**. They are never passed to MySQL.

---

# <span style="color:#2563eb">10. Dot Notation</span>

The frontend keeps the existing developer-friendly dot notation.

```text
department.name
department.manager.name
branch.company.name
```

Django relation syntax becomes:

```text
department__name
department__manager__name
branch__company__name
```

But the translation is only allowed after relation validation.

```text
DOT PATH
   ↓
split(".")
   ↓
validate every segment
   ↓
resolve Django relation metadata
   ↓
convert to ORM path
```

No blind string conversion.

---

# <span style="color:#2563eb">11. Lookup Operators</span>

Use one controlled vocabulary.

```text
exact
gt
gte
lt
lte
in
icontains
contains
startswith
istartswith
endswith
iendswith
isnull
range
```

Example:

```text
price.gt = 100
```

becomes:

```python
queryset.filter(price__gt=100)
```

Example:

```text
department.name = "Sales"
```

becomes:

```python
queryset.filter(
    department__name="Sales"
)
```

The parser does not invent operators. It only accepts registered operators.

---

# <span style="color:#16a34a">12. Level 06 — Relation & Query Planning</span>

### Purpose

Determine how requested relationships should be retrieved.

```text
Populate AST
     ↓
Django Model Metadata
     ↓
Relation Resolver
     ↓
Join Planner
```

### Relation strategy

```text
ForeignKey / OneToOne
        ↓
select_related()

ManyToMany / Reverse FK
        ↓
prefetch_related()
```

### Join strategy

```text
AUTO
INNER
LEFT OUTER
RIGHT
PREFETCH
```

`RIGHT` is an explicit advanced option and should only be compiled where the ORM/database strategy supports it safely. It should not be implemented by injecting raw SQL.

### Planner owns

- Relation existence
- Relation type
- Join strategy
- Join depth
- Duplicate relation removal
- Populate path collision
- `select_related`
- `prefetch_related`

It does not execute queries.

---

# <span style="color:#2563eb">13. Populate Collision Guard</span>

Parent/child paths must be normalized.

Input:

```text
department
department.manager
```

If selecting the parent already covers the required representation, the engine must avoid contradictory projection/population instructions.

Conceptually:

```text
requested paths
      ↓
normalize
      ↓
remove redundant/conflicting paths
      ↓
query plan
```

This preserves the original engine's path-collision responsibility without carrying over Mongoose-specific behavior.

---

# <span style="color:#2563eb">14. Level 07 — Query Compilation</span>

### Purpose

Convert the validated query plan into a Django QuerySet.

Example:

```python
qs = Employee.objects.all()

qs = qs.filter(
    department__name="Sales"
)

qs = qs.select_related(
    "department",
    "designation"
)

qs = qs.order_by("-created_at")

qs = qs[:50]
```

The compiler can combine:

```text
filters
+
policy Q()
+
status scope (status=1 for active records)
+
ordering
+
projection
+
pagination
+
populate plan
```

### Status Scope & Delete-Based Queries

Because all registered Master and Transaction tables are governed by the `status` metadata rule:
- **Default Active Scoping:** All read, list, and populate queries automatically inject a `Q(status=1)` filter to target active records.
- **Deactive Filtering:** Records with `status=0` (Deactive / Soft-Deleted) are excluded from standard query compilation unless explicitly bypassed via authorized audit/recovery scopes.

### Critical rule

The compiler does not know:

```text
"What is an employee?"
"What does a ticket mean?"
"What should happen when an invoice is created?"
```

It only knows:

```text
Model
Field
Relation
Lookup
QuerySet
Plan
Context
```

---

# <span style="color:#2563eb">15. Level 08 — Generic Execution</span>

### Purpose

Execute the operation.

Supported actions:

```text
READ
CREATE
UPDATE
DELETE
REPORT
```

### Mutation execution

```text
transaction.atomic()
        ↓
lock if required
        ↓
service before hook
        ↓
database mutation
        ↓
service after hook
```

Concurrency:

```python
with transaction.atomic():
    object = (
        Model.objects
        .select_for_update()
        .get(pk=object_id)
    )
```

Optimistic versioning can additionally be applied where the model has a version field.

### DELETE Action & Status Lifecycle

Under the Golden Rule, delete queries are status-controlled:

```text
DELETE request received
        ↓
Lookup target object in active scope (status=1)
        ↓
Execute service before_delete hook
        ↓
Status mutation: object.status = 0 (Deactive)
        ↓
Execute service after_delete hook
        ↓
Commit transaction (atomic)
```

- **Soft Delete by Default:** Physical deletion (`DELETE FROM table`) is disallowed for registered Master and Transaction tables. A `DELETE` operation executes a soft-delete by mutating `status = 0` (Deactive).
- **Activation / Reactivation:** Restoring or activating an entity sets `status = 1` (Active).
- **Audit & History:** State transitions between `1` (Active) and `0` (Deactive) are logged in the audit trail.

---

# <span style="color:#16a34a">16. The Service Boundary — Business Lives Here</span>

This is the most important boundary in the architecture.

```text
GENERIC ENGINE
      │
      │ calls
      ▼
MODEL SERVICE
      │
      └── business meaning
```

Example:

```python
# services/task.py

def before_create(context, data):
    if not data.get("due_date"):
        raise BusinessRuleError("Due date required")

    return data
```

The generic engine must never contain:

```python
if model == "task":
if model == "employee":
if model == "invoice":
```

Business rules belong in:

```text
services/
    employee.py
    task.py
    invoice.py
    ticket.py
```

The service is the only layer allowed to understand domain meaning.

---

# <span style="color:#2563eb">17. Level 09 — Output Serialization</span>

### Purpose

Control exactly what leaves the backend.

```text
Database Result
      ↓
DRF Serializer
      ↓
Field Policy
      ↓
Populate Representation
      ↓
Serialized Response
```

This is separate from input sanitization.

### Input security asks

> Can this request safely enter the execution system?

### Output serialization asks

> What data may leave the system?

They must never be combined into one "sanitize everything" helper.

---

# <span style="color:#2563eb">18. Level 10 — Finalization</span>

### Purpose

Complete the request after execution.

```text
Result
  ↓
Audit
  ↓
Domain Event
  ↓
Tracing
  ↓
Response Envelope
```

Example:

```json
{
  "success": true,
  "count": 20,
  "data": []
}
```

There is one response builder for both success and failure.

---

# <span style="color:#f59e0b">19. Generic Context — The Anti-If Rule</span>

When behavior depends on request state, prefer context over model-specific branching.

Bad:

```python
if model_name == "employee":
    ...
elif model_name == "ticket":
    ...
```

Good:

```python
context.model
context.action
context.user
context.object_id
context.policy
context.relations
context.schema
context.service
```

And registry-driven behavior:

```text
Model Registry
Schema Registry
Policy Registry
Service Registry
Relation Metadata
Lookup Registry
```

The generic pipeline consumes registered capabilities.

---

# <span style="color:#dc2626">20. Mandatory Guardrail Principle</span>

Developers should **not** need to remember:

```text
Did I validate?
Did I sanitize?
Did I check the policy?
Did I validate the relation?
Did I sanitize output?
Did I audit?
```

The architecture answers these automatically.

A request cannot jump:

```text
Validation → Execution
```

or:

```text
Parsing → Database
```

or:

```text
Authentication → Business Service
```

without passing mandatory stages.

The pipeline itself is the developer guardrail.

---

# <span style="color:#2563eb">21. Registration-Time Enforcement</span>

Every registered model must provide the generic capabilities required by the pipeline.

### Master & Transaction Table Classification with Status Metadata

Every table registration must classify whether the model is a **Master** or a **Transaction** table and explicitly declare its lifecycle `status` metadata:
- `status = 1`: **Active**
- `status = 0`: **Deactive** (Soft-deleted / Inactive for delete-based queries)

Conceptually:

```python
@register_model(
    "employee",
    table_type="master",             # "master" | "transaction" (mandatory)
    status_field="status",           # controlled by 1 (active) / 0 (deactive)
    schema=EmployeeSchema,
    serializer=EmployeeSerializer,
    policy="employee",
    service=EmployeeService,
)
class Employee(models.Model):
    # Mandatory lifecycle metadata field for all master/transaction models
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Deactive")],
        db_index=True,
        help_text="0 = Deactive (soft-deleted), 1 = Active",
    )
    ...
```

Startup/system checks must reject missing required registrations or missing status metadata.

The objective is:

```text
Registered model missing 'status' or 'table_type'
      ↓
manage.py check
      ↓
FAIL (E001: Model 'employee' must define status metadata with 0/1 active-deactive control)
```

not:

```text
Bad configuration
      ↓
Production
      ↓
Unexpected runtime behavior / Hard row deletion
```

---

# <span style="color:#16a34a">22. Suggested Project Structure</span>

```text
core/
│
├── pipeline/
│   ├── executor.py
│   ├── stages.py
│   └── context.py
│
├── registry/
│   ├── model_registry.py
│   ├── relation_registry.py
│   ├── service_registry.py
│   └── policy_registry.py
│
├── validation/
│   ├── schemas/
│   └── validator.py
│
├── security/
│   ├── sanitizer.py
│   ├── identifier_guard.py
│   └── lookup_guard.py
│
├── policy/
│   ├── engine.py
│   ├── context.py
│   └── conditions/
│
├── query/
│   ├── parser.py
│   ├── compiler.py
│   ├── planner.py
│   ├── relation_resolver.py
│   └── collision_guard.py
│
├── crud/
│   ├── read.py
│   ├── create.py
│   ├── update.py
│   ├── delete.py
│   └── report.py
│
├── serialization/
│   ├── base.py
│   └── output.py
│
├── audit/
│   └── logger.py
│
└── response/
    ├── normalizer.py
    └── exceptions.py
│
services/
├── employee.py
├── task.py
├── invoice.py
└── ticket.py
```

---

# <span style="color:#2563eb">23. Build Order</span>

```text
01. Core Context
        ↓
02. Model / Capability Registry
        ↓
03. Pipeline Executor
        ↓
04. Schema Validation
        ↓
05. Security Sanitization
        ↓
06. Authorization / Policy
        ↓
07. Filter + Populate DSL Parser
        ↓
08. Relation Resolver
        ↓
09. Join / Query Planner
        ↓
10. Django Query Compiler
        ↓
11. Generic CRUD Executor
        ↓
12. Service Boundary
        ↓
13. Output Serializer
        ↓
14. Audit / Events / Response
        ↓
15. System Checks + Static Typing
        ↓
16. Security / Pipeline Tests
```

---

# <span style="color:#dc2626">24. Final Architecture Contract</span>

These are not suggestions.

They are **engineering rules**.

### Rule A — One request, one path

Every generic request follows the same mandatory pipeline.

### Rule B — One responsibility, one owner

If two modules do the same job, merge the responsibility.

### Rule C — Business meaning belongs to services

Generic infrastructure must not understand domain meaning.

### Rule D — Generic context beats model conditionals

Prefer:

```text
context
registry
metadata
policy
schema
```

over:

```text
if model == ...
if department == ...
if employee == ...
```

### Rule E — Stages are developer guardrails

A stage is not merely an organizational concept. It is an enforced execution boundary.

### Rule F — No silent bypass

A developer cannot accidentally skip validation, security, authorization, planning, serialization, or finalization.

### Rule G — SQL is an implementation detail

The Populate Engine produces Django ORM expressions. It does not construct SQL from request strings.

### Rule H — Compact DSL, strict internals

Developer payloads can remain compact:

```json
{
  "populate": {
    "department": ["id", "name"],
    "department>manager": ["id", "name"],
    "branch<company": ["id", "name"]
  }
}
```

But internally every instruction becomes a typed, validated representation.

### Rule I — Services are the only business extension point

The generic pipeline provides the execution environment. Services provide domain behavior.

### Rule J — The architecture remembers the rules

**Developers should not have to remember the pipeline. The pipeline must enforce it.**

### Rule K — Mandatory Table Status Metadata (0/1)

Every registered table—whether **Master** or **Transaction**—must define a metadata `status` field.
This field is strictly governed as:
- `1` = **Active**
- `0` = **Deactive** (Soft-deleted / Inactive)

All delete-based operations compile to status toggles (`status = 0`), and all standard queries automatically scope to `status = 1`. No Master or Transaction table may be registered without this metadata guarantee.

---

# <span style="color:#16a34a">25. Approval Gate & Implementation Contract</span>

**Status: APPROVED & FROZEN**  
**Approval Date:** 2026-09-23  
**Sign-off:** Approved by Project Owner  

This document is the **official, approved architecture contract** and the baseline for all implementation work.

The following 15 structural boundaries and contracts are now **frozen**:

1. **Pipeline interfaces** (`Ingress → Validation → Sanitization → Authorization → Parsing → Planning → Compilation → Execution → Serialization → Finalization`)
2. **Stage contracts** (Strict single-responsibility per stage)
3. **Context schema** (Immutable `RequestContext` throughout the pipeline)
4. **Populate DSL grammar** (Compact developer syntax)
5. **Join semantics** (`select_related`, `prefetch_related`, depth limits)
6. **Filter grammar** (Safe operator white-listing, Django ORM compilation)
7. **Security rules** (No text-replacement sanitization, strict ORM parameter binding)
8. **Policy contract** (Model & action-level RBAC/ABAC)
9. **Service contract** (Domain logic boundary with `before_*` and `after_*` hooks)
10. **Serializer contract** (Field whitelisting, output projection)
11. **Registry contract** (Explicit registration of models, schemas, policies, services)
12. **Folder/module boundaries** (Decoupled stage packages under `core/`)
13. **Test requirements** (Ingress-to-response pipeline coverage and fail-closed test suites)
14. **Django/MySQL implementation sequence** (Build order 01 to 16)
15. **Table status metadata contract** (Active: `1` / Deactive: `0` soft-delete protocol for all master and transaction tables)

> **Implementation Directive:**
>
> All development must strictly adhere to these frozen responsibility boundaries. Do not implement ad-hoc helpers or invent shortcuts around them.
>
> **The architecture is approved. Implementation directly follows the boundaries.**
