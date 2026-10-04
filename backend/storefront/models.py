from django.conf import settings
from django.db import models
from core.registry import register_model


# ---------------------------------------------------------
# 1. STOREFRONT MERCHANDISING & BANNERS
# ---------------------------------------------------------

@register_model("hero_banner", table_type="master", status_field="status")
class HeroBanner(models.Model):
    """Storefront homepage promotional hero banners and showcase sliders."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]

    title = models.CharField(max_length=150, verbose_name="Banner Title")
    subtitle = models.CharField(max_length=255, blank=True, null=True, verbose_name="Subtitle")
    badge_text = models.CharField(max_length=50, blank=True, null=True, verbose_name="Highlight Badge (e.g. NEW ARRIVAL)")
    image_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="Image Asset URL")
    cta_text = models.CharField(max_length=50, default="Shop Collection", verbose_name="Button Text")
    cta_link = models.CharField(max_length=200, default="/shopping/products", verbose_name="Target Link")
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "hero_banners"
        verbose_name = "Hero Banner"
        verbose_name_plural = "Hero Banners"
        ordering = ["display_order", "-created_at"]

    def __str__(self):
        return self.title


@register_model("product_image", table_type="master", status_field="status")
class ProductImage(models.Model):
    """High-resolution gallery visuals and thumbnails for product types and variants."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]

    product = models.ForeignKey(
        "catalogue.ProductType",
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Parent Product"
    )
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="images",
        verbose_name="Specific Variant (Optional)"
    )
    image_url = models.CharField(max_length=500, verbose_name="Image URL")
    alt_text = models.CharField(max_length=150, blank=True, null=True, verbose_name="SEO Alt Text")
    is_primary = models.BooleanField(default=False, verbose_name="Is Primary/Cover Image")
    display_order = models.PositiveIntegerField(default=0, db_index=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "product_images"
        verbose_name = "Product Image"
        verbose_name_plural = "Product Images"
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.product.name} Image #{self.id}"


# ---------------------------------------------------------
# 2. SHOPPING CART & ITEMS
# ---------------------------------------------------------

@register_model("cart", table_type="transaction", status_field="status")
class Cart(models.Model):
    """Persistent retail cart session for guests and authenticated customers."""
    STATUS_CHOICES = [(1, "Active"), (0, "Converted / Archived")]
    CART_STATUS_CHOICES = [
        ("active", "Active Shopping"),
        ("converted", "Converted to Order"),
        ("abandoned", "Abandoned"),
    ]

    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="carts",
        verbose_name="Customer Account"
    )
    session_key = models.CharField(max_length=100, blank=True, null=True, db_index=True, help_text="Guest anonymous session key")
    coupon_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Applied Coupon Code")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Coupon Discount Amount")
    cart_status = models.CharField(max_length=20, default="active", choices=CART_STATUS_CHOICES)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "carts"
        verbose_name = "Shopping Cart"
        verbose_name_plural = "Shopping Carts"
        ordering = ["-updated_at"]

    def __str__(self):
        owner = self.customer.name if self.customer else f"Guest ({self.session_key[:8] if self.session_key else 'Anonymous'})"
        return f"Cart #{self.id} - {owner}"


@register_model("cart_item", table_type="transaction", status_field="status")
class CartItem(models.Model):
    """Individual product variant lines inside a shopping cart."""
    STATUS_CHOICES = [(1, "Active"), (0, "Removed")]

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Cart"
    )
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.CASCADE,
        related_name="cart_items",
        verbose_name="Product Variant"
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name="Quantity")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Captured Unit Price")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cart_items"
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        unique_together = [("cart", "variant")]

    def __str__(self):
        return f"{self.variant.sku} × {self.quantity}"


# ---------------------------------------------------------
# 3. CUSTOMER SAVED ADDRESSES & PAYMENT METHODS
# ---------------------------------------------------------

