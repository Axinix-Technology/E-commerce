from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from catalogue.models import ProductType

User = get_user_model()


class PopulateEngineSecurityTests(TestCase):
    """
    Regression and security tests for the 10-stage Populate Engine.
    Verifies fail-closed authentication, mass assignment blocking,
    sensitive field filtering prevention, and bulk mutation guards.
    """

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPassword@123",
            status=1,
            is_active=True
        )
        self.admin = User.objects.create_superuser(
            username="adminuser",
            email="admin@example.com",
            password="AdminPassword@123",
            status=1,
            is_active=True
        )

    def test_unauthenticated_requests_blocked(self):
        """Unauthenticated requests must be blocked with HTTP 401."""
        response = self.client.get("/api/populate/read/category_master")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_access(self):
        """Authenticated users can query permitted models."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/populate/read/category_master")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("success"))

    def test_sensitive_field_filter_blocked(self):
        """Blind hash extraction via password filters must be rejected with 400/Security error."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/populate/read/user?filter={"password.startswith":"pbkdf2"}')
        self.assertIn(response.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR))
        self.assertFalse(response.data.get("success"))
        self.assertIn("prohibited", response.data.get("error", {}).get("message", "").lower())

    def test_mass_assignment_of_superuser_blocked(self):
        """Standard users cannot grant themselves superuser status."""
        self.client.force_authenticate(user=self.user)
        payload = {"is_superuser": True}
        response = self.client.patch(f"/api/populate/update/user/{self.user.id}", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_superuser)

    def test_direct_modification_of_stock_ledger_blocked(self):
        """Stock ledger rows are strictly immutable via generic CRUD."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch("/api/populate/update/stock_ledger/1", {"inward_qty": 999}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.delete("/api/populate/delete/stock_ledger/1")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bulk_delete_requires_filters(self):
        """Bulk delete without filters must be rejected to prevent table wiping."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/populate/bulk_delete/product_type", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("explicit filter", response.data.get("error", {}).get("message", "").lower())
