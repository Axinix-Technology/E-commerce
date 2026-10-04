import json
import logging
from typing import Any
from django.db import models

logger = logging.getLogger("core.audit")

SENSITIVE_KEYS = frozenset({
    "password",
    "new_password",
    "old_password",
    "confirm_password",
    "token",
    "access_token",
    "refresh_token",
    "secret",
    "secret_key",
    "api_key",
    "fcm_token",
    "authorization",
    "credit_card",
    "cvv",
})


def get_client_ip(request: Any) -> str:
    """
    Safely extract real client IP address from proxy headers or remote addr.
    Handles X-Forwarded-For, X-Real-IP, and standard REMOTE_ADDR.
    """
    if not request:
        return "127.0.0.1"

    # 1. Check HTTP_X_FORWARDED_FOR
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        # First IP in comma-separated list is the client IP
        parts = [ip.strip() for ip in x_forwarded_for.split(",") if ip.strip()]
        if parts:
            return parts[0]

    # 2. Check HTTP_X_REAL_IP
    x_real_ip = request.META.get("HTTP_X_REAL_IP")
    if x_real_ip and x_real_ip.strip():
        return x_real_ip.strip()

    # 3. Fallback to REMOTE_ADDR
    remote_addr = request.META.get("REMOTE_ADDR")
    if remote_addr and remote_addr.strip():
        return remote_addr.strip()

    return "127.0.0.1"


def sanitize_payload(payload: Any) -> Any:
    """
    Recursively sanitize dictionaries/lists to redact sensitive credentials,
    passwords, tokens, and authorization headers from audit logs.
    """
    if isinstance(payload, dict):
        sanitized = {}
        for k, v in payload.items():
            if str(k).lower() in SENSITIVE_KEYS:
                sanitized[k] = "********"
            elif isinstance(v, (dict, list)):
                sanitized[k] = sanitize_payload(v)
            else:
                sanitized[k] = v
        return sanitized
    elif isinstance(payload, list):
        return [sanitize_payload(item) for item in payload]
    return payload


def record_audit_log(
    *,
    request_id: str | None = None,
    user: Any = None,
    user_name: str | None = None,
    action: str = "UNKNOWN",
    entity: str = "core",
    entity_id: str | None = None,
    module: str | None = None,
    description: str | None = None,
    details: str | None = None,
    changes: dict | list | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    path: str | None = None,
    method: str | None = None,
    status_code: int | None = None,
) -> Any:
    """
    Insert an audit log record into the database with fail-safe error handling.
    Audit logging failures will log a warning but never crash the API request.
    """
    try:
        from core.models import AuditLog

        # Resolve user model instance and username
        actual_user = None
        resolved_username = user_name

        if user and getattr(user, "is_authenticated", False) and getattr(user, "pk", None):
            actual_user = user
            if not resolved_username:
                resolved_username = (
                    getattr(user, "username", None)
                    or getattr(user, "email", None)
                    or str(user)
                )

        if not resolved_username:
            resolved_username = "Anonymous"

        # Sanitize changes payload
        clean_changes = sanitize_payload(changes) if changes is not None else {}
        if not isinstance(clean_changes, (dict, list)):
            clean_changes = {"data": str(clean_changes)}

        # Human-readable description
        activity_desc = description or details or f"{action} on {entity}"
        activity_details = details or description or activity_desc

        audit_entry = AuditLog.objects.create(
            request_id=request_id,
            user=actual_user,
            user_name=resolved_username[:150] if resolved_username else None,
            action=(action or "UNKNOWN").upper()[:50],
            entity=(entity or "core")[:100],
            entity_id=str(entity_id)[:100] if entity_id is not None else None,
            module=(module or entity or "core")[:100],
            description=activity_desc,
            details=activity_details,
            changes=clean_changes,
            ip_address=ip_address,
            user_agent=(user_agent or "")[:255] if user_agent else None,
            path=(path or "")[:255] if path else None,
            method=(method or "")[:20] if method else None,
            status_code=status_code,
        )
        return audit_entry
    except Exception as exc:
        logger.warning(f"[AuditRecorder] Failed to persist AuditLog: {exc}", exc_info=False)
        return None
