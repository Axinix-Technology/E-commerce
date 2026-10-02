from django.db import models
from core.registry import register_model


@register_model("capability", table_type="master", status_field="status", aliases=["capabilities"])
class Capability(models.Model):
    """
    Defines UI and business capability vocabulary for visibility decisions and action gates.
    """
    STATUS_CHOICES = [
        (1, "Active"),
        (0, "Inactive"),
    ]

    key = models.CharField(max_length=150, unique=True, db_index=True, help_text="e.g. catalogue.categories.read")
    action = models.CharField(max_length=50, blank=True, null=True, db_index=True, help_text="e.g. read, create, update, delete")
    label = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    module = models.CharField(max_length=50, default="core", db_index=True)
    type = models.CharField(max_length=30, default="ui", choices=[("ui", "UI Visibility"), ("business", "Business Gate")])

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "capabilities"
        verbose_name = "Capability"
        verbose_name_plural = "Capabilities"
        ordering = ["module", "key"]

    def __str__(self):
        return f"{self.key} ({self.label})"


@register_model("sidebar", table_type="master", status_field="status", aliases=["sidebars"])
class Sidebar(models.Model):
    """
    Dynamic navigation tree nodes for frontend sidebar rendering.
    Supports hierarchical parent-child submenus, icons, routes, and capability gates.
    """
    STATUS_CHOICES = [
        (1, "Active"),
        (0, "Inactive"),
    ]

    VISIBILITY_CHOICES = [
        ("protected", "Protected"),
        ("public", "Public"),
    ]

    title = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. LayoutDashboard, FolderTree, Package")
    icon_package = models.CharField(max_length=50, default="lucide")
    main_route = models.CharField(max_length=200, blank=True, null=True, db_index=True, help_text="e.g. /dashboard, /catalogue/categories")
    visibility = models.CharField(max_length=20, default="protected", choices=VISIBILITY_CHOICES, db_index=True)

    # Capability gates
    capabilities = models.ManyToManyField(Capability, blank=True, related_name="sidebars")

    # Module association
    module_key = models.CharField(max_length=50, default="core", db_index=True, help_text="e.g. core, catalogue, users, orders")

    # Hierarchy: Parent & Submenus
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        db_column="parent_id"
    )
    has_children = models.BooleanField(default=False)
    is_parent = models.BooleanField(default=False)

    order = models.IntegerField(default=0, db_index=True)
    badge = models.CharField(max_length=30, blank=True, null=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sidebars"
        verbose_name = "Sidebar Item"
        verbose_name_plural = "Sidebar Items"
        ordering = ["order", "id"]
        indexes = [
            models.Index(fields=["status", "order"]),
            models.Index(fields=["parent_id", "status"]),
            models.Index(fields=["module_key", "status"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.main_route or 'parent'})"


@register_model("access_policy", table_type="master", status_field="status", aliases=["access_policies"])
class AccessPolicy(models.Model):
    """
    Dynamic database-backed RBAC/ABAC access policies per role and model.
    """
    STATUS_CHOICES = [
        (1, "Active"),
        (0, "Inactive"),
    ]

    role = models.ForeignKey(
        "users.Role",
        on_delete=models.CASCADE,
        related_name="access_policies",
        db_column="role_id"
    )
    model_name = models.CharField(max_length=100, db_index=True, help_text="Target model e.g. users, category_master, sidebars")
    actions = models.JSONField(default=list, help_text="e.g. ['read', 'create', 'update', 'delete', 'report']")
    allow_access = models.JSONField(default=dict, blank=True, help_text="e.g. {'read': ['*'], 'create': ['name', 'rate']}")
    forbidden_access = models.JSONField(default=dict, blank=True, help_text="e.g. {'read': ['password']}")
    conditions = models.JSONField(default=dict, blank=True, help_text="ABAC conditions")
    registry = models.JSONField(default=list, blank=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "access_policies"
        verbose_name = "Access Policy"
        verbose_name_plural = "Access Policies"
        unique_together = ("role", "model_name")
        indexes = [
            models.Index(fields=["role_id", "model_name", "status"]),
        ]

    def __str__(self):
        return f"Policy: Role #{self.role_id} -> {self.model_name}"
