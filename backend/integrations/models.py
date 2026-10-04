from django.db import models
from core.registry import register_model


@register_model("payment_gateway", table_type="master", status_field="status", aliases=["gateways", "payment_gateways"])
class PaymentGatewayConfig(models.Model):
    STATUS_CHOICES = [(1, 'Active'), (0, 'Inactive')]

    name = models.CharField(max_length=100, verbose_name="Gateway Name")
    gateway_code = models.CharField(max_length=50, unique=True, verbose_name="Gateway Code", help_text="razorpay, stripe, phonepe, paytm, cashfree")
    api_key = models.CharField(max_length=255, verbose_name="API Key / Client ID")
    api_secret = models.CharField(max_length=255, verbose_name="API Secret Key")
    webhook_secret = models.CharField(max_length=255, blank=True, null=True, verbose_name="Webhook Secret")
    merchant_id = models.CharField(max_length=100, blank=True, null=True, verbose_name="Merchant ID")
    is_test_mode = models.BooleanField(default=True, verbose_name="Sandbox / Test Mode")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payment_gateway_configs"
        verbose_name = "Payment Gateway"
        verbose_name_plural = "Payment Gateways"
        ordering = ["name"]

    def __str__(self):
        mode = "Test" if self.is_test_mode else "Live"
        return f"{self.name} ({mode})"


@register_model("shop_integration", table_type="master", status_field="status", aliases=["shop_integrations", "shops"])
class ShopIntegration(models.Model):
    STATUS_CHOICES = [(1, 'Active'), (0, 'Inactive')]
    PLATFORM_CHOICES = [
        ("shopify", "Shopify"),
        ("woocommerce", "WooCommerce"),
        ("amazon", "Amazon Seller Central"),
        ("flipkart", "Flipkart Marketplace"),
        ("custom", "Custom REST API"),
    ]

    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, default="shopify")
    store_name = models.CharField(max_length=150, verbose_name="Store / Account Name")
    store_url = models.URLField(max_length=255, verbose_name="Store URL")
    api_key = models.CharField(max_length=255, verbose_name="API Key / Access Token")
    api_secret = models.CharField(max_length=255, blank=True, null=True, verbose_name="API Secret / Shared Key")
    sync_interval_minutes = models.IntegerField(default=30, verbose_name="Sync Interval (Minutes)")
    last_synced_at = models.DateTimeField(null=True, blank=True, verbose_name="Last Synced At")
    sync_status = models.CharField(max_length=30, default="idle", verbose_name="Current Sync Status")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "shop_integrations"
        verbose_name = "Shop Integration"
        verbose_name_plural = "Shop Integrations"
        ordering = ["store_name"]

    def __str__(self):
        return f"{self.store_name} ({self.get_platform_display()})"
