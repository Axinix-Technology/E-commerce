from typing import Any
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from core.pipeline.executor import PopulatePipeline


class PopulateAPIView(APIView):
    """
    Universal Entry Point for the Django Populate Engine.
    Dispatches every request directly into the 10-stage execution pipeline.
    """
    permission_classes = [AllowAny]

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
