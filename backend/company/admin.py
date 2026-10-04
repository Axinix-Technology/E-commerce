from django.contrib import admin
from .models import Company, GeneralSetting, BranchMaster, DepartmentMaster, DesignationMaster, ProfessionMaster


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


@admin.register(BranchMaster)
class BranchMasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'phone', 'city', 'state', 'is_head_office', 'status')
    list_filter = ('is_head_office', 'status', 'state')
    search_fields = ('name', 'code', 'city', 'gstin')


@admin.register(DepartmentMaster)
class DepartmentMasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'status')
    list_filter = ('status',)
    search_fields = ('name', 'code')


@admin.register(DesignationMaster)
class DesignationMasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'department', 'status')
    list_filter = ('department', 'status')
    search_fields = ('name', 'code')


@admin.register(ProfessionMaster)
class ProfessionMasterAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status')
    list_filter = ('status',)
    search_fields = ('name',)
