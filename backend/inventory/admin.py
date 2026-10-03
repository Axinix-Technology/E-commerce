from django.contrib import admin
from .models import (
    InventoryStock,
    StockIssueType,
    StockMovementLedger,
    BarcodeEditLog,
    DuplicateBarcodeLog,
    OrderBarcodeLink,
    RebarcodingRecord,
)


@admin.register(InventoryStock)
class InventoryStockAdmin(admin.ModelAdmin):
    list_display = ("product", "quantity_on_hand", "sellable_stock", "reserved_stock", "approval_stock", "damaged_stock", "status")
    list_filter = ("status",)
    search_fields = ("product__name",)


@admin.register(StockIssueType)
class StockIssueTypeAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "deduct_from_available_stock", "status")
    list_filter = ("deduct_from_available_stock", "status")
    search_fields = ("code", "name")


@admin.register(StockMovementLedger)
class StockMovementLedgerAdmin(admin.ModelAdmin):
    list_display = ("movement_type", "product", "inward_qty", "outward_qty", "lot_number", "item_barcode", "created_at")
    list_filter = ("movement_type",)
    search_fields = ("product__name", "reference_id", "item_barcode")


@admin.register(BarcodeEditLog)
class BarcodeEditLogAdmin(admin.ModelAdmin):
    list_display = ("original_barcode", "new_barcode", "sku", "edited_by", "created_at")
    search_fields = ("original_barcode", "new_barcode", "sku")


@admin.register(DuplicateBarcodeLog)
class DuplicateBarcodeLogAdmin(admin.ModelAdmin):
    list_display = ("barcode", "duplicate_count", "location", "resolved", "reported_at")
    list_filter = ("resolved",)
    search_fields = ("barcode",)


@admin.register(OrderBarcodeLink)
class OrderBarcodeLinkAdmin(admin.ModelAdmin):
    list_display = ("barcode", "sale_number", "customer_name", "is_linked", "linked_at")
    list_filter = ("is_linked",)
    search_fields = ("barcode", "sale_number", "customer_name")


@admin.register(RebarcodingRecord)
class RebarcodingRecordAdmin(admin.ModelAdmin):
    list_display = ("batch_no", "old_barcode", "new_barcode", "reason", "status", "created_at")
    list_filter = ("status", "reason")
    search_fields = ("batch_no", "old_barcode", "new_barcode")
