from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from core.views import test_api_view

urlpatterns = [
    # Health checks & Test endpoints (Root & /api/test)
    path('', test_api_view, name='root_healthcheck'),
    path('api/test', test_api_view, name='api_test_no_slash'),
    path('api/test/', test_api_view, name='api_test'),

    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/company/', include('company.urls')),
    path('api/populate/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
