import hashlib
from django.contrib.auth import authenticate
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        max_length=150,
        trim_whitespace=True,
        error_messages={
            "required": "Username is required.",
            "blank": "Username cannot be blank.",
        }
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        max_length=128,  # Protects CPU against oversized payloads before hashing
        trim_whitespace=False,
        error_messages={
            "required": "Password is required.",
            "blank": "Password cannot be blank.",
            "min_length": "Password must be at least 8 characters long.",
            "max_length": "Password exceeds maximum allowable length of 128 characters.",
        }
    )

    # Device & Session Metadata (All optional & nullable)
    device = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='', max_length=150)
    device_id = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='', max_length=255)
    fcm_token = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        # Authenticate via configured backends (handles direct and SHA-256 pre-hashes cleanly)
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )

        if not user:
            # Generic message prevents account enumeration
            raise serializers.ValidationError({"detail": "Invalid username or password."})

        # Check Active Status (Rule K: 1=Active, 0=Inactive)
        if user.status != 1 or not user.is_active:
            raise serializers.ValidationError({"detail": "This account is inactive or disabled."})

        attrs['user'] = user
        return attrs
