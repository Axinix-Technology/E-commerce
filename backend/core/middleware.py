import json
import logging
import uuid
from typing import Any
from django.contrib.auth import get_user_model
from core.audit.helpers import get_client_ip, sanitize_payload, record_audit_log

logger = logging.getLogger("core.audit")
User = get_user_model()


class ApiAuditLogMiddleware:
    """
    Global API Audit Log Middleware.
    Enforces core platform policy:
    1. Extracts or injects a unique X-Request-ID for every incoming request.
    2. Attaches X-Request-ID header to every response for distributed tracing.
    3. Automatically records database AuditLog for all non-populate API routes
       (e.g., /api/auth/, /api/company/, and any newly added custom endpoints).
       (/api/populate/ routes are rich-audited by Stage 10 of PopulateEngine;
       this middleware detects and prevents duplicate log entries).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Extract or generate Request Correlation ID
        req_id = (
            request.headers.get("X-Request-ID")
            or request.META.get("HTTP_X_REQUEST_ID")
            or str(uuid.uuid4())
        )
        request.request_id = req_id

        # 2. Extract Client IP & User Agent
        client_ip = get_client_ip(request)
        request.client_ip = client_ip
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        # 3. Process Request
        response = self.get_response(request)

        # 4. Always attach X-Request-ID to response headers
        try:
            response["X-Request-ID"] = req_id
        except Exception:
            pass

        # 5. Audit Logging for Non-Populate API Routes
        try:
            cached_payload = getattr(request, "data", None)
            if cached_payload is None:
                try:
                    if hasattr(request, "_body") and request._body:
                        cached_payload = json.loads(request._body.decode("utf-8"))
                    elif hasattr(request, "POST") and request.POST:
                        cached_payload = dict(request.POST.items())
                except Exception:
                    pass

            self._audit_non_populate_request(request, response, req_id, client_ip, user_agent, cached_payload)
        except Exception as exc:
            logger.warning(f"[ApiAuditLogMiddleware] Error recording audit log: {exc}")

        return response

    def _audit_non_populate_request(
        self,
        request: Any,
        response: Any,
        request_id: str,
        client_ip: str,
        user_agent: str,
        cached_payload: Any,
    ) -> None:
        path: str = request.path

        # Only audit API routes
        if not path.startswith("/api/"):
            return

        # Skip Populate requests (PopulateEngine Stage 10 logs with full AST & relation context)
        if getattr(request, "_is_populate_request", False) or path.startswith("/api/populate/"):
            return

        # Skip high-frequency healthchecks
        if path in ("/api/test", "/api/test/"):
            return

        status_code = getattr(response, "status_code", 200)
        method = request.method

        # Resolve User & Action
        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None
        username = None

        if user:
            username = (
                getattr(user, "username", None)
                or getattr(user, "email", None)
                or str(user)
            )

        # Determine Module from path segment e.g. /api/auth/login -> module: "users", entity: "auth"
        path_parts = [p for p in path.strip("/").split("/") if p]
        module = path_parts[1] if len(path_parts) > 1 else "api"
        entity = path_parts[-1] if len(path_parts) > 2 else module

        # Derive Action & Description
        if path.startswith("/api/auth/login"):
            action = "LOGIN"
            # If user logged in successfully, grab username from response data
            resp_data = getattr(response, "data", None)
            if isinstance(resp_data, dict) and "user" in resp_data:
                u_info = resp_data["user"]
                username = u_info.get("username") or u_info.get("email")
                if not user and username:
                    user = User.objects.filter(username=username).first()

            if status_code < 400:
                description = f"User '{username or 'Unknown'}' authenticated successfully via login"
            else:
                attempted = cached_payload.get("username") if isinstance(cached_payload, dict) else None
                description = f"Failed login attempt for '{attempted or 'Unknown'}'"
                if attempted and not username:
                    username = attempted

        elif path.startswith("/api/auth/logout"):
            action = "LOGOUT"
            description = f"User '{username or 'Unknown'}' logged out"

        elif path.startswith("/api/auth/me"):
            action = "READ"
            description = f"Session hydration verified for '{username or 'Unknown'}'"

        elif path.startswith("/api/company/"):
            action = "READ" if method == "GET" else "UPDATE"
            module = "company"
            entity = "company"
            description = f"{action} company configuration via {path}"

        else:
            action = method.upper()
            description = f"{method} {path} -> HTTP {status_code}"

        # Changes payload: redact sensitive fields
        sanitized_changes = None
        if cached_payload:
            sanitized_changes = sanitize_payload(cached_payload)
        elif status_code >= 400 and getattr(response, "data", None):
            sanitized_changes = sanitize_payload(response.data)

        # Record into database
        record_audit_log(
            request_id=request_id,
            user=user,
            user_name=username,
            action=action,
            entity=entity,
            module=module,
            description=description,
            details=description,
            changes=sanitized_changes or {},
            ip_address=client_ip,
            user_agent=user_agent,
            path=path,
            method=method,
            status_code=status_code,
        )
