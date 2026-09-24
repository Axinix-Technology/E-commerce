from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserSession
from .serializers import LoginSerializer


def get_client_ip(request):
    """Utility to extract client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class LoginView(APIView):
    """
    Login Execution Endpoint:
    - Validates user credentials & active status
    - Enforces rate limiting (10 attempts / minute)
    - Captures device information & FCM token into UserSession
    - Generates/Retrieves Auth Token
    - Returns token, session_id, and user profile payload
    """
    permission_classes = [AllowAny]
    throttle_scope = 'login'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        device = serializer.validated_data.get('device', '')
        device_id = serializer.validated_data.get('device_id', '')
        fcm_token = serializer.validated_data.get('fcm_token', '')
        client_ip = get_client_ip(request)

        # 1. Update existing session for this device or create a new active session
        if device_id:
            user_session, _ = UserSession.objects.update_or_create(
                user=user,
                device_id=device_id,
                defaults={
                    'device': device or 'Unknown Device',
                    'ip_address': client_ip,
                    'fcm_token': fcm_token or None,
                    'last_activity': timezone.now(),
                    'status': 1,
                }
            )
        else:
            user_session = UserSession.objects.create(
                user=user,
                device=device or 'Unknown Device',
                device_id=device_id or None,
                ip_address=client_ip,
                fcm_token=fcm_token or None,
                status=1,
            )

        # 2. Get or create auth token
        token, _ = Token.objects.get_or_create(user=user)

        # 3. Response payload
        is_super = bool(user.is_superuser or (user.role and user.role.is_superadmin))
        role_name = user.role.name if user.role else ("Super Admin" if user.is_superuser else None)

        return Response({
            "success": True,
            "message": "Login successful",
            "token": token.key,
            "session_id": user_session.id,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "role": role_name,
                "role_id": user.role_id,
                "is_superadmin": is_super,
                "isSuperAdmin": is_super,
                "status": user.status,
            }
        }, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    Endpoint for frontend session hydration.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_super = bool(user.is_superuser or (user.role and user.role.is_superadmin))
        role_name = user.role.name if user.role else ("Super Admin" if user.is_superuser else None)

        return Response({
            "success": True,
            "data": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "name": f"{user.first_name} {user.last_name}".strip() or user.username,
                "role": role_name,
                "role_id": user.role_id,
                "is_superadmin": is_super,
                "isSuperAdmin": is_super,
                "status": user.status,
            }
        }, status=status.HTTP_200_OK)
