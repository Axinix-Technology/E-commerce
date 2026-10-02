from typing import Any
from django.db import transaction, models
from core.pipeline.context import RequestContext
from .base import BaseCRUDExecutor


from core.response.exceptions import AuthorizationError

FORBIDDEN_MUTATION_FIELDS = frozenset({"password", "is_superuser", "is_staff", "token", "secret_key"})
RESTRICTED_CREATE_MODELS = frozenset({"inventory_stock", "user_session"})


class CreateExecutor(BaseCRUDExecutor):
    """
    Stage 08 — Generic Create Executor.
    Executes single or bulk create mutations within atomic transactions.
    Fails closed: rolls back entirely if any hook or child mutation fails.
    """

    @classmethod
    def execute(cls, context: RequestContext) -> dict[str, Any]:
        # 0. Model-level creation restrictions
        if context.model_name in RESTRICTED_CREATE_MODELS:
            raise AuthorizationError(
                f"Direct creation of '{context.model_name}' records is not permitted via generic API.",
                code="RESTRICTED_MODEL"
            )

        if context.model_name in ("user", "role") and not getattr(context.user, "is_superuser", False):
            raise AuthorizationError(
                f"Managing '{context.model_name}' records requires administrative privileges.",
                code="ADMIN_REQUIRED"
            )

        service = cls.get_service(context)
        model_cls = context.model_cls
        model_meta = context.model_metadata
        status_field = getattr(model_meta, "status_field", "status") if model_meta else "status"

        if context.is_bulk:
            return cls._execute_bulk(context, service, model_cls, status_field)

        # 1. Single Create: Run before_create, creation, and after_create inside a SINGLE atomic transaction
        with transaction.atomic():
            data = dict(context.body) if isinstance(context.body, dict) else {}

            # Guard against forbidden field injection
            for forbidden_key in FORBIDDEN_MUTATION_FIELDS:
                if forbidden_key in data:
                    raise AuthorizationError(
                        f"Direct mutation of '{forbidden_key}' is not allowed via generic API.",
                        code="FORBIDDEN_FIELD"
                    )

            data = service.before_create(context, data)

            # Ensure active status (1) for master/transaction tables
            if hasattr(model_cls, status_field) and status_field not in data:
                data[status_field] = 1

            # Separate M2M or nested fields if necessary
            m2m_data: dict[str, list] = {}
            concrete_data: dict[str, Any] = {}

            for key, val in data.items():
                field_obj = None
                try:
                    field_obj = model_cls._meta.get_field(key)
                except Exception:
                    pass

                if field_obj and field_obj.many_to_many:
                    m2m_data[key] = val
                elif field_obj and field_obj.concrete:
                    concrete_data[key] = val
                elif hasattr(model_cls, key):
                    concrete_data[key] = val

            instance = model_cls.objects.create(**concrete_data)
            for m2m_key, m2m_vals in m2m_data.items():
                m2m_rel = getattr(instance, m2m_key, None)
                if m2m_rel and hasattr(m2m_rel, "set"):
                    m2m_rel.set(m2m_vals)

            # Service Hook: after_create (runs atomically with create)
            instance = service.after_create(context, instance)

        return {
            "items": [instance],
            "count": 1,
            "is_single": True,
        }

    @classmethod
    def _execute_bulk(
        cls,
        context: RequestContext,
        service: Any,
        model_cls: type[models.Model],
        status_field: str
    ) -> dict[str, Any]:
        payload_items: list[dict] = context.body if isinstance(context.body, list) else []
        created_instances: list[models.Model] = []

        with transaction.atomic():
            for item in payload_items:
                item_data = dict(item)
                item_data = service.before_create(context, item_data)
                if hasattr(model_cls, status_field) and status_field not in item_data:
                    item_data[status_field] = 1

                inst = model_cls.objects.create(**item_data)
                inst = service.after_create(context, inst)
                created_instances.append(inst)

        return {
            "items": created_instances,
            "count": len(created_instances),
            "is_single": False,
        }
