from typing import Callable
from django.db.models import Q
from core.policy.context import PolicyContext


def is_owner(field_name: str = "user_id") -> Callable[[PolicyContext], Q]:
    """Condition ensuring non-admin users only query/mutate rows they own."""
    def condition(ctx: PolicyContext) -> Q:
        if ctx.is_superadmin:
            return Q()
        if not ctx.user_id:
            return Q(pk__in=[])  # Deny all
        return Q(**{field_name: ctx.user_id})
    return condition


def matches_attribute(model_field: str, user_attr: str) -> Callable[[PolicyContext], Q]:
    """Condition matching a model field to an attribute on the user object."""
    def condition(ctx: PolicyContext) -> Q:
        if ctx.is_superadmin:
            return Q()
        val = getattr(ctx.user, user_attr, None)
        if val is None:
            return Q(pk__in=[])
        return Q(**{model_field: val})
    return condition
