from django.contrib import admin
from .models import (
    GstMaster,
    CategoryMaster,
    ProductType,
    ProductVariant,
    VendorMaster,
    StateMaster,
    CustomerMaster,
    MaterialMaster,
    DesignMaster,
    BrandMaster,
    SizeMaster,
    AgeGroupMaster,
)


@admin.register(GstMaster)
class GstMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "rate", "cgst_rate", "sgst_rate", "igst_rate", "status")
    list_filter = ("status",)
    search_fields = ("name",)


@admin.register(CategoryMaster)
class CategoryMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "hsn_code", "parent", "tax_group", "status")
    list_filter = ("status",)
    search_fields = ("name", "hsn_code")


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "brand", "selling_price", "is_active", "status")
    list_filter = ("category", "is_active", "status")
    search_fields = ("name", "slug", "brand")
    inlines = [ProductVariantInline]


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("sku", "product", "size", "color", "selling_price", "cost_price", "status")
    list_filter = ("status", "size", "color")
    search_fields = ("sku", "barcode", "product__name")


@admin.register(VendorMaster)
class VendorMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "vendor_code", "phone", "email", "city", "gstin", "status")
    list_filter = ("status", "state")
    search_fields = ("name", "vendor_code", "phone", "gstin")


@admin.register(StateMaster)
class StateMasterAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "tin", "is_union_territory", "status")
    list_filter = ("is_union_territory", "status")
    search_fields = ("code", "name")


@admin.register(CustomerMaster)
class CustomerMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "customer_type", "city", "status")
    list_filter = ("customer_type", "status")
    search_fields = ("name", "phone", "email", "gstin")


@admin.register(MaterialMaster)
class MaterialMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "status")
    list_filter = ("status",)
    search_fields = ("name", "code")


@admin.register(DesignMaster)
class DesignMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "pattern_type", "status")
    list_filter = ("status", "pattern_type")
    search_fields = ("name", "code")


@admin.register(BrandMaster)
class BrandMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "website", "status")
    list_filter = ("status",)
    search_fields = ("name", "code")


@admin.register(SizeMaster)
class SizeMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "category_type", "sort_order", "status")
    list_filter = ("category_type", "status")
    search_fields = ("name", "code")


@admin.register(AgeGroupMaster)
class AgeGroupMasterAdmin(admin.ModelAdmin):
    list_display = ("name", "min_age", "max_age", "status")
    list_filter = ("status",)
    search_fields = ("name",)
