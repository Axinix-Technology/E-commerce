from typing import Any
from django.db.models import QuerySet
from core.pipeline.context import RequestContext
from core.response.exceptions import NotFoundError
from .base import BaseCRUDExecutor


class ReadExecutor(BaseCRUDExecutor):
    """
    Stage 08 — Generic Read Executor.
    Executes single or paginated read queries with domain service hooks.
    """

    @classmethod
    def execute(cls, queryset: QuerySet, context: RequestContext) -> dict[str, Any]:
        service = cls.get_service(context)

        # 1. Service Hook: before_read
        queryset = service.before_read(context, queryset)

        # 2. Single record lookup if object_id is specified
        if context.object_id is not None:
            instance = cls.find_target_instance(context, queryset)
            return {
                "items": [instance],
                "count": 1,
                "is_single": True,
            }

        # 3. Paginated list lookup
        total_count = queryset.count()

        pagination = context.pagination
        offset = pagination.get("offset", 0)
        limit = pagination.get("limit", 20)

        paged_qs = queryset[offset:offset + limit]
        items = list(paged_qs)

        return {
            "items": items,
            "count": total_count,
            "page": pagination.get("page", 1),
            "limit": limit,
            "is_single": False,
        }
