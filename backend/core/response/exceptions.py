class PopulateEngineError(Exception):
    """Base exception for all Populate Engine errors."""
    default_code = "ENGINE_ERROR"
    status_code = 500

    def __init__(self, message: str, code: str | None = None, details: dict | list | None = None, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        self.code = code or self.default_code
        self.details = details
        if status_code is not None:
            self.status_code = status_code


class ConfigurationError(PopulateEngineError):
    """Raised when model or registry configuration is invalid."""
    default_code = "CONFIG_ERROR"
    status_code = 500


class ValidationError(PopulateEngineError):
    """Raised in Stage 02 when input data fails schema, shape or type validation."""
    default_code = "VALIDATION_FAILED"
    status_code = 400


class SecuritySanitizationError(PopulateEngineError):
    """Raised in Stage 03 when an identifier, operator, or payload contains unsafe/unregistered elements."""
    default_code = "SECURITY_VIOLATION"
    status_code = 400


class AuthorizationError(PopulateEngineError):
    """Raised in Stage 04 when user lacks permissions for model, action, or field."""
    default_code = "PERMISSION_DENIED"
    status_code = 403


class DSLParseError(PopulateEngineError):
    """Raised in Stage 05 when developer DSL syntax is invalid."""
    default_code = "INVALID_DSL_SYNTAX"
    status_code = 400


class MaxPopulateDepthExceeded(PopulateEngineError):
    """Raised when populate tree depth exceeds the safe limit (Recipe 03: max depth 3)."""
    default_code = "MAX_POPULATE_DEPTH_EXCEEDED"
    status_code = 400


class QueryPlanningError(PopulateEngineError):
    """Raised in Stage 06 when relation or join planning fails."""
    default_code = "QUERY_PLANNING_ERROR"
    status_code = 400


class QueryCompilationError(PopulateEngineError):
    """Raised in Stage 07 when Django QuerySet compilation fails."""
    default_code = "QUERY_COMPILATION_ERROR"
    status_code = 400


class ExecutionError(PopulateEngineError):
    """Raised in Stage 08 when database or CRUD execution fails."""
    default_code = "EXECUTION_ERROR"
    status_code = 500


class NotFoundError(PopulateEngineError):
    """Raised when the target record does not exist in the active scope."""
    default_code = "NOT_FOUND"
    status_code = 404


class BusinessRuleError(PopulateEngineError):
    """Raised by service hooks when domain business rules are violated."""
    default_code = "BUSINESS_RULE_VIOLATION"
    status_code = 422


class SerializationError(PopulateEngineError):
    """Raised in Stage 09 when output serialization fails."""
    default_code = "SERIALIZATION_ERROR"
    status_code = 500
