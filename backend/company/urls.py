from django.urls import path
from .views import PublicCompanyView

urlpatterns = [
    path('public/', PublicCompanyView.as_view(), name='company-public'),
]
