from dataclasses import dataclass, field
from typing import Any, Callable, Type
from django.db import models
from core.response.exceptions import ConfigurationError


@dataclass
class ModelMetadata:
    """
    Metadata contract for a registered model in the Populate Engine.
    """
    name: str
    model_class: Type[models.Model]
    table_type: str = "master"  # "master" | "transaction" | "system"
    status_field: str = "status"  # Controlled by 1 (active) and 0 (deactive)
    schema: Any | None = None
    serializer: Any | None = None
    policy: Any | None = None
    service: Any | None = None
    search_fields: list[str] = field(default_factory=list)
    default_ordering: list[str] = field(default_factory=lambda: ["-id"])

    def has_status_field(self) -> bool:
        if not self.status_field:
            return False
        try:
            self.model_class._meta.get_field(self.status_field)
            return True
        except Exception:
            return hasattr(self.model_class, self.status_field)


class ModelRegistry:
    """
    Centralized Model Registry holding capability configurations.
    """
    _registry: dict[str, ModelMetadata] = {}
    _aliases: dict[str, str] = {}

    @classmethod
    def register(
        cls,
        name: str,
        table_type: str = "master",
        status_field: str = "status",
        schema: Any | None = None,
        serializer: Any | None = None,
        policy: Any | None = None,
        service: Any | None = None,
        search_fields: list[str] | None = None,
        default_ordering: list[str] | None = None,
        aliases: list[str] | None = None,
    ) -> Callable[[Type[models.Model]], Type[models.Model]]:
        """
        Decorator or function to register a Django model with the Populate Engine.
        """
        def decorator(model_cls: Type[models.Model]) -> Type[models.Model]:
            key = name.lower().strip()
            table_type_normalized = table_type.lower().strip()
            if table_type_normalized not in ("master", "transaction", "system"):
                raise ConfigurationError(
                    f"Model '{name}' registered with invalid table_type '{table_type}'. "
                    f"Must be 'master', 'transaction', or 'system'."
                )

            metadata = ModelMetadata(
                name=key,
                model_class=model_cls,
                table_type=table_type_normalized,
                status_field=status_field,
                schema=schema,
                serializer=serializer,
                policy=policy,
                service=service,
                search_fields=search_fields or [],
                default_ordering=default_ordering or ["-id"],
            )

            cls._registry[key] = metadata

            # Register standard aliases (plural/singular)
            cls._aliases[key] = key
            if key.endswith("s"):
                cls._aliases[key[:-1]] = key
            else:
                cls._aliases[f"{key}s"] = key

            # DB table name alias
            db_table = getattr(getattr(model_cls, "_meta", None), "db_table", None)
            if db_table:
                cls._aliases[db_table.lower()] = key

            # Custom aliases
            if aliases:
                for alias in aliases:
                    cls._aliases[alias.lower().strip()] = key

            return model_cls

        return decorator

    @classmethod
    def get(cls, name: str) -> ModelMetadata:
        key = name.lower().strip()
        resolved_key = cls._aliases.get(key, key)
        if resolved_key not in cls._registry:
            raise ConfigurationError(
                f"Model '{name}' is not registered with Populate Engine.",
                code="MODEL_NOT_REGISTERED",
                status_code=404
            )
        return cls._registry[resolved_key]

    @classmethod
    def is_registered(cls, name: str) -> bool:
        key = name.lower().strip()
        resolved_key = cls._aliases.get(key, key)
        return resolved_key in cls._registry

    @classmethod
    def get_all(cls) -> dict[str, ModelMetadata]:
        return dict(cls._registry)

    @classmethod
    def clear(cls) -> None:
        """For testing purposes."""
        cls._registry.clear()
        cls._aliases.clear()


# Helper shortcuts
register_model = ModelRegistry.register
get_model_metadata = ModelRegistry.get
is_model_registered = ModelRegistry.is_registered
