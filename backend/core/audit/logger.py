import logging
from datetime import datetime
from typing import Any, TYPE_CHECKING
from core.audit.helpers import record_audit_log

if TYPE_CHECKING:
    from core.pipeline.context import RequestContext

logger = logging.getLogger("core.audit")


class AuditLogger:
    """
    Stage 10 Helper — Audit Logger.
    Emits structured audit trail records for compliance and traceability.
    Persists immutable audit log records to the database with request_id,
    who asked (user), and from where details (IP, user agent, endpoint).
    """

    @classmethod
    def log(cls, context: Any, result: dict[str, Any]) -> None:
        if not context:
            return

        is_error = "error" in result
        status_code = result.get("status_code", 400) if is_error else (201 if context.action in ("create", "bulk-create", "bulk-upsert") else 200)

        # Determine entity ID
        entity_id = None
        if context.object_id is not None:
            entity_id = str(context.object_id)
        elif isinstance(result.get("data"), dict) and "id" in result["data"]:
            entity_id = str(result["data"]["id"])

        # Determine module name
        module_name = context.model_name or "core"
        if getattr(context, "model_cls", None) and hasattr(context.model_cls, "_meta"):
            module_name = context.model_cls._meta.app_label

        # Build descriptive activity summary
        if is_error:
            description = f"Failed {context.action} on {context.model_name}: {result.get('error')}"
        elif context.action == "delete":
            description = f"Soft-deleted {context.model_name} #{entity_id or context.object_id}"
        elif context.action in ("create", "bulk-create", "bulk-upsert"):
            description = f"Created {context.model_name} #{entity_id or ''}".strip()
        elif context.action in ("update", "bulk-update"):
            description = f"Updated {context.model_name} #{entity_id or context.object_id}"
        elif context.action in ("read", "report", "statistics"):
            description = f"Queried {context.model_name} (records: {result.get('count', 0)})"
        else:
            description = f"{context.action.upper()} on {context.model_name}"

        # Capture changes or filter context
        if is_error:
            changes = {"error": str(result.get("error"))}
        elif context.is_mutation:
            changes = context.body if isinstance(context.body, (dict, list)) else {"body": str(context.body)}
        else:
            changes = {
                "count": result.get("count", 0),
                "filters": context.filters,
                "fields": context.fields,
                "pagination": context.pagination,
            }

        # 1. Emit structured log to logging stream
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": context.request_id,
            "user_id": context.user_id,
            "action": context.action,
            "model": context.model_name,
            "object_id": entity_id or context.object_id,
            "count": result.get("count", 0),
            "is_mutation": context.is_mutation,
            "ip_address": getattr(context, "ip_address", None),
            "status_code": status_code,
        }

        if context.action == "delete":
            log_entry["lifecycle_transition"] = "status: 1 -> 0 (Soft-deleted)"

        logger.info(f"[PopulateEngine Audit] {log_entry}")

        # 2. Avoid recursive/redundant self-logging when operating on the audit_log model itself
        if context.model_name in ("audit_log", "audit_logs", "activity_log"):
            return

        # 3. Persist to Database AuditLog table
        record_audit_log(
            request_id=context.request_id,
            user=context.user,
            action=context.action.upper(),
            entity=context.model_name,
            entity_id=entity_id,
            module=module_name,
            description=description,
            details=description,
            changes=changes,
            ip_address=getattr(context, "ip_address", None),
            user_agent=getattr(context, "user_agent", None),
            path=getattr(context, "path", None),
            method=getattr(context, "method", "POST"),
            status_code=status_code,
        )

