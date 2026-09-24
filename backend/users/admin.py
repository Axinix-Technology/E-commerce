from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserSession, Notification, NotificationPreference, NotificationRecipient


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'city', 'status')
    list_filter = ('role', 'status', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'phone', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Personal Details', {'fields': ('dob', 'age', 'phone')}),
        ('Address', {'fields': ('address_line_1', 'address_line_2', 'address_line_3', 'city', 'state', 'country')}),
        ('Role & Status', {'fields': ('role', 'status')}),
    )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'device', 'ip_address', 'login_time', 'last_activity', 'status')
    list_filter = ('status', 'device')
    search_fields = ('user__username', 'device', 'ip_address', 'device_id')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'notification_type', 'priority', 'status', 'created_at')
    list_filter = ('notification_type', 'priority', 'status')
    search_fields = ('title', 'body')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'push_enabled', 'email_enabled', 'sms_enabled', 'status')
    list_filter = ('category', 'push_enabled', 'email_enabled', 'sms_enabled', 'status')
    search_fields = ('user__username', 'category')


@admin.register(NotificationRecipient)
class NotificationRecipientAdmin(admin.ModelAdmin):
    list_display = ('id', 'notification', 'user', 'delivery_status', 'sent_at', 'read_at', 'status')
    list_filter = ('delivery_status', 'status')
    search_fields = ('user__username', 'notification__title', 'fcm_message_id')
