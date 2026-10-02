from typing import Any
from rest_framework.request import Request
from rest_framework.response import Response
from core.pipeline.context import RequestContext, Action
from core.validation.validator import RequestValidator
from core.security.sanitizer import SecuritySanitizer
from core.policy.engine import PolicyEngine
from core.query.parser import DeveloperDSLParser
from core.query.planner import QueryPlanner
from core.query.compiler import QueryCompiler
from core.crud import (
    ReadExecutor,
    CreateExecutor,
    UpdateExecutor,
    DeleteExecutor,
    ReportExecutor,
)
from core.serialization.output import OutputSerializer
from core.audit.logger import AuditLogger
from core.response.normalizer import success_response, error_response


class IngressStage:
    """Stage 01: Ingress & Context Creation."""

    @classmethod
    def execute(
        cls,
        request: Request,
        action: str,
        model_name: str,
        object_id: Any | None = None
    ) -> RequestContext:
        action_clean = action.lower().strip().replace("_", "-")
        model_clean = model_name.lower().strip()

        # Ingress parses source parameters:
        # Handles both DRF Request (with .data) and Django HttpRequest
        body_data = getattr(request, "data", None)
        if body_data is None:
            raw_body = getattr(request, "body", b"")
            if raw_body:
                import json
                try:
                    body_data = json.loads(raw_body.decode("utf-8"))
                except Exception:
                    body_data = getattr(request, "POST", {})
            else:
                body_data = getattr(request, "POST", {})

        if not isinstance(body_data, (dict, list)):
            body_data = {}

        raw_query = getattr(request, "query_params", None)
        if raw_query is None:
            raw_query = getattr(request, "GET", {})
        query_params = dict(raw_query.items())

        if Action.is_read_action(action_clean):
            # Read parameters can be in body or query
            combined = {**query_params, **(body_data if isinstance(body_data, dict) else {})}
            filters = combined.get("filter") or combined.get("filters") or {}
            populate = combined.get("populate") or combined.get("populateFields") or {}
            fields = combined.get("fields")
            ordering_raw = combined.get("sort") or combined.get("ordering") or []
            page = combined.get("page", 1)
            limit = combined.get("limit", 20)
            mutation_body = {}
        else:
            filters = query_params.get("filter") or query_params.get("filters") or {}
            populate = query_params.get("populate") or {}
            fields = query_params.get("fields")
            ordering_raw = query_params.get("sort") or query_params.get("ordering") or []
            page = query_params.get("page", 1)
            limit = query_params.get("limit", 20)
            mutation_body = body_data

        # If filters or populate are passed as serialized JSON strings in query params, deserialize them
        if isinstance(filters, str):
            import json
            try:
                filters = json.loads(filters)
            except Exception:
                filters = {}

        if isinstance(populate, str):
            import json
            try:
                populate = json.loads(populate)
            except Exception:
                pass

        if isinstance(ordering_raw, str):
            ordering = [s.strip() for s in ordering_raw.split(",") if s.strip()]
        elif isinstance(ordering_raw, list):
            ordering = ordering_raw
        else:
            ordering = []

        if isinstance(fields, str):
            fields = [s.strip() for s in fields.split(",") if s.strip()]

        context = RequestContext(
            action=action_clean,
            model_name=model_clean,
            object_id=object_id,
            body=mutation_body,
            filters=filters if isinstance(filters, dict) else {},
            populate=populate if isinstance(populate, (dict, list)) else {},
            fields=fields if isinstance(fields, list) else None,
            ordering=ordering,
            pagination={"page": page, "limit": limit},
            user=getattr(request, "user", None),
        )
        return context


class ValidationStage:
    """Stage 02: Shape and Type Validation."""

    @classmethod
    def execute(cls, context: RequestContext) -> RequestContext:
        return RequestValidator.validate(context)


class SanitizationStage:
    """Stage 03: Security Sanitization."""

    @classmethod
    def execute(cls, context: RequestContext) -> RequestContext:
        return SecuritySanitizer.sanitize(context)


class AuthorizationStage:
    """Stage 04: RBAC / ABAC Authorization."""

    @classmethod
    def execute(cls, context: RequestContext) -> RequestContext:
        return PolicyEngine.authorize(context)


class ParsingStage:
    """Stage 05: Developer DSL Parser."""

    @classmethod
    def execute(cls, context: RequestContext) -> Any:
        ast = DeveloperDSLParser.parse(context)
        context.metadata["query_ast"] = ast
        return ast


class PlanningStage:
    """Stage 06: Relation & Join Planner."""

    @classmethod
    def execute(cls, context: RequestContext, ast: Any) -> Any:
        plan = QueryPlanner.plan(ast, context.model_cls)
        context.metadata["query_plan"] = plan
        return plan


class CompilationStage:
    """Stage 07: Django QuerySet Compilation."""

    @classmethod
    def execute(cls, context: RequestContext, plan: Any) -> Any:
        qs = QueryCompiler.compile(plan, context)
        context.metadata["compiled_queryset"] = qs
        return qs


class ExecutionStage:
    """Stage 08: Generic Execution (CRUD + Domain Service hooks)."""

    @classmethod
    def execute(cls, context: RequestContext, queryset: Any) -> dict[str, Any]:
        action = context.action

        if action == Action.READ.value:
            return ReadExecutor.execute(queryset, context)

        elif action == Action.CREATE.value or action in (Action.BULK_CREATE.value, Action.BULK_UPSERT.value):
            return CreateExecutor.execute(context)

        elif action == Action.UPDATE.value or action == Action.BULK_UPDATE.value:
            return UpdateExecutor.execute(queryset, context)

        elif action == Action.DELETE.value or action == Action.BULK_DELETE.value:
            return DeleteExecutor.execute(queryset, context)

        elif action in (Action.REPORT.value, Action.STATISTICS.value):
            return ReportExecutor.execute(queryset, context)

        else:
            return ReadExecutor.execute(queryset, context)


class SerializationStage:
    """Stage 09: Output Serialization."""

    @classmethod
    def execute(cls, context: RequestContext, execution_result: dict[str, Any]) -> dict[str, Any]:
        return OutputSerializer.serialize_result(execution_result, context)


class FinalizationStage:
    """Stage 10: Finalization (Audit & Response Envelope)."""

    @classmethod
    def execute_success(cls, context: RequestContext, serialized_result: dict[str, Any]) -> Response:
        AuditLogger.log(context, serialized_result)

        data = serialized_result.get("data")
        count = serialized_result.get("count")
        page = serialized_result.get("page")
        limit = serialized_result.get("limit")

        metadata = {}
        if page is not None and limit is not None:
            metadata["page"] = page
            metadata["limit"] = limit
            metadata["total_pages"] = (count + limit - 1) // limit if limit else 1

        message = None
        if context.action == Action.DELETE.value:
            message = f"{context.model_name.capitalize()} soft-deleted successfully."
        elif context.action == Action.CREATE.value:
            message = f"{context.model_name.capitalize()} created successfully."
        elif context.action == Action.UPDATE.value:
            message = f"{context.model_name.capitalize()} updated successfully."

        return success_response(
            data=data,
            count=count,
            message=message,
            metadata=metadata if metadata else None,
            status_code=201 if context.action == Action.CREATE.value else 200,
        )

    @classmethod
    def execute_error(cls, error: Exception, context: RequestContext | None = None) -> Response:
        if context:
            AuditLogger.log(context, {"error": str(error), "count": 0})
        return error_response(error)
