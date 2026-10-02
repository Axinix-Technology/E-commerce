from django.db import models
from django.conf import settings
from core.registry import register_model


@register_model("inventory_stock", table_type="master", status_field="status")
class InventoryStock(models.Model):
    product = models.OneToOneField(
        "catalogue.ProductType",
        on_delete=models.CASCADE,
        related_name="inventory_stock",
        db_column="product_id",
    )
    quantity_on_hand = models.PositiveIntegerField(default=0, help_text="Total physical count")
    sellable_stock = models.PositiveIntegerField(default=0, help_text="Available to Promise (Broadcast to Amazon/Flipkart)")
    reserved_stock = models.PositiveIntegerField(default=0, help_text="Locked in unfulfilled orders")
    approval_stock = models.PositiveIntegerField(default=0, help_text="Out on photoshoot / PR memo")
    quarantine_stock = models.PositiveIntegerField(default=0, help_text="Customer returns under inspection")
    repair_stock = models.PositiveIntegerField(default=0, help_text="In alteration / workshop repair")
    damaged_stock = models.PositiveIntegerField(default=0, help_text="Scrap / written off")
    reorder_level = models.PositiveIntegerField(default=10, help_text="Minimum safety threshold")
    
    # Rule 11
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_stocks"
        verbose_name = "Inventory Stock"
        verbose_name_plural = "Inventory Stocks"
        ordering = ["product_id"]

    def __str__(self):
        return f"{self.product.name}: {self.sellable_stock} sellable (QOH: {self.quantity_on_hand})"


@register_model("stock_issue_type", table_type="master", status_field="status")
class StockIssueType(models.Model):
    """
    Configuration model for Stock Issues & Approvals.
    Controls whether a specific stock issue/memo deducts from Available Sellable Stock or not.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Issue Type Name")
    code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="Code Identifier")
    deduct_from_available_stock = models.BooleanField(
        default=True,
        help_text="If True, issuing stock removes it from available stock. If False, stock remains counted as available."
    )
    description = models.TextField(blank=True, null=True)

    # Rule 11
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "stock_issue_types"
        verbose_name = "Stock Issue Type"
        verbose_name_plural = "Stock Issue Types"
        ordering = ["name"]

    def __str__(self):
        deduct_str = "Deducts Available" if self.deduct_from_available_stock else "Keeps in Available"
        return f"{self.name} ({deduct_str})"


@register_model("stock_ledger", table_type="transaction", status_field="status")
class StockMovementLedger(models.Model):
    MOVEMENT_TYPES = [
        # Inward (+)
        ("purchase_inward", "Purchase / GRN Inward"),
        ("return_restock", "Return Restocked after QC"),
        ("approval_return", "Returned from Approval / Photoshoot"),
        ("repair_return", "Returned from Repair / Alteration"),
        ("audit_plus", "Stock Audit Plus Adjustment"),
        
        # Outward (-)
        ("pos_sale", "POS Billing Sale"),
        ("marketplace_sale", "Marketplace Sale (Amazon/Flipkart)"),
        ("approval_outward", "Sent to Photoshoot / Approval Memo"),
        ("repair_outward", "Sent to Repair / Alteration Workshop"),
        ("vendor_return", "Returned to Vendor (RTV)"),
        ("scrap_writeoff", "Damaged / Scrap Write-Off"),
        ("audit_minus", "Stock Audit Minus Adjustment"),
    ]

    product = models.ForeignKey(
        "catalogue.ProductType",
        on_delete=models.PROTECT,
        related_name="ledger_movements",
        db_column="product_id",
    )
    movement_type = models.CharField(max_length=30, choices=MOVEMENT_TYPES, db_index=True)
    from_bucket = models.CharField(max_length=20, blank=True, null=True)
    to_bucket = models.CharField(max_length=20, blank=True, null=True)
    inward_qty = models.PositiveIntegerField(default=0)
    outward_qty = models.PositiveIntegerField(default=0)
    lot_number = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    item_barcode = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reference_type = models.CharField(max_length=50, blank=True, default="DIRECT") # 'GRN', 'INVOICE', 'MEMO', 'QC_NOTE'
    reference_id = models.CharField(max_length=100, blank=True, default="", db_index=True)
    issue_type = models.ForeignKey(
        StockIssueType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movements",
        db_column="issue_type_id",
        verbose_name="Stock Issue Type"
    )
    notes = models.TextField(blank=True, null=True)
    
    # Rule 11
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_stock_movements",
    )

    class Meta:
        db_table = "stock_movement_ledger"
        verbose_name = "Stock Movement Ledger"
        verbose_name_plural = "Stock Movement Ledgers"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type}: {self.product.name} (+{self.inward_qty}/-{self.outward_qty})"


# Legacy models retained for migration compatibility
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