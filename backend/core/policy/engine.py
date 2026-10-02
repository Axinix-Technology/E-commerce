from typing import Any
from django.db.models import Q
from core.pipeline.context import RequestContext
from core.registry.policy_registry import PolicyRegistry
from core.response.exceptions import AuthorizationError
from .context import PolicyContext


class PolicyEngine:
    """
    Stage 04 — Authorization Engine (RBAC / ABAC).
    Evaluates permissions declaratively.
    Uses boolean is_superuser for superuser access without string comparisons.
    Caches policy decisions in-process (Recipe 04).
    """

    _decision_cache: dict[tuple[Any, str, str], bool] = {}

    @classmethod
    def authorize(cls, context: RequestContext) -> RequestContext:
        policy_ctx = PolicyContext(
            user=context.user,
            action=context.action,
            model_name=context.model_name,
            object_id=context.object_id,
            request=context,
        )

        # 1. Superuser bypass (strictly using is_superuser boolean)
        if policy_ctx.is_superadmin:
            context.metadata["policy_q"] = Q()
            context.metadata["forbidden_fields"] = ["password"]
            context.metadata["allowed_fields"] = None
            return context

        # 2. Check permission for authenticated user
        cache_key = (policy_ctx.user_id, policy_ctx.model_name, policy_ctx.action)
        if cache_key in cls._decision_cache:
            allowed = cls._decision_cache[cache_key]
        else:
            policy = PolicyRegistry.get(context.model_name)
            allowed = policy.check_permission(policy_ctx)
            if len(cls._decision_cache) > 2048:
                cls._decision_cache.clear()
            cls._decision_cache[cache_key] = allowed

        if not allowed:
            raise AuthorizationError(
                f"User is not authorized to perform '{context.action}' on '{context.model_name}'.",
                code="PERMISSION_DENIED",
                details={"model": context.model_name, "action": context.action}
            )

        # 3. Retrieve row-level Q scoping and field policies
        policy = PolicyRegistry.get(context.model_name)
        scope_q = policy.get_query_scope(policy_ctx)
        allowed_fields = policy.get_allowed_fields(policy_ctx)
        forbidden_fields = policy.get_forbidden_fields(policy_ctx)

        context.metadata["policy_q"] = scope_q
        context.metadata["allowed_fields"] = allowed_fields
        context.metadata["forbidden_fields"] = forbidden_fields or ["password"]

        return context

    @classmethod
    def clear_cache(cls) -> None:
        cls._decision_cache.clear()
