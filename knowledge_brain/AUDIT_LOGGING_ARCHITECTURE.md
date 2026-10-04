# Audit Logging Architecture

## 1. Overview
The Audit Logging Architecture provides an automated, immutable, and end-to-end distributed audit trail across all API interactions in the Axinix E-Commerce platform. Every request is tagged with a correlation ID, client origin details, actor identity, action type, status code, and sanitized payload changes.

---

## 2. Core Pillars & Capabilities

### 2.1 Request Correlation & Distributed Tracing
- **`request_id` (Correlation ID)**:
  - Frontend (`axiosInstance.js`) injects an `X-Request-ID` header using `crypto.randomUUID()` on all outgoing calls.
  - Backend `ApiAuditLogMiddleware` extracts the incoming `X-Request-ID` or generates a fresh UUID if absent.
  - The correlation ID is echoed in every HTTP response header: `X-Request-ID: <uuid>`.

### 2.2 Client Origin & Actor Metadata
Every audit record records:
- **Who Asked**:
  - `user`: Foreign key to `users.User` if authenticated.
  - `user_name`: Username, email, or `"Anonymous"` / `"System"`.
- **From Where Details**:
  - `ip_address`: Real client IP address extracted safely from `X-Forwarded-For`, `X-Real-IP`, or `REMOTE_ADDR`.
  - `user_agent`: Client device, browser, or CLI User Agent string.
  - `path`: Request URI/endpoint path.
  - `method`: HTTP method (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

### 2.3 Populate Core Pipeline Integration (`/api/populate/`)
- During Stage 01 (`IngressStage`), `RequestContext` captures `request_id`, `ip_address`, `user_agent`, `path`, and `method`.
- In Stage 10 (`FinalizationStage`), `AuditLogger.log(...)` automatically creates a persistent database record in the `audit_logs` table (`AuditLog` model).
- Captures:
  - Model name (`entity`), action (`READ`, `CREATE`, `UPDATE`, `DELETE`, etc.), target `entity_id`.
  - Record counts, query filters, pagination, and response status code.
  - Sanitized mutation body changes (passwords and tokens redacted).
- Meta-logging protection: Operations directly on the `audit_log` model emit to log streams without recursive database duplication.

### 2.4 Global API Audit Middleware (`ApiAuditLogMiddleware`)
- Intercepts all non-populate API routes under `/api/` (such as `/api/auth/login`, `/api/auth/logout`, `/api/company/public`, and any custom endpoints).
- Automatically records the user, action, endpoint, client IP, status code, and sanitized payload.
- Automatically captures authenticated user identities even on initial login endpoints upon successful response dispatch.

### 2.5 Security & Data Sanitization
- All audit logging logic passes request/response payloads through `core.audit.helpers.sanitize_payload(...)`.
- Strictly masks sensitive keys (`password`, `token`, `secret`, `authorization`, `credit_card`, `fcm_token`) with `"********"`.
