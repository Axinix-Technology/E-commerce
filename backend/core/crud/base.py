from typing import Any
from django.db import models
from core.pipeline.context import RequestContext
from core.registry.service_registry import ServiceRegistry, BaseService
from core.response.exceptions import NotFoundError


class BaseCRUDExecutor:
    """
    Base helper for Stage 08 CRUD executors.
    Resolves domain services and manages transactional boundaries.
    """

    @classmethod
    def get_service(cls, context: RequestContext) -> BaseService:
        return ServiceRegistry.get(context.model_name)

    @classmethod
    def find_target_instance(cls, context: RequestContext, queryset: Any) -> models.Model:
        """Finds target instance in active scope or raises NotFoundError / ValidationError."""
        if context.object_id is not None:
            try:
                return queryset.get(pk=context.object_id)
            except (models.ObjectDoesNotExist, ValueError):
                raise NotFoundError(
                    f"Record '{context.model_name}' with ID '{context.object_id}' not found.",
                    details={"model": context.model_name, "id": context.object_id}
                )

        count = queryset.count()
        if count == 0:
            raise NotFoundError(
                f"No active record found for '{context.model_name}' matching filter criteria.",
                details={"model": context.model_name, "filters": context.filters}
            )
        if count > 1:
            from core.response.exceptions import ValidationError
            raise ValidationError(
                f"Filter matched {count} records. Single mutation requires an explicit object_id. Use bulk actions instead.",
                code="AMBIGUOUS_TARGET",
                details={"model": context.model_name, "match_count": count}
            )

        return queryset.first()
