from django.db import models
from django.conf import settings
from core.registry import register_model


@register_model("gst_master", table_type="master", status_field="status")
class GstMaster(models.Model):
    """
    GST Tax Master.
    Defines the tax rate and calculation percentages (CGST, SGST, IGST).
    """

    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    name = models.CharField(max_length=50, unique=True, verbose_name="GST Slab Name")
    rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Tax Rate (%)")

    # Tax Split
    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="CGST (%)")
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="SGST (%)")
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="IGST (%)")

    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Description")

    status = models.SmallIntegerField(
        default=1,
        choices=STATUS_CHOICES,
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, blank=True, null=True, related_name="gst_created"
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, blank=True, null=True, related_name="gst_updated"
    )

    class Meta:
        db_table = 'gst_masters'
        verbose_name = 'GST Master'
        verbose_name_plural = 'GST Masters'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.rate}%)"


@register_model("category_master", table_type="master", status_field="status")
class CategoryMaster(models.Model):
    """
    Product Category Master.
    Defines the category hierarchy for products.
    """

    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    parent = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='subcategories',
        verbose_name='Parent Category'
    )

    # Category Details
    name = models.CharField(max_length=50, unique=True, null=False, blank=False, verbose_name="Category Name")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Description")
    hsn_code = models.CharField(max_length=10, blank=True, null=True, verbose_name="HSN Code")
    image = models.CharField(max_length=255, blank=True, null=True, verbose_name="Category Image")
    
    # Category Tax details
    tax_group = models.ForeignKey(GstMaster, on_delete=models.PROTECT, null=True, blank=True, related_name="tax_group")
    
    # For Soft delete Status
    status = models.SmallIntegerField(
        default=1,
        choices=STATUS_CHOICES,
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )

    # Metadata details
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, blank=True, null=True, related_name="category_created"
    )
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, blank=True, null=True, related_name="category_updated"
    )

    class Meta:
        db_table = 'category_masters'
        verbose_name = 'Category Master'
        verbose_name_plural = 'Category Masters'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


@register_model("product_type", table_type="master", status_field="status")
class ProductType(models.Model):
    category = models.ForeignKey(
        CategoryMaster,
        on_delete=models.PROTECT,
        related_name="product_types",
        db_column="category_id",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=150, blank=True, null=True)
    care_instructions = models.TextField(blank=True, null=True)
    age_group = models.CharField(max_length=30, blank=True, null=True)
    gender_label = models.CharField(max_length=20, blank=True, null=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Retail Selling Price (M.R.P.)")
    is_active = models.BooleanField(default=True)
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ProductType"
        ordering = ["id"]

    def __str__(self):
        return self.name


@register_model("product_variant", table_type="master", status_field="status")
class ProductVariant(models.Model):
    product = models.ForeignKey(
        ProductType,
        on_delete=models.PROTECT,
        related_name="variants",
        db_column="product_id",
    )
    sku = models.CharField(max_length=64, unique=True)
    size = models.CharField(max_length=30, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    barcode = models.CharField(max_length=64, blank=True, null=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ProductVariant"
        ordering = ["id"]

    def __str__(self):
        return self.sku


@register_model("vendor_master", table_type="master", status_field="status")
class VendorMaster(models.Model):
    name = models.CharField(max_length=150, unique=True, verbose_name="Vendor / Supplier Name")
    vendor_code = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name="Vendor Code")
    contact_person = models.CharField(max_length=100, blank=True, null=True, verbose_name="Contact Person")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Phone Number")
    email = models.EmailField(max_length=120, blank=True, null=True, verbose_name="Email Address")
    gstin = models.CharField(max_length=15, blank=True, null=True, verbose_name="GSTIN Number")
    pan_number = models.CharField(max_length=10, blank=True, null=True, verbose_name="PAN Number")
    
    # Address details
    address = models.TextField(blank=True, null=True, verbose_name="Street Address")
    city = models.CharField(max_length=60, blank=True, null=True, verbose_name="City")
    state = models.CharField(max_length=60, blank=True, null=True, verbose_name="State")
    pincode = models.CharField(max_length=10, blank=True, null=True, verbose_name="PIN Code")
    
    # Banking details for supplier payouts
    bank_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Bank Name")
    account_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="Account Number")
    ifsc_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="IFSC Code")
    
    # Status metadata (Rule 11)
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vendor_masters"
        verbose_name = "Vendor Master"
        verbose_name_plural = "Vendor Masters"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


@register_model("state_master", table_type="master", status_field="status")
class StateMaster(models.Model):
    code = models.CharField(max_length=2, unique=True, verbose_name="GST State Code", help_text="e.g. 33 for Tamil Nadu")
    name = models.CharField(max_length=60, unique=True, verbose_name="State / UT Name")
    tin = models.CharField(max_length=2, blank=True, null=True, verbose_name="TIN Code")
    is_union_territory = models.BooleanField(default=False)
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "state_masters"
        verbose_name = "State Master"
        verbose_name_plural = "State Masters"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} - {self.name}"


@register_model("customer_master", table_type="master", status_field="status")
class CustomerMaster(models.Model):
    CUSTOMER_TYPES = [
        ("b2c", "Retail Consumer (B2C)"),
        ("b2b", "Registered Business (B2B)"),
    ]
    customer_type = models.CharField(max_length=10, choices=CUSTOMER_TYPES, default="b2c")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customer_profiles",
        verbose_name="Linked User Account"
    )
    name = models.CharField(max_length=150, verbose_name="Customer / Business Name")
    phone = models.CharField(max_length=20, db_index=True, verbose_name="Phone Number")
    email = models.EmailField(max_length=120, blank=True, null=True, verbose_name="Email Address")
    
    # B2B Tax Credentials
    gstin = models.CharField(max_length=15, blank=True, null=True, verbose_name="GSTIN Number")
    pan_number = models.CharField(max_length=10, blank=True, null=True, verbose_name="PAN Number")
    company_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="Trade / Business Name")
    
    # Address & Tax Determination (Place of Supply)
    billing_address = models.TextField(blank=True, null=True, verbose_name="Billing Address")
    shipping_address = models.TextField(blank=True, null=True, verbose_name="Shipping Address")
    city = models.CharField(max_length=60, blank=True, null=True, verbose_name="City")
    state = models.ForeignKey(
        StateMaster,
        on_delete=models.PROTECT,
        related_name="customers",
        verbose_name="State (Place of Supply)",
        null=True,
        blank=True
    )
    pincode = models.CharField(max_length=10, blank=True, null=True, verbose_name="PIN Code")
    status = models.SmallIntegerField(
        default=1,
        choices=[(1, "Active"), (0, "Inactive")],
        db_index=True,
        help_text="1 = Active, 0 = Inactive"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer_masters"
        verbose_name = "Customer Master"
        verbose_name_plural = "Customer Masters"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.phone})"



