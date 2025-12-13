"""
Members serializers
"""
from rest_framework import serializers
from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    """Member serializer"""
    points_to_next_tier = serializers.ReadOnlyField()
    
    class Meta:
        model = Member
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'join_date', 'total_points', 'tier_level', 'status',
            'points_to_next_tier', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_points']
    
    def validate_email(self, value):
        """Validate email uniqueness on update"""
        instance = self.instance
        if instance and Member.objects.exclude(pk=instance.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        elif not instance and Member.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value


class MemberListSerializer(serializers.ModelSerializer):
    """Simplified member serializer for list view"""
    
    class Meta:
        model = Member
        fields = [
            'id', 'name', 'email', 'phone', 'join_date',
            'total_points', 'tier_level', 'status'
        ]


class MemberStatisticsSerializer(serializers.Serializer):
    """Member statistics serializer"""
    total_members = serializers.IntegerField()
    active_members = serializers.IntegerField()
    inactive_members = serializers.IntegerField()
    by_tier = serializers.DictField()
    total_points = serializers.IntegerField()
