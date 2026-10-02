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
        """Finds target instance in active scope or raises NotFoundError."""
        try:
            if context.object_id is not None:
                return queryset.get(pk=context.object_id)
            obj = queryset.first()
            if not obj:
                raise NotFoundError(
                    f"Record '{context.model_name}' with ID '{context.object_id}' not found.",
                    details={"model": context.model_name, "id": context.object_id}
                )
            return obj
        except (models.ObjectDoesNotExist, ValueError):
            raise NotFoundError(
                f"Record '{context.model_name}' with ID '{context.object_id}' not found.",
                details={"model": context.model_name, "id": context.object_id}
            )
