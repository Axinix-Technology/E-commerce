from datetime import date, datetime
from decimal import Decimal
from typing import Any, Type
from django.db import models
from django.core.exceptions import ValidationError as DjangoValidationError
from core.response.exceptions import ValidationError
from core.validation.rules import validate_field_characters


class DynamicModelValidator:
    """
    Generic dynamic model schema validator based on Django model metadata.
    Validates types, required fields, choices, and length constraints.
    """

    @classmethod
    def validate_payload(
        cls,
        model_cls: Type[models.Model],
        data: dict,
        is_create: bool = True
    ) -> dict:
        if not isinstance(data, dict):
            raise ValidationError("Payload must be a JSON object (dictionary).")

        cleaned_data: dict[str, Any] = {}
        model_fields = {f.name: f for f in model_cls._meta.get_fields() if hasattr(f, "attname")}

        # Check required fields for CREATE
        if is_create:
            for name, field in model_fields.items():
                if field.primary_key:
                    continue
                # Skip auto fields, timestamps with auto_now/auto_now_add, or fields with default
                if getattr(field, "auto_now", False) or getattr(field, "auto_now_add", False):
                    continue
                if field.has_default():
                    continue
                if field.null or field.blank:
                    continue

                # ForeignKey usually has attname e.g. role_id
                attname = getattr(field, "attname", name)
                if name not in data and attname not in data:
                    raise ValidationError(
                        f"Field '{name}' is required.",
                        details={"missing_field": name}
                    )

        # Validate provided fields
        for key, val in data.items():
            # Check if key corresponds to a field or attname
            field = model_fields.get(key)
            if not field:
                # Check for fk_id matching attname
                for f_name, f_obj in model_fields.items():
                    if getattr(f_obj, "attname", None) == key:
                        field = f_obj
                        break

            if not field:
                # Field doesn't exist on model; allow it to pass through or omit
                # We retain it so domain services / custom hooks can consume custom parameters
                cleaned_data[key] = val
                continue

            # Validate nullability
            if val is None:
                if not field.null and not getattr(field, "blank", False) and not field.has_default():
                    raise ValidationError(f"Field '{key}' cannot be null.")
                cleaned_data[key] = None
                continue

            # Validate types & choices
            try:
                # Check choices
                if getattr(field, "choices", None):
                    valid_choices = [c[0] for c in field.choices]
                    # Cast if needed (e.g. str vs int for smallint choices)
                    if isinstance(field, (models.IntegerField, models.SmallIntegerField)):
                        try:
                            val = int(val)
                        except (ValueError, TypeError):
                            pass
                    if val not in valid_choices:
                        raise ValidationError(
                            f"Invalid choice '{val}' for field '{key}'. Valid choices: {valid_choices}",
                            details={"field": key, "valid_choices": valid_choices}
                        )

                # Check max_length on CharField
                max_length = getattr(field, "max_length", None)
                if max_length and isinstance(val, str) and len(val) > max_length:
                    raise ValidationError(
                        f"Value for '{key}' exceeds maximum length of {max_length}.",
                        details={"field": key, "max_length": max_length, "actual_length": len(val)}
                    )

                # Character-level rule validation (letters, numbers, spaces only for names, no special chars)
                is_valid_chars, char_err = validate_field_characters(key, val)
                if not is_valid_chars:
                    raise ValidationError(
                        char_err,
                        details={"field": key, "value": val, "error": char_err}
                    )

                cleaned_data[key] = val

            except (DjangoValidationError, TypeError, ValueError) as err:
                raise ValidationError(
                    f"Validation error for field '{key}': {str(err)}",
                    details={"field": key, "error": str(err)}
                )

        # Cross-field range validations
        if "min_age" in cleaned_data and "max_age" in cleaned_data:
            try:
                min_a = int(cleaned_data["min_age"])
                max_a = int(cleaned_data["max_age"])
                if min_a > max_a:
                    raise ValidationError(
                        f"Minimum age ({min_a}) cannot be greater than maximum age ({max_a}).",
                        details={"field": "min_age", "min_age": min_a, "max_age": max_a}
                    )
            except (ValueError, TypeError):
                pass

        return cleaned_data
