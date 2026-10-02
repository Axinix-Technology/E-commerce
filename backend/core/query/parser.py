import json
from dataclasses import dataclass, field
from typing import Any, Type
from django.db import models
from core.pipeline.context import RequestContext
from core.query.collision_guard import PopulateCollisionGuard
from core.query.relation_resolver import RelationResolver, ResolvedRelationPath
from core.security.lookup_guard import LookupGuard
from core.security.identifier_guard import IdentifierGuard
from core.response.exceptions import DSLParseError


@dataclass
class ParsedFilterClause:
    lookup_field: str  # Django ORM lookup, e.g. "department__company__name__icontains"
    value: Any


@dataclass
class ParsedQueryAST:
    model_name: str
    filter_clauses: list[ParsedFilterClause] = field(default_factory=list)
    populate_paths: list[ResolvedRelationPath] = field(default_factory=list)
    projection_fields: list[str] | None = None
    ordering: list[str] = field(default_factory=list)


class DeveloperDSLParser:
    """
    Stage 05 — Developer DSL Parser.
    Converts developer-friendly populate and filter payloads into a structured AST.
    Implements LRU caching for parsed DSL plans (Recipe 04).
    """

    _ast_cache: dict[str, ParsedQueryAST] = {}

    @classmethod
    def _make_cache_key(cls, model_name: str, action: str, filters: dict, populate: Any, fields: Any, ordering: list) -> str:
        try:
            raw = f"{model_name}:{action}:{json.dumps(filters, sort_keys=True)}:{json.dumps(populate, sort_keys=True)}:{json.dumps(fields, sort_keys=True)}:{json.dumps(ordering)}"
            return str(hash(raw))
        except Exception:
            return ""

    @classmethod
    def parse(cls, context: RequestContext) -> ParsedQueryAST:
        model_cls = context.model_cls
        model_name = context.model_name
        action = context.action

        # Check LRU cache (Recipe 04)
        cache_key = cls._make_cache_key(
            model_name, action, context.filters, context.populate, context.fields, context.ordering
        )
        if cache_key and cache_key in cls._ast_cache:
            return cls._ast_cache[cache_key]

        ast = ParsedQueryAST(model_name=model_name)

        # 1. Parse Filter Clauses
        if context.filters:
            ast.filter_clauses = cls._parse_filters(model_cls, context.filters)

        # 2. Parse Populate Directives
        if context.populate:
            ast.populate_paths = cls._parse_populate(model_cls, context.populate)

        # 3. Parse Projections and Ordering
        ast.projection_fields = context.fields
        ast.ordering = context.ordering or context.model_metadata.default_ordering

        # Store in cache
        if cache_key:
            if len(cls._ast_cache) > 1024:
                cls._ast_cache.clear()
            cls._ast_cache[cache_key] = ast

        return ast

    @classmethod
    def _parse_filters(cls, model_cls: Type[models.Model], raw_filters: dict) -> list[ParsedFilterClause]:
        clauses: list[ParsedFilterClause] = []

        for raw_key, raw_val in raw_filters.items():
            if not isinstance(raw_key, str):
                continue

            # Check if key is already dunder or dot notation
            parts = raw_key.replace("__", ".").split(".")

            # Check if last token is an allowed lookup operator
            if len(parts) > 1 and LookupGuard.is_allowed(parts[-1]):
                op = LookupGuard.validate_operator(parts[-1])
                field_segments = parts[:-1]
            else:
                op = "exact"
                field_segments = parts

            # Validate path traversal through IdentifierGuard
            try:
                IdentifierGuard.validate_path_segments(model_cls, field_segments)
            except Exception:
                # Custom report or service parameter that is not a direct model column
                continue

            lookup_field = "__".join(field_segments)
            if op != "exact":
                lookup_field = f"{lookup_field}__{op}"

            # Auto-cast list values for 'in' operator
            if op == "in" and not isinstance(raw_val, (list, tuple, set)):
                raw_val = [raw_val]

            clauses.append(ParsedFilterClause(lookup_field=lookup_field, value=raw_val))

        return clauses

    @classmethod
    def _parse_populate(cls, model_cls: Type[models.Model], raw_populate: Any) -> list[ResolvedRelationPath]:
        resolved_paths: list[ResolvedRelationPath] = []

        if isinstance(raw_populate, list):
            # Format: ["department", "department>manager", "branch<company"]
            normalized = PopulateCollisionGuard.normalize_paths(raw_populate)
            for path_str in normalized:
                resolved = RelationResolver.resolve_path(model_cls, path_str)
                resolved_paths.append(resolved)

        elif isinstance(raw_populate, dict):
            # Format: {"department": ["id", "name"], "department>manager": ["id", "name"]}
            keys = PopulateCollisionGuard.normalize_paths(list(raw_populate.keys()))
            for path_str in keys:
                projection = raw_populate.get(path_str)
                if not isinstance(projection, list):
                    projection = None
                resolved = RelationResolver.resolve_path(model_cls, path_str, projection=projection)
                resolved_paths.append(resolved)

        elif isinstance(raw_populate, str):
            resolved = RelationResolver.resolve_path(model_cls, raw_populate)
            resolved_paths.append(resolved)

        else:
            raise DSLParseError(
                f"Unsupported populate format: {type(raw_populate).__name__}. Must be list or dictionary.",
                details={"populate": raw_populate}
            )

        return resolved_paths

    @classmethod
    def clear_cache(cls) -> None:
        cls._ast_cache.clear()
