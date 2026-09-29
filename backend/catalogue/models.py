from django.db import models

class GstMaster(models.Model):
    """
    GST Tax Master.
    Defines the tax rate and calculation percentages (CGST, SGST, IGST).
    """

    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    name = models.CharField(max_length=50,unique=True, verbose_name="GST Slab Name")  #e.g., GST 18%
    rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Tax Rate (%)") #e.g., 18.00

    # Tax Split
    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="CGST (%)") #e.g., 9.00
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="SGST (%)") #e.g., 9.00
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="IGST (%)") #e.g., 18.00

    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="Description")

    status = models.SmallIntegerField(
        default = 1,
        choices = STATUS_CHOICES,
        db_index = True,
        help_text = "1 = Active, 0 = Inactive"
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
        on_delete = models.PROTECT,
        null = True,
        blank = True,
        related_name = 'subcategories',
        verbose_name = 'Parent Category'
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
        default = 1,
        choices = STATUS_CHOICES,
        db_index = True,
        help_text = "1 = Active, 0 = Inactive"
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
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ProductType"
        ordering = ["id"]

    def __str__(self):
        return self.name


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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ProductVariant"
        ordering = ["id"]

    def __str__(self):
        return self.sku

