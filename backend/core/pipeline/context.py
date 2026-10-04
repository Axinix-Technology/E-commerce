import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class Action(str, Enum):
    READ = "read"
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    REPORT = "report"
    STATISTICS = "statistics"
    BULK_CREATE = "bulk-create"
    BULK_UPDATE = "bulk-update"
    BULK_UPSERT = "bulk-upsert"
    BULK_DELETE = "bulk-delete"

    @classmethod
    def has_value(cls, value: str) -> bool:
        return any(value == item.value for item in cls)

    @classmethod
    def is_read_action(cls, action_str: str) -> bool:
        return action_str in (cls.READ.value, cls.REPORT.value, cls.STATISTICS.value)

    @classmethod
    def is_mutation_action(cls, action_str: str) -> bool:
        return action_str in (
            cls.CREATE.value, cls.UPDATE.value, cls.DELETE.value,
            cls.BULK_CREATE.value, cls.BULK_UPDATE.value,
            cls.BULK_UPSERT.value, cls.BULK_DELETE.value
        )


@dataclass
class RequestContext:
    """
    Immutable unified context passed across all 10 pipeline stages.
    """
    action: str
    model_name: str
    object_id: Any | None = None
    body: dict | list = field(default_factory=dict)
    filters: dict = field(default_factory=dict)
    populate: dict | list = field(default_factory=dict)
    fields: list[str] | None = None
    ordering: list[str] = field(default_factory=list)
    pagination: dict = field(default_factory=lambda: {"page": 1, "limit": 20, "offset": 0})
    user: Any = None
    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    ip_address: str | None = None
    user_agent: str | None = None
    path: str | None = None
    method: str | None = None
    tenant_context: dict | None = None
    metadata: dict = field(default_factory=dict)
    model_cls: Any = None
    model_metadata: Any = None
    cache_plan: bool = True

    @property
    def user_id(self) -> Any:
        if self.user is None:
            return None
        return getattr(self.user, "id", None) or getattr(self.user, "pk", None)

    @property
    def role(self) -> Any:
        if not self.user:
            return None
        return getattr(self.user, "role", None)

    @property
    def is_superadmin(self) -> bool:
        if not self.user:
            return False
        return bool(getattr(self.user, "is_superuser", False))

    @property
    def is_read(self) -> bool:
        return Action.is_read_action(self.action)

    @property
    def is_mutation(self) -> bool:
        return Action.is_mutation_action(self.action)

    @property
    def is_bulk(self) -> bool:
        return self.action.startswith("bulk-")
