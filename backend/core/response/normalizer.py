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
