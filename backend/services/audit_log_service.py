import logging
from typing import Any
from django.contrib.auth import get_user_model
from core.registry.service_registry import BaseService, register_service

logger = logging.getLogger("core.audit")
User = get_user_model()


class AuditLogService(BaseService):
    """
    Domain Service for AuditLog.
    Handles manual audit creation, user resolution, and field normalization.
    """

    def before_create(self, context: Any, data: dict) -> dict:
        data = dict(data)

        # 1. Normalize 'user' if passed as a username string
        user_val = data.get("user")
        if isinstance(user_val, str) and user_val.strip():
            username = user_val.strip()
            data["user_name"] = username
            user_obj = User.objects.filter(username=username).first()
            if user_obj:
                data["user"] = user_obj
            else:
                data.pop("user", None)
        elif not user_val and context.user and getattr(context.user, "is_authenticated", False):
            data["user"] = context.user
            data["user_name"] = (
                getattr(context.user, "username", None)
                or getattr(context.user, "email", None)
                or str(context.user)
            )

        # 2. Normalize module <-> entity
        if data.get("module") and not data.get("entity"):
            data["entity"] = data["module"]
        elif data.get("entity") and not data.get("module"):
            data["module"] = data["entity"]

        # 3. Normalize description <-> details
        if data.get("description") and not data.get("details"):
            data["details"] = data["description"]
        elif data.get("details") and not data.get("description"):
            data["description"] = data["details"]

        # 4. Inject request_id if missing
        if not data.get("request_id") and getattr(context, "request_id", None):
            data["request_id"] = context.request_id

        # 5. Inject client IP if missing
        if not data.get("ip_address") and getattr(context, "ip_address", None):
            data["ip_address"] = context.ip_address

        return data


# Register service in ServiceRegistry
register_service("audit_log", AuditLogService)
