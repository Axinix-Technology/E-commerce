from django.db import models
from django.conf import settings
from core.registry import register_model


@register_model("purchase_inward", table_type="transaction", status_field="status")
class PurchaseInward(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("received", "Received / Stocked"),
        ("cancelled", "Cancelled"),
    ]

    inward_number = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="GRN / Inward Number")
    vendor = models.ForeignKey(
        "catalogue.VendorMaster",
        on_delete=models.PROTECT,
        related_name="inwards",
        verbose_name="Vendor / Supplier"
    )
    invoice_number = models.CharField(max_length=100, verbose_name="Supplier Invoice / Bill No")
    invoice_date = models.DateField(verbose_name="Supplier Invoice Date")
    inward_date = models.DateField(auto_now_add=True, verbose_name="Inward Date")
    
    total_taxable_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    inward_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received", db_index=True)
    remarks = models.TextField(blank=True, null=True)
    
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_inwards"
    )
    
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
        db_table = "purchase_inwards"
        verbose_name = "Purchase Inward"
        verbose_name_plural = "Purchase Inwards"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.inward_number} - {self.vendor.name}"


@register_model("inward_item", table_type="transaction", status_field="status")
class InwardItem(models.Model):
    inward = models.ForeignKey(PurchaseInward, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalogue.ProductType", on_delete=models.PROTECT, related_name="inward_items")
    quantity = models.PositiveIntegerField(verbose_name="Inward Quantity")
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Purchase Cost Price")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="GST Rate %")
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    lot_number = models.CharField(max_length=50, db_index=True, verbose_name="Batch / Lot Number")
    
    # Rule 11
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inward_items"
        verbose_name = "Inward Item"
        verbose_name_plural = "Inward Items"
        ordering = ["id"]

    def __str__(self):
        return f"{self.inward.inward_number} | {self.product.name} × {self.quantity}"


@register_model("tagged_unit", table_type="master", status_field="status", aliases=["tagged_inventory_unit"])
class TaggedInventoryUnit(models.Model):
    BUCKET_CHOICES = [
        ("sellable", "Sellable On-Hand"),
        ("reserved", "Order Reserved"),
        ("approval", "Approval / Photoshoot Memo"),
        ("quarantine", "Customer Return Quarantine"),
        ("repair", "Repair / Alteration Workshop"),
        ("damaged", "Damaged / Scrap Write-Off"),
        ("sold", "Sold & Dispatched"),
    ]

    inward_item = models.ForeignKey(InwardItem, on_delete=models.CASCADE, related_name="tagged_units")
    product = models.ForeignKey("catalogue.ProductType", on_delete=models.PROTECT, related_name="tagged_units")
    item_barcode = models.CharField(max_length=64, unique=True, db_index=True, verbose_name="Physical Barcode Sticker")
    lot_number = models.CharField(max_length=50, db_index=True)
    current_bucket = models.CharField(max_length=20, choices=BUCKET_CHOICES, default="sellable", db_index=True)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    is_sold = models.BooleanField(default=False, db_index=True)
    
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
        db_table = "tagged_inventory_units"
        verbose_name = "Tagged Inventory Unit"
        verbose_name_plural = "Tagged Inventory Units"
        ordering = ["id"]

    def __str__(self):
        return f"{self.item_barcode} ({self.current_bucket})"
