from django.db import models


class SalesChannel(models.Model):
    """Marketplace or external sales platform, such as Flipkart."""

    INTEGRATION_TYPE_CHOICES = [
        ("api", "API"),
        ("file_import", "File Import"),
        ("manual", "Manual"),
    ]

    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=50, unique=True)
    seller_account_id = models.CharField(max_length=100, blank=True, null=True)
    seller_account_name = models.CharField(max_length=150, blank=True, null=True)
    integration_type = models.CharField(
        max_length=20,
        choices=INTEGRATION_TYPE_CHOICES,
        default="manual",
    )
    base_url = models.URLField(max_length=500, blank=True, null=True)
    default_currency = models.CharField(max_length=3, default="INR")
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sales_channels"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ChannelOrder(models.Model):
    """Marketplace order header imported into your system."""

    channel = models.ForeignKey(
        SalesChannel,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    external_order_id = models.CharField(max_length=100)
    external_order_number = models.CharField(max_length=100, blank=True, null=True)

    # Kept as text because marketplaces may use different status values.
    external_status = models.CharField(max_length=100, blank=True, null=True)
    fulfillment_status = models.CharField(max_length=100, blank=True, null=True)
    payment_status = models.CharField(max_length=100, blank=True, null=True)

    currency = models.CharField(max_length=3, default="INR")
    payment_method = models.CharField(max_length=50, blank=True, null=True)

    ordered_at = models.DateTimeField(blank=True, null=True)
    confirmed_at = models.DateTimeField(blank=True, null=True)
    shipped_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)

    buyer_name = models.CharField(max_length=150, blank=True, null=True)
    buyer_email = models.EmailField(blank=True, null=True)
    buyer_phone = models.CharField(max_length=30, blank=True, null=True)

    billing_name = models.CharField(max_length=150, blank=True, null=True)
    billing_address = models.TextField(blank=True, null=True)
    billing_city = models.CharField(max_length=100, blank=True, null=True)
    billing_state = models.CharField(max_length=100, blank=True, null=True)
    billing_postal_code = models.CharField(max_length=20, blank=True, null=True)
    billing_country = models.CharField(max_length=100, blank=True, null=True)

    shipping_name = models.CharField(max_length=150, blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, blank=True, null=True)

    fulfillment_type = models.CharField(max_length=50, blank=True, null=True)
    carrier_name = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    tracking_url = models.URLField(max_length=500, blank=True, null=True)

    item_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_fee_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    order_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    invoice_date = models.DateTimeField(blank=True, null=True)

    # Retains platform-specific imported fields not represented above.
    raw_data = models.JSONField(blank=True, null=True)
    imported_at = models.DateTimeField(auto_now_add=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    external_updated_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "channel_orders"
        constraints = [
            models.UniqueConstraint(
                fields=["channel", "external_order_id"],
                name="unique_channel_external_order",
            )
        ]
        indexes = [
            models.Index(fields=["external_status"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["ordered_at"]),
        ]
        ordering = ["-ordered_at"]

    def __str__(self):
        return f"{self.channel.code}: {self.external_order_id}"


class ChannelOrderItem(models.Model):
    """Marketplace order line; variant can be empty until SKU matching."""

    order = models.ForeignKey(
        ChannelOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )
    external_order_item_id = models.CharField(max_length=100, blank=True, null=True)
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="channel_order_items",
    )

    external_sku = models.CharField(max_length=100, blank=True, null=True)
    product_name = models.CharField(max_length=255)
    size = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)

    quantity = models.PositiveIntegerField()
    returned_quantity = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    raw_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "channel_order_items"
        constraints = [
            models.UniqueConstraint(
                fields=["order", "external_order_item_id"],
                name="unique_channel_order_item",
            )
        ]
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} × {self.quantity}"


class ChannelOrderEvent(models.Model):
    """History of marketplace order, payment, or fulfillment status updates."""

    order = models.ForeignKey(
        ChannelOrder,
        on_delete=models.CASCADE,
        related_name="events",
    )
    event_type = models.CharField(max_length=50)
    status = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    occurred_at = models.DateTimeField(blank=True, null=True)
    raw_data = models.JSONField(blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "channel_order_events"
        ordering = ["recorded_at"]

    def __str__(self):
        return f"{self.order.external_order_id}: {self.event_type}"


class ChannelSettlement(models.Model):
    """A payout or settlement batch reported by a marketplace."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("settled", "Settled"),
        ("failed", "Failed"),
    ]

    channel = models.ForeignKey(
        SalesChannel,
        on_delete=models.PROTECT,
        related_name="settlements",
    )
    external_settlement_id = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    currency = models.CharField(max_length=3, default="INR")

    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_fee_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    period_start = models.DateTimeField(blank=True, null=True)
    period_end = models.DateTimeField(blank=True, null=True)
    expected_at = models.DateTimeField(blank=True, null=True)
    settled_at = models.DateTimeField(blank=True, null=True)
    bank_reference = models.CharField(max_length=100, blank=True, null=True)

    raw_data = models.JSONField(blank=True, null=True)
    imported_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "channel_settlements"
        constraints = [
            models.UniqueConstraint(
                fields=["channel", "external_settlement_id"],
                name="unique_channel_settlement",
            )
        ]
        ordering = ["-period_end"]

    def __str__(self):
        return f"{self.channel.code}: {self.external_settlement_id}"


class ChannelSettlementOrder(models.Model):
    """Amount from a settlement batch allocated to a particular order."""

    settlement = models.ForeignKey(
        ChannelSettlement,
        on_delete=models.CASCADE,
        related_name="order_allocations",
    )
    order = models.ForeignKey(
        ChannelOrder,
        on_delete=models.PROTECT,
        related_name="settlement_allocations",
    )
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fees_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = "channel_settlement_orders"
        constraints = [
            models.UniqueConstraint(
                fields=["settlement", "order"],
                name="unique_settlement_order",
            )
        ]

    def __str__(self):
        return f"{self.settlement} → {self.order.external_order_id}"


class ChannelReturn(models.Model):
    """Return or refund requested through the marketplace."""

    STATUS_CHOICES = [
        ("requested", "Requested"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("in_transit", "In Transit"),
        ("received", "Received"),
        ("refunded", "Refunded"),
        ("completed", "Completed"),
    ]

    order_item = models.ForeignKey(
        ChannelOrderItem,
        on_delete=models.PROTECT,
        related_name="returns",
    )
    external_return_id = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="requested")
    reason = models.TextField(blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    requested_at = models.DateTimeField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    raw_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "channel_returns"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Return for {self.order_item}"