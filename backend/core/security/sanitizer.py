from typing import Any
from core.pipeline.context import RequestContext
from core.response.exceptions import SecuritySanitizationError
from .identifier_guard import IdentifierGuard
from .lookup_guard import LookupGuard


class SecuritySanitizer:
    """
    Stage 03 — Security Sanitization.
    Ensures input data cannot become executable query instructions or SQL injection.
    Values are left intact for parameterization; dynamic identifiers are whitelisted.
    """

    @classmethod
    def sanitize(cls, context: RequestContext) -> RequestContext:
        model_cls = context.model_cls

        # 1. Sanitize ordering instructions
        if context.ordering:
            sanitized_ordering = []
            for item in context.ordering:
                if not isinstance(item, str):
                    continue
                direction = "-" if item.startswith("-") else ""
                raw_field = item[1:] if item.startswith("-") else item

                # Ordering can be dot-path or field
                segments = raw_field.replace("__", ".").split(".")
                IdentifierGuard.validate_path_segments(model_cls, segments)
                orm_field = "__".join(segments)
                sanitized_ordering.append(f"{direction}{orm_field}")
            context.ordering = sanitized_ordering

        # 2. Sanitize projection fields (if specified)
        if context.fields:
            sanitized_fields = []
            for f in context.fields:
                if not isinstance(f, str):
                    continue
                # Validate direct field
                IdentifierGuard.validate_model_field(model_cls, f)
                sanitized_fields.append(f)
            context.fields = sanitized_fields

        # 3. Sanitize filter keys & lookup operators
        if context.filters:
            sanitized_filters = {}
            for key, val in context.filters.items():
                if not isinstance(key, str):
                    continue

                # Parse key for operator or path
                parts = key.replace("__", ".").split(".")

                # Check if last segment is a lookup operator
                if len(parts) > 1 and LookupGuard.is_allowed(parts[-1]):
                    op = LookupGuard.validate_operator(parts[-1])
                    path_segments = parts[:-1]
                else:
                    op = "exact"
                    path_segments = parts

                # Validate path segments
                try:
                    IdentifierGuard.validate_path_segments(model_cls, path_segments)
                    clean_key = f"{'__'.join(path_segments)}__{op}" if op != "exact" else "__".join(path_segments)
                    sanitized_filters[clean_key] = val
                except SecuritySanitizationError:
                    if context.action in ("report", "statistics"):
                        sanitized_filters[key] = val
                    else:
                        raise

            context.filters = sanitized_filters

        return context
