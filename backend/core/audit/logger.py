import logging
from datetime import datetime
from typing import Any, TYPE_CHECKING

if TYPE_CHECKING:
    from core.pipeline.context import RequestContext

logger = logging.getLogger("core.audit")


class AuditLogger:
    """
    Stage 10 Helper — Audit Logger.
    Emits structured audit trail records for compliance and traceability.
    """

    @classmethod
    def log(cls, context: Any, result: dict[str, Any]) -> None:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": context.request_id,
            "user_id": context.user_id,
            "action": context.action,
            "model": context.model_name,
            "object_id": context.object_id,
            "count": result.get("count", 0),
            "is_mutation": context.is_mutation,
        }

        if context.action == "delete":
            log_entry["lifecycle_transition"] = "status: 1 -> 0 (Soft-deleted)"

        logger.info(f"[PopulateEngine Audit] {log_entry}")
