from typing import Any
from django.db.models import QuerySet, Q
from core.pipeline.context import RequestContext
from core.query.planner import QueryPlan


class QueryCompiler:
    """
    Stage 07 — Query Compilation.
    Converts a validated QueryPlan and RequestContext into a Django QuerySet.
    Enforces Golden Rule 11 (status=1 active scoping) and policy Q() conditions.
    """

    @classmethod
    def compile(cls, plan: QueryPlan, context: RequestContext) -> QuerySet:
        model_cls = plan.model_cls
        qs: QuerySet = model_cls.objects.all()

        # 1. Golden Rule 11 Status Scoping: default active scope (status=1)
        model_meta = context.model_metadata
        status_field = getattr(model_meta, "status_field", "status") if model_meta else "status"
        include_inactive = context.metadata.get("include_inactive", False)

        has_status = False
        if hasattr(model_cls, status_field):
            has_status = True
        else:
            try:
                model_cls._meta.get_field(status_field)
                has_status = True
            except Exception:
                has_status = False

        if has_status and not include_inactive:
            qs = qs.filter(**{status_field: 1})

        # 2. Apply Stage 04 Authorization Policy Q() Scope
        policy_q = context.metadata.get("policy_q")
        if isinstance(policy_q, Q) and policy_q:
            qs = qs.filter(policy_q)

        # 3. Apply Stage 05/06 Parsed User Filter Q()
        if plan.filter_q:
            qs = qs.filter(plan.filter_q)

        # 4. Target object ID filter (if single item action)
        if context.object_id is not None:
            qs = qs.filter(pk=context.object_id)

        # 5. Apply select_related joins
        if plan.select_related_paths:
            qs = qs.select_related(*plan.select_related_paths)

        # 6. Apply prefetch_related relations
        if plan.prefetch_objects:
            qs = qs.prefetch_related(*plan.prefetch_objects)

        # 7. Apply Ordering
        if plan.ordering:
            qs = qs.order_by(*plan.ordering)

        # 8. Apply Field Projection (only) if specified and allowed
        if plan.projection_fields:
            # Primary key must always be included for Django ORM hydration
            proj = list(plan.projection_fields)
            if "id" not in proj and "pk" not in proj:
                proj.append("id")
            # Only include fields that actually exist on the model
            valid_proj = [f for f in proj if hasattr(model_cls, f)]
            if valid_proj:
                qs = qs.only(*valid_proj)

        return qs
