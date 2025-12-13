"""
Vouchers admin
"""
from django.contrib import admin
from .models import Voucher


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    """Voucher admin interface"""
    list_display = ['id', 'code', 'name', 'type', 'points_cost', 'stock', 'status', 'start_date', 'end_date']
    list_filter = ['type', 'status', 'start_date', 'end_date']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description', 'type')
        }),
        ('Value & Cost', {
            'fields': ('discount_value', 'points_cost', 'stock')
        }),
        ('Validity Period', {
            'fields': ('start_date', 'end_date', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
