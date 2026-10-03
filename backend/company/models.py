from django.db import models
from core.registry import register_model


@register_model("company", table_type="master", status_field="status")
class Company(models.Model):
    """
    Company / Organization Master Profile.
    """
    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    # Names & Identification
    name = models.CharField(max_length=255, verbose_name="Company Name")
    legal_name = models.CharField(max_length=255, verbose_name="Legal Registered Name")
    short_name = models.CharField(max_length=50, blank=True, null=True, verbose_name="Short Name")
    gst_no = models.CharField(max_length=50, blank=True, null=True, verbose_name="GST Number / Tax ID")

    # Address & Location
    address_line_1 = models.CharField(max_length=255, verbose_name="Address 1")
    address_line_2 = models.CharField(max_length=255, blank=True, null=True, verbose_name="Address 2")
    area = models.CharField(max_length=150, blank=True, null=True, verbose_name="Area / Locality")
    city = models.CharField(max_length=100, verbose_name="City")
    state = models.CharField(max_length=100, verbose_name="State")
    country = models.CharField(max_length=100, default='India', verbose_name="Country")
    pincode = models.CharField(max_length=20, verbose_name="Pincode / Postal Code")
    map_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Google Map URL")

    # Visual Assets
    company_image = models.ImageField(upload_to='company/images/', blank=True, null=True, verbose_name="Company Image")
    logo_image = models.ImageField(upload_to='company/logos/', blank=True, null=True, verbose_name="Logo Image")

    # Social Media Toggles & Links
    has_social_media = models.BooleanField(default=False, verbose_name="Social Media Available (Yes/No)")
    website_url = models.URLField(max_length=300, blank=True, null=True, verbose_name="Website URL")
    instagram_url = models.URLField(max_length=300, blank=True, null=True, verbose_name="Instagram URL")
    youtube_url = models.URLField(max_length=300, blank=True, null=True, verbose_name="YouTube URL")
    whatsapp_url = models.URLField(max_length=300, blank=True, null=True, verbose_name="WhatsApp URL / Link")

    # Populate Engine mandatory status field (Rule K: 1=Active, 0=Inactive)
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'companies'
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return f"{self.name} ({self.short_name or self.city})"


@register_model("general_setting", table_type="master", status_field="status")
class GeneralSetting(models.Model):
    """
    General System & Store Configuration Settings.
    Includes currency formatting, separators, defaults, and feature flags.
    """
    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    VALUE_TYPES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('json', 'JSON'),
    ]

    key = models.CharField(max_length=100, unique=True, db_index=True, verbose_name="Setting Key")
    value = models.TextField(verbose_name="Setting Value")
    value_type = models.CharField(max_length=20, choices=VALUE_TYPES, default='string')
    group = models.CharField(max_length=50, default='general', db_index=True, help_text="e.g. currency, store, invoice, notifications")
    description = models.CharField(max_length=255, blank=True, null=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'general_settings'
        verbose_name = 'General Setting'
        verbose_name_plural = 'General Settings'
        ordering = ['group', 'key']

    def __str__(self):
        return f"{self.group}.{self.key} = {self.value}"

    @classmethod
    def format_currency(cls, amount: float | int | str, currency_format: str = "INR", symbol: str = "₹") -> str:
        """
        Utility function to format currency with appropriate comma separators.
        - INR: 1,00,000.00 (Lakh / Crore comma system)
        - INTL: 100,000.00 (Thousand / Million comma system)
        """
        try:
            val = float(amount)
        except (ValueError, TypeError):
            return f"{symbol} 0.00"

        if currency_format.upper() == "INR":
            # Indian numbering format: ##,##,###.##
            is_negative = val < 0
            val_abs = abs(val)
            parts = f"{val_abs:.2f}".split(".")
            integer_part = parts[0]
            decimal_part = parts[1]

            if len(integer_part) > 3:
                last_three = integer_part[-3:]
                remaining = integer_part[:-3]
                # Split remaining in groups of 2 from right to left
                chunks = []
                while len(remaining) > 2:
                    chunks.insert(0, remaining[-2:])
                    remaining = remaining[:-2]
                if remaining:
                    chunks.insert(0, remaining)
                formatted_int = ",".join(chunks) + "," + last_three
            else:
                formatted_int = integer_part

            sign = "-" if is_negative else ""
            return f"{sign}{symbol} {formatted_int}.{decimal_part}"
        else:
            # International standard format: ###,###.##
            return f"{symbol} {val:,.2f}"


@register_model("branch_master", table_type="master", status_field="status", aliases=["branches", "branch"])
class BranchMaster(models.Model):
    STATUS_CHOICES = [(1, 'Active'), (0, 'Inactive')]

    name = models.CharField(max_length=150, verbose_name="Branch Name")
    code = models.CharField(max_length=50, unique=True, verbose_name="Branch Code")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Phone Number")
    email = models.EmailField(max_length=120, blank=True, null=True, verbose_name="Email Address")
    address = models.TextField(blank=True, null=True, verbose_name="Address")
    city = models.CharField(max_length=100, blank=True, null=True, verbose_name="City")
    state = models.CharField(max_length=100, blank=True, null=True, verbose_name="State")
    pincode = models.CharField(max_length=20, blank=True, null=True, verbose_name="Pincode")
    gstin = models.CharField(max_length=20, blank=True, null=True, verbose_name="GSTIN")
    is_head_office = models.BooleanField(default=False, verbose_name="Head Office Flag")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "branch_masters"
        verbose_name = "Branch Master"
        verbose_name_plural = "Branch Masters"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


@register_model("department_master", table_type="master", status_field="status", aliases=["departments", "department"])
class DepartmentMaster(models.Model):
    STATUS_CHOICES = [(1, 'Active'), (0, 'Inactive')]

    name = models.CharField(max_length=100, unique=True, verbose_name="Department Name")
    code = models.CharField(max_length=50, unique=True, verbose_name="Department Code")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "department_masters"
        verbose_name = "Department Master"
        verbose_name_plural = "Department Masters"
        ordering = ["name"]

    def __str__(self):
        return self.name


@register_model("designation_master", table_type="master", status_field="status", aliases=["designations", "designation"])
class DesignationMaster(models.Model):
    STATUS_CHOICES = [(1, 'Active'), (0, 'Inactive')]

    name = models.CharField(max_length=100, unique=True, verbose_name="Designation Name")
    code = models.CharField(max_length=50, unique=True, verbose_name="Designation Code")
    department = models.ForeignKey(
        DepartmentMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="designations"
    )
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "designation_masters"
        verbose_name = "Designation Master"
        verbose_name_plural = "Designation Masters"
        ordering = ["name"]

    def __str__(self):
        return self.name


@register_model("profession_master", table_type="master", status_field="status", aliases=["professions", "profession"])
class ProfessionMaster(models.Model):
    STATUS_CHOICES = [(1, 'Active'), (0, 'Inactive')]

    name = models.CharField(max_length=100, unique=True, verbose_name="Profession Name")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "profession_masters"
        verbose_name = "Profession Master"
        verbose_name_plural = "Profession Masters"
        ordering = ["name"]

    def __str__(self):
        return self.name