@register_model("customer_address", table_type="master", status_field="status")
class CustomerAddress(models.Model):
    """Multiple saved shipping and billing addresses for registered customers."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]
    ADDRESS_TYPE_CHOICES = [
        ("home", "Home"),
        ("office", "Office / Commercial"),
        ("other", "Other Destination"),
    ]

    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.CASCADE,
        related_name="saved_addresses",
        verbose_name="Customer Master"
    )
    address_type = models.CharField(max_length=20, default="home", choices=ADDRESS_TYPE_CHOICES)
    recipient_name = models.CharField(max_length=150, verbose_name="Contact Recipient Name")
    phone = models.CharField(max_length=20, verbose_name="Contact Phone")
    address_line_1 = models.CharField(max_length=255, verbose_name="Flat, House no., Building, Street")
    address_line_2 = models.CharField(max_length=255, blank=True, null=True, verbose_name="Area, Sector, Locality")
    landmark = models.CharField(max_length=150, blank=True, null=True, verbose_name="Landmark")
    city = models.CharField(max_length=100, verbose_name="City")
    state = models.ForeignKey(
        "catalogue.StateMaster",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="saved_customer_addresses",
        verbose_name="State (Place of Supply)"
    )
    pincode = models.CharField(max_length=10, verbose_name="PIN Code")
    is_default = models.BooleanField(default=False, verbose_name="Is Default Delivery Address")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer_addresses"
        verbose_name = "Customer Address"
        verbose_name_plural = "Customer Addresses"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.recipient_name} ({self.address_type.upper()}) - {self.city}, {self.pincode}"


@register_model("customer_payment_method", table_type="master", status_field="status")
class CustomerPaymentMethod(models.Model):
    """Saved customer payment instruments (Masked Cards, UPI VPA, Bank Accounts)."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]
    METHOD_TYPE_CHOICES = [
        ("upi", "Unified Payments Interface (UPI)"),
        ("card", "Credit / Debit Card"),
        ("netbanking", "Net Banking Preference"),
    ]

    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.CASCADE,
        related_name="saved_payment_methods",
        verbose_name="Customer Master"
    )
    method_type = models.CharField(max_length=20, choices=METHOD_TYPE_CHOICES)
    provider_name = models.CharField(max_length=100, verbose_name="Provider / Bank (e.g. HDFC Bank, Google Pay)")
    account_identifier = models.CharField(max_length=100, verbose_name="Masked Number or VPA (e.g. •••• 4242 or user@okhdfcbank)")
    card_holder_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Cardholder Name")
    card_expiry = models.CharField(max_length=10, blank=True, null=True, verbose_name="Card Expiry (MM/YY)")
    is_default = models.BooleanField(default=False, verbose_name="Default Payment Method")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer_payment_methods"
        verbose_name = "Customer Payment Method"
        verbose_name_plural = "Customer Payment Methods"
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.provider_name}: {self.account_identifier}"


@register_model("password_reset_otp", table_type="transaction", status_field="status")
class PasswordResetOtp(models.Model):
    """Secure time-limited OTP tokens for retail customer password recovery."""
    STATUS_CHOICES = [(1, "Active"), (0, "Used / Expired")]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="password_reset_otps"
    )
    email_or_phone = models.CharField(max_length=150, db_index=True, verbose_name="Target Email or Phone")
    otp_code = models.CharField(max_length=10, verbose_name="Generated OTP")
    token = models.CharField(max_length=128, unique=True, verbose_name="Verification Token")
    expires_at = models.DateTimeField(verbose_name="Expiration Timestamp")
    is_used = models.BooleanField(default=False, verbose_name="Is Verified & Used")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "password_reset_otps"
        verbose_name = "Password Reset OTP"
        verbose_name_plural = "Password Reset OTPs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"OTP for {self.email_or_phone} (Expires: {self.expires_at})"


# ---------------------------------------------------------
# 4. HELP & POLICIES (SUPPORT, FAQ, STATUTORY POLICIES)
# ---------------------------------------------------------

@register_model("support_ticket", table_type="transaction", status_field="status")
class SupportTicket(models.Model):
    """Customer inquiries, help requests, and fulfillment issues."""
    STATUS_CHOICES = [(1, "Active"), (0, "Archived")]
    CATEGORY_CHOICES = [
        ("orders", "Order & Delivery Inquiry"),
        ("returns", "Returns & Refund Request"),
        ("payments", "Billing, Invoicing & GST"),
        ("product", "Product Details & Sizing"),
        ("general", "General Customer Support"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent / Escalated"),
    ]
    TICKET_STATUS_CHOICES = [
        ("open", "Open / Submitted"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("closed", "Closed"),
    ]

    ticket_number = models.CharField(max_length=40, unique=True, db_index=True, verbose_name="Ticket Identifier (e.g. SR-202610-1001)")
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets"
    )
    name = models.CharField(max_length=150, verbose_name="Customer Name")
    email = models.EmailField(max_length=120, verbose_name="Customer Email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Customer Phone")
    category = models.CharField(max_length=50, default="general", choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=200, verbose_name="Issue Subject")
    message = models.TextField(verbose_name="Issue Description")
    priority = models.CharField(max_length=20, default="medium", choices=PRIORITY_CHOICES)
    ticket_status = models.CharField(max_length=20, default="open", choices=TICKET_STATUS_CHOICES, db_index=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_support_tickets"
    )
    resolution_notes = models.TextField(blank=True, null=True, verbose_name="Resolution Details")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "support_tickets"
        verbose_name = "Support Ticket"
        verbose_name_plural = "Support Tickets"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ticket_number} - {self.subject} ({self.ticket_status})"


