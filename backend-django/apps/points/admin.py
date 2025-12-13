"""
Points admin
"""
from django.contrib import admin
from .models import PointTransaction


@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    """Point Transaction admin interface"""
    list_display = ['id', 'member', 'transaction_type', 'points', 'transaction_date', 'created_by']
    list_filter = ['transaction_type', 'transaction_date']
    search_fields = ['member__id', 'member__name', 'description', 'created_by']
    readonly_fields = ['transaction_date', 'created_at']
    ordering = ['-transaction_date']
    date_hierarchy = 'transaction_date'
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('member', 'transaction_type', 'points', 'description')
        }),
        ('Metadata', {
            'fields': ('transaction_date', 'created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion to maintain transaction history"""
        return False
