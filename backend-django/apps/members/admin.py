"""
Members admin
"""
from django.contrib import admin
from .models import Member


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    """Member admin interface"""
    list_display = ['id', 'name', 'email', 'phone', 'tier_level', 'total_points', 'status', 'join_date']
    list_filter = ['tier_level', 'status', 'join_date']
    search_fields = ['id', 'name', 'email', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_points']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'email', 'phone', 'address')
        }),
        ('Membership', {
            'fields': ('join_date', 'tier_level', 'status', 'total_points')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
