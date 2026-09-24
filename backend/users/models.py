from datetime import date
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User Model matching project requirements and Populate Engine status rules.
    """
    ROLE_CHOICES = [
        ('ADMIN', 'Super Admin'),
        ('MANAGER', 'Store Manager'),
        ('STAFF', 'Staff / Operator'),
        ('CUSTOMER', 'Customer'),
    ]

    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    # Personal Information
    dob = models.DateField(null=True, blank=True, verbose_name="Date of Birth")
    age = models.PositiveIntegerField(null=True, blank=True, verbose_name="Age")
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)

    # Address Details
    address_line_1 = models.CharField(max_length=255, blank=True, null=True, verbose_name="Address 1")
    address_line_2 = models.CharField(max_length=255, blank=True, null=True, verbose_name="Address 2")
    address_line_3 = models.CharField(max_length=255, blank=True, null=True, verbose_name="Address 3")
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')

    # Security & Role
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='CUSTOMER', db_index=True)

    # Populate Engine mandatory status field (Rule K: 1=Active, 0=Inactive)
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def save(self, *args, **kwargs):
        # Auto-compute age if DOB is provided and age is empty
        if self.dob and not self.age:
            today = date.today()
            self.age = today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_full_name() or self.role})"


class UserSession(models.Model):
    """
    User Device Sessions storing login activity and FCM push notification tokens.
    """
    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Revoked'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', db_column='user_id')
    device = models.CharField(max_length=150, blank=True, null=True, help_text="e.g. Chrome on Windows, iPhone 15 Pro")
    device_id = models.CharField(max_length=255, blank=True, null=True, db_index=True, help_text="Unique hardware/device UUID")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP Address")
    login_time = models.DateTimeField(auto_now_add=True, verbose_name="Login Time")
    last_activity = models.DateTimeField(auto_now=True, verbose_name="Last Activity")
    session_time = models.DurationField(null=True, blank=True, help_text="Active duration or session lifetime")

    # Firebase Cloud Messaging token for push notifications
    fcm_token = models.TextField(blank=True, null=True, verbose_name="FCM Token")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_sessions'
        verbose_name = 'User Session'
        verbose_name_plural = 'User Sessions'
        ordering = ['-login_time']

    def __str__(self):
        return f"Session {self.id} - {self.user.username} ({self.device or 'Unknown Device'})"


class Notification(models.Model):
    """
    Notification master containing the notification template/message and payload.
    """
    PRIORITY_CHOICES = [
        ('HIGH', 'High'),
        ('NORMAL', 'Normal'),
        ('LOW', 'Low'),
    ]

    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Deleted'),
    ]

    title = models.CharField(max_length=255)
    body = models.TextField()
    notification_type = models.CharField(max_length=50, default='GENERAL', db_index=True, help_text="e.g. ORDER, INVENTORY, SYSTEM, PROMO")
    payload = models.JSONField(default=dict, blank=True, help_text="Custom key-value payload sent to FCM clients")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='NORMAL')

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"


class NotificationPreference(models.Model):
    """
    User notification preferences per category and channel.
    """
    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Inactive'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_preferences', db_column='user_id')
    category = models.CharField(max_length=50, default='ORDERS', db_index=True, help_text="e.g. ORDERS, INVENTORY, SECURITY, PROMOTIONS")
    push_enabled = models.BooleanField(default=True, verbose_name="Push (FCM) Enabled")
    email_enabled = models.BooleanField(default=True, verbose_name="Email Enabled")
    sms_enabled = models.BooleanField(default=False, verbose_name="SMS Enabled")

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
        unique_together = ('user', 'category')

    def __str__(self):
        return f"{self.user.username} - {self.category} Preferences"


class NotificationRecipient(models.Model):
    """
    Notification Recipients / Receptionists:
    Tracks delivery per user and target UserSession (FCM token) with receipts.
    """
    DELIVERY_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
        ('FAILED', 'Failed'),
    ]

    STATUS_CHOICES = [
        (1, 'Active'),
        (0, 'Archived'),
    ]

    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='recipients', db_column='notification_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications', db_column='user_id')
    user_session = models.ForeignKey(
        UserSession,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='targeted_notifications',
        db_column='user_session_id',
        help_text="Target device session where FCM was dispatched"
    )
    fcm_message_id = models.CharField(max_length=255, blank=True, null=True, db_index=True, help_text="FCM upstream message ID")
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default='PENDING', db_index=True)
    failure_reason = models.TextField(blank=True, null=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)

    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_recipients'
        verbose_name = 'Notification Recipient'
        verbose_name_plural = 'Notification Recipients'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification #{self.notification_id} -> {self.user.username} ({self.delivery_status})"
