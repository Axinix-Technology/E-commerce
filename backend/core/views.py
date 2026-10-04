from typing import Any
import sys
from django.http import JsonResponse
from django.utils import timezone
from django.db import connection
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.pipeline.executor import PopulatePipeline


def test_api_view(request):
    """
    Public Test and Health Check endpoint.
    Verifies API availability and live database connectivity.
    """
    db_status = "connected"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    is_healthy = db_status == "connected"
    return JsonResponse({
        "status": "healthy" if is_healthy else "degraded",
        "service": "Axinix Central E-Commerce Platform API",
        "version": "1.1.0",
        "database": db_status,
        "timestamp": timezone.now().isoformat(),
        "python_version": sys.version.split()[0],
        "environment": "production" if not settings.DEBUG else "development",
        "endpoints": {
            "test": "/api/test/",
            "auth": "/api/auth/login/",
            "populate": "/api/populate/",
            "company": "/api/company/",
            "admin": "/admin/"
        }
    }, status=200 if is_healthy else 503)



class PopulateAPIView(APIView):
    """
    Universal Entry Point for the Django Populate Engine.
    Dispatches every request directly into the 10-stage execution pipeline.
    Fails closed: requires authenticated session or token.
    """
    permission_classes = [IsAuthenticated]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)

    def dispatch_pipeline(self, request: Request, action: str, model_name: str, object_id: Any | None = None) -> Response:
        return PopulatePipeline.execute(
            request=request,
            action=action,
            model_name=model_name,
            object_id=object_id,
        )

    def get(self, request: Request, action: str, model_name: str, object_id: Any | None = None) -> Response:
        return self.dispatch_pipeline(request, action, model_name, object_id)

    def post(self, request: Request, action: str, model_name: str, object_id: Any | None = None) -> Response:
        return self.dispatch_pipeline(request, action, model_name, object_id)

    def put(self, request: Request, action: str, model_name: str, object_id: Any | None = None) -> Response:
        return self.dispatch_pipeline(request, action, model_name, object_id)

    def patch(self, request: Request, action: str, model_name: str, object_id: Any | None = None) -> Response:
        return self.dispatch_pipeline(request, action, model_name, object_id)

    def delete(self, request: Request, action: str, model_name: str, object_id: Any | None = None) -> Response:
        return self.dispatch_pipeline(request, action, model_name, object_id)
