from django.contrib import admin
from .models import PaymentGatewayConfig, ShopIntegration


@admin.register(PaymentGatewayConfig)
class PaymentGatewayConfigAdmin(admin.ModelAdmin):
    list_display = ("name", "gateway_code", "merchant_id", "is_test_mode", "status")
    list_filter = ("is_test_mode", "status")
    search_fields = ("name", "gateway_code", "merchant_id")


@admin.register(ShopIntegration)
class ShopIntegrationAdmin(admin.ModelAdmin):
    list_display = ("store_name", "platform", "store_url", "sync_status", "last_synced_at", "status")
    list_filter = ("platform", "sync_status", "status")
    search_fields = ("store_name", "store_url")