@register_model("faq_category", table_type="master", status_field="status")
class FaqCategory(models.Model):
    """Categorization header for storefront FAQ accordions."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]

    name = models.CharField(max_length=100, unique=True, verbose_name="Category Name")
    slug = models.SlugField(max_length=120, unique=True)
    icon = models.CharField(max_length=50, blank=True, null=True, verbose_name="Lucide Icon Key")
    display_order = models.PositiveIntegerField(default=0, db_index=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "faq_categories"
        verbose_name = "FAQ Category"
        verbose_name_plural = "FAQ Categories"
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


@register_model("faq_item", table_type="master", status_field="status")
class FaqItem(models.Model):
    """Questions and answers for storefront help center."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]

    category = models.ForeignKey(
        FaqCategory,
        on_delete=models.CASCADE,
        related_name="faqs",
        verbose_name="Parent Category"
    )
    question = models.CharField(max_length=300, verbose_name="Frequently Asked Question")
    answer = models.TextField(verbose_name="Comprehensive Answer")
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_published = models.BooleanField(default=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "faq_items"
        verbose_name = "FAQ Item"
        verbose_name_plural = "FAQ Items"
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.question


@register_model("store_policy", table_type="master", status_field="status")
class StorePolicy(models.Model):
    """Statutory policies, terms, shipping guidelines, and company credentials."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]
    POLICY_TYPE_CHOICES = [
        ("shipping_delivery", "Shipping and Delivery Policy"),
        ("returns_refunds", "Returns and Refunds Policy"),
        ("privacy_policy", "Privacy Policy (DPDP Act)"),
        ("terms_conditions", "Terms and Conditions of Sale"),
        ("about_us", "About Axinix E-Commerce"),
    ]

    policy_type = models.CharField(max_length=50, unique=True, choices=POLICY_TYPE_CHOICES)
    title = models.CharField(max_length=200, verbose_name="Policy Title")
    content = models.TextField(verbose_name="Legal & Informational Markdown / HTML Content")
    version = models.CharField(max_length=20, default="1.0", verbose_name="Policy Version")
    effective_date = models.DateField(null=True, blank=True, verbose_name="Statutory Effective Date")
    is_published = models.BooleanField(default=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "store_policies"
        verbose_name = "Store Policy"
        verbose_name_plural = "Store Policies"
        ordering = ["policy_type"]

    def __str__(self):
        return f"{self.title} (v{self.version})"


# ---------------------------------------------------------
# 5. USEFUL ADDITIONS (REVIEWS, WISHLIST, TRACKING, PROMOS)
# ---------------------------------------------------------

@register_model("product_review", table_type="master", status_field="status")
class ProductReview(models.Model):
    """Customer ratings, reviews, and verified buyer testimonials."""
    STATUS_CHOICES = [(1, "Approved / Visible"), (0, "Pending / Hidden")]
    RATING_CHOICES = [
        (1, "1 Star - Poor"),
        (2, "2 Stars - Fair"),
        (3, "3 Stars - Good"),
        (4, "4 Stars - Very Good"),
        (5, "5 Stars - Excellent"),
    ]

    product = models.ForeignKey(
        "catalogue.ProductType",
        on_delete=models.CASCADE,
        related_name="reviews",
        verbose_name="Reviewed Product"
    )
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="variant_reviews",
        verbose_name="Purchased Variant"
    )
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews"
    )
    sale_item = models.ForeignKey(
        "orders.SaleItem",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviews",
        verbose_name="Verified Purchase Sale Line"
    )
    reviewer_name = models.CharField(max_length=150, verbose_name="Public Reviewer Name")
    reviewer_email = models.EmailField(max_length=120, blank=True, null=True)
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, default=5, verbose_name="Score (1-5)")
    title = models.CharField(max_length=200, blank=True, null=True, verbose_name="Review Headline")
    content = models.TextField(verbose_name="Review Feedback")
    verified_purchase = models.BooleanField(default=False, verbose_name="Verified Buyer Badge")
    helpful_votes = models.PositiveIntegerField(default=0, verbose_name="Helpful Upvotes")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "product_reviews"
        verbose_name = "Product Review"
        verbose_name_plural = "Product Reviews"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.name} - {self.rating}★ by {self.reviewer_name}"


@register_model("wishlist_item", table_type="master", status_field="status")
class WishlistItem(models.Model):
    """Customer saved favorites and wishlist registry."""
    STATUS_CHOICES = [(1, "Active"), (0, "Removed")]

    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.CASCADE,
        related_name="wishlist_items",
        verbose_name="Customer"
    )
    product = models.ForeignKey(
        "catalogue.ProductType",
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
        verbose_name="Saved Product"
    )
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="wishlisted_variants",
        verbose_name="Selected Variant"
    )

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wishlist_items"
        verbose_name = "Wishlist Item"
        verbose_name_plural = "Wishlist Items"
        unique_together = [("customer", "product", "variant")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer.name} saved {self.product.name}"


@register_model("order_tracking_milestone", table_type="transaction", status_field="status")
class OrderTrackingMilestone(models.Model):
    """Granular live delivery scans and transit milestone timeline."""
    STATUS_CHOICES = [(1, "Active"), (0, "Archived")]
    MILESTONE_STATUS_CHOICES = [
        ("order_confirmed", "Order Confirmed & Processed"),
        ("packed", "Packed & Ready for Dispatch"),
        ("shipped", "Dispatched & In Transit"),
        ("out_for_delivery", "Out for Delivery"),
        ("delivered", "Delivered Successfully"),
        ("rto", "Returned to Origin"),
    ]

    sale = models.ForeignKey(
        "orders.Sale",
        on_delete=models.CASCADE,
        related_name="tracking_milestones",
        verbose_name="Associated Sale Order"
    )
    tracking_number = models.CharField(max_length=100, db_index=True, verbose_name="Carrier Tracking AWB")
    carrier = models.CharField(max_length=100, default="BlueDart Express", verbose_name="Logistics Partner")
    status_code = models.CharField(max_length=50, choices=MILESTONE_STATUS_CHOICES, db_index=True)
    title = models.CharField(max_length=150, verbose_name="Milestone Heading")
    location = models.CharField(max_length=150, blank=True, null=True, verbose_name="Scan Location / Hub")
    description = models.TextField(blank=True, null=True, verbose_name="Status Description")
    milestone_time = models.DateTimeField(verbose_name="Milestone Event Timestamp")
    estimated_delivery = models.DateField(blank=True, null=True, verbose_name="Estimated Delivery Date")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_tracking_milestones"
        verbose_name = "Order Tracking Milestone"
        verbose_name_plural = "Order Tracking Milestones"
        ordering = ["sale", "milestone_time"]

    def __str__(self):
        return f"{self.tracking_number} - {self.title} ({self.location or 'In Transit'})"


@register_model("promotion_coupon", table_type="master", status_field="status")
class PromotionCoupon(models.Model):
    """Discount vouchers, promotional campaign codes, and cart discount rules."""
    STATUS_CHOICES = [(1, "Active"), (0, "Inactive")]
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage Discount (%)"),
        ("fixed", "Flat Amount Off (₹)"),
    ]

    code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="Promo Code (e.g. AXINIX10)")
    title = models.CharField(max_length=150, verbose_name="Campaign Offer Title")
    description = models.TextField(blank=True, null=True, verbose_name="Terms & Conditions Summary")
    discount_type = models.CharField(max_length=20, default="percentage", choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Discount Value")
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Minimum Order Value (₹)")
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Maximum Cap Amount (₹)")
    valid_from = models.DateTimeField(verbose_name="Valid From")
    valid_until = models.DateTimeField(null=True, blank=True, verbose_name="Valid Until")
    usage_limit = models.PositiveIntegerField(null=True, blank=True, verbose_name="Total Global Usage Limit")
    times_used = models.PositiveIntegerField(default=0, verbose_name="Times Redeemed")
    is_active = models.BooleanField(default=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "promotion_coupons"
        verbose_name = "Promotion Coupon"
        verbose_name_plural = "Promotion Coupons"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} ({self.title})"
