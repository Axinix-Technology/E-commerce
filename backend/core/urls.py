from django.urls import path
from core.views import PopulateAPIView

app_name = "populate"

urlpatterns = [
    # /api/populate/<action>/<model>
    path("<str:action>/<str:model_name>", PopulateAPIView.as_view(), name="populate-action-model"),
    # /api/populate/<action>/<model>/<id>
    path("<str:action>/<str:model_name>/<str:object_id>", PopulateAPIView.as_view(), name="populate-action-model-id"),
]
