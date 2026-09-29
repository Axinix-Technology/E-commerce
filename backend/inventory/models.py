from django.db import models
from django.conf import settings

class Inventory(models.Model):
    variant = models.OneToOneField(
    "catalogue.ProductVariant",
    on_delete=models.CASCADE,
    related_name="inventory",
    db_column="variant_id",
    )
    quantity_on_hand = models.PositiveIntegerField(default=0)
    quantity_reserved = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "Inventory"
        ordering = ["id"]

    def __str__(self):
        return f"{self.variant.sku}: {self.quantity_on_hand} on hand"

class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ("purchase", "Purchase"),
        ("adjustment", "Adjustment"),
        ("reservation", "Reservation"),
        ("sale", "Sale"),
        ("return", "Return"),
        ("damage", "Damage"),
    ]

    variant = models.ForeignKey(
    "catalogue.ProductVariant",
    on_delete=models.PROTECT,
    related_name="stock_movements",
    db_column="variant_id",
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity_change = models.IntegerField()
    reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
        db_column="created_by_id",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "StockMovement"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type}: {self.variant.sku} ({self.quantity_change})"