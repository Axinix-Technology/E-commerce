from typing import Any
from django.db import models
from core.pipeline.context import RequestContext
from core.registry.service_registry import ServiceRegistry
from .base import serialize_value


class OutputSerializer:
    """
    Stage 09 — Output Serialization.
    Controls what data leaves the backend.
    Enforces field-level authorization and strips forbidden fields.
    Renders populated relationships into nested structures.
    """

    @classmethod
    def serialize_result(cls, execution_result: dict[str, Any], context: RequestContext) -> dict[str, Any]:
        items = execution_result.get("items", [])
        is_single = execution_result.get("is_single", False)
        service = ServiceRegistry.get(context.model_name)

        if isinstance(items, dict):
            # Already a dict (e.g. statistics result)
            serialized_data = serialize_value(items)
        elif isinstance(items, list):
            serialized_list = []
            for item in items:
                record_dict = cls.serialize_instance(item, context)
                # Domain Service hook: after_read
                if context.is_read:
                    record_dict = service.after_read(context, record_dict)
                serialized_list.append(record_dict)

            if is_single and len(serialized_list) == 1:
                serialized_data = serialized_list[0]
            elif is_single and len(serialized_list) == 0:
                serialized_data = None
            else:
                serialized_data = serialized_list
        else:
            serialized_data = serialize_value(items)

        res = dict(execution_result)
        res["data"] = serialized_data
        return res

    @classmethod
    def serialize_instance(cls, instance: Any, context: RequestContext) -> dict[str, Any]:
        if not isinstance(instance, models.Model):
            if isinstance(instance, dict):
                return cls._filter_fields(dict(instance), context)
            return {"value": serialize_value(instance)}

        # Extract concrete model fields
        data: dict[str, Any] = {}
        for field in instance._meta.get_fields():
            if field.is_relation:
                continue

            field_name = field.name
            val = getattr(instance, field_name, None)
            data[field_name] = serialize_value(val)

        # Include Foreign Key IDs (e.g. role_id, parent_id)
        for field in instance._meta.get_fields():
            if field.is_relation and not getattr(field, "many_to_many", False) and hasattr(field, "attname"):
                attname = field.attname
                if attname not in data:
                    val = getattr(instance, attname, None)
                    if not hasattr(val, "all"):
                        data[attname] = val

        # Include populated relationships if present in context
        populate_plan = context.metadata.get("query_plan")
        populate_paths = getattr(populate_plan, "populate_paths", []) if populate_plan else []

        for rel_path in populate_paths:
            top_segment = rel_path.segments[0].segment if rel_path.segments else rel_path.django_lookup.split("__")[0]

            try:
                related_obj = getattr(instance, top_segment, None)
                if related_obj is None:
                    data[top_segment] = None
                elif hasattr(related_obj, "all"):  # RelatedManager for M2M or ReverseFK
                    children = list(related_obj.all())
                    data[top_segment] = [
                        cls._serialize_related_instance(child, rel_path.projection_fields)
                        for child in children
                    ]
                elif isinstance(related_obj, models.Model):
                    data[top_segment] = cls._serialize_related_instance(
                        related_obj, rel_path.projection_fields
                    )
                else:
                    data[top_segment] = serialize_value(related_obj)
            except Exception:
                # If relation was not loaded or inaccessible, omit or leave None
                pass

        return cls._filter_fields(data, context)

    @classmethod
    def _serialize_related_instance(cls, instance: models.Model, projection_fields: list[str] | None) -> dict[str, Any]:
        rel_data: dict[str, Any] = {}
        fields_to_include = projection_fields or [
            f.name for f in instance._meta.get_fields() if not f.is_relation
        ]

        for fname in fields_to_include:
            if hasattr(instance, fname):
                val = getattr(instance, fname)
                # Strip password on related user objects
                if fname in ("password", "token", "secret_key"):
                    continue
                rel_data[fname] = serialize_value(val)

        if "id" not in rel_data and hasattr(instance, "id"):
            rel_data["id"] = instance.id

        return rel_data

    @classmethod
    def _filter_fields(cls, data: dict[str, Any], context: RequestContext) -> dict[str, Any]:
        forbidden_fields = context.metadata.get("forbidden_fields") or ["password"]
        allowed_fields = context.metadata.get("allowed_fields")

        # 1. Remove forbidden fields
        for f in forbidden_fields:
            data.pop(f, None)

        # 2. Filter by allowed fields if restricted
        if allowed_fields is not None:
            allowed_set = set(allowed_fields)
            data = {k: v for k, v in data.items() if k in allowed_set or k == "id"}

        return data
