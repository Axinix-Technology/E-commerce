import re
from typing import Type
from django.db import models
from core.registry.relation_registry import RelationRegistry
from core.response.exceptions import SecuritySanitizationError

_IDENTIFIER_PATTERN = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")


class IdentifierGuard:
    """
    Stage 03 — Dynamic identifier whitelist guard.
    Verifies that fields, relations, and paths exist in model metadata
    and conform to strict safe identifier syntax.
    """

    @classmethod
    def validate_identifier_syntax(cls, name: str) -> None:
        if not name or not _IDENTIFIER_PATTERN.match(name):
            raise SecuritySanitizationError(
                f"Invalid or unsafe identifier syntax: '{name}'.",
                code="INVALID_IDENTIFIER_SYNTAX",
                details={"identifier": name}
            )

    @classmethod
    def validate_model_field(cls, model_class: Type[models.Model], field_name: str) -> str:
        """
        Validates that a field or relation exists directly on the model.
        Returns the sanitized field name or raises SecuritySanitizationError.
        """
        cls.validate_identifier_syntax(field_name)

        # Check model fields
        valid_fields = RelationRegistry.get_field_names(model_class)
        if field_name in valid_fields:
            return field_name

        # Also check attnames (e.g. role_id for ForeignKey role)
        for field in model_class._meta.get_fields():
            if getattr(field, "attname", None) == field_name:
                return field_name

        raise SecuritySanitizationError(
            f"Field '{field_name}' does not exist on model '{model_class.__name__}'.",
            code="UNREGISTERED_FIELD",
            details={"model": model_class.__name__, "field": field_name}
        )

    @classmethod
    def validate_path_segments(cls, model_class: Type[models.Model], path_segments: list[str]) -> list[str]:
        """
        Validates every segment in a dot/double-underscore path traversal.
        Traverses relations to ensure each step is a valid registered relationship or field.
        """
        current_model = model_class

        for i, segment in enumerate(path_segments):
            cls.validate_identifier_syntax(segment)

            is_last = (i == len(path_segments) - 1)

            # Check if segment is a relation
            rel_descriptor = RelationRegistry.get_relation(current_model, segment)
            if rel_descriptor:
                current_model = rel_descriptor.target_model
                continue

            # If not a relation, check if it's a direct field
            valid_fields = RelationRegistry.get_field_names(current_model)
            if segment in valid_fields:
                if not is_last:
                    raise SecuritySanitizationError(
                        f"Field '{segment}' on model '{current_model.__name__}' is not a relation and cannot be traversed further.",
                        code="INVALID_TRAVERSAL",
                        details={"model": current_model.__name__, "segment": segment}
                    )
                continue

            # Check attnames
            has_attname = any(getattr(f, "attname", None) == segment for f in current_model._meta.get_fields())
            if has_attname:
                if not is_last:
                    raise SecuritySanitizationError(
                        f"Field '{segment}' is not traversable.",
                        code="INVALID_TRAVERSAL"
                    )
                continue

            raise SecuritySanitizationError(
                f"Unknown field or relation '{segment}' on model '{current_model.__name__}'.",
                code="UNKNOWN_PATH_SEGMENT",
                details={"model": current_model.__name__, "segment": segment}
            )

        return path_segments
