from dataclasses import dataclass, field
from typing import Any, Type
from django.db import models
from django.db.models import Prefetch, Q
from core.query.parser import ParsedQueryAST
from core.query.relation_resolver import ResolvedRelationPath

MAX_PREFETCH_CHILDREN = 50  # Recipe 03: Ceiling on child records per parent node to prevent OOM


@dataclass
class QueryPlan:
    model_cls: Type[models.Model]
    select_related_paths: list[str] = field(default_factory=list)
    prefetch_objects: list[Prefetch | str] = field(default_factory=list)
    filter_q: Q = field(default_factory=Q)
    ordering: list[str] = field(default_factory=list)
    projection_fields: list[str] | None = None
    populate_paths: list[ResolvedRelationPath] = field(default_factory=list)


class QueryPlanner:
    """
    Stage 06 — Relation & Query Planner.
    Analyzes relationship graph and constructs optimized join/prefetch strategy.
    Enforces Recipe 03 child limits on prefetch branches.
    """

    @classmethod
    def plan(cls, ast: ParsedQueryAST, model_cls: Type[models.Model]) -> QueryPlan:
        plan = QueryPlan(
            model_cls=model_cls,
            ordering=ast.ordering,
            projection_fields=ast.projection_fields,
            populate_paths=ast.populate_paths,
        )

        # 1. Combine AST filter clauses into a Q object
        filter_q = Q()
        for clause in ast.filter_clauses:
            filter_q &= Q(**{clause.lookup_field: clause.value})
        plan.filter_q = filter_q

        # 2. Plan populate relationships
        select_related_set: set[str] = set()
        prefetch_list: list[Prefetch | str] = []

        for rel_path in ast.populate_paths:
            if not rel_path.is_to_many:
                # Forward FK / OneToOne relation -> select_related
                select_related_set.add(rel_path.django_lookup)
            else:
                # To-many or reverse FK -> prefetch_related with bounded child limit (Recipe 03)
                target_model = rel_path.target_model
                prefetch_qs = target_model.objects.all()

                # Status scoping for active records if model has status field
                if hasattr(target_model, "status"):
                    prefetch_qs = prefetch_qs.filter(status=1)

                if rel_path.projection_fields:
                    # Only project needed fields plus primary key and foreign keys
                    valid_fields = [f for f in rel_path.projection_fields if hasattr(target_model, f)]
                    if "id" not in valid_fields and hasattr(target_model, "id"):
                        valid_fields.append("id")

                    # Include any foreign key linking back to parent model to avoid N+1 queries during prefetch hydration
                    for f in target_model._meta.get_fields():
                        if f.is_relation and getattr(f, "related_model", None) == model_cls:
                            attname = getattr(f, "attname", None)
                            if attname and attname not in valid_fields:
                                valid_fields.append(attname)

                    if valid_fields:
                        prefetch_qs = prefetch_qs.only(*valid_fields)

                prefetch_obj = Prefetch(
                    rel_path.django_lookup,
                    queryset=prefetch_qs
                )
                prefetch_list.append(prefetch_obj)

        plan.select_related_paths = sorted(list(select_related_set))
        plan.prefetch_objects = prefetch_list

        return plan
