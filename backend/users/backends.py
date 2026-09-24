import hashlib
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class DualPasswordBackend(ModelBackend):
    """
    Authentication backend that supports both pre-hashed SHA-256 passwords
    (sent by the client UI) and plain-text passwords (from Django Admin, tests, or API clients).
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Fallback for email-based login if username field isn't explicitly matched
        user = None
        try:
            user = UserModel.objects.get_by_natural_key(username)
        except UserModel.DoesNotExist:
            try:
                user = UserModel.objects.get(email__iexact=username)
            except (UserModel.DoesNotExist, UserModel.MultipleObjectsReturned):
                UserModel().set_password(password)
                return None

        if not user:
            return None

        # Check 1: Direct match (checks whatever format was saved in user.password)
        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        # Check 2: If incoming is raw text and user password was stored as SHA-256 hex
        if len(password) != 64:
            sha256_digest = hashlib.sha256(password.encode('utf-8')).hexdigest()
            if user.check_password(sha256_digest) and self.user_can_authenticate(user):
                return user

        return None
