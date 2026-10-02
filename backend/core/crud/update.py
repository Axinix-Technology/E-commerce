from typing import Any
from django.db import transaction, models
from core.pipeline.context import RequestContext
from core.response.exceptions import NotFoundError
from .base import BaseCRUDExecutor


class UpdateExecutor(BaseCRUDExecutor):
    """
    Stage 08 — Generic Update Executor.
    Adheres strictly to Recipe 01:
    - Service before_update and external checks run OUTSIDE the lock.
    - Minimal DB lock window (<10ms) using select_for_update().
    - Service after_update runs post-commit.
    """

    @classmethod
    def execute(cls, queryset: Any, context: RequestContext) -> dict[str, Any]:
        service = cls.get_service(context)
        model_cls = context.model_cls

        if context.is_bulk:
            return cls._execute_bulk(queryset, context, service)

        # 1. Fetch current instance in active scope to pass to before_update hook
        target_instance = cls.find_target_instance(context, queryset)
        pk_val = target_instance.pk

        # 2. Service Hook: before_update (runs OUTSIDE lock window)
        update_data = dict(context.body) if isinstance(context.body, dict) else {}
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
