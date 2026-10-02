from typing import Any, Callable
from django.db.models import Q


class BasePolicy:
    """
    Base model access policy.
    """
    def check_permission(self, policy_context: Any) -> bool:
        """Determines if the action on the model is permitted."""
        return True

    def get_query_scope(self, policy_context: Any) -> Q:
        """Returns Q() object for row-level scoping (e.g. user_id=X or tenant_id=Y)."""
        return Q()

    def get_allowed_fields(self, policy_context: Any) -> list[str] | None:
        """Returns list of allowed fields for output or input, or None for all."""
        return None

    def get_forbidden_fields(self, policy_context: Any) -> list[str]:
        """Returns list of explicitly forbidden fields (e.g. password, token)."""
        return ["password", "token", "secret_key"]


class PolicyRegistry:
    """
    Centralized registry for model-specific access policies.
    """
    _policies: dict[str, BasePolicy] = {}

    @classmethod
    def register(cls, model_name: str, policy: BasePolicy | type[BasePolicy]) -> None:
        key = model_name.lower().strip()
        instance = policy() if isinstance(policy, type) else policy
        cls._policies[key] = instance

    @classmethod
    def get(cls, model_name: str) -> BasePolicy:
        key = model_name.lower().strip()
        if key in cls._policies:
            return cls._policies[key]
        return BasePolicy()

    @classmethod
    def clear(cls) -> None:
        cls._policies.clear()


register_policy = PolicyRegistry.register
get_policy = PolicyRegistry.get
