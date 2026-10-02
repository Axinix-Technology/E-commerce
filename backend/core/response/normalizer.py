from typing import Any
from rest_framework.response import Response
from .exceptions import PopulateEngineError


def success_response(
    data: Any = None,
    count: int | None = None,
    message: str | None = None,
    metadata: dict | None = None,
    status_code: int = 200
) -> Response:
    """
    Standard Success Response Envelope:
    {
        "success": true,
        "count": <int>,
        "data": <list | dict | primitive>,
        "message": <optional string>,
        "metadata": <optional metadata>
    }
    """
    if count is None:
        if isinstance(data, list):
            count = len(data)
        elif data is not None:
            count = 1
        else:
            count = 0

    payload: dict[str, Any] = {
        "success": True,
        "count": count,
        "data": data,
    }

    if message is not None:
        payload["message"] = message

    if metadata is not None:
        payload["metadata"] = metadata

    return Response(payload, status=status_code)


from rest_framework.exceptions import ValidationError as DRFValidationError, APIException
from django.core.exceptions import ValidationError as DjangoValidationError


def error_response(error: Exception | str, status_code: int | None = None) -> Response:
    """
    Standard Error Response Envelope:
    {
        "success": false,
        "error": {
            "code": <string>,
            "message": <string>,
            "details": <optional object/list>
        }
    }
    """
    if isinstance(error, PopulateEngineError):
        code = error.code
        message = error.message
        details = error.details
        status_val = status_code or error.status_code
    elif isinstance(error, DRFValidationError):
        code = "VALIDATION_ERROR"
        if isinstance(error.detail, list):
            message = "; ".join(str(d) for d in error.detail)
            details = [str(d) for d in error.detail]
        elif isinstance(error.detail, dict):
            parts = []
            clean_details = {}
            for k, v in error.detail.items():
                v_str = ", ".join(str(item) for item in v) if isinstance(v, list) else str(v)
                parts.append(f"{k}: {v_str}")
                clean_details[k] = v_str
            message = "; ".join(parts)
            details = clean_details
        else:
            message = str(error.detail)
            details = None
        status_val = status_code or 400
    elif isinstance(error, DjangoValidationError):
        code = "VALIDATION_ERROR"
        message = "; ".join(error.messages) if hasattr(error, "messages") else str(error)
        details = getattr(error, "message_dict", None)
        status_val = status_code or 400
    elif isinstance(error, APIException):
        code = getattr(error, "default_code", "API_ERROR").upper()
        message = str(error.detail) if hasattr(error, "detail") else str(error)
        details = None
        status_val = status_code or getattr(error, "status_code", 400)
    elif isinstance(error, Exception):
        code = "INTERNAL_SERVER_ERROR"
        message = str(error)
        details = None
        status_val = status_code or 500
    else:
        code = "GENERAL_ERROR"
        message = str(error)
        details = None
        status_val = status_code or 400

    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        }
    }

    if details is not None:
        payload["error"]["details"] = details

    return Response(payload, status=status_val)
