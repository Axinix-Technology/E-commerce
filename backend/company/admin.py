from django.contrib import admin
from .models import Company, GeneralSetting


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'legal_name', 'gst_no', 'city', 'state', 'has_social_media', 'status')
    list_filter = ('has_social_media', 'status', 'city', 'state')
    search_fields = ('name', 'legal_name', 'gst_no', 'city')


@admin.register(GeneralSetting)
class GeneralSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'group', 'key', 'value', 'value_type', 'status')
    list_filter = ('group', 'value_type', 'status')
    search_fields = ('key', 'value', 'description')
