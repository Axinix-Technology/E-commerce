import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Company

_company_cache = None
_company_cache_time = 0
CACHE_TTL = 60  # seconds


class PublicCompanyView(APIView):
    """
    Public Company Profile endpoint (Used by Login Page & Header branding).
    Returns active company details or standard defaults if not yet populated.
    Cached in-memory to prevent repeated cloud database latency.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        global _company_cache, _company_cache_time

        now = time.time()
        if _company_cache is not None and (now - _company_cache_time) < CACHE_TTL:
            return Response(_company_cache, status=status.HTTP_200_OK)

        company = Company.objects.filter(status=1).first()

        if company:
            data = {
                "name": company.name,
                "legal_name": company.legal_name,
                "short_name": company.short_name or company.name,
                "logo_image": request.build_absolute_uri(company.logo_image.url) if company.logo_image else None,
                "company_image": request.build_absolute_uri(company.company_image.url) if company.company_image else None,
                "city": company.city,
                "state": company.state,
                "website_url": company.website_url,
                "is_configured": True,
            }
        else:
            # Default placeholder when Company Master is not yet filled in DB
            data = {
                "name": "Centralized Commerce",
                "legal_name": "Axinix Platform Ltd",
                "short_name": "Axinix",
                "logo_image": None,
                "company_image": None,
                "city": None,
                "state": None,
                "website_url": None,
                "is_configured": False,
            }

        _company_cache = data
        _company_cache_time = now
        return Response(data, status=status.HTTP_200_OK)
