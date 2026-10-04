from django.contrib import admin
from .models import Capability, Sidebar, AccessPolicy, AuditLog


@admin.register(Capability)
class CapabilityAdmin(admin.ModelAdmin):
    list_display = ("key", "label", "module", "type", "action", "status")
    list_filter = ("module", "type", "status")
    search_fields = ("key", "label")


@admin.register(Sidebar)
class SidebarAdmin(admin.ModelAdmin):
    list_display = ("title", "main_route", "icon", "parent", "order", "status")
    list_filter = ("status", "parent")
    search_fields = ("title", "main_route")


@admin.register(AccessPolicy)
class AccessPolicyAdmin(admin.ModelAdmin):
    list_display = ("role", "model_name", "status")
    list_filter = ("role", "status")
    search_fields = ("model_name",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity", "entity_id", "user_name", "ip_address", "created_at")
    list_filter = ("action", "entity")
    search_fields = ("entity", "entity_id", "user_name", "details")
