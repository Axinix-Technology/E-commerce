from typing import Any
from django.db import transaction, models
from core.pipeline.context import RequestContext
from core.response.exceptions import NotFoundError, AuthorizationError, ValidationError
from .base import BaseCRUDExecutor

FORBIDDEN_MUTATION_FIELDS = frozenset({"password", "is_superuser", "is_staff", "token", "secret_key"})
RESTRICTED_UPDATE_MODELS = frozenset({"stock_ledger", "inventory_stock", "user_session"})


class UpdateExecutor(BaseCRUDExecutor):
    """
    Stage 08 — Generic Update Executor.
    Adheres strictly to Recipe 01:
    - Enforces fail-closed access controls and forbidden mutation fields.
    - Minimal DB lock window (<10ms) using select_for_update().
    - Service after_update runs post-commit.
    """

    @classmethod
    def execute(cls, queryset: Any, context: RequestContext) -> dict[str, Any]:
        # 0. Model-level update restrictions
        if context.model_name in RESTRICTED_UPDATE_MODELS:
            raise AuthorizationError(
                f"Direct modification of '{context.model_name}' records is not permitted via generic API.",
                code="RESTRICTED_MODEL"
            )

        if context.model_name in ("user", "role") and not getattr(context.user, "is_superuser", False):
            raise AuthorizationError(
                f"Modifying '{context.model_name}' records requires administrative privileges.",
                code="ADMIN_REQUIRED"
            )

        service = cls.get_service(context)
        model_cls = context.model_cls

        if context.is_bulk:
            return cls._execute_bulk(queryset, context, service)

        # 1. Fetch current instance in active scope to pass to before_update hook
        target_instance = cls.find_target_instance(context, queryset)
        pk_val = target_instance.pk

        # 2. Service Hook: before_update (runs OUTSIDE lock window)
        update_data = dict(context.body) if isinstance(context.body, dict) else {}

        # Guard against forbidden field injection
        for forbidden_key in FORBIDDEN_MUTATION_FIELDS:
            if forbidden_key in update_data:
                raise AuthorizationError(
                    f"Direct mutation of '{forbidden_key}' is not allowed via generic API.",
                    code="FORBIDDEN_FIELD"
                )

        update_data = service.before_update(context, target_instance, update_data)

        # 3. Minimal DB lock window (Recipe 01: keep lock duration < 10ms)
        updated_fields: list[str] = []
        with transaction.atomic():
            locked_instance = model_cls.objects.select_for_update().get(pk=pk_val)

            for key, val in update_data.items():
                if hasattr(locked_instance, key):
                    # Do not mutate primary key
                    if key in ("id", "pk"):
                        continue
                    setattr(locked_instance, key, val)
                    updated_fields.append(key)

            if updated_fields:
                locked_instance.save(update_fields=list(set(updated_fields)))
            else:
                locked_instance.save()

        # 4. Service Hook: after_update (post-commit, outside lock)
        final_instance = service.after_update(context, locked_instance)

        return {
            "items": [final_instance],
            "count": 1,
            "is_single": True,
        }

    @classmethod
    def _execute_bulk(cls, queryset: Any, context: RequestContext, service: Any) -> dict[str, Any]:
        update_data = dict(context.body) if isinstance(context.body, dict) else {}
        updated_instances = []

        with transaction.atomic():
            records = list(queryset.select_for_update())
            for rec in records:
                clean_data = service.before_update(context, rec, dict(update_data))
                for k, v in clean_data.items():
                    if hasattr(rec, k) and k not in ("id", "pk"):
                        setattr(rec, k, v)
                rec.save()
                post_rec = service.after_update(context, rec)
                updated_instances.append(post_rec)

        return {
            "items": updated_instances,
            "count": len(updated_instances),
            "is_single": False,
        }
