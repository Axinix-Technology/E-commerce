from dataclasses import dataclass
from typing import Any
from core.pipeline.context import RequestContext


@dataclass(frozen=True)
class PolicyContext:
    """
    Context supplied to authorization policies and ABAC conditions.
    """
    user: Any
    action: str
    model_name: str
    object_id: Any | None
    request: RequestContext

    @property
    def is_superadmin(self) -> bool:
        if not self.user:
            return False
        return bool(getattr(self.user, "is_superuser", False))

    @property
    def user_id(self) -> Any:
        if not self.user:
            return None
        return getattr(self.user, "id", None) or getattr(self.user, "pk", None)
