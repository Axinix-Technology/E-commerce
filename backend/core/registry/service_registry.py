from typing import Any, Type
from django.db.models import QuerySet, Model


class BaseService:
    """
    Base domain service providing lifecycle extension hooks for Populate Engine.
    Only domain services know business meaning.
    """

    def before_read(self, context: Any, queryset: QuerySet) -> QuerySet:
        """Invoked before QuerySet compilation/execution. Can add domain filters or annotations."""
        return queryset

    def after_read(self, context: Any, data: Any) -> Any:
        """Invoked after output serialization. Can add computed fields or metrics."""
        return data

    def before_create(self, context: Any, data: dict) -> dict:
        """Invoked before model instantiation. Can validate business rules and inject computed data."""
        return data

    def after_create(self, context: Any, instance: Model) -> Model:
        """Invoked post-commit after creation. Can trigger async side-effects, webhooks, or logging."""
        return instance

    def before_update(self, context: Any, instance: Model, data: dict) -> dict:
        """
        Invoked BEFORE acquiring the DB lock (Recipe 01: keep lock window < 10ms).
        Execute external calls, payment checks, and heavy business validations here.
        """
        return data

    def after_update(self, context: Any, instance: Model) -> Model:
        """Invoked post-commit after update mutation. Can emit domain events or sync state."""
        return instance

    def before_delete(self, context: Any, instance: Model) -> None:
        """Invoked before soft-delete (status=0). Check business constraints."""
        pass

    def after_delete(self, context: Any, instance: Model) -> None:
        """Invoked post-commit after soft-delete. Trigger cleanup or notification."""
        pass

    def execute_report(self, context: Any, queryset: QuerySet) -> dict[str, Any] | None:
        """
        Invoked by ReportExecutor for custom aggregations and complex ledger reports
        (e.g., dynamic stock Opening-Inward-Outward-Closing or GST compliance tables).
        """
        return None


class ServiceRegistry:
    """
    Centralized registry for model-specific domain services.
    """
    _services: dict[str, BaseService] = {}

    @classmethod
    def register(cls, model_name: str, service_cls: Type[BaseService] | BaseService) -> None:
        key = model_name.lower().strip()
        instance = service_cls() if isinstance(service_cls, type) else service_cls
        cls._services[key] = instance

    @classmethod
    def get(cls, model_name: str) -> BaseService:
        key = model_name.lower().strip()
        if key in cls._services:
            return cls._services[key]
        return BaseService()

    @classmethod
    def clear(cls) -> None:
        cls._services.clear()


register_service = ServiceRegistry.register
get_service = ServiceRegistry.get
