from core.response.exceptions import SecuritySanitizationError

# Controlled vocabulary for lookup operators (Doc section 11)
ALLOWED_LOOKUP_OPERATORS: frozenset[str] = frozenset({
    "exact",
    "iexact",
    "gt",
    "gte",
    "lt",
    "lte",
    "in",
    "icontains",
    "contains",
    "startswith",
    "istartswith",
    "endswith",
    "iendswith",
    "isnull",
    "range",
})


class LookupGuard:
    """
    Stage 03 — Lookup operator whitelist guard.
    Only allows pre-registered, safe Django ORM operators.
    """

    @classmethod
    def validate_operator(cls, op: str) -> str:
        op_lower = op.lower().strip()
        if op_lower not in ALLOWED_LOOKUP_OPERATORS:
            raise SecuritySanitizationError(
                f"Unsupported or unauthorized lookup operator '{op}'.",
                code="UNAUTHORIZED_LOOKUP_OPERATOR",
                details={
                    "operator": op,
                    "allowed_operators": sorted(list(ALLOWED_LOOKUP_OPERATORS)),
                }
            )
        return op_lower

    @classmethod
    def is_allowed(cls, op: str) -> bool:
        return op.lower().strip() in ALLOWED_LOOKUP_OPERATORS
