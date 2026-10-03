from django.contrib import admin
from .models import (
    HeroBanner,
    ProductImage,
    Cart,
    CartItem,
    CustomerAddress,
    CustomerPaymentMethod,
    PasswordResetOtp,
    SupportTicket,
    FaqCategory,
    FaqItem,
    StorePolicy,
    ProductReview,
    WishlistItem,
    OrderTrackingMilestone,
    PromotionCoupon,
)


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ["title", "cta_text", "display_order", "is_active", "status"]
    list_filter = ["is_active", "status"]
    search_fields = ["title", "subtitle"]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["product", "variant", "is_primary", "display_order", "status"]
    list_filter = ["is_primary", "status"]
    search_fields = ["product__name", "variant__sku"]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "session_key", "coupon_code", "discount_amount", "cart_status", "updated_at"]
    list_filter = ["cart_status", "status"]
    search_fields = ["customer__name", "session_key", "coupon_code"]
    inlines = [CartItemInline]


@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ["recipient_name", "customer", "address_type", "city", "state", "pincode", "is_default", "status"]
    list_filter = ["address_type", "is_default", "status"]
    search_fields = ["recipient_name", "phone", "city", "pincode", "customer__name"]


@admin.register(CustomerPaymentMethod)
class CustomerPaymentMethodAdmin(admin.ModelAdmin):
    list_display = ["customer", "method_type", "provider_name", "account_identifier", "is_default", "status"]
    list_filter = ["method_type", "is_default", "status"]
    search_fields = ["customer__name", "provider_name", "account_identifier"]


@admin.register(PasswordResetOtp)
class PasswordResetOtpAdmin(admin.ModelAdmin):
    list_display = ["email_or_phone", "otp_code", "token", "expires_at", "is_used", "status", "created_at"]
    list_filter = ["is_used", "status"]
    search_fields = ["email_or_phone", "otp_code"]


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ["ticket_number", "name", "email", "category", "priority", "ticket_status", "created_at"]
    list_filter = ["category", "priority", "ticket_status", "status"]
    search_fields = ["ticket_number", "name", "email", "subject"]


class FaqItemInline(admin.StackedInline):
    model = FaqItem
    extra = 1


@admin.register(FaqCategory)
class FaqCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "display_order", "status"]
    search_fields = ["name", "slug"]
    inlines = [FaqItemInline]


@admin.register(FaqItem)
class FaqItemAdmin(admin.ModelAdmin):
    list_display = ["question", "category", "display_order", "is_published", "status"]
    list_filter = ["category", "is_published", "status"]
    search_fields = ["question", "answer"]


@admin.register(StorePolicy)
class StorePolicyAdmin(admin.ModelAdmin):
    list_display = ["policy_type", "title", "version", "effective_date", "is_published", "status"]
    list_filter = ["is_published", "status"]
    search_fields = ["title", "content"]


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ["product", "reviewer_name", "rating", "verified_purchase", "helpful_votes", "status", "created_at"]
    list_filter = ["rating", "verified_purchase", "status"]
    search_fields = ["product__name", "reviewer_name", "title", "content"]


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ["customer", "product", "variant", "status", "created_at"]
    search_fields = ["customer__name", "product__name"]


@admin.register(OrderTrackingMilestone)
class OrderTrackingMilestoneAdmin(admin.ModelAdmin):
    list_display = ["sale", "tracking_number", "carrier", "status_code", "title", "location", "milestone_time"]
    list_filter = ["carrier", "status_code", "status"]
    search_fields = ["tracking_number", "title", "location"]


@admin.register(PromotionCoupon)
class PromotionCouponAdmin(admin.ModelAdmin):
    list_display = ["code", "title", "discount_type", "discount_value", "min_order_value", "times_used", "is_active", "status"]
    list_filter = ["discount_type", "is_active", "status"]
    search_fields = ["code", "title"]
