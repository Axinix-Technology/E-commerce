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
        ("return_quarantine", "Customer Return Quarantine"),
        ("qc_restock", "QC Pass & Restock Return"),
        ("approval_return", "Returned from Approval / Photoshoot"),
        ("repair_return", "Returned from Repair / Alteration"),
        ("branch_transfer_inward", "Branch Transfer Inward"),
        ("audit_plus", "Stock Audit Plus Adjustment"),
        
        # Outward (-)
        ("pos_sale", "POS Billing Sale"),
        ("marketplace_sale", "Marketplace Sale (Amazon/Flipkart)"),
        ("branch_transfer_outward", "Branch Transfer Outward"),
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


@register_model("barcode_edit_log", table_type="system", aliases=["barcode_edits", "barcode_edit"])
class BarcodeEditLog(models.Model):
    original_barcode = models.CharField(max_length=64, db_index=True, verbose_name="Original Barcode")
    new_barcode = models.CharField(max_length=64, db_index=True, verbose_name="New Barcode")
    sku = models.CharField(max_length=64, blank=True, null=True, verbose_name="SKU")
    product_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Product Name")
    reason = models.TextField(verbose_name="Correction Reason")
    edited_by = models.CharField(max_length=100, blank=True, null=True, verbose_name="Edited By")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Edited At")

    class Meta:
        db_table = "barcode_edit_logs"
        verbose_name = "Barcode Edit Log"
        verbose_name_plural = "Barcode Edit Logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.original_barcode} -> {self.new_barcode}"


@register_model("duplicate_barcode_log", table_type="system", aliases=["duplicate_barcodes", "duplicate_barcode"])
class DuplicateBarcodeLog(models.Model):
    barcode = models.CharField(max_length=64, db_index=True, verbose_name="Duplicate Barcode")
    duplicate_count = models.PositiveIntegerField(default=2, verbose_name="Instances Detected")
    location = models.CharField(max_length=100, blank=True, null=True, verbose_name="Detection Point")
    resolved = models.BooleanField(default=False, verbose_name="Is Resolved")
    resolution_notes = models.TextField(blank=True, null=True, verbose_name="Resolution Notes")
    reported_by = models.CharField(max_length=100, blank=True, null=True, verbose_name="Reported By")
    reported_at = models.DateTimeField(auto_now_add=True, verbose_name="Reported At")

    class Meta:
        db_table = "duplicate_barcode_logs"
        verbose_name = "Duplicate Barcode Log"
        verbose_name_plural = "Duplicate Barcode Logs"
        ordering = ["-reported_at"]

    def __str__(self):
        return f"Duplicate: {self.barcode} ({self.duplicate_count} hits)"


@register_model("order_barcode_link", table_type="system", aliases=["order_links", "order_link"])
class OrderBarcodeLink(models.Model):
    barcode = models.CharField(max_length=64, db_index=True, verbose_name="Scanned Barcode")
    sku = models.CharField(max_length=64, blank=True, null=True, verbose_name="SKU")
    product_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Product Name")
    sale_number = models.CharField(max_length=64, db_index=True, verbose_name="Order / Sale Number")
    customer_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Customer")
    is_linked = models.BooleanField(default=True, verbose_name="Is Active Link")
    unlink_reason = models.TextField(blank=True, null=True, verbose_name="Unlink Reason")
    linked_by = models.CharField(max_length=100, blank=True, null=True, verbose_name="Linked By")
    linked_at = models.DateTimeField(auto_now_add=True, verbose_name="Linked At")
    unlinked_at = models.DateTimeField(null=True, blank=True, verbose_name="Unlinked At")

    class Meta:
        db_table = "order_barcode_links"
        verbose_name = "Order Barcode Link"
        verbose_name_plural = "Order Barcode Links"
        ordering = ["-linked_at"]

    def __str__(self):
        status_txt = "Linked" if self.is_linked else "Unlinked"
        return f"{self.barcode} <-> {self.sale_number} ({status_txt})"


@register_model("rebarcoding_record", table_type="transaction", status_field="status", aliases=["rebarcodings", "re_barcoding"])
class RebarcodingRecord(models.Model):
    STATUS_CHOICES = [(1, "Active"), (0, "Void")]

    batch_no = models.CharField(max_length=50, verbose_name="Rebarcoding Batch")
    old_barcode = models.CharField(max_length=64, verbose_name="Old Barcode")
    new_barcode = models.CharField(max_length=64, verbose_name="New Generated Barcode")
    sku = models.CharField(max_length=64, blank=True, null=True, verbose_name="SKU")
    reason = models.CharField(max_length=100, default="Damaged Tag", verbose_name="Reason")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    performed_by = models.CharField(max_length=100, blank=True, null=True, verbose_name="Staff")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Processed At")

    class Meta:
        db_table = "rebarcoding_records"
        verbose_name = "Rebarcoding Record"
        verbose_name_plural = "Rebarcoding Records"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.old_barcode} -> {self.new_barcode} ({self.batch_no})"