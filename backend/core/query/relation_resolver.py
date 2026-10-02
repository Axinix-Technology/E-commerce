from dataclasses import dataclass
from typing import Type
from django.db import models
from core.registry.relation_registry import RelationRegistry, RelationDescriptor
from core.response.exceptions import MaxPopulateDepthExceeded, QueryPlanningError

MAX_POPULATE_DEPTH = 3  # Recipe 03: Hard ceiling to prevent prefetch memory exhaustion


@dataclass
class ResolvedPathSegment:
    segment: str
    target_model: Type[models.Model]
    is_to_many: bool
    relation_type: str


@dataclass
class ResolvedRelationPath:
    raw_path: str
    django_lookup: str  # e.g. "department__company"
    join_strategy: str  # "auto" | "inner" | "left"
    is_to_many: bool
    segments: list[ResolvedPathSegment]
    target_model: Type[models.Model]
    projection_fields: list[str] | None = None


class RelationResolver:
    """
    Stage 06 Helper — Resolves dot-notation relation paths against Django Model metadata.
    Enforces maximum populate depth of 3 levels (Recipe 03).
    """

    @classmethod
    def resolve_path(
        cls,
        root_model: Type[models.Model],
        path_str: str,
        projection: list[str] | None = None
    ) -> ResolvedRelationPath:
        # Extract join modifiers: '>' (INNER), '<' (LEFT OUTER), or AUTO
        join_strategy = "auto"
        clean_path = path_str

        if ">" in clean_path:
            join_strategy = "inner"
            clean_path = clean_path.replace(">", ".")
        elif "<" in clean_path:
            join_strategy = "left"
            clean_path = clean_path.replace("<", ".")

        # Normalize dots and dunders
        segments = [s.strip() for s in clean_path.replace("__", ".").split(".") if s.strip()]

        # Enforce hard depth limit (Recipe 03)
        if len(segments) > MAX_POPULATE_DEPTH:
            raise MaxPopulateDepthExceeded(
                f"Populate path '{path_str}' exceeds maximum allowed depth of {MAX_POPULATE_DEPTH} levels.",
                details={"path": path_str, "depth": len(segments), "max_depth": MAX_POPULATE_DEPTH}
            )

        current_model = root_model
        resolved_segments: list[ResolvedPathSegment] = []
        is_any_to_many = False

        for segment in segments:
            descriptor = RelationRegistry.get_relation(current_model, segment)
            if not descriptor:
                raise QueryPlanningError(
                    f"Relationship '{segment}' does not exist on model '{current_model.__name__}'.",
                    code="RELATION_NOT_FOUND",
                    details={"model": current_model.__name__, "relation": segment}
                )

            if descriptor.is_to_many:
                is_any_to_many = True

            resolved_segments.append(
                ResolvedPathSegment(
                    segment=segment,
                    target_model=descriptor.target_model,
                    is_to_many=descriptor.is_to_many,
                    relation_type=descriptor.relation_type,
                )
            )
            current_model = descriptor.target_model

        django_lookup = "__".join(s.segment for s in resolved_segments)

        return ResolvedRelationPath(
            raw_path=path_str,
            django_lookup=django_lookup,
            join_strategy=join_strategy,
            is_to_many=is_any_to_many,
            segments=resolved_segments,
            target_model=current_model,
            projection_fields=projection,
        )
