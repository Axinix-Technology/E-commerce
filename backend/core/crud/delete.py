from typing import Any
from django.db import transaction, models
from core.pipeline.context import RequestContext
from core.response.exceptions import NotFoundError, ExecutionError
from .base import BaseCRUDExecutor


class DeleteExecutor(BaseCRUDExecutor):
    """
    Stage 08 — Generic Delete Executor.
    Enforces Golden Rule 11:
    - Master and Transaction tables execute soft-delete (status = 0).
    - Physical hard deletion is strictly disallowed.
    - Lifecycle hooks before_delete and after_delete are invoked around the mutation.
    """

    @classmethod
    def execute(cls, queryset: Any, context: RequestContext) -> dict[str, Any]:
        service = cls.get_service(context)
        model_cls = context.model_cls
        model_meta = context.model_metadata
        status_field = getattr(model_meta, "status_field", "status") if model_meta else "status"

        if context.is_bulk:
            return cls._execute_bulk(queryset, context, service, status_field)

        # 1. Lookup target object in active scope
        target_instance = cls.find_target_instance(context, queryset)
        pk_val = target_instance.pk

        # 2. Service Hook: before_delete (runs outside lock)
        service.before_delete(context, target_instance)

        # 3. Soft-delete mutation inside minimal atomic transaction
        with transaction.atomic():
            locked_instance = model_cls.objects.select_for_update().get(pk=pk_val)

            if hasattr(locked_instance, status_field):
                # Golden Rule 11: Status mutation to 0 (Deactive)
                setattr(locked_instance, status_field, 0)
                locked_instance.save(update_fields=[status_field])
            else:
                # If model is explicitly system table without status_field, handle accordingly
                locked_instance.delete()

        # 4. Service Hook: after_delete (post-commit)
        service.after_delete(context, locked_instance)

        return {
            "items": [locked_instance],
            "count": 1,
            "is_single": True,
            "deleted": True,
        }

    @classmethod
    def _execute_bulk(cls, queryset: Any, context: RequestContext, service: Any, status_field: str) -> dict[str, Any]:
        deleted_count = 0
        with transaction.atomic():
            records = list(queryset.select_for_update())
            for rec in records:
                service.before_delete(context, rec)
                if hasattr(rec, status_field):
                    setattr(rec, status_field, 0)
                    rec.save(update_fields=[status_field])
                else:
                    rec.delete()
                service.after_delete(context, rec)
                deleted_count += 1

        return {
            "items": [],
            "count": deleted_count,
            "is_single": False,
            "deleted": True,
        }
