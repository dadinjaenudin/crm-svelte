"""
Redeem admin
"""
from django.contrib import admin
from .models import RedeemTransaction


@admin.register(RedeemTransaction)
class RedeemTransactionAdmin(admin.ModelAdmin):
    """Redeem Transaction admin interface"""
    list_display = ['id', 'member', 'voucher', 'points_cost', 'status', 'redeem_date', 'used_date']
    list_filter = ['status', 'redeem_date', 'used_date']
    search_fields = ['member__id', 'member__name', 'voucher__code', 'voucher__name']
    readonly_fields = ['redeem_date', 'created_at', 'updated_at', 'points_cost']
    ordering = ['-redeem_date']
    date_hierarchy = 'redeem_date'
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('member', 'voucher', 'points_cost', 'status')
        }),
        ('Dates', {
            'fields': ('redeem_date', 'used_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion to maintain transaction history"""
        return False
