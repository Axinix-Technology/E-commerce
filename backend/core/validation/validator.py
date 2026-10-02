from typing import Any
from core.pipeline.context import RequestContext, Action
from core.registry.model_registry import ModelRegistry
from core.response.exceptions import ValidationError
from .schemas.base import DynamicModelValidator


class RequestValidator:
    """
    Stage 02 — Shape, structure, and type validation.
    Does NOT check user authorization.
    """

    @classmethod
    def validate(cls, context: RequestContext) -> RequestContext:
        # 1. Action validation
        if not Action.has_value(context.action):
            raise ValidationError(
                f"Unsupported action '{context.action}'.",
                code="INVALID_ACTION",
                details={"allowed_actions": [a.value for a in Action]}
            )

        # 2. Model registration check (Fail closed)
        model_meta = ModelRegistry.get(context.model_name)
        context.model_metadata = model_meta
        context.model_cls = model_meta.model_class

        # 3. Pagination sanitization / validation
        page = context.pagination.get("page", 1)
        limit = context.pagination.get("limit", 20)

        try:
            page = max(1, int(page))
        except (ValueError, TypeError):
            page = 1

        try:
            # Enforce ceiling: max 100 items per page
            limit = max(1, min(100, int(limit)))
        except (ValueError, TypeError):
            limit = 20

        offset = (page - 1) * limit
        context.pagination = {"page": page, "limit": limit, "offset": offset}

        # 4. Mutation payload validation
        if context.action == Action.CREATE.value:
            if not isinstance(context.body, dict):
                raise ValidationError("Create action requires a JSON dictionary body.")
            if model_meta.schema:
                # Custom schema validation (e.g. Pydantic or custom callable)
                if hasattr(model_meta.schema, "model_validate"):
                    model_meta.schema.model_validate(context.body)
                elif callable(model_meta.schema):
                    context.body = model_meta.schema(context.body)
            else:
                context.body = DynamicModelValidator.validate_payload(
                    context.model_cls, context.body, is_create=True
                )

        elif context.action == Action.UPDATE.value:
            if not isinstance(context.body, dict):
                raise ValidationError("Update action requires a JSON dictionary body.")
            if not context.object_id and not context.filters:
                raise ValidationError("Update action requires an object_id or filter criteria.")
            if model_meta.schema:
                if hasattr(model_meta.schema, "model_validate"):
                    model_meta.schema.model_validate(context.body)
                elif callable(model_meta.schema):
                    context.body = model_meta.schema(context.body)
            else:
                context.body = DynamicModelValidator.validate_payload(
                    context.model_cls, context.body, is_create=False
                )

        elif context.action == Action.DELETE.value:
            if not context.object_id and not context.filters:
                raise ValidationError("Delete action requires an object_id or filter criteria.")

        elif context.action in (Action.BULK_CREATE.value, Action.BULK_UPSERT.value):
            if not isinstance(context.body, list):
                raise ValidationError(f"{context.action} requires an array (list) of items in body.")
            if len(context.body) == 0:
                raise ValidationError("Bulk payload cannot be empty.")
            if len(context.body) > 500:
                raise ValidationError("Bulk operations cannot exceed 500 items per request.")

        elif context.action == Action.BULK_UPDATE.value:
            if not isinstance(context.body, list) and not isinstance(context.body, dict):
                raise ValidationError("Bulk update requires a list of items or an update body with filters.")

        return context
