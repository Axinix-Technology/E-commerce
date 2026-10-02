from typing import Any
from rest_framework.request import Request
from rest_framework.response import Response
from core.pipeline.context import RequestContext
from core.pipeline.stages import (
    IngressStage,
    ValidationStage,
    SanitizationStage,
    AuthorizationStage,
    ParsingStage,
    PlanningStage,
    CompilationStage,
    ExecutionStage,
    SerializationStage,
    FinalizationStage,
)
from core.response.exceptions import PopulateEngineError


class PopulatePipeline:
    """
    Core Pipeline Executor:
    Enforces the single immutable 10-stage execution pipeline.
    01. INGRESS        -> Request & Context Creation
    02. VALIDATION     -> Schema & Shape Check
    03. SANITIZATION   -> Identifier & Parameter Safety
    04. AUTHORIZATION  -> RBAC / ABAC Policies (boolean is_superuser)
    05. PARSING        -> Developer DSL -> AST
    06. PLANNING       -> Join & Prefetch Planning
    07. COMPILATION    -> Django QuerySet Compilation
    08. EXECUTION      -> CRUD Transactions & Domain Services
    09. SERIALIZATION  -> Output Security & Shape
    10. FINALIZATION   -> Audit Logging & Response Envelope
    """

    @classmethod
    def execute(
        cls,
        request: Request,
        action: str,
        model_name: str,
        object_id: Any | None = None
    ) -> Response:
        context: RequestContext | None = None

        try:
            # 01. Ingress
            context = IngressStage.execute(request, action, model_name, object_id)

            # 02. Validation
            context = ValidationStage.execute(context)

            # 03. Sanitization
            context = SanitizationStage.execute(context)

            # 04. Authorization
            context = AuthorizationStage.execute(context)

            # 05. Parsing
            ast = ParsingStage.execute(context)

            # 06. Planning
            plan = PlanningStage.execute(context, ast)

            # 07. Compilation
            queryset = CompilationStage.execute(context, plan)

            # 08. Execution
            raw_result = ExecutionStage.execute(context, queryset)

            # 09. Serialization
            serialized_result = SerializationStage.execute(context, raw_result)

            # 10. Finalization (Success)
            return FinalizationStage.execute_success(context, serialized_result)

        except PopulateEngineError as engine_err:
            # Fail closed through standard error finalization
            return FinalizationStage.execute_error(engine_err, context)

        except Exception as unexpected_err:
            # Catch-all fail-closed error finalization
            return FinalizationStage.execute_error(unexpected_err, context)
