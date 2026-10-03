from django.contrib import admin
from .models import (
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchasePayment,
    GoodsReceipt,
    GoodsReceiptItem,
    Sale,
    SaleItem,
    SalePayment,
    SalesReturn,
    SalesReturnItem,
)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "city", "state", "is_active")
    search_fields = ("name", "phone", "email", "gst_no")


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_number", "supplier", "status", "payment_status", "total_amount", "ordered_at")
    list_filter = ("status", "payment_status")
    search_fields = ("po_number", "supplier__name")
    inlines = [PurchaseOrderItemInline]


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ("sale_number", "customer_name", "status", "payment_status", "total_amount", "sold_at")
    list_filter = ("status", "payment_status")
    search_fields = ("sale_number", "customer_name", "customer_phone")
    inlines = [SaleItemInline]


@admin.register(SalePayment)
class SalePaymentAdmin(admin.ModelAdmin):
    list_display = ("sale", "transaction_type", "amount", "payment_method", "reference_number", "transacted_at")
    list_filter = ("transaction_type", "payment_method")
    search_fields = ("reference_number", "sale__sale_number")


class SalesReturnItemInline(admin.TabularInline):
    model = SalesReturnItem
    extra = 0


@admin.register(SalesReturn)
class SalesReturnAdmin(admin.ModelAdmin):
    list_display = ("return_number", "sale", "status", "total_refund_amount", "requested_at")
    list_filter = ("status",)
    search_fields = ("return_number", "sale__sale_number")
    inlines = [SalesReturnItemInline]
